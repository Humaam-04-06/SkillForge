const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const githubService = require('../services/githubService');

router.get('/analyze', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    
    if (!user.githubAccessToken) {
      return res.status(400).json({ message: 'GitHub access token missing. Please re-authenticate.' });
    }

    console.log(`Starting scan for GitHub user: ${user.username}`);

    // 1. Fetch user data from GitHub (to ensure profile is up to date)
    const ghProfile = await githubService.fetchUserProfile(user.username, user.githubAccessToken);
    
    // 2. Fetch public repos
    const repos = await githubService.fetchUserRepos(user.username, user.githubAccessToken);

    // 3. Analyze languages and update skills map
    const calculatedSkills = githubService.analyzeLanguages(repos);
    
    // 4. Generate contribution heatmap
    const heatmap = githubService.getContributionData(user.username);

    // Update user record in MongoDB
    user.displayName = ghProfile.name || user.displayName;
    user.avatarUrl = ghProfile.avatar_url || user.avatarUrl;
    user.bio = ghProfile.bio || user.bio;
    user.publicRepos = ghProfile.public_repos || repos.length;
    user.followers = ghProfile.followers || 0;
    user.following = ghProfile.following || 0;
    user.location = ghProfile.location || user.location;
    user.company = ghProfile.company || user.company;
    user.skills = calculatedSkills;
    user.contributionHeatmap = heatmap;

    await user.save();

    console.log(`GitHub analysis complete for ${user.username}`);

    res.json({
      message: 'GitHub analysis completed successfully.',
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        publicRepos: user.publicRepos,
        followers: user.followers,
        following: user.following,
        location: user.location,
        company: user.company,
        skills: user.skills,
        contributionHeatmap: user.contributionHeatmap
      }
    });

  } catch (error) {
    console.error('Error analyzing GitHub profile:', error);
    res.status(500).json({ message: 'Failed to complete GitHub profile analysis.', error: error.message });
  }
});

module.exports = router;
