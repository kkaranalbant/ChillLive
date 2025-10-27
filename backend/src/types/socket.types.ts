export interface UserSocketData {
  userId: string;
  socketId: string;
  isGuest: boolean;
  preferences: {
    genderFilter?: 'male' | 'female' | 'all';
    ageRange?: {
      min: number;
      max: number;
    };
    nearbyOnly?: boolean;
  };
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
  };
  status: 'waiting' | 'matched' | 'in-chat';
  partnerId?: string;
  roomId?: string;
}

export interface ChatRoom {
  roomId: string;
  user1: string;
  user2: string;
  createdAt: Date;
}

export interface SignalData {
  type: 'offer' | 'answer' | 'ice-candidate';
  sdp?: any;
  candidate?: any;
}
