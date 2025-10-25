import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model';

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const secret = process.env.JWT_ACCESS_SECRET || 'default-secret';
    const decoded = jwt.verify(token, secret) as { userId: string };

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.isBanned) {
      return res.status(403).json({ error: 'User is banned' });
    }

    req.userId = decoded.userId;
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const secret = process.env.JWT_ACCESS_SECRET || 'default-secret';
      const decoded = jwt.verify(token, secret) as { userId: string };
      const user = await User.findById(decoded.userId);

      if (user && !user.isBanned) {
        req.userId = decoded.userId;
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Token invalid but continue anyway
    next();
  }
};
