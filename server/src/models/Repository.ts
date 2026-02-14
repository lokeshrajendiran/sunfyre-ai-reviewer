import mongoose, { Document, Schema } from 'mongoose';

export interface IRepository extends Document {
  userId: mongoose.Types.ObjectId;
  githubId: number;
  name: string;
  fullName: string;
  owner: string;
  description?: string;
  isPrivate: boolean;
  url: string;
  defaultBranch: string;
  language?: string;
  stars: number;
  forks: number;
  isActive: boolean;
  lastSyncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const repositorySchema = new Schema<IRepository>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    githubId: {
      type: Number,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    owner: {
      type: String,
      required: true,
    },
    description: String,
    isPrivate: {
      type: Boolean,
      default: false,
    },
    url: {
      type: String,
      required: true,
    },
    defaultBranch: {
      type: String,
      default: 'main',
    },
    language: String,
    stars: {
      type: Number,
      default: 0,
    },
    forks: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastSyncedAt: Date,
  },
  {
    timestamps: true,
  }
);

repositorySchema.index({ userId: 1, githubId: 1 }, { unique: true });

export const Repository = mongoose.model<IRepository>('Repository', repositorySchema);
