import mongoose, { Schema, Document } from "mongoose";

export type ContextType =
  | "script"
  | "objection"
  | "persona"
  | "qualification"
  | "competition"
  | "faq"
  | "custom";

export interface IContext extends Document {
  campaignId: mongoose.Types.ObjectId;
  type: ContextType;
  title?: string;
  content: any;
  createdAt: Date;
  updatedAt: Date;
}

const ContextSchema = new Schema<IContext>(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "script",
        "objection",
        "persona",
        "qualification",
        "competition",
        "faq",
        "custom",
      ],
      required: true,
    },
    title: { type: String },
    content: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export const ContextModel = mongoose.model<IContext>("Context", ContextSchema);
