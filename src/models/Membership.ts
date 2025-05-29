import mongoose, { Schema, Document } from "mongoose";

export interface IMembership extends Document {
  userId: string,
  businessId?: mongoose.Types.ObjectId;
  role: string;
  onboardingStep?: number;
  createdAt: Date;
}

const MembershipSchema = new Schema<IMembership>({
  userId: { type: String, ref: "User", required: true },
  businessId: { type: Schema.Types.ObjectId, ref: "Business", required: false },
  role: { type: String, enum: ["admin", "sdr", "ae"], required: true },
  onboardingStep: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

MembershipSchema.index({ userId: 1, businessId: 1 });

export const Membership = mongoose.model<IMembership>(
  "Membership",
  MembershipSchema
);
