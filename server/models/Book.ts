import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true, enum: ['math', 'literacy', 'science', 'language', 'life-skills', 'history', 'geography', 'physics', 'chemistry', 'biology', 'other'] },
  grade: { type: Number, required: true, min: 1, max: 11 },
  language: { type: String, enum: ['uz', 'ru', 'en'], default: 'uz' },
  description: String,
  pdfPath: String,
  pdfText: String,
  coverEmoji: { type: String, default: '📚' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Book', bookSchema);
