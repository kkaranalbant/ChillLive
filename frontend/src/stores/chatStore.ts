import { create } from 'zustand';
import { MatchData, ChatMessage } from '@/types';

interface ChatState {
  // Match state
  isSearching: boolean;
  isMatched: boolean;
  matchData: MatchData | null;
  queueSize: number;

  // Chat state
  messages: ChatMessage[];

  // Actions
  setSearching: (searching: boolean) => void;
  setMatched: (matched: boolean) => void;
  setMatchData: (data: MatchData | null) => void;
  setQueueSize: (size: number) => void;
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isSearching: false,
  isMatched: false,
  matchData: null,
  queueSize: 0,
  messages: [],

  setSearching: (searching) => set({ isSearching: searching }),

  setMatched: (matched) => set({ isMatched: matched }),

  setMatchData: (data) => set({ matchData: data }),

  setQueueSize: (size) => set({ queueSize: size }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  clearMessages: () => set({ messages: [] }),

  reset: () =>
    set({
      isSearching: false,
      isMatched: false,
      matchData: null,
      queueSize: 0,
      messages: [],
    }),
}));
