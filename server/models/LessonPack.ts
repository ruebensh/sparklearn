import mongoose from 'mongoose';

const lessonPackSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subject: { type: String, enum: ['math', 'literacy', 'science', 'life-skills', 'language', 'other'], required: true },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  language: { type: String, default: 'en' },
  ageRange: { min: Number, max: Number },
  description: { type: String, trim: true },

  // PDF file info
  pdfPath: { type: String },           // Server da saqlangan yo'l
  pdfOriginalName: { type: String },   // Asl fayl nomi
  pdfSizeKB: { type: Number },
  pdfText: { type: String },           // pdf-parse bilan chiqarilgan matn (AI uchun)

  isOfflineReady: { type: Boolean, default: true },
  downloadCount: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Assigned students
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

export default mongoose.model('LessonPack', lessonPackSchema);