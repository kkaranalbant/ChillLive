import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage {
  from: string;
  message: string;
  timestamp: Date;
}

export interface ISession extends Document {
  roomId: string;
  user1: {
    userId: string;
    username: string;
    ip?: string;
  };
  user2: {
    userId: string;
    username: string;
    ip?: string;
  };
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  endReason?: 'completed' | 'skipped' | 'disconnected' | 'reported' | 'error';
  chatMessages: IChatMessage[];
  reportId?: string;
  metadata?: {
    user1Location?: {
      country?: string;
      city?: string;
    };
    user2Location?: {
      country?: string;
      city?: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>({
  from: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const sessionSchema = new Schema<ISession>(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user1: {
      userId: {
        type: String,
        required: true,
        index: true,
      },
      username: String,
      ip: String,
    },
    user2: {
      userId: {
        type: String,
        required: true,
        index: true,
      },
      username: String,
      ip: String,
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: Date,
    duration: Number,
    endReason: {
      type: String,
      enum: ['completed', 'skipped', 'disconnected', 'reported', 'error'],
    },
    chatMessages: [chatMessageSchema],
    reportId: {
      type: String,
      index: true,
    },
    metadata: {
      user1Location: {
        country: String,
        city: String,
      },
      user2Location: {
        country: String,
        city: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for admin queries
sessionSchema.index({ startTime: -1 });
sessionSchema.index({ 'user1.userId': 1, 'user2.userId': 1 });
sessionSchema.index({ reportId: 1 });

export const Session = mongoose.model<ISession>('Session', sessionSchema);
