import mongoose, { Schema, Document } from "mongoose";

export type AuditionStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "retry"
  | "approved"
  | "rejected";

export interface ISalesRepCampaignStatus extends Document {
  campaignId: mongoose.Types.ObjectId;
  salesRepId: string;
  trainingProgress: number;
  completedTrainingIds?: mongoose.Types.ObjectId[];
  auditionStatus: AuditionStatus;
  auditionResponses: {
    questionId: mongoose.Types.ObjectId;
    audioUrl: string;
  }[];
  auditionAttempts: number;
  lastAuditionAt?: Date;
  feedbackNotes?: string;
  resumeUrl?: string;
  experienceYears?: string;
  country?: string;
  linkedInUrl?: string;
  createdAt: Date;
}

const SalesRepCampaignStatusSchema = new Schema<ISalesRepCampaignStatus>({
  campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },
  salesRepId: { type: String, required: true },
  trainingProgress: { type: Number, default: 0 },
  completedTrainingIds: [{ type: Schema.Types.ObjectId, ref: "Training" }],
  auditionStatus: {
    type: String,
    enum: ["not_started", "in_progress", "submitted", "retry", "approved", "rejected"],
    default: "not_started",
  },
  auditionResponses: [
    {
      questionId: { type: mongoose.Types.ObjectId, ref: "AuditionQuestion" },
      audioUrl: String,
    }
  ],  
  auditionAttempts: { type: Number, default: 0 },
  lastAuditionAt: { type: Date },
  feedbackNotes: { type: String },
  resumeUrl: { type: String },
  experienceYears: { type: String },
  country: { type: String },
  linkedInUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

SalesRepCampaignStatusSchema.index({ campaignId: 1, salesRepId: 1 }, { unique: true });

export const SalesRepCampaignStatus = mongoose.model<ISalesRepCampaignStatus>(
  "SalesRepCampaignStatus",
  SalesRepCampaignStatusSchema
);
