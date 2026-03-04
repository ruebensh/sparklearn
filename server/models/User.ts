import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // --- COMMON FIELDS ---
  name: { type: String, required: true, trim: true },
  role: { type: String, enum: ['parent', 'student', 'admin'], required: true },
  password: { type: String, required: true, minlength: 6 },
  language: { type: String, default: 'en' },
  isVerified: { type: Boolean, default: false },
  refreshToken: { type: String, default: null },

  // --- PARENT ONLY FIELDS ---
  email: {
    type: String,
    lowercase: true,
    trim: true,
    sparse: true, // null bo'lsa ham unique indeks ishlaydi
    unique: true, // Bu avtomatik ravishda indeks yaratadi
  },
  phone: { type: String, trim: true },
  region: { type: String, trim: true },
  occupation: { type: String, trim: true },
  
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],

  // --- STUDENT ONLY FIELDS ---
  username: {
    type: String,
    lowercase: true,
    trim: true,
    sparse: true,
    unique: true, // Bu ham avtomatik ravishda indeks yaratadi
  },
  age: { type: Number, min: 3, max: 25 },
  grade: { type: String, trim: true },
  
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },

  // --- LEARNING DATA (student) ---
  currentLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  totalLessonsCompleted: { type: Number, default: 0 },
  totalTimeSpentMinutes: { type: Number, default: 0 },
  lastActivityAt: { type: Date, default: null },

  // --- OFFLINE SYNC ---
  offlineData: { type: mongoose.Schema.Types.Mixed, default: null },
  lastSyncedAt: { type: Date, default: null },

}, { 
  timestamps: true,
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true } 
});

// --- INDEXES ---
// Faqat parent maydoni uchun indeks qoldiramiz (chunki u yuqorida unique emas)
userSchema.index({ parent: 1 });

// --- VIRTUAL: student uchun displayName ---
userSchema.virtual('displayName').get(function () {
  if (this.role === 'student') return this.username;
  return this.name;
});

export default mongoose.model('User', userSchema);