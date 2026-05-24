const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const User = require('../models/User');
const Roadmap = require('../models/Roadmap');
const SkillGap = require('../models/SkillGap');
const Challenge = require('../models/Challenge');
const ChatHistory = require('../models/ChatHistory');

// PATCH /api/settings/api-key
router.patch('/api-key', requireAuth, async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (apiKey === undefined) {
      return res.status(400).json({ message: 'apiKey is required.' });
    }

    req.user.apiKey = apiKey.trim();
    await req.user.save();

    res.json({
      message: 'Gemini API Key updated successfully.',
      hasKey: !!req.user.apiKey
    });
  } catch (error) {
    console.error('Error updating API key:', error);
    res.status(500).json({ message: 'Failed to update API Key.' });
  }
});

// PATCH /api/settings/theme
router.patch('/theme', requireAuth, async (req, res) => {
  try {
    const { theme } = req.body;
    if (!theme || !['dark', 'light'].includes(theme)) {
      return res.status(400).json({ message: 'theme must be either "dark" or "light".' });
    }

    req.user.theme = theme;
    await req.user.save();

    res.json({
      message: 'Theme preference saved.',
      theme: req.user.theme
    });
  } catch (error) {
    console.error('Error updating theme preference:', error);
    res.status(500).json({ message: 'Failed to save theme preference.' });
  }
});

// DELETE /api/settings/account
// GDPR account deletion, wiping all linked database collections
router.delete('/account', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete user documents in all collections
    await Roadmap.deleteMany({ userId });
    await SkillGap.deleteMany({ userId });
    await Challenge.deleteMany({ userId });
    await ChatHistory.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    res.json({
      message: 'Your account and all related learning records have been permanently deleted.'
    });

  } catch (error) {
    console.error('Error during account deletion:', error);
    res.status(500).json({ message: 'An error occurred while deleting your account.' });
  }
});

module.exports = router;
