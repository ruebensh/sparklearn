import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  grade: { type: Number, min: 1, max: 11 },
  language: { type: String, enum: ['uz', 'ru', 'en'], default: 'uz' },
  interests: [{ type: String }], // ['sport', 'music', 'technology', 'art', 'cooking', ...]
  difficultSubjects: [{ type: String }], // ['math', 'physics', ...]
  favoriteSubjects: [{ type: String }],
  isOnboardingComplete: { type: Boolean, default: false },
  // AI tomonidan hisoblangan
  currentTopics: [{
    subject: String,
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    lastPage: { type: Number, default: 0 },
    progress: { type: Number, default: 0 },
  }],
}, { timestamps: true });

export default mongoose.model('StudentProfile', studentProfileSchema);
