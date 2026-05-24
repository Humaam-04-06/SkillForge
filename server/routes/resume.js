const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const aiService = require('../services/aiService');
const githubService = require('../services/githubService');

// POST /api/resume/generate
router.post('/generate', requireAuth, async (req, res) => {
  try {
    const { repoIds } = req.body;
    if (!repoIds || !Array.isArray(repoIds) || repoIds.length === 0) {
      return res.status(400).json({ message: 'repoIds (array) is required.' });
    }

    const user = req.user;
    const apiKey = req.headers['x-api-key'] || user.apiKey;

    if (!user.githubAccessToken) {
      return res.status(400).json({ message: 'GitHub authentication required.' });
    }

    // 1. Fetch repositories from GitHub to get metadata
    const repos = await githubService.fetchUserRepos(user.username, user.githubAccessToken);
    
    // Filter repos matched by ID
    const selectedRepos = repos.filter(r => repoIds.includes(String(r.id)) || repoIds.includes(r.id));
    
    if (selectedRepos.length === 0) {
      return res.status(400).json({ message: 'None of the provided repoIds were found in public repositories.' });
    }

    const results = [];
    
    // Generate bullets for each repo
    for (const repo of selectedRepos) {
      const repoDetails = {
        name: repo.name,
        description: repo.description || 'No description provided.',
        language: repo.language || 'JavaScript',
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        createdAt: repo.created_at
      };

      const bulletsObj = await aiService.generateResumeBullets(repoDetails, apiKey);
      results.push(bulletsObj);
    }

    res.json({
      message: 'Resume bullets generated successfully.',
      projects: results
    });

  } catch (error) {
    console.error('Error generating resume bullets:', error);
    res.status(500).json({ message: 'Failed to generate resume bullets.' });
  }
});

// POST /api/resume/export-pdf
// Simply outputs plain text format for direct client download
router.post('/export-pdf', requireAuth, (req, res) => {
  try {
    const { bullets } = req.body; // Expects array of { repoName, bullets: [] }
    if (!bullets || !Array.isArray(bullets)) {
      return res.status(400).json({ message: 'bullets data is required.' });
    }

    let textContent = `=========================================\n`;
    textContent += `    SKILLFORGE GENERATED RESUME BULLETS\n`;
    textContent += `=========================================\n\n`;

    bullets.forEach(proj => {
      textContent += `Project: ${proj.repoName}\n`;
      textContent += `-----------------------------------------\n`;
      proj.bullets.forEach((bullet, index) => {
        textContent += `${index + 1}. [ ] ${bullet}\n`;
      });
      textContent += `\n`;
    });

    res.setHeader('Content-disposition', 'attachment; filename=skillforge_resume_bullets.txt');
    res.setHeader('Content-type', 'text/plain');
    res.charset = 'UTF-8';
    res.write(textContent);
    res.end();

  } catch (error) {
    console.error('Error exporting bullets:', error);
    res.status(500).json({ message: 'Failed to export resume bullets.' });
  }
});

module.exports = router;
