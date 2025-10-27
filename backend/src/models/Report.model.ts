import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  reporter: mongoose.Types.ObjectId;
  reportedUser: mongoose.Types.ObjectId;
  sessionId?: string;
  roomId?: string;
  reason: 'inappropriate' | 'spam' | 'harassment' | 'underage' | 'other';
  description?: string;
  screenshotData?: string; // base64 screenshot
  status: 'pending' | 'reviewed' | 'resolved' | 'action_taken';
  actionTaken?: {
    type: 'warning' | 'temporary_ban' | 'permanent_ban' | 'none';
    date: Date;
    notes?: string;
  };
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    reporter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reportedUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      index: true,
    },
    roomId: String,
    reason: {
      type: String,
      enum: ['inappropriate', 'spam', 'harassment', 'underage', 'other'],
      required: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    screenshotData: {
      type: String,
      // Store as base64 or URL
      maxlength: 10000000, // ~10MB for base64 image
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'action_taken'],
      default: 'pending',
      index: true,
    },
    actionTaken: {
      type: {
        type: String,
        enum: ['warning', 'temporary_ban', 'permanent_ban', 'none'],
      },
      date: Date,
      notes: String,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
reportSchema.index({ reportedUser: 1, createdAt: -1 });

export const Report = mongoose.model<IReport>('Report', reportSchema);
