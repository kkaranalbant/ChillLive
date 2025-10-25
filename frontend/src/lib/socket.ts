import { io, Socket } from 'socket.io-client';
import { MatchData, ChatMessage, SignalData } from '@/types';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(token: string): void {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    this.socket = io(SOCKET_URL || undefined, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Re-attach all listeners
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        this.socket?.on(event, callback as any);
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Emit events
  findMatch(preferences?: any): void {
    this.socket?.emit('find-match', preferences);
  }

  sendSignal(roomId: string, signalData: SignalData): void {
    this.socket?.emit('signal', { roomId, signalData });
  }

  sendMessage(roomId: string, message: string): void {
    this.socket?.emit('chat-message', { roomId, message });
  }

  skipPartner(): void {
    this.socket?.emit('skip-partner');
  }

  endChat(): void {
    this.socket?.emit('end-chat');
  }

  // Listen to events
  onMatchFound(callback: (data: MatchData) => void): void {
    this.addListener('match-found', callback);
  }

  onWaitingForMatch(callback: (data: { queueSize: number }) => void): void {
    this.addListener('waiting-for-match', callback);
  }

  onMatchError(callback: (data: { message: string }) => void): void {
    this.addListener('match-error', callback);
  }

  onSignal(callback: (data: { from: string; signalData: SignalData }) => void): void {
    this.addListener('signal', callback);
  }

  onChatMessage(callback: (data: ChatMessage) => void): void {
    this.addListener('chat-message', callback);
  }

  onPartnerSkipped(callback: () => void): void {
    this.addListener('partner-skipped', callback);
  }

  onPartnerDisconnected(callback: () => void): void {
    this.addListener('partner-disconnected', callback);
  }

  onChatEnded(callback: () => void): void {
    this.addListener('chat-ended', callback);
  }

  // Helper to add and track listeners
  private addListener(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);

    if (this.socket) {
      this.socket.on(event, callback as any);
    }
  }

  // Remove listener
  off(event: string, callback?: Function): void {
    if (callback) {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
      this.socket?.off(event, callback as any);
    } else {
      this.listeners.delete(event);
      this.socket?.off(event);
    }
  }

  // Clear all listeners
  clearListeners(): void {
    this.listeners.forEach((_, event) => {
      this.socket?.off(event);
    });
    this.listeners.clear();
  }
}

export const socketService = new SocketService();
