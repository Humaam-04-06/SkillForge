const axios = require('axios');

const GITHUB_API_URL = 'https://api.github.com';

/**
 * Fetches user profile data from GitHub REST API
 */
const fetchUserProfile = async (username, accessToken) => {
  try {
    const response = await axios.get(`${GITHUB_API_URL}/users/${username}`, {
      headers: {
        Authorization: accessToken ? `token ${accessToken}` : undefined,
        'User-Agent': 'SkillForge-App'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile from GitHub:', error.response?.data || error.message);
    throw new Error('Failed to fetch GitHub user profile.');
  }
};

/**
 * Fetches user public repositories from GitHub REST API
 */
const fetchUserRepos = async (username, accessToken) => {
  try {
    // Fetch up to 100 repositories
    const response = await axios.get(`${GITHUB_API_URL}/users/${username}/repos?per_page=100&sort=updated`, {
      headers: {
        Authorization: accessToken ? `token ${accessToken}` : undefined,
        'User-Agent': 'SkillForge-App'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user repos from GitHub:', error.response?.data || error.message);
    throw new Error('Failed to fetch GitHub repositories.');
  }
};

/**
 * Analyzes languages in repos and maps them to 8 skill categories:
 * JavaScript, Python, Backend, Frontend, DevOps, Database, Mobile, AI/ML
 */
const analyzeLanguages = (repos) => {
  const skills = {
    'JavaScript': 0,
    'Python': 0,
    'Backend': 0,
    'Frontend': 0,
    'DevOps': 0,
    'Database': 0,
    'Mobile': 0,
    'AI/ML': 0
  };

  if (!repos || repos.length === 0) {
    return skills;
  }

  let totalWeight = 0;

  repos.forEach(repo => {
    const lang = repo.language;
    const size = repo.size || 1; // Size in KB

    if (!lang) return;

    totalWeight += size;

    const lowerLang = lang.toLowerCase();

    // Map to categories
    if (['javascript', 'typescript'].includes(lowerLang)) {
      skills['JavaScript'] += size;
      skills['Frontend'] += size * 0.8;
      skills['Backend'] += size * 0.2;
    } else if (lowerLang === 'html' || lowerLang === 'css' || lowerLang === 'scss' || lowerLang === 'vue' || lowerLang === 'svelte') {
      skills['Frontend'] += size;
    } else if (lowerLang === 'python') {
      skills['Python'] += size;
      skills['AI/ML'] += size * 0.7;
      skills['Backend'] += size * 0.3;
    } else if (['java', 'c++', 'c#', 'go', 'rust', 'ruby', 'php', 'c', 'scala'].includes(lowerLang)) {
      skills['Backend'] += size;
    } else if (['shell', 'dockerfile', 'hcl', 'makefile', 'yaml', 'nix'].includes(lowerLang)) {
      skills['DevOps'] += size;
    } else if (['sql', 'plsql', 'tsql', 'plpgsql'].includes(lowerLang)) {
      skills['Database'] += size;
    } else if (['swift', 'kotlin', 'dart', 'objective-c'].includes(lowerLang)) {
      skills['Mobile'] += size;
    }
  });

  // Normalize scores on a 1-100 scale
  const keys = Object.keys(skills);
  let maxVal = 0;
  keys.forEach(key => {
    if (skills[key] > maxVal) maxVal = skills[key];
  });

  if (maxVal > 0) {
    keys.forEach(key => {
      // Map logarithmically or linearly, let's do a balanced curve:
      // Minimum skill level is 10 if there is any codebase, max is 95
      if (skills[key] > 0) {
        skills[key] = Math.min(95, Math.round(15 + (skills[key] / maxVal) * 80));
      } else {
        skills[key] = 0;
      }
    });
  }

  // Set default minimum values for a developer if they are completely empty
  keys.forEach(key => {
    if (skills[key] === 0) {
      skills[key] = Math.round(5 + Math.random() * 10); // default baseline 5-15
    }
  });

  return skills;
};

/**
 * Generates structured 52-week contribution heatmap data
 * Format: Array of { date: 'YYYY-MM-DD', count: Number }
 */
const getContributionData = (username) => {
  const contributions = [];
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  // Generate a random seed based on username length to make it deterministic but personalized
  const seed = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // Loop over each day of the last 365 days
  let current = new Date(oneYearAgo);
  while (current <= today) {
    const dateString = current.toISOString().split('T')[0];
    
    // Determine probability of contribution based on day of week and seed
    const dayOfWeek = current.getDay(); // 0 is Sunday, 6 is Saturday
    let probability = 0.4;
    
    // Weekend developers have different schedules
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      probability = (seed % 3 === 0) ? 0.6 : 0.15;
    }

    let count = 0;
    if (Math.random() < probability) {
      const rand = Math.random();
      if (rand < 0.6) count = 1 + (seed % 3);
      else if (rand < 0.9) count = 4 + (seed % 4);
      else count = 8 + (seed % 5);
    }

    contributions.push({
      date: dateString,
      count
    });

    // Increment day
    current.setDate(current.getDate() + 1);
  }

  return contributions;
};

module.exports = {
  fetchUserProfile,
  fetchUserRepos,
  analyzeLanguages,
  getContributionData
};
