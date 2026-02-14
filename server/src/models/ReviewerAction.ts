import mongoose, { Document, Schema } from 'mongoose';

export interface IReviewerAction extends Document {
  aiReviewId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  pullRequestId: mongoose.Types.ObjectId;
  commentId?: string;
  action: 'accept' | 'reject' | 'discuss' | 'resolved';
  feedback?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const reviewerActionSchema = new Schema<IReviewerAction>(
  {
    aiReviewId: {
      type: Schema.Types.ObjectId,
      ref: 'AIReview',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pullRequestId: {
      type: Schema.Types.ObjectId,
      ref: 'PullRequest',
      required: true,
      index: true,
    },
    commentId: String,
    action: {
      type: String,
      enum: ['accept', 'reject', 'discuss', 'resolved'],
      required: true,
    },
    feedback: String,
    metadata: Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

reviewerActionSchema.index({ pullRequestId: 1, userId: 1 });

export const ReviewerAction = mongoose.model<IReviewerAction>(
  'ReviewerAction',
  reviewerActionSchema
);
