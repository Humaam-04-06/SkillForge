const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  githubId: {
    type: String,
    required: true,
    unique: true
  },
  githubAccessToken: {
    type: String
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String
  },
  avatarUrl: {
    type: String
  },
  email: {
    type: String
  },
  profileUrl: {
    type: String
  },
  bio: {
    type: String
  },
  publicRepos: {
    type: Number,
    default: 0
  },
  followers: {
    type: Number,
    default: 0
  },
  following: {
    type: Number,
    default: 0
  },
  location: {
    type: String
  },
  company: {
    type: String
  },
  apiKey: {
    type: String,
    default: ''
  },
  aiProvider: {
    type: String,
    default: 'gemini'
  },
  theme: {
    type: String,
    default: 'dark',
    enum: ['dark', 'light']
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  skills: {
    type: Map,
    of: Number,
    default: {
      'JavaScript': 0,
      'Python': 0,
      'Backend': 0,
      'Frontend': 0,
      'DevOps': 0,
      'Database': 0,
      'Mobile': 0,
      'AI/ML': 0
    }
  },
  contributionHeatmap: {
    type: Array, // Array of commits per day/week
    default: []
  },
  streak: {
    type: Number,
    default: 0
  },
  challengesCompletedCount: {
    type: Number,
    default: 0
  },
  matchScoreHistory: [{
    jobTitle: String,
    score: Number,
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
