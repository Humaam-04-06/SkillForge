const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const aiService = require('../services/aiService');
const SkillGap = require('../models/SkillGap');
const Roadmap = require('../models/Roadmap');
const ChatHistory = require('../models/ChatHistory');
const User = require('../models/User');

// Helper to resolve the correct Gemini API key
const resolveApiKey = (req) => {
  // 1. Check x-api-key header (primary)
  const headerKey = req.headers['x-api-key'];
  if (headerKey && headerKey !== 'null' && headerKey !== 'undefined' && headerKey.trim() !== '') {
    return headerKey;
  }
  // 2. Check user record (fallback)
  if (req.user && req.user.apiKey && req.user.apiKey.trim() !== '') {
    return req.user.apiKey;
  }
  return null;
};

// POST /api/ai/analyze-gap
router.post('/analyze-gap', requireAuth, async (req, res) => {
  try {
    const { jobTitle, jobDescription } = req.body;
    if (!jobTitle || !jobDescription) {
      return res.status(400).json({ message: 'jobTitle and jobDescription are required.' });
    }

    const apiKey = resolveApiKey(req);
    const userSkills = req.user.skills;

    // Run AI gap analysis
    const analysis = await aiService.analyzeSkillGap(userSkills, jobDescription, apiKey);

    // Save report to database
    const skillGap = new SkillGap({
      userId: req.user._id,
      jobTitle,
      jobDescription,
      matchScore: analysis.matchScore,
      userSkills: Object.keys(userSkills).map(k => ({ skill: k, level: userSkills[k], confidence: 80 })),
      jobRequirements: analysis.jobRequirements,
      gaps: analysis.gaps
    });

    await skillGap.save();

    // Log match score in history
    req.user.matchScoreHistory.push({
      jobTitle,
      score: analysis.matchScore
    });
    await req.user.save();

    res.json({
      message: 'Gap analysis complete',
      skillGap
    });
  } catch (error) {
    console.error('Error analyzing skill gap route:', error);
    res.status(500).json({ message: 'AI Gap Analysis failed.', error: error.message });
  }
});

// GET /api/ai/gap-report/latest
router.get('/gap-report/latest', requireAuth, async (req, res) => {
  try {
    const skillGap = await SkillGap.findOne({ userId: req.user._id })
      .sort({ analyzedAt: -1 });
    
    if (!skillGap) {
      return res.status(404).json({ message: 'No gap report found for this user.' });
    }
    
    res.json(skillGap);
  } catch (error) {
    console.error('Error fetching latest gap report:', error);
    res.status(500).json({ message: 'Failed to retrieve latest gap report.' });
  }
});

// GET /api/ai/gap-report/:id
router.get('/gap-report/:id', requireAuth, async (req, res) => {
  try {
    const skillGap = await SkillGap.findOne({ _id: req.params.id, userId: req.user._id });
    if (!skillGap) {
      return res.status(404).json({ message: 'Skill gap report not found.' });
    }
    res.json(skillGap);
  } catch (error) {
    console.error('Error fetching gap report by ID:', error);
    res.status(500).json({ message: 'Failed to retrieve skill gap report.' });
  }
});

// POST /api/ai/generate-roadmap
router.post('/generate-roadmap', requireAuth, async (req, res) => {
  try {
    const { skillGapId, duration } = req.body;
    if (!skillGapId || !duration) {
      return res.status(400).json({ message: 'skillGapId and duration (30/60/90) are required.' });
    }

    const apiKey = resolveApiKey(req);

    // Fetch the gap details
    const skillGap = await SkillGap.findById(skillGapId);
    if (!skillGap) {
      return res.status(404).json({ message: 'Skill gap report not found.' });
    }

    // Call Gemini to generate learning roadmap
    const weeksData = await aiService.generateRoadmap(skillGap.gaps, duration, apiKey);

    // Deactivate previous active roadmaps for this user
    await Roadmap.updateMany({ userId: req.user._id, isActive: true }, { isActive: false });

    // Save new roadmap
    const roadmap = new Roadmap({
      userId: req.user._id,
      skillGapId,
      duration,
      weeks: weeksData,
      progress: 0,
      isActive: true
    });

    await roadmap.save();

    res.json({
      message: 'Roadmap generated successfully.',
      roadmap
    });
  } catch (error) {
    console.error('Error generating roadmap route:', error);
    res.status(500).json({ message: 'AI Roadmap Generation failed.', error: error.message });
  }
});

// POST /api/ai/mentor-chat
router.post('/mentor-chat', requireAuth, async (req, res) => {
  try {
    const { messages, sessionId } = req.body;
    if (!messages || !Array.isArray(messages) || !sessionId) {
      return res.status(400).json({ message: 'messages (array) and sessionId are required.' });
    }

    const apiKey = resolveApiKey(req);

    // Build context
    const userContext = {
      username: req.user.username,
      skills: req.user.skills
    };

    // Find active roadmap progress if exists
    const activeRoadmap = await Roadmap.findOne({ userId: req.user._id, isActive: true });
    if (activeRoadmap) {
      userContext.roadmapProgress = activeRoadmap.progress;
    }

    // Send chat thread to Gemini
    const aiResponse = await aiService.mentorChat(messages, userContext, apiKey);

    // Save message pair in database ChatHistory
    let chatHistory = await ChatHistory.findOne({ userId: req.user._id, sessionId });
    if (!chatHistory) {
      chatHistory = new ChatHistory({
        userId: req.user._id,
        sessionId,
        messages: []
      });
    }

    // Push new message pair
    const lastUserMsg = messages[messages.length - 1];
    chatHistory.messages.push({
      role: 'user',
      content: lastUserMsg.content,
      timestamp: new Date()
    });

    chatHistory.messages.push({
      role: 'assistant',
      content: aiResponse.content,
      timestamp: new Date()
    });

    await chatHistory.save();

    res.json({
      reply: aiResponse.content,
      isDemo: aiResponse.isDemo
    });
  } catch (error) {
    console.error('Error in mentor chat route:', error);
    res.status(500).json({ message: 'AI Mentor failed to respond.', error: error.message });
  }
});

module.exports = router;
