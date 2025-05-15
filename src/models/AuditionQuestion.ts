import mongoose, { Schema, Document } from "mongoose";

export interface IAuditionQuestion extends Document {
  campaignId: mongoose.Types.ObjectId;
  question: string;
  createdBy: string;
  createdAt: Date;
}

const AuditionQuestionSchema = new Schema<IAuditionQuestion>({
  campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },
  question: { type: String, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const AuditionQuestion = mongoose.model<IAuditionQuestion>(
  "AuditionQuestion",
  AuditionQuestionSchema
);
