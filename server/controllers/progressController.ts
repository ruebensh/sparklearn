import { Request, Response } from 'express';
import Progress from '../models/Progress.js';
import User from '../models/User.js';
import { success, error } from '../utils/apiResponse.js';

// GET /api/progress  →  Student yoki parent uchun progress
export const getProgress = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    // @ts-ignore
    const role = req.user?.role;

    if (role === 'parent') {
      // Parent — barcha farzandlarning progressi
      const parent = await User.findById(userId).populate('children');
      const childIds = parent?.children || [];

      const allProgress = await Progress.find({ user: { $in: childIds } })
        .populate('user', 'name username age grade currentLevel')
        .populate('lessonPack', 'title subject level')
        .sort({ lastActivityAt: -1 });

      return success(res, { progress: allProgress });
    } else {
      // Student — o'z progressi
      const progress = await Progress.find({ user: userId })
        .populate('lessonPack', 'title subject level pdfOriginalName')
        .sort({ lastActivityAt: -1 });

      // Skill summary
      const skillSummary = {
        math: 0, literacy: 0, science: 0, language: 0, 'life-skills': 0,
      };
      let totalQuizzes = 0;
      let avgScore = 0;

      progress.forEach(p => {
        Object.keys(skillSummary).forEach(k => {
          (skillSummary as any)[k] = Math.max((skillSummary as any)[k], (p.skillScores as any)[k] || 0);
        });
        totalQuizzes += p.quizScores.length;
        p.quizScores.forEach((q: any) => avgScore += q.score);
      });

      if (totalQuizzes > 0) avgScore = Math.round(avgScore / totalQuizzes);

      return success(res, { progress, skillSummary, totalQuizzes, avgScore });
    }
  } catch (err: any) {
    return error(res, 'Failed to fetch progress', 500);
  }
};

// GET /api/progress/student/:studentId  →  Parent bitta farzand progressini ko'radi
export const getStudentProgress = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId).select('-password -refreshToken');
    if (!student) return error(res, 'Student not found', 404);

    const progress = await Progress.find({ user: studentId })
      .populate('lessonPack', 'title subject level')
      .sort({ lastActivityAt: -1 });

    // Quiz history (last 30)
    const quizHistory: any[] = [];
    progress.forEach(p => {
      p.quizScores.forEach((q: any) => {
        quizHistory.push({ ...q.toObject(), lessonTitle: (p.lessonPack as any)?.title });
      });
    });
    quizHistory.sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime());

    // Skill scores
    const skillScores = {
      math: 0, literacy: 0, science: 0, language: 0, 'life-skills': 0,
    };
    progress.forEach(p => {
      Object.keys(skillScores).forEach(k => {
        (skillScores as any)[k] = Math.max((skillScores as any)[k], (p.skillScores as any)[k] || 0);
      });
    });

    // Jahon standarti (UNESCO/PISA average benchmark)
    const worldStandard = {
      math: 65, literacy: 70, science: 62, language: 68, 'life-skills': 60,
    };

    return success(res, {
      student,
      progress,
      quizHistory: quizHistory.slice(0, 30),
      skillScores,
      worldStandard,
      totalLessons: progress.length,
      completedLessons: progress.filter(p => p.isCompleted).length,
      avgScore: quizHistory.length
        ? Math.round(quizHistory.reduce((s, q) => s + q.score, 0) / quizHistory.length)
        : 0,
    });
  } catch (err: any) {
    return error(res, 'Failed to fetch student progress', 500);
  }
};