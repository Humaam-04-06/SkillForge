const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const User = require('../models/User');
const Roadmap = require('../models/Roadmap');

// GET /api/profile/leaderboard
// Returns top 20 users sorted by streak
router.get('/leaderboard', async (req, res) => {
  try {
    const topUsers = await User.find({ isPublic: true })
      .select('username displayName avatarUrl streak challengesCompletedCount')
      .sort({ streak: -1 })
      .limit(20);

    res.json(topUsers);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Failed to retrieve leaderboard data.' });
  }
});

// GET /api/profile/:username
// Retrieve user's public profile data (without authentication)
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    
    if (!user) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    if (!user.isPublic) {
      return res.status(403).json({ message: 'This profile is set to private by the owner.' });
    }

    // Retrieve active roadmap goal summary if exists
    const activeRoadmap = await Roadmap.findOne({ userId: user._id, isActive: true })
      .select('progress weeks duration');

    let roadmapSummary = null;
    if (activeRoadmap) {
      roadmapSummary = {
        progress: activeRoadmap.progress,
        duration: activeRoadmap.duration,
        weeksCount: activeRoadmap.weeks.length
      };
    }

    res.json({
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      publicRepos: user.publicRepos,
      followers: user.followers,
      location: user.location,
      company: user.company,
      skills: user.skills,
      streak: user.streak,
      challengesCompletedCount: user.challengesCompletedCount,
      contributionHeatmap: user.contributionHeatmap,
      matchScoreHistory: user.matchScoreHistory,
      activeRoadmap: roadmapSummary
    });

  } catch (error) {
    console.error('Error fetching public profile:', error);
    res.status(500).json({ message: 'Failed to retrieve profile data.' });
  }
});

// PATCH /api/profile/privacy
// Toggle public profile visibility (requires authentication)
router.patch('/privacy', requireAuth, async (req, res) => {
  try {
    const { isPublic } = req.body;
    if (isPublic === undefined) {
      return res.status(400).json({ message: 'isPublic setting is required.' });
    }

    req.user.isPublic = isPublic;
    await req.user.save();

    res.json({
      message: `Profile visibility updated to ${isPublic ? 'Public' : 'Private'}.`,
      isPublic: req.user.isPublic
    });

  } catch (error) {
    console.error('Error toggling profile privacy:', error);
    res.status(500).json({ message: 'Failed to update profile visibility.' });
  }
});

module.exports = router;
