import mongoose, { Schema } from "mongoose";

export interface IBusiness extends Document {
  name: string;
  companySize: string;
  referralSource?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const BusinessSchema = new Schema<IBusiness>({
  name: { type: String, required: true },
  companySize: { type: String },
  referralSource: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Business = mongoose.model<IBusiness>("Business", BusinessSchema);
