import mongoose, { Schema } from "mongoose";

const FeedbackSchema = new Schema({
  callId: { type: String, ref: "Call", required: true },
  feedbackReason: {
    type: String,
    enum: [
      "tentative_interest",
      "no_pickup",
      "not_interested",
      "not_qualified",
      "bad_data"
    ],
    required: true,
  },
  notes: String,
  createdAt: { type: Date, default: Date.now },
});

export const Feedback = mongoose.model("Feedback", FeedbackSchema);
