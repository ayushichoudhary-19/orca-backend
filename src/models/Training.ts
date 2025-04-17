import mongoose, { Schema, Document } from "mongoose";

interface Section {
  _id?: mongoose.Types.ObjectId;
  title: string;
  content: string;
}

export interface ITraining extends Document {
  title: string;
  description: string;
  campaignId: mongoose.Types.ObjectId;
  sections: Section[];
  isVisible: boolean;
  sortOrder: number;
  lastEditedBy: string;
  lastSavedAt: Date;
  isPublished: boolean;
}

const SectionSchema = new Schema<Section>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
  },
  { _id: true } // Auto-generates `_id` for each section block
);

const TrainingSchema = new Schema<ITraining>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },
  sections: { type: [SectionSchema], default: [] },
  isVisible: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  lastEditedBy: { type: String, required: true },
  lastSavedAt: { type: Date, default: Date.now },
  isPublished: { type: Boolean, default: false },
});

export const TrainingModel = mongoose.model<ITraining>(
  "Training",
  TrainingSchema
);
