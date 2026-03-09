import { Request, Response } from 'express';
import Groq from 'groq-sdk';
import StudentProfile from '../models/StudentProfile.js';
import ChatSession from '../models/ChatSession.js';
import QuizResult from '../models/QuizResult.js';
import Book from '../models/Book.js';
import LessonPack from '../models/LessonPack.js';
import { success, error } from '../utils/apiResponse.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── ONBOARDING ──
export const saveOnboarding = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const studentId = req.user?.id;
    const { grade, language, interests, difficultSubjects, favoriteSubjects } = req.body;
    const profile = await StudentProfile.findOneAndUpdate(
      { student: studentId },
      { grade, language, interests, difficultSubjects, favoriteSubjects, isOnboardingComplete: true },
      { upsert: true, new: true }
    );
    return success(res, { profile }, 'Onboarding complete!');
  } catch (err: any) {
    return error(res, 'Failed to save onboarding', 500);
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const studentId = req.user?.id;
    const profile = await StudentProfile.findOne({ student: studentId });
    return success(res, { profile });
  } catch (err: any) {
    return error(res, 'Failed to get profile', 500);
  }
};

// ── BOOKS ──
export const getBooks = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const studentId = req.user?.id;
    const profile = await StudentProfile.findOne({ student: studentId });
    const filter: any = { isActive: true };
    if (profile?.grade) filter.grade = profile.grade;
    if (profile?.language) filter.language = profile.language;
    const books = await Book.find(filter).select('-pdfText');
    return success(res, { books });
  } catch (err: any) {
    return error(res, 'Failed to get books', 500);
  }
};

// ── SESSIONS LIST ──
export const getSessions = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const studentId = req.user?.id;
    const { bookId, lessonPackId } = req.query;
    const filter: any = { student: studentId };
    if (bookId) filter.bookId = bookId;
    if (lessonPackId) filter.lessonPackId = lessonPackId;
    const sessions = await ChatSession.find(filter).sort({ updatedAt: -1 }).limit(20);
    const sessionsWithPreview = sessions.map((s: any) => ({
      _id: s._id,
      subject: s.subject,
      lastTopic: s.lastTopic,
      bookId: s.bookId,
      lessonPackId: s.lessonPackId,
      updatedAt: s.updatedAt,
      messageCount: s.messages.length,
      preview: s.messages[s.messages.length - 1]?.content?.slice(0, 80) || '',
    }));
    return success(res, { sessions: sessionsWithPreview });
  } catch (err: any) {
    return error(res, 'Failed to get sessions', 500);
  }
};

// ── GET SESSION ──
export const getSession = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const studentId = req.user?.id;
    const { sessionId } = req.params;
    const session = await ChatSession.findOne({ _id: sessionId, student: studentId });
    if (!session) return error(res, 'Session not found', 404);
    return success(res, { session });
  } catch (err: any) {
    return error(res, 'Failed to get session', 500);
  }
};

// ── AI CHAT ──
export const chat = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const studentId = req.user?.id;
    const { message, sessionId, bookId, lessonPackId } = req.body;
    const profile = await StudentProfile.findOne({ student: studentId });

    let contextText = '';
    let sourceTitle = '';

    if (bookId) {
      const book = await Book.findById(bookId);
      if (book?.pdfText) { contextText = book.pdfText.slice(0, 8000); sourceTitle = book.title; }
    } else if (lessonPackId) {
      const lesson = await LessonPack.findById(lessonPackId);
      if (lesson?.pdfText) { contextText = lesson.pdfText.slice(0, 8000); sourceTitle = lesson.title; }
    }

    let session: any;
    if (sessionId) {
      session = await ChatSession.findOne({ _id: sessionId, student: studentId });
    }
    if (!session) {
      session = await ChatSession.create({
        student: studentId, bookId: bookId || null,
        lessonPackId: lessonPackId || null,
        subject: sourceTitle, messages: [],
      });
    }

    const lang = profile?.language || 'uz';
    const langName = lang === 'uz' ? "O'zbek" : lang === 'ru' ? 'Ruscha' : 'English';
    const interests = profile?.interests?.join(', ') || 'turli narsalar';
    const grade = profile?.grade || '?';
    const difficultSubjects = profile?.difficultSubjects?.join(', ') || '';

    const systemPrompt = `Sen "Crisis Classroom" AI o'qituvchisisan.
${grade}-sinf o'quvchisiga ${langName} tilida dars ber.
O'quvchi qiziqishlari: ${interests}.
${difficultSubjects ? `Qiynalayotgan fanlari: ${difficultSubjects}. Bu fanlarni qiziqishlari orqali tushuntir.` : ''}
${contextText ? `Darslik matni:\n${contextText}\n\nFaqat shu darslik asosida dars ber.` : ''}
Har doim qiziqarli, qisqa va aniq tushuntir. Misollarni o'quvchi qiziqishlariga bog'la.
Javobni ${langName} tilida ber.`;

    const historyMessages = session.messages.slice(-10).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    }));
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...historyMessages,
        { role: 'user', content: message },
      ],
      max_tokens: 1500,
    });
    const aiResponse = completion.choices[0]?.message?.content || 'Javob topilmadi';

    session.messages.push({ role: 'user', content: message } as any);
    session.messages.push({ role: 'assistant', content: aiResponse } as any);
    session.lastTopic = message.slice(0, 100);
    if (sourceTitle) session.subject = sourceTitle;
    await session.save();

    return success(res, { response: aiResponse, sessionId: session._id });
  } catch (err: any) {
    console.error('Chat error:', err);
    return error(res, 'Chat failed: ' + err.message, 500);
  }
};

// ── QUIZ GENERATE ──
export const generateQuiz = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const studentId = req.user?.id;
    const { sessionId, bookId, lessonPackId, subject } = req.body;
    const profile = await StudentProfile.findOne({ student: studentId });
    const lang = profile?.language || 'uz';
    const langName = lang === 'uz' ? "O'zbek" : lang === 'ru' ? 'Ruscha' : 'English';
    const interests = profile?.interests?.join(', ') || '';

    let contextText = '';
    let lastTopic = '';

    if (sessionId) {
      const session = await ChatSession.findById(sessionId);
      lastTopic = session?.lastTopic || '';
      if (session?.bookId) {
        const book = await Book.findById(session.bookId);
        contextText = book?.pdfText?.slice(0, 6000) || '';
      } else if (session?.lessonPackId) {
        const lesson = await LessonPack.findById(session.lessonPackId);
        contextText = lesson?.pdfText?.slice(0, 6000) || '';
      }
    } else if (bookId) {
      const book = await Book.findById(bookId);
      contextText = book?.pdfText?.slice(0, 6000) || '';
    } else if (lessonPackId) {
      const lesson = await LessonPack.findById(lessonPackId);
      contextText = lesson?.pdfText?.slice(0, 6000) || '';
    }

    const prompt = `${langName} tilida 5 ta test savol tuz.
${lastTopic ? `Mavzu: ${lastTopic}` : subject ? `Fan: ${subject}` : ''}
${contextText ? `Darslik asosida:\n${contextText.slice(0, 3000)}` : ''}
${interests ? `Savollarni qiziqishlarga bog'la: ${interests}` : ''}

FAQAT JSON qaytargil:
{
  "questions": [
    {
      "question": "savol matni",
      "options": ["A variant", "B variant", "C variant", "D variant"],
      "correctIndex": 0,
      "explanation": "nima uchun to'g'ri"
    }
  ]
}`;

    const quizCompletion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
    });
    const raw = quizCompletion.choices[0]?.message?.content || '';
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return success(res, { questions: parsed.questions, sessionId, subject });
  } catch (err: any) {
    console.error('Quiz generate error:', err);
    return error(res, 'Failed to generate quiz', 500);
  }
};

// ── QUIZ SUBMIT ──
export const submitQuiz = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const studentId = req.user?.id;
    const { questions, answers, subject, bookId, lessonPackId, topic } = req.body;
    const profile = await StudentProfile.findOne({ student: studentId });

    let correctAnswers = 0;
    const processedQuestions = questions.map((q: any, i: number) => {
      const isCorrect = answers[i] === q.correctIndex;
      if (isCorrect) correctAnswers++;
      return { ...q, studentAnswer: answers[i], isCorrect };
    });

    const score = Math.round((correctAnswers / questions.length) * 100);
    const weakAreas: string[] = score < 60 ? [subject] : [];
    const strongAreas: string[] = score >= 60 ? [subject] : [];

    const quizResult = await QuizResult.create({
      student: studentId, subject, grade: profile?.grade, topic,
      bookId, lessonPackId, questions: processedQuestions,
      score, totalQuestions: questions.length, correctAnswers,
      level: profile?.grade ? (profile.grade <= 4 ? 'beginner' : profile.grade <= 8 ? 'intermediate' : 'advanced') : 'beginner',
      weakAreas, strongAreas,
    });

    return success(res, { score, correctAnswers, totalQuestions: questions.length, quizId: quizResult._id, weakAreas, strongAreas });
  } catch (err: any) {
    console.error('Submit quiz error:', err);
    return error(res, 'Failed to submit quiz', 500);
  }
};

// ── PROGNOZ ──
export const getProgress = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const studentId = req.user?.id;
    const targetId = (req.params as any).studentId || studentId;

    const quizResults = await QuizResult.find({ student: targetId }).sort({ createdAt: -1 }).limit(50);
    const profile = await StudentProfile.findOne({ student: targetId });

    const subjectMap: Record<string, number[]> = {};
    quizResults.forEach((q: any) => {
      if (!subjectMap[q.subject]) subjectMap[q.subject] = [];
      subjectMap[q.subject].push(q.score);
    });

    const subjectScores = Object.entries(subjectMap).map(([subject, scores]) => ({
      subject, avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      quizCount: scores.length,
      trend: scores.length > 1 ? (scores[0] > scores[scores.length - 1] ? 'up' : 'down') : 'stable',
    }));

    const weeklyData = quizResults.slice(0, 10).reverse().map((q: any, i: number) => ({
      name: `Quiz ${i + 1}`, score: q.score, subject: q.subject,
      date: new Date(q.createdAt).toLocaleDateString(),
    }));

    const recentScores = quizResults.slice(0, 5).map((q: any) => q.score);
    const avgRecent = recentScores.length ? Math.round(recentScores.reduce((a: number, b: number) => a + b, 0) / recentScores.length) : 0;
    const trend = recentScores.length > 1 ? recentScores[0] - recentScores[recentScores.length - 1] : 0;
    const forecast = Math.min(100, Math.max(0, avgRecent + Math.round(trend * 0.5)));

    return success(res, { profile, subjectScores, weeklyData, totalQuizzes: quizResults.length, avgScore: avgRecent, forecast, recentQuizzes: quizResults.slice(0, 5) });
  } catch (err: any) {
    return error(res, 'Failed to get progress', 500);
  }
};
