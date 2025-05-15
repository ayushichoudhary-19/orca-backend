import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
  {
    calendlyEventId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    fullName: { type: String },
    time: { type: Date, required: true },
    status: {
      type: String,
      enum: ["scheduled", "canceled"],
      default: "scheduled",
    },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign" },
    salesRepId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // salesRepId: { type: String },
  },
  { timestamps: true }
);

export const Meeting = mongoose.model("Meeting", meetingSchema);
