import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.utils';
import { User } from '../models/User.model';
import { matchmakingService } from '../services/matchmaking.service';
import { UserSocketData, SignalData } from '../types/socket.types';

// Store connected users
const connectedUsers = new Map<string, Socket>();

export const initializeSocketHandlers = (io: Server) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const payload = verifyAccessToken(token);
      const user = await User.findById(payload.userId);

      if (!user || user.isBanned) {
        return next(new Error('User not found or banned'));
      }

      // Attach user data to socket
      (socket as any).userId = payload.userId;
      (socket as any).user = user;

      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    const user = (socket as any).user;

    console.log(`User connected: ${userId} (${socket.id})`);

    // Store socket connection
    connectedUsers.set(userId, socket);

    // Update user status
    User.findByIdAndUpdate(userId, { status: 'online' }).exec();

    // Handle find match
    socket.on('find-match', async (preferences) => {
      try {
        const userData: UserSocketData = {
          userId,
          socketId: socket.id,
          isGuest: user.isGuest,
          preferences: preferences || user.preferences,
          profile: user.profile,
          status: 'waiting',
        };

        // Try to find a match
        const match = matchmakingService.findMatch(userData);

        if (match) {
          // Match found
          const room = matchmakingService.createRoom(userId, match.userId);

          // Join both users to the room
          socket.join(room.roomId);
          const partnerSocket = connectedUsers.get(match.userId);
          partnerSocket?.join(room.roomId);

          // Notify both users
          socket.emit('match-found', {
            roomId: room.roomId,
            partnerId: match.userId,
            partnerProfile: {
              username: (await User.findById(match.userId))?.username,
              gender: match.profile.gender,
              age: match.profile.age,
            },
          });

          partnerSocket?.emit('match-found', {
            roomId: room.roomId,
            partnerId: userId,
            partnerProfile: {
              username: user.username,
              gender: user.profile.gender,
              age: user.profile.age,
            },
          });

          // Update user status
          await User.findByIdAndUpdate(userId, { status: 'in-chat' });
          await User.findByIdAndUpdate(match.userId, { status: 'in-chat' });
        } else {
          // No match found, add to queue
          matchmakingService.addToQueue(userData);
          socket.emit('waiting-for-match', {
            queueSize: matchmakingService.getQueueSize(),
          });
        }
      } catch (error) {
        console.error('Find match error:', error);
        socket.emit('match-error', { message: 'Failed to find match' });
      }
    });

    // Handle WebRTC signaling
    socket.on('signal', ({ roomId, signalData }: { roomId: string; signalData: SignalData }) => {
      console.log(`Signal from ${userId} in room ${roomId}: ${signalData.type}`);
      // Forward signal to partner in the room
      socket.to(roomId).emit('signal', {
        from: userId,
        signalData,
      });
    });

    // Handle text messages
    socket.on('chat-message', ({ roomId, message }: { roomId: string; message: string }) => {
      const room = matchmakingService.getRoomByUserId(userId);

      if (room && room.roomId === roomId) {
        socket.to(roomId).emit('chat-message', {
          from: userId,
          message,
          timestamp: new Date(),
        });
      }
    });

    // Handle skip/next
    socket.on('skip-partner', async () => {
      const room = matchmakingService.getRoomByUserId(userId);

      if (room) {
        // Notify partner
        socket.to(room.roomId).emit('partner-skipped');

        // End room
        matchmakingService.endRoom(room.roomId);

        // Update status
        await User.findByIdAndUpdate(userId, { status: 'online' });
        const partnerId = room.user1 === userId ? room.user2 : room.user1;
        await User.findByIdAndUpdate(partnerId, { status: 'online' });

        // Leave room
        socket.leave(room.roomId);
        connectedUsers.get(partnerId)?.leave(room.roomId);
      }
    });

    // Handle end chat
    socket.on('end-chat', async () => {
      const room = matchmakingService.getRoomByUserId(userId);

      if (room) {
        // Notify partner
        socket.to(room.roomId).emit('chat-ended');

        // End room
        matchmakingService.endRoom(room.roomId);

        // Update status
        await User.findByIdAndUpdate(userId, { status: 'online' });
        const partnerId = room.user1 === userId ? room.user2 : room.user1;
        await User.findByIdAndUpdate(partnerId, { status: 'online' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${userId}`);

      // Clean up
      matchmakingService.endUserSession(userId);
      connectedUsers.delete(userId);

      // Update status
      await User.findByIdAndUpdate(userId, { status: 'offline' });

      // Notify partner if in room
      const room = matchmakingService.getRoomByUserId(userId);
      if (room) {
        socket.to(room.roomId).emit('partner-disconnected');
      }
    });
  });

  console.log('✅ Socket.io handlers initialized');
};
