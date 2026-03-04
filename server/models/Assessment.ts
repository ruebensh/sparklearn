import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema({
  lessonPack: { type: mongoose.Schema.Types.ObjectId, ref: 'LessonPack' },
  questions: [{
    id: String,
    text: String,
    type: { type: String, enum: ['multiple-choice', 'true-false', 'fill-blank'] },
    options: [String],
    correctAnswer: String,
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
    topic: String,
  }],
  results: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: Number,
    answers: mongoose.Schema.Types.Mixed,
    completedAt: Date,
    adaptiveRecommendation: String,        // Next suggested level
  }],
}, { timestamps: true });

export default mongoose.model('Assessment', assessmentSchema);
