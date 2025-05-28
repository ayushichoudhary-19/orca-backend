import mongoose, { Schema } from "mongoose";

const CallSchema = new Schema({
  _id: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  status: { type: String, required: true },

  duration: Number,
  recordingUrl: String,
  notes: String,
  script: String,
  sessionId: String,
  sequenceIndex: { type: Number, default: 0 },

  campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },
  salesRepId: { type: String, required: true },
  leadId: { type: Schema.Types.ObjectId, ref: "Lead" },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const CallSessionSchema = new Schema({
    phoneNumbers: [String],
    currentIndex: { type: Number, default: 0 },
    isComplete: { type: Boolean, default: false },
    calls: [{ type: String, ref: "Call" }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
  

export const Call = mongoose.model("Call", CallSchema);
export const CallSession = mongoose.model("CallSession", CallSessionSchema);
