import mongoose, { Schema, Document, Model } from "mongoose";

/* =====================================================
   CONSTANTS
===================================================== */

export const FEED_ACTIVITY = {
  ORDER_PLACED: "order_placed",
  ORDER_STATUS_CHANGE: "order_status_change",
  REVIEW_POSTED: "review_posted",
  PROMO_EARNED: "promo_earned",
} as const;

export const PRIORITY = {
  HIGH: "high",
  NORMAL: "normal",
} as const;

/* =====================================================
   TYPES
===================================================== */

// ✅ Correct: values, not keys
export type ActivityType =
  (typeof FEED_ACTIVITY)[keyof typeof FEED_ACTIVITY];

export type PriorityType =
  (typeof PRIORITY)[keyof typeof PRIORITY];

export interface IActivityFeed extends Document {
  userId: Schema.Types.ObjectId;

  type: ActivityType;

  title: string;
  subtitle?: string | null;
  actionUrl?: string;

  data: Record<string, any>;

  isRead: boolean;
  priority: PriorityType;

  createdAt: Date;
  updatedAt: Date;
}

/* =====================================================
   SCHEMA
===================================================== */

const activityFeedSchema = new Schema<IActivityFeed>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },

    type: {
      type: String,
      enum: Object.values(FEED_ACTIVITY), // ✅ dynamic + safe
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    subtitle: {
      type: String,
      default: null,
    },

    actionUrl: {
      type: String,
    },

    data: {
      type: Schema.Types.Mixed,
      default: {},
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    priority: {
      type: String,
      enum: Object.values(PRIORITY),
      default: PRIORITY.NORMAL,
    },
  },
  {
    timestamps: true,
  }
);

/* =====================================================
   INDEXES (IMPORTANT)
===================================================== */

// 🔥 Fast feed query
activityFeedSchema.index({ userId: 1, createdAt: -1 });

// 🔥 Unread count optimization
activityFeedSchema.index({ userId: 1, isRead: 1 });

/* =====================================================
   MODEL
===================================================== */

const ActivityFeed: Model<IActivityFeed> =
  mongoose.model<IActivityFeed>("ActivityFeed", activityFeedSchema);

export default ActivityFeed;