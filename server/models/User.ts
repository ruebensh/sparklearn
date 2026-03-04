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
  // Parent email bilan ro'yxatdan o'tadi
  email: {
    type: String,
    lowercase: true,
    trim: true,
    sparse: true, // null bo'lsa ham unique ishlaydi
    unique: true,
  },
  phone: { type: String, trim: true },         // Telefon raqam (ixtiyoriy)
  region: { type: String, trim: true },         // Hudud
  occupation: { type: String, trim: true },     // Kasb
  // Parent yaratgan studentlar ro'yxati
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],

  // --- STUDENT ONLY FIELDS ---
  // Student username bilan kiradi (parent yaratadi)
  username: {
    type: String,
    lowercase: true,
    trim: true,
    sparse: true,
    unique: true,
  },
  age: { type: Number, min: 3, max: 25 },
  grade: { type: String, trim: true },          // Sinf: "5", "6" va hokazo
  // Student qaysi parentga tegishli
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

}, { timestamps: true });

// --- INDEXES ---
userSchema.index({ email: 1 }, { sparse: true });
userSchema.index({ username: 1 }, { sparse: true });
userSchema.index({ parent: 1 });

// --- VIRTUAL: student uchun displayName ---
userSchema.virtual('displayName').get(function () {
  if (this.role === 'student') return this.username;
  return this.name;
});

export default mongoose.model('User', userSchema);