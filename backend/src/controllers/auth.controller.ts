import { Request, Response } from 'express';
import { User } from '../models/User.model';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.utils';
import { AppError } from '../middleware/error.middleware';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, username, profile } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Create new user
    const user = new User({
      email,
      password,
      username,
      isGuest: false,
      profile: profile || {},
    });

    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user._id.toString(), isGuest: false });
    const refreshToken = generateRefreshToken({ userId: user._id.toString(), isGuest: false });

    res.status(201).json({
      message: 'User registered successfully',
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if user is banned
    if (user.isBanned) {
      throw new AppError('Account has been banned', 403);
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    // Update status to online
    user.status = 'online';
    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user._id.toString(), isGuest: false });
    const refreshToken = generateRefreshToken({ userId: user._id.toString(), isGuest: false });

    res.json({
      message: 'Login successful',
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Login failed' });
  }
};

export const guestLogin = async (req: Request, res: Response) => {
  try {
    const { username, profile } = req.body;

    // Create guest user
    const guestUser = new User({
      username: username || `Guest_${Date.now()}`,
      isGuest: true,
      profile: profile || {},
    });

    await guestUser.save();

    // Generate tokens
    const accessToken = generateAccessToken({ userId: guestUser._id.toString(), isGuest: true });
    const refreshToken = generateRefreshToken({ userId: guestUser._id.toString(), isGuest: true });

    res.status(201).json({
      message: 'Guest session created',
      user: guestUser,
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Guest login failed' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token required', 400);
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Check if user still exists
    const user = await User.findById(payload.userId);
    if (!user || user.isBanned) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      userId: payload.userId,
      isGuest: payload.isGuest,
    });

    res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(401).json({ error: 'Token refresh failed' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (userId) {
      await User.findByIdAndUpdate(userId, { status: 'offline' });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
};
