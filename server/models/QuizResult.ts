import mongoose from 'mongoose';

const quizResultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  grade: Number,
  topic: String,
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', default: null },
  lessonPackId: { type: mongoose.Schema.Types.ObjectId, ref: 'LessonPack', default: null },
  questions: [{
    question: String,
    options: [String],
    correctIndex: Number,
    studentAnswer: Number,
    isCorrect: Boolean,
    explanation: String,
  }],
  score: { type: Number, min: 0, max: 100 },
  totalQuestions: Number,
  correctAnswers: Number,
  timeTakenMinutes: Number,
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  // Prognoz uchun
  weakAreas: [String],
  strongAreas: [String],
}, { timestamps: true });

quizResultSchema.index({ student: 1, subject: 1, createdAt: -1 });

export default mongoose.model('QuizResult', quizResultSchema);
