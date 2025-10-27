import { Session, IChatMessage } from '../models/Session.model';
import { User } from '../models/User.model';

class SessionService {
  /**
   * Create a new session when match is found
   */
  async createSession(
    roomId: string,
    user1Id: string,
    user2Id: string,
    user1IP?: string,
    user2IP?: string
  ): Promise<void> {
    try {
      const [user1, user2] = await Promise.all([
        User.findById(user1Id),
        User.findById(user2Id),
      ]);

      if (!user1 || !user2) {
        console.error('Cannot create session: users not found');
        return;
      }

      const session = new Session({
        roomId,
        user1: {
          userId: user1Id,
          username: user1.username,
          ip: user1IP,
        },
        user2: {
          userId: user2Id,
          username: user2.username,
          ip: user2IP,
        },
        startTime: new Date(),
        chatMessages: [],
        metadata: {
          user1Location: {
            country: user1.profile?.location?.country,
            city: user1.profile?.location?.city,
          },
          user2Location: {
            country: user2.profile?.location?.country,
            city: user2.profile?.location?.city,
          },
        },
      });

      await session.save();
      console.log(`[SESSION] Created session ${roomId}`);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  }

  /**
   * Add a chat message to session
   */
  async addMessage(
    roomId: string,
    from: string,
    message: string
  ): Promise<void> {
    try {
      const chatMessage: IChatMessage = {
        from,
        message,
        timestamp: new Date(),
      } as IChatMessage;

      await Session.findOneAndUpdate(
        { roomId },
        {
          $push: { chatMessages: chatMessage },
        }
      );
    } catch (error) {
      console.error('Failed to add message to session:', error);
    }
  }

  /**
   * End a session
   */
  async endSession(
    roomId: string,
    reason: 'completed' | 'skipped' | 'disconnected' | 'reported' | 'error'
  ): Promise<void> {
    try {
      const session = await Session.findOne({ roomId });

      if (!session) {
        console.error(`Session ${roomId} not found`);
        return;
      }

      const endTime = new Date();
      const duration = Math.floor(
        (endTime.getTime() - session.startTime.getTime()) / 1000
      );

      session.endTime = endTime;
      session.duration = duration;
      session.endReason = reason;

      await session.save();
      console.log(`[SESSION] Ended session ${roomId} - Reason: ${reason}, Duration: ${duration}s`);
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }

  /**
   * Link a report to a session
   */
  async linkReport(roomId: string, reportId: string): Promise<void> {
    try {
      await Session.findOneAndUpdate(
        { roomId },
        {
          reportId,
          endReason: 'reported',
        }
      );

      console.log(`[SESSION] Linked report ${reportId} to session ${roomId}`);
    } catch (error) {
      console.error('Failed to link report to session:', error);
    }
  }

  /**
   * Get session by room ID
   */
  async getSession(roomId: string) {
    return Session.findOne({ roomId });
  }

  /**
   * Get user's session history
   */
  async getUserSessions(userId: string, limit: number = 50) {
    return Session.find({
      $or: [{ 'user1.userId': userId }, { 'user2.userId': userId }],
    })
      .sort({ startTime: -1 })
      .limit(limit);
  }

  /**
   * Get sessions with reports
   */
  async getReportedSessions(limit: number = 50) {
    return Session.find({
      reportId: { $exists: true, $ne: null },
    })
      .sort({ startTime: -1 })
      .limit(limit);
  }
}

export const sessionService = new SessionService();
