import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email?: string;
  password?: string;
  username: string;
  isGuest: boolean;
  profile: {
    gender?: 'male' | 'female' | 'other';
    age?: number;
    location?: {
      country?: string;
      city?: string;
    };
    bio?: string;
  };
  preferences: {
    genderFilter?: 'male' | 'female' | 'all';
    ageRange?: {
      min: number;
      max: number;
    };
    locationFilter?: string;
  };
  status: 'online' | 'offline' | 'in-chat';
  reportCount: number;
  isBanned: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    isGuest: {
      type: Boolean,
      default: false,
    },
    profile: {
      gender: {
        type: String,
        enum: ['male', 'female', 'other'],
      },
      age: {
        type: Number,
        min: 13,
        max: 120,
      },
      location: {
        country: String,
        city: String,
      },
      bio: {
        type: String,
        maxlength: 500,
      },
    },
    preferences: {
      genderFilter: {
        type: String,
        enum: ['male', 'female', 'all'],
        default: 'all',
      },
      ageRange: {
        min: {
          type: Number,
          default: 18,
        },
        max: {
          type: Number,
          default: 99,
        },
      },
      locationFilter: String,
    },
    status: {
      type: String,
      enum: ['online', 'offline', 'in-chat'],
      default: 'offline',
    },
    reportCount: {
      type: Number,
      default: 0,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const User = mongoose.model<IUser>('User', userSchema);
