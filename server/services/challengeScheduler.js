const cron = require('node-cron');
const User = require('../models/User');
const SkillGap = require('../models/SkillGap');
const Challenge = require('../models/Challenge');
const aiService = require('./aiService');

/**
 * Helper to generate a daily challenge for a specific user
 */
const generateUserChallenge = async (user) => {
  try {
    // Find user's latest skill gap report
    const latestGap = await SkillGap.findOne({ userId: user._id }).sort({ analyzedAt: -1 });
    
    let focusSkill = 'JavaScript';
    let currentLevel = 50;

    if (latestGap && latestGap.gaps && latestGap.gaps.length > 0) {
      // Pick a random gap from the top 3 gaps (which are sorted by gapSize descending)
      const topGaps = latestGap.gaps.slice(0, 3);
      const randomGap = topGaps[Math.floor(Math.random() * topGaps.length)];
      focusSkill = randomGap.skill;
      currentLevel = randomGap.currentLevel;
    } else {
      // Fallback: look at their weakest category in user profile
      let weakestCategory = 'JavaScript';
      let minScore = 100;
      
      const skills = user.skills;
      if (skills) {
        skills.forEach((value, key) => {
          if (value < minScore) {
            minScore = value;
            weakestCategory = key;
          }
        });
      }
      focusSkill = weakestCategory;
      currentLevel = minScore;
    }

    // Call AI to generate challenge (use user key if available)
    const challengeData = await aiService.generateChallenge(focusSkill, currentLevel, user.apiKey);

    // Save challenge
    const newChallenge = new Challenge({
      userId: user._id,
      challenge: {
        title: challengeData.title,
        description: challengeData.description,
        type: challengeData.type,
        difficulty: challengeData.difficulty,
        skill: focusSkill,
        options: challengeData.options,
        correctAnswer: challengeData.correctAnswer
      },
      date: new Date(),
      completed: false
    });

    await newChallenge.save();
    console.log(`Generated challenge for user ${user.username} on skill ${focusSkill}`);
    return newChallenge;
  } catch (error) {
    console.error(`Error generating challenge for user ${user.username}:`, error);
    return null;
  }
};

/**
 * Initializes cron schedule
 * Runs every day at midnight (0 0 * * *)
 */
const initChallengeScheduler = () => {
  console.log('Daily challenge scheduler initialized...');
  
  // '0 0 * * *' = midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily challenge generator cron job...');
    try {
      // Find all active users (anyone logged in or updated within the last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const activeUsers = await User.find({
        updatedAt: { $gte: thirtyDaysAgo }
      });

      console.log(`Generating challenges for ${activeUsers.length} active users...`);
      for (const user of activeUsers) {
        await generateUserChallenge(user);
      }
      console.log('Finished daily challenge generation.');
    } catch (error) {
      console.error('Error in daily challenge cron job:', error);
    }
  });
};

module.exports = {
  initChallengeScheduler,
  generateUserChallenge
};
