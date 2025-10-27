import { Response } from 'express';
import { Report } from '../models/Report.model';
import { User } from '../models/User.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import { sessionService } from '../services/session.service';

export const createReport = async (req: AuthRequest, res: Response) => {
  try {
    const { reportedUserId, reason, description, screenshotData, roomId } = req.body;

    if (!req.userId) {
      throw new AppError('Unauthorized', 401);
    }

    // Check if reported user exists
    const reportedUser = await User.findById(reportedUserId);
    if (!reportedUser) {
      throw new AppError('Reported user not found', 404);
    }

    // Get session if roomId provided
    let session = null;
    if (roomId) {
      session = await sessionService.getSession(roomId);
    }

    // Create report
    const report = new Report({
      reporter: req.userId,
      reportedUser: reportedUserId,
      reason,
      description,
      screenshotData,
      roomId,
      sessionId: session?._id?.toString(),
    });

    await report.save();

    // Link report to session
    if (session) {
      await sessionService.linkReport(roomId, (report._id as any).toString());
    }

    // Increment report count for the reported user
    reportedUser.reportCount += 1;

    // Auto-ban if report count exceeds threshold (e.g., 5)
    const AUTO_BAN_THRESHOLD = 5;
    if (reportedUser.reportCount >= AUTO_BAN_THRESHOLD) {
      reportedUser.isBanned = true;
      console.log(`[AUTO-BAN] User ${reportedUserId} banned automatically after ${reportedUser.reportCount} reports`);
    }

    await reportedUser.save();

    res.status(201).json({
      message: 'Report submitted successfully',
      report: {
        ...report.toObject(),
        screenshotData: undefined, // Don't send screenshot back to save bandwidth
      },
      autoBanned: reportedUser.isBanned,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Report creation error:', error);
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
