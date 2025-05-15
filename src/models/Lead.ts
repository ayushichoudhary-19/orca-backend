import mongoose, { Schema, Document } from "mongoose";

export type LeadStatus =
  | "untouched"
  | "called"
  | "meeting"
  | "disqualified"
  | "suppressed";

  export interface ILead extends Document {
    campaignId: mongoose.Types.ObjectId;
    fullName?: string;
    email?: string;
    phone: string;
    title?: string;
    company?: string;
    location?: string;
    mobileNumber?: string;
    linkedinUrl?: string;
    website?: string;
    city?: string;
    employeeCount?: string;
    revenue?: string;
    accountExecutiveEmail?: string;
    status: LeadStatus;
    enriched?: boolean;
    suppressed?: boolean;
    uploadedFromFile?: string;
    createdAt: Date;
  }
  

const LeadSchema = new Schema<ILead>({
  campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },
  fullName: String,
  email: String,
  phone: { type: String, required: true },
  title: String,
  company: String,
  location: String,
  status: {
    type: String,
    enum: ["untouched", "called", "meeting", "disqualified", "suppressed"],
    default: "untouched",
  },
  enriched: { type: Boolean, default: false },
  suppressed: { type: Boolean, default: false },
  uploadedFromFile: String,
  createdAt: { type: Date, default: Date.now },
  mobileNumber: String,
  linkedinUrl: String,
  website: String,
  city: String,
  employeeCount: String,
  revenue: String,
  accountExecutiveEmail: String,
});

LeadSchema.index({ campaignId: 1, phone: 1 }, { unique: true });

export const Lead = mongoose.model<ILead>("Lead", LeadSchema);
