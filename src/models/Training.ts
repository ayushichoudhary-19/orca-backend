import mongoose, { Schema, Document } from "mongoose";
import { JSONContent } from "@tiptap/core";

export type TrainingType =
  | "company_overview"
  | "product_overview"
  | "buyer_persona"
  | "competition"
  | "qualification_criteria"
  | "objection_handling";

export interface ITraining extends Document {
  campaignId: mongoose.Types.ObjectId;
  type?: TrainingType;
  title: string;
  description: string;
  content: JSONContent;
  isVisible: boolean;
  isPublished: boolean;
  sortOrder: number;
  lastSavedAt: Date;
  lastEditedBy: string;
}

const TrainingSchema = new Schema<ITraining>({
  campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },
  type: {
    type: String,
    enum: [
      "company_overview",
      "product_overview",
      "buyer_persona",
      "competition",
      "qualification_criteria",
      "objection_handling",
    ],
    default: null,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  content: { type: Schema.Types.Mixed, required: false, default: null },
  isVisible: { type: Boolean, default: true },
  isPublished: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
  lastSavedAt: { type: Date, default: Date.now },
  lastEditedBy: { type: String, required: true },
});

export const TrainingModel = mongoose.model<ITraining>(
  "Training",
  TrainingSchema
);
