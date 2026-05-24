const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const Challenge = require('../models/Challenge');
const challengeScheduler = require('../services/challengeScheduler');

// GET /api/challenges/today
router.get('/today', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    
    // Find challenge generated for today (from midnight today to midnight tomorrow)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let challenge = await Challenge.findOne({
      userId: user._id,
      date: { $gte: today, $lt: tomorrow }
    });

    // If no challenge has been generated today yet, generate one on demand
    if (!challenge) {
      challenge = await challengeScheduler.generateUserChallenge(user);
    }

    if (!challenge) {
      return res.status(404).json({ message: 'Could not retrieve or generate challenge for today.' });
    }

    res.json(challenge);
  } catch (error) {
    console.error('Error fetching today\'s challenge:', error);
    res.status(500).json({ message: 'Failed to retrieve today\'s challenge.' });
  }
});

// POST /api/challenges/complete
router.post('/complete', requireAuth, async (req, res) => {
  try {
    const { challengeId, solution, isCorrect } = req.body;
    if (!challengeId) {
      return res.status(400).json({ message: 'challengeId is required.' });
    }

    const challenge = await Challenge.findOne({ _id: challengeId, userId: req.user._id });
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found.' });
    }

    if (challenge.completed) {
      return res.status(400).json({ message: 'Challenge already marked completed.' });
    }

    // Mark complete
    challenge.completed = true;
    challenge.completedAt = new Date();
    challenge.solution = solution || '';
    
    // Check answer if it's a quiz
    if (challenge.challenge.type === 'quiz') {
      challenge.isCorrect = (solution === challenge.challenge.correctAnswer);
    } else {
      challenge.isCorrect = isCorrect !== undefined ? isCorrect : true;
    }

    await challenge.save();

    // Calculate streak adjustments
    const user = req.user;
    user.challengesCompletedCount += 1;

    // Check last completed challenge date
    const lastChallenge = await Challenge.findOne({
      userId: user._id,
      _id: { $ne: challengeId },
      completed: true
    }).sort({ completedAt: -1 });

    if (!lastChallenge) {
      // First challenge ever completed
      user.streak = 1;
    } else {
      const lastCompletedDate = new Date(lastChallenge.completedAt);
      lastCompletedDate.setHours(0, 0, 0, 0);

      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);

      const diffTime = Math.abs(todayDate - lastCompletedDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Completed consecutive day
        user.streak += 1;
      } else if (diffDays > 1) {
        // Streak broken, reset
        user.streak = 1;
      }
      // If diffDays === 0, completed another challenge today, streak stays the same
    }

    await user.save();

    res.json({
      message: 'Challenge submitted successfully.',
      challenge,
      streak: user.streak,
      challengesCompletedCount: user.challengesCompletedCount
    });

  } catch (error) {
    console.error('Error completing challenge:', error);
    res.status(500).json({ message: 'Failed to submit challenge solution.' });
  }
});

// GET /api/challenges/history
router.get('/history', requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const challenges = await Challenge.find({ userId: req.user._id, completed: true })
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Challenge.countDocuments({ userId: req.user._id, completed: true });

    res.json({
      challenges,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching challenge history:', error);
    res.status(500).json({ message: 'Failed to fetch challenge history.' });
  }
});

// GET /api/challenges/streak
router.get('/streak', requireAuth, (req, res) => {
  res.json({
    streak: req.user.streak,
    challengesCompletedCount: req.user.challengesCompletedCount
  });
});

module.exports = router;
