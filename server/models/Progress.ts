import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lessonPack: { type: mongoose.Schema.Types.ObjectId, ref: 'LessonPack', required: true },

  percentComplete: { type: Number, default: 0, min: 0, max: 100 },
  totalTimeSpentMinutes: { type: Number, default: 0 },
  lastActivityAt: { type: Date, default: null },
  isCompleted: { type: Boolean, default: false },

  // AI assessment scores
  quizScores: [{
    takenAt: { type: Date, default: Date.now },
    score: Number,          // 0-100
    totalQuestions: Number,
    correctAnswers: Number,
    level: String,          // 'beginner' | 'intermediate' | 'advanced'
    topic: String,
  }],

  // Skill tracking per subject
  skillScores: {
    math: { type: Number, default: 0 },
    literacy: { type: Number, default: 0 },
    science: { type: Number, default: 0 },
    language: { type: Number, default: 0 },
    'life-skills': { type: Number, default: 0 },
  },

  // Adaptive level
  currentLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },

  isSynced: { type: Boolean, default: true },
  offlineUpdates: [mongoose.Schema.Types.Mixed],
}, { timestamps: true });

progressSchema.index({ user: 1, lessonPack: 1 }, { unique: true });

export default mongoose.model('Progress', progressSchema);