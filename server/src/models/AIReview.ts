import mongoose, { Document, Schema } from 'mongoose';

export interface IInlineComment {
  file: string;
  line: number;
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface IAIReview extends Document {
  pullRequestId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  summary: string;
  riskScore: number;
  riskExplanation: string;
  inlineComments: IInlineComment[];
  suggestedTests: string[];
  filesAnalyzed: string[];
  aiModel: string;
  tokensUsed?: number;
  analysisVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

const inlineCommentSchema = new Schema<IInlineComment>(
  {
    file: {
      type: String,
      required: true,
    },
    line: {
      type: Number,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'info',
    },
  },
  { _id: false }
);

const aiReviewSchema = new Schema<IAIReview>(
  {
    pullRequestId: {
      type: Schema.Types.ObjectId,
      ref: 'PullRequest',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    riskScore: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    riskExplanation: {
      type: String,
      required: true,
    },
    inlineComments: [inlineCommentSchema],
    suggestedTests: [String],
    filesAnalyzed: [String],
    aiModel: {
      type: String,
      default: 'gpt-4',
    },
    tokensUsed: Number,
    analysisVersion: {
      type: String,
      default: '1.0',
    },
  },
  {
    timestamps: true,
  }
);

aiReviewSchema.index({ pullRequestId: 1, createdAt: -1 });

export const AIReview = mongoose.model<IAIReview>('AIReview', aiReviewSchema);
