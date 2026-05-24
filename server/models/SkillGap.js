const mongoose = require('mongoose');

const SkillGapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobTitle: {
    type: String,
    required: true
  },
  jobDescription: {
    type: String,
    required: true
  },
  matchScore: {
    type: Number,
    required: true
  },
  userSkills: [{
    skill: String,
    level: Number,
    confidence: Number
  }],
  jobRequirements: [{
    skill: String,
    level: Number,
    priority: {
      type: String,
      enum: ['high', 'medium', 'low']
    }
  }],
  gaps: [{
    skill: String,
    currentLevel: Number,
    requiredLevel: Number,
    gapSize: Number,
    priority: {
      type: String,
      enum: ['high', 'medium', 'low']
    }
  }],
  analyzedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SkillGap', SkillGapSchema);
