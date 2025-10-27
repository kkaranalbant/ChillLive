export interface User {
  _id: string;
  email?: string;
  username: string;
  isGuest: boolean;
  profile: {
    gender?: 'male' | 'female' | 'other';
    age?: number;
    location?: {
      country?: string;
      city?: string;
      coordinates?: {
        latitude: number;
        longitude: number;
      };
    };
    bio?: string;
  };
  preferences: {
    genderFilter?: 'male' | 'female' | 'all';
    ageRange?: {
      min: number;
      max: number;
    };
    nearbyOnly?: boolean;
  };
  status: 'online' | 'offline' | 'in-chat';
  reportCount: number;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  profile?: Partial<User['profile']>;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface GuestData {
  username?: string;
  profile?: Partial<User['profile']>;
}

export interface MatchData {
  roomId: string;
  partnerId: string;
  partnerProfile: {
    username: string;
    gender?: string;
    age?: number;
  };
}

export interface ChatMessage {
  from: string;
  message: string;
  timestamp: Date;
}

export interface SignalData {
  type: 'offer' | 'answer' | 'ice-candidate';
  sdp?: any;
  candidate?: any;
}

export interface ReportData {
  reportedUserId: string;
  reason: 'inappropriate' | 'spam' | 'harassment' | 'underage' | 'other';
  description?: string;
}
