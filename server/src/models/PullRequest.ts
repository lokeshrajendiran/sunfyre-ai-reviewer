import mongoose, { Document, Schema } from 'mongoose';

export interface IPullRequest extends Document {
  userId: mongoose.Types.ObjectId;
  repositoryId: mongoose.Types.ObjectId;
  githubId: number;
  number: number;
  title: string;
  description?: string;
  state: 'open' | 'closed' | 'merged';
  author: {
    username: string;
    avatarUrl?: string;
  };
  baseBranch: string;
  headBranch: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  commits: number;
  url: string;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
  mergedAt?: Date;
}

const pullRequestSchema = new Schema<IPullRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    repositoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Repository',
      required: true,
      index: true,
    },
    githubId: {
      type: Number,
      required: true,
    },
    number: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    state: {
      type: String,
      enum: ['open', 'closed', 'merged'],
      default: 'open',
    },
    author: {
      username: {
        type: String,
        required: true,
      },
      avatarUrl: String,
    },
    baseBranch: {
      type: String,
      required: true,
    },
    headBranch: {
      type: String,
      required: true,
    },
    filesChanged: {
      type: Number,
      default: 0,
    },
    additions: {
      type: Number,
      default: 0,
    },
    deletions: {
      type: Number,
      default: 0,
    },
    commits: {
      type: Number,
      default: 0,
    },
    url: {
      type: String,
      required: true,
    },
    closedAt: Date,
    mergedAt: Date,
  },
  {
    timestamps: true,
  }
);

pullRequestSchema.index({ repositoryId: 1, number: 1 }, { unique: true });
pullRequestSchema.index({ repositoryId: 1, state: 1 });

export const PullRequest = mongoose.model<IPullRequest>('PullRequest', pullRequestSchema);
