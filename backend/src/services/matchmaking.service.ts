import { UserSocketData, ChatRoom } from '../types/socket.types';
import { areUsersNearby } from '../utils/geolocation.utils';

class MatchmakingService {
  private waitingUsers: Map<string, UserSocketData> = new Map();
  private activeRooms: Map<string, ChatRoom> = new Map();
  private userToRoom: Map<string, string> = new Map();

  addToQueue(user: UserSocketData): void {
    this.waitingUsers.set(user.userId, user);
    console.log(`User ${user.userId} added to queue. Queue size: ${this.waitingUsers.size}`);
  }

  removeFromQueue(userId: string): void {
    this.waitingUsers.delete(userId);
    console.log(`User ${userId} removed from queue. Queue size: ${this.waitingUsers.size}`);
  }

  findMatch(user: UserSocketData): UserSocketData | null {
    for (const [waitingUserId, waitingUser] of this.waitingUsers) {
      // Skip self
      if (waitingUserId === user.userId) continue;

      // Check if users match each other's preferences
      if (this.isMatch(user, waitingUser)) {
        this.waitingUsers.delete(waitingUserId);
        console.log(`Match found: ${user.userId} <-> ${waitingUserId}`);
        return waitingUser;
      }
    }

    return null;
  }

  private isMatch(user1: UserSocketData, user2: UserSocketData): boolean {
    // Check gender filter for user1
    if (user1.preferences.genderFilter && user1.preferences.genderFilter !== 'all') {
      if (user2.profile.gender !== user1.preferences.genderFilter) {
        return false;
      }
    }

    // Check gender filter for user2
    if (user2.preferences.genderFilter && user2.preferences.genderFilter !== 'all') {
      if (user1.profile.gender !== user2.preferences.genderFilter) {
        return false;
      }
    }

    // Check age range for user1
    if (user1.preferences.ageRange && user2.profile.age) {
      const { min, max } = user1.preferences.ageRange;
      if (user2.profile.age < min || user2.profile.age > max) {
        return false;
      }
    }

    // Check age range for user2
    if (user2.preferences.ageRange && user1.profile.age) {
      const { min, max } = user2.preferences.ageRange;
      if (user1.profile.age < min || user1.profile.age > max) {
        return false;
      }
    }

    // Check nearby location filter
    // If either user wants nearby matches only, check if they're close
    if (user1.preferences.nearbyOnly || user2.preferences.nearbyOnly) {
      const nearby = areUsersNearby(user1.profile.location, user2.profile.location);

      if (!nearby) {
        console.log(`Users ${user1.userId} and ${user2.userId} not nearby, skipping match`);
        return false;
      }
    }

    return true;
  }

  createRoom(user1Id: string, user2Id: string): ChatRoom {
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const room: ChatRoom = {
      roomId,
      user1: user1Id,
      user2: user2Id,
      createdAt: new Date(),
    };

    this.activeRooms.set(roomId, room);
    this.userToRoom.set(user1Id, roomId);
    this.userToRoom.set(user2Id, roomId);

    console.log(`Room created: ${roomId}`);
    return room;
  }

  getRoomByUserId(userId: string): ChatRoom | undefined {
    const roomId = this.userToRoom.get(userId);
    return roomId ? this.activeRooms.get(roomId) : undefined;
  }

  endRoom(roomId: string): void {
    const room = this.activeRooms.get(roomId);
    if (room) {
      this.userToRoom.delete(room.user1);
      this.userToRoom.delete(room.user2);
      this.activeRooms.delete(roomId);
      console.log(`Room ended: ${roomId}`);
    }
  }

  endUserSession(userId: string): void {
    // Remove from queue
    this.removeFromQueue(userId);

    // End active room if user is in one
    const roomId = this.userToRoom.get(userId);
    if (roomId) {
      this.endRoom(roomId);
    }
  }

  getQueueSize(): number {
    return this.waitingUsers.size;
  }

  getActiveRoomsCount(): number {
    return this.activeRooms.size;
  }
}

export const matchmakingService = new MatchmakingService();
