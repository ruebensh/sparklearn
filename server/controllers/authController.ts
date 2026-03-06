import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { success, error } from '../utils/apiResponse.js';
import { sendOTPEmail } from '../utils/emailService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'crisis-classroom-secret-key';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'crisis-classroom-refresh-secret';

const generateTokens = (userId: string, role: string) => {
  const accessToken = jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId }, REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

// ─────────────────────────────────────────
// POST /api/auth/register  →  PARENT ONLY
// ─────────────────────────────────────────
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, region, occupation } = req.body;

    if (!name || !email || !password)
      return error(res, 'Name, email and password are required', 400);
    if (password.length < 8)
      return error(res, 'Password must be at least 8 characters', 400);

    const existing = await User.findOne({ email });
    if (existing) return error(res, 'This email is already registered', 409);

    // OTP yaratish
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 daqiqa
    const hashedPassword = await bcrypt.hash(password, 12);
    const parent = await User.create({
      name, email, password: hashedPassword,
      role: 'parent', phone, region, occupation,
      otpCode, otpExpires, isVerified: false,
    });

    try { await sendOTPEmail(email, name, otpCode); } catch (e) { console.error('Email error:', e); }

    return success(res, {
      requiresVerification: true, email,
      user: { id: parent._id, name: parent.name, email: parent.email, role: parent.role },
    }, 'Account created. Please verify your email.', 201);

  } catch (err: any) {
    console.error('Register error:', err);
    return error(res, 'Registration failed', 500);
  }
};

// ─────────────────────────────────────────
// POST /api/auth/login  →  PARENT (email) yoki STUDENT (username)
// ─────────────────────────────────────────
export const login = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;
    if (!password) return error(res, 'Password is required', 400);

    let user: any;

    if (email) {
      user = await User.findOne({ email, role: 'parent' });
      if (!user) return error(res, 'Invalid email or password', 401);
    } else if (username) {
      user = await User.findOne({ username: username.toLowerCase(), role: 'student' });
      if (!user) return error(res, 'Invalid username or password', 401);
    } else {
      return error(res, 'Email or username is required', 400);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return error(res, 'Invalid credentials', 401);

    const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);
    user.refreshToken = refreshToken;
    await user.save();

    return success(res, {
      accessToken, refreshToken,
      user: {
        id: user._id,
        name: user.role === 'student' ? user.username : user.name,
        email: user.email || null,
        username: user.username || null,
        role: user.role,
      },
    }, 'Login successful');

  } catch (err: any) {
    console.error('Login error:', err);
    return error(res, 'Login failed', 500);
  }
};

// ─────────────────────────────────────────
// POST /api/auth/create-student  →  Parent farzand login yaratadi
// ─────────────────────────────────────────
export const createStudent = async (req: Request, res: Response) => {
  try {
    const { name, username, password, age, grade } = req.body;
    console.log('CREATE STUDENT BODY:', req.body);
    console.log('PARENT ID:', req.user?.id);
    const parentId = req.user?.id;

    if (!name || !username || !password)
      return error(res, 'Name, username and password are required', 400);
    if (password.length < 6)
      return error(res, 'Password must be at least 6 characters', 400);
    if (!/^[a-z0-9_]{3,20}$/.test(username.toLowerCase()))
      return error(res, 'Username: 3-20 characters, only letters, numbers and underscore', 400);

    // Username unique tekshirish
    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) return error(res, 'This username is already taken. Try another one.', 409);

    const parent = await User.findById(parentId);
    if (!parent || parent.role !== 'parent')
      return error(res, 'Only parents can create student accounts', 403);

    // OTP yaratish
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 daqiqa

    const hashedPassword = await bcrypt.hash(password, 12);

    const student = await User.create({
      name,
      username: username.toLowerCase(),
      password: hashedPassword,
      role: 'student',
      age, grade,
      parent: parentId,
    });

    parent.children = [...(parent.children || []), student._id as any];
    await parent.save();

    return success(res, {
      student: {
        id: student._id,
        name: student.name,
        username: student.username,
        age: student.age,
        grade: student.grade,
        role: student.role,
      },
    }, 'Student account created successfully', 201);

  } catch (err: any) {
    console.error('Create student error:', err);
    return error(res, 'Failed to create student account', 500);
  }
};

// ─────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────
export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
    return success(res, null, 'Logged out successfully');
  } catch (err: any) {
    return error(res, 'Logout failed', 500);
  }
};

// ─────────────────────────────────────────
// POST /api/auth/refresh-token
// ─────────────────────────────────────────
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return error(res, 'Refresh token required', 400);

    const decoded = jwt.verify(token, REFRESH_SECRET) as { id: string };
    const user = await User.findOne({ _id: decoded.id, refreshToken: token });
    if (!user) return error(res, 'Invalid refresh token', 401);

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id.toString(), user.role);
    user.refreshToken = newRefreshToken;
    await user.save();

    return success(res, { accessToken, refreshToken: newRefreshToken }, 'Token refreshed');
  } catch (err: any) {
    return error(res, 'Invalid or expired refresh token', 401);
  }
};

// GET /api/auth/my-children  →  Parent o'z bolalarini ko'radi
export const getMyChildren = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const parentId = req.user?.id;
    const parent = await User.findById(parentId)
      .populate('children', 'name username age grade currentLevel createdAt');
    if (!parent) return error(res, 'Parent not found', 404);
    return success(res, { children: parent.children || [] });
  } catch (err: any) {
    return error(res, 'Failed to fetch children', 500);
  }
};


// DELETE /api/auth/delete-student/:studentId
export const deleteStudent = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const parentId = req.user?.id;
    const { studentId } = req.params;

    const parent = await User.findById(parentId);
    if (!parent) return error(res, 'Parent not found', 404);

    const student = await User.findOne({ _id: studentId, parent: parentId, role: 'student' });
    if (!student) return error(res, 'Student not found', 404);

    // Parentning children ro'yxatidan olib tashlash
    parent.children = (parent.children || []).filter(
      (id: any) => id.toString() !== studentId
    );
    await parent.save();

    // Studentni o'chirish
    await student.deleteOne();

    return success(res, null, 'Student account deleted');
  } catch (err: any) {
    return error(res, 'Failed to delete student', 500);
  }
};
// POST /api/auth/verify-otp
export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return error(res, 'Email and OTP required', 400);

    const user = await User.findOne({ email, role: 'parent' });
    if (!user) return error(res, 'User not found', 404);
    if (user.isVerified) return error(res, 'Already verified', 400);
    if (!user.otpCode || !user.otpExpires) return error(res, 'No OTP found', 400);
    if (new Date() > user.otpExpires) return error(res, 'OTP expired. Please register again.', 400);
    if (user.otpCode !== otp.toString()) return error(res, 'Invalid OTP code', 400);

    user.isVerified = true;
    user.otpCode = null;
    const { accessToken, refreshToken: refreshTokenValue } = generateTokens(user._id.toString(), user.role);
    user.refreshToken = refreshTokenValue;
    await user.save();

    return success(res, {
      accessToken,
      refreshToken: refreshTokenValue,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }, 'Email verified successfully!');
  } catch (err: any) {
    console.error('Verify OTP error:', err);
    return error(res, 'Verification failed', 500);
  }
};

// POST /api/auth/resend-otp
export const resendOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email, role: 'parent' });
    if (!user) return error(res, 'User not found', 404);
    if (user.isVerified) return error(res, 'Already verified', 400);

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otpCode;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTPEmail(email, user.name, otpCode);
    return success(res, null, 'OTP resent successfully');
  } catch (err: any) {
    return error(res, 'Failed to resend OTP', 500);
  }
};
