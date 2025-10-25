import { Response } from 'express';
import { Report } from '../models/Report.model';
import { User } from '../models/User.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

export const createReport = async (req: AuthRequest, res: Response) => {
  try {
    const { reportedUserId, reason, description } = req.body;

    if (!req.userId) {
      throw new AppError('Unauthorized', 401);
    }

    // Check if reported user exists
    const reportedUser = await User.findById(reportedUserId);
    if (!reportedUser) {
      throw new AppError('Reported user not found', 404);
    }

    // Create report
    const report = new Report({
      reporter: req.userId,
      reportedUser: reportedUserId,
      reason,
      description,
    });

    await report.save();

    // Increment report count for the reported user
    reportedUser.reportCount += 1;

    // Auto-ban if report count exceeds threshold (e.g., 5)
    if (reportedUser.reportCount >= 5) {
      reportedUser.isBanned = true;
    }

    await reportedUser.save();

    res.status(201).json({
      message: 'Report submitted successfully',
      report,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to submit report' });
  }
};

export const getReports = async (req: AuthRequest, res: Response) => {
  try {
    const reports = await Report.find()
      .populate('reporter', 'username')
      .populate('reportedUser', 'username')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ reports });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};
