import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { success, error } from '../utils/apiResponse.js';

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

    const hashedPassword = await bcrypt.hash(password, 12);

    const parent = await User.create({
      name, email, password: hashedPassword,
      role: 'parent', phone, region, occupation,
    });

    const { accessToken, refreshToken } = generateTokens(parent._id.toString(), 'parent');
    parent.refreshToken = refreshToken;
    await parent.save();

    return success(res, {
      accessToken, refreshToken,
      user: { id: parent._id, name: parent.name, email: parent.email, role: parent.role },
    }, 'Parent account created successfully', 201);

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
    // @ts-ignore
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