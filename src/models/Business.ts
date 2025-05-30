import mongoose, { Schema } from "mongoose";

export interface IBusiness extends Document {
  name: string;
  companySize: string;
  onboardingStep: { type: Number, default: 0 }
  referralSource?: string;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const BusinessSchema = new Schema<IBusiness>({
  name: { type: String, required: true },
  companySize: { type: String },
  onboardingStep: { type: Number, default: 0 },
  referralSource: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

export const Business = mongoose.model<IBusiness>("Business", BusinessSchema);
