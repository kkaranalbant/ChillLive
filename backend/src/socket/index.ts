import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.utils';
import { User } from '../models/User.model';
import { matchmakingService } from '../services/matchmaking.service';
import { UserSocketData, SignalData } from '../types/socket.types';
import { getLocationFromIP } from '../utils/geolocation.utils';

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

  io.on('connection', async (socket: Socket) => {
    const userId = (socket as any).userId;
    const user = (socket as any).user;

    console.log(`User connected: ${userId} (${socket.id})`);

    // Store socket connection
    connectedUsers.set(userId, socket);

    // Get client IP address
    const clientIP = socket.handshake.headers['x-forwarded-for']?.toString().split(',')[0].trim()
      || socket.handshake.headers['x-real-ip']?.toString()
      || socket.handshake.address;

    console.log(`User ${userId} IP: ${clientIP}`);

    // Detect location from IP and update user
    if (clientIP) {
      const location = getLocationFromIP(clientIP);

      if (location) {
        console.log(`User ${userId} location:`, location);

        await User.findByIdAndUpdate(userId, {
          status: 'online',
          lastIP: clientIP,
          'profile.location': location,
        }).exec();
      } else {
        await User.findByIdAndUpdate(userId, { status: 'online' }).exec();
      }
    } else {
      await User.findByIdAndUpdate(userId, { status: 'online' }).exec();
    }

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
          console.log(`[MATCH] Created room ${room.roomId} for ${userId} and ${match.userId}`);

          // Join both users to the room
          socket.join(room.roomId);
          console.log(`[MATCH] User ${userId} (socket ${socket.id}) joined room ${room.roomId}`);

          const partnerSocket = connectedUsers.get(match.userId);
          if (partnerSocket) {
            partnerSocket.join(room.roomId);
            console.log(`[MATCH] Partner ${match.userId} (socket ${partnerSocket.id}) joined room ${room.roomId}`);
          } else {
            console.error(`[MATCH] ERROR: Partner socket not found for user ${match.userId}`);
          }

          // Check room state
          const roomSockets = io.sockets.adapter.rooms.get(room.roomId);
          console.log(`[MATCH] Room ${room.roomId} now has ${roomSockets?.size || 0} members:`,
            roomSockets ? Array.from(roomSockets) : []);

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
      console.log(`[SIGNAL] Received from ${userId} in room ${roomId}: ${signalData.type}`);

      // Check if socket is in the room
      const rooms = Array.from(socket.rooms);
      console.log(`[SIGNAL] Socket ${socket.id} rooms:`, rooms);

      // Check room members
      const roomSockets = io.sockets.adapter.rooms.get(roomId);
      console.log(`[SIGNAL] Room ${roomId} has ${roomSockets?.size || 0} members:`,
        roomSockets ? Array.from(roomSockets) : []);

      // Forward signal to partner in the room
      const sentCount = socket.to(roomId).emit('signal', {
        from: userId,
        signalData,
      });

      console.log(`[SIGNAL] Forwarded to room ${roomId}, broadcast sent`);
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
