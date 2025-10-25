import { Router } from 'express';
import { body } from 'express-validator';
import { createReport, getReports } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create report
router.post(
  '/',
  [
    body('reportedUserId').notEmpty(),
    body('reason').isIn(['inappropriate', 'spam', 'harassment', 'underage', 'other']),
  ],
  createReport
);

// Get reports (admin only - for now accessible to all authenticated users)
router.get('/', getReports);

export default router;
