import { Router } from 'express';
import { getProfile, updateProfile, updatePreferences } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get current user profile
router.get('/profile', getProfile);

// Update profile
router.put('/profile', updateProfile);

// Update preferences
router.put('/preferences', updatePreferences);

export default router;
