const mongoose = require('mongoose');

const ChallengeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  challenge: {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['coding problem', 'mini-project', 'concept explanation', 'quiz'],
      required: true
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true
    },
    skill: {
      type: String,
      required: true
    },
    // For quizzes or interactive questions
    options: [String],
    correctAnswer: String
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  solution: {
    type: String,
    default: ''
  },
  isCorrect: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Challenge', ChallengeSchema);
