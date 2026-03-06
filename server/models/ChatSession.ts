import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const chatSessionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', default: null },
  lessonPackId: { type: mongoose.Schema.Types.ObjectId, ref: 'LessonPack', default: null },
  subject: String,
  messages: [messageSchema],
  lastTopic: String, // Oxirgi o'rganilgan mavzu (quiz uchun)
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('ChatSession', chatSessionSchema);
