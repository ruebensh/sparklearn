import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import Groq from 'groq-sdk';
import LessonPack from '../models/LessonPack.js';
import Progress from '../models/Progress.js';
import User from '../models/User.js';
import { success, error } from '../utils/apiResponse.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Upload papkasi
const uploadDir = path.join(process.cwd(), 'uploads', 'lessons');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'));
  },
});

// ─────────────────────────────────────────
// POST /api/lessons  →  PDF yuklash (parent only)
// ─────────────────────────────────────────
export const createLesson = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const parentId = req.user?.id;
    const file = req.file;

    if (!file) return error(res, 'PDF file is required', 400);

    const { title, subject, level, language, ageMin, ageMax, description, assignedTo } = req.body;

    if (!title || !subject || !level) return error(res, 'Title, subject and level are required', 400);

    // PDF matnini chiqarish
    const pdfBuffer = fs.readFileSync(file.path);
    const pdfData = await pdfParse(pdfBuffer);
    const pdfText = pdfData.text.slice(0, 15000); // Max 15k char AI uchun

    const lesson = await LessonPack.create({
      title,
      subject,
      level,
      language: language || 'en',
      description,
      ageRange: { min: ageMin || 5, max: ageMax || 18 },
      pdfPath: file.path,
      pdfOriginalName: file.originalname,
      pdfSizeKB: Math.round(file.size / 1024),
      pdfText,
      createdBy: parentId,
      assignedTo: assignedTo ? JSON.parse(assignedTo) : [],
    });

    return success(res, { lesson }, 'Lesson uploaded successfully', 201);
  } catch (err: any) {
    console.error('Upload error:', err);
    return error(res, err.message || 'Upload failed', 500);
  }
};

// ─────────────────────────────────────────
// GET /api/lessons  →  Parent o'z darslarini ko'radi
// ─────────────────────────────────────────
export const getLessons = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    // @ts-ignore
    const role = req.user?.role;

    let lessons;
    if (role === 'parent') {
      lessons = await LessonPack.find({ createdBy: userId })
        .populate('assignedTo', 'name username grade')
        .sort({ createdAt: -1 });
    } else {
      // Student — o'ziga assigned darslar
      lessons = await LessonPack.find({ assignedTo: userId }).sort({ createdAt: -1 });
    }

    return success(res, { lessons });
  } catch (err: any) {
    return error(res, 'Failed to fetch lessons', 500);
  }
};

// ─────────────────────────────────────────
// GET /api/lessons/:id  →  Bitta dars
// ─────────────────────────────────────────
export const getLessonById = async (req: Request, res: Response) => {
  try {
    const lesson = await LessonPack.findById(req.params.id);
    if (!lesson) return error(res, 'Lesson not found', 404);
    return success(res, { lesson });
  } catch (err: any) {
    return error(res, 'Failed to fetch lesson', 500);
  }
};

// ─────────────────────────────────────────
// DELETE /api/lessons/:id  →  Darsni o'chirish
// ─────────────────────────────────────────
export const deleteLesson = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const parentId = req.user?.id;
    const lesson = await LessonPack.findOne({ _id: req.params.id, createdBy: parentId });
    if (!lesson) return error(res, 'Lesson not found', 404);

    // PDF faylni o'chirish
    if (lesson.pdfPath && fs.existsSync(lesson.pdfPath)) {
      fs.unlinkSync(lesson.pdfPath);
    }
    await lesson.deleteOne();
    return success(res, null, 'Lesson deleted');
  } catch (err: any) {
    return error(res, 'Delete failed', 500);
  }
};

// ─────────────────────────────────────────
// POST /api/lessons/:id/assign  →  O'quvchiga biriktirish
// ─────────────────────────────────────────
export const assignLesson = async (req: Request, res: Response) => {
  try {
    const { studentIds } = req.body;
    const lesson = await LessonPack.findById(req.params.id);
    if (!lesson) return error(res, 'Lesson not found', 404);
    lesson.assignedTo = studentIds;
    await lesson.save();
    return success(res, { lesson }, 'Lesson assigned');
  } catch (err: any) {
    return error(res, 'Assign failed', 500);
  }
};

// ─────────────────────────────────────────
// POST /api/lessons/:id/explain  →  AI tushuntirish (Groq)
// ─────────────────────────────────────────
export const explainLesson = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    const { question, studentAge, studentLevel } = req.body;

    const lesson = await LessonPack.findById(req.params.id);
    if (!lesson) return error(res, 'Lesson not found', 404);
    if (!lesson.pdfText) return error(res, 'Lesson content not available', 400);

    const user = await User.findById(userId);
    const age = studentAge || user?.age || 12;
    const level = studentLevel || user?.currentLevel || 'beginner';

    const prompt = `You are a friendly, patient teacher helping a ${age}-year-old student at ${level} level.

LESSON CONTENT:
${lesson.pdfText.slice(0, 8000)}

STUDENT'S QUESTION: ${question || 'Please explain this lesson in simple terms'}

Instructions:
- Explain in simple, clear language suitable for a ${age}-year-old
- Use examples from everyday life
- Be encouraging and positive
- If the lesson is in a specific language, respond in that language
- Keep response under 300 words
- End with a simple question to check understanding`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 600,
      temperature: 0.7,
    });

    const explanation = completion.choices[0]?.message?.content || 'Could not generate explanation';

    return success(res, { explanation, lessonTitle: lesson.title });
  } catch (err: any) {
    console.error('AI error:', err);
    return error(res, 'AI explanation failed', 500);
  }
};

// ─────────────────────────────────────────
// POST /api/lessons/:id/quiz  →  AI quiz yaratish
// ─────────────────────────────────────────
export const generateQuiz = async (req: Request, res: Response) => {
  try {
    const { level, count = 5 } = req.body;
    const lesson = await LessonPack.findById(req.params.id);
    if (!lesson) return error(res, 'Lesson not found', 404);
    if (!lesson.pdfText) return error(res, 'Lesson content not available', 400);

    const prompt = `Based on this lesson content, create ${count} multiple choice quiz questions for ${level || 'beginner'} level students.

LESSON: ${lesson.title}
CONTENT: ${lesson.pdfText.slice(0, 6000)}

Return ONLY a JSON array in this exact format, no other text:
[
  {
    "id": "q1",
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Brief explanation why this is correct"
  }
]`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.5,
    });

    const raw = completion.choices[0]?.message?.content || '[]';

    // JSON parse
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    const questions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return success(res, { questions, lessonTitle: lesson.title, level: level || 'beginner' });
  } catch (err: any) {
    console.error('Quiz gen error:', err);
    return error(res, 'Quiz generation failed', 500);
  }
};

// ─────────────────────────────────────────
// POST /api/lessons/:id/quiz/submit  →  Quiz natijasini saqlash
// ─────────────────────────────────────────
export const submitQuiz = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    const { answers, questions, level, timeSpentMinutes } = req.body;

    const lesson = await LessonPack.findById(req.params.id);
    if (!lesson) return error(res, 'Lesson not found', 404);

    // Score hisoblash
    let correct = 0;
    questions.forEach((q: any, i: number) => {
      if (answers[i] === q.correctIndex) correct++;
    });
    const score = Math.round((correct / questions.length) * 100);

    // Adaptive level aniqlash
    let nextLevel = level;
    if (score >= 85) nextLevel = level === 'beginner' ? 'intermediate' : 'advanced';
    else if (score < 50) nextLevel = level === 'advanced' ? 'intermediate' : 'beginner';

    // Progress saqlash yoki yangilash
    let progress = await Progress.findOne({ user: userId, lessonPack: req.params.id });
    if (!progress) {
      progress = await Progress.create({ user: userId, lessonPack: req.params.id });
    }

    progress.quizScores.push({
      takenAt: new Date(),
      score,
      totalQuestions: questions.length,
      correctAnswers: correct,
      level,
      topic: lesson.subject,
    });

    // Skill score yangilash (rolling average)
    const subject = lesson.subject as string;
    if (subject && (progress.skillScores as any)[subject] !== undefined) {
      const old = (progress.skillScores as any)[subject] || 0;
      (progress.skillScores as any)[subject] = Math.round((old + score) / 2);
    }

    progress.currentLevel = nextLevel as any;
    progress.totalTimeSpentMinutes += timeSpentMinutes || 0;
    progress.lastActivityAt = new Date();
    progress.percentComplete = Math.min(100, progress.percentComplete + 20);
    await progress.save();

    // User currentLevel yangilash
    await User.findByIdAndUpdate(userId, { currentLevel: nextLevel, lastActivityAt: new Date() });

    return success(res, {
      score,
      correct,
      total: questions.length,
      nextLevel,
      message: score >= 70 ? '🎉 Great job! Keep it up!' : '📚 Keep practicing, you\'re improving!',
    });
  } catch (err: any) {
    console.error('Submit quiz error:', err);
    return error(res, 'Failed to save quiz result', 500);
  }
};