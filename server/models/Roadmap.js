const mongoose = require('mongoose');

const RoadmapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skillGapId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SkillGap',
    required: true
  },
  duration: {
    type: Number,
    enum: [30, 60, 90],
    required: true
  },
  weeks: [{
    weekNumber: Number,
    goal: String,
    days: [{
      day: Number,
      task: String,
      type: {
        type: String,
        enum: ['read', 'watch', 'build', 'practice']
      },
      resource: String,
      completed: {
        type: Boolean,
        default: false
      },
      completedAt: {
        type: Date
      }
    }]
  }],
  progress: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Roadmap', RoadmapSchema);
