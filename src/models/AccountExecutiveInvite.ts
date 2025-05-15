import mongoose, { Schema, Document } from "mongoose";

export interface IAccountExecutiveInvite extends Document {
  campaignId: mongoose.Types.ObjectId;
  email: string;
  status: "invited" | "accepted" | "declined";
  invitedAt: Date;
  joinedAt?: Date;
}

const AccountExecutiveInviteSchema = new Schema<IAccountExecutiveInvite>({
  campaignId: {
    type: Schema.Types.ObjectId,
    ref: "Campaign",
    required: true
  },
  email: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["invited", "accepted", "declined"],
    default: "invited",
    required: true
  },
  invitedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  joinedAt: {
    type: Date
  }
});

AccountExecutiveInviteSchema.index({ campaignId: 1, email: 1 }, { unique: true });
AccountExecutiveInviteSchema.index({ email: 1 });

export const AccountExecutiveInvite = mongoose.model<IAccountExecutiveInvite>(
  "AccountExecutiveInvite",
  AccountExecutiveInviteSchema
);