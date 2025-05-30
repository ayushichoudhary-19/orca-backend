import mongoose from "mongoose";

const inviteSchema = new mongoose.Schema({
  email: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "ae"],
    required: true,
  },
  type: {
    type: String,
    enum: ["business", "campaign"],
    required: true,
  },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business" },
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign" },
  createdAt: { type: Date, default: Date.now },
});

export const Invite = mongoose.model("Invite", inviteSchema);
