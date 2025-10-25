import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, guestLogin, refreshToken, logout } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authRateLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

// Register
router.post(
  '/register',
  authRateLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('username').trim().notEmpty(),
  ],
  register
);

// Login
router.post(
  '/login',
  authRateLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  login
);

// Guest login
router.post('/guest', guestLogin);

// Refresh token
router.post('/refresh', refreshToken);

// Logout
router.post('/logout', authenticate, logout);

export default router;
