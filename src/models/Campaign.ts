import mongoose, { Schema, Document } from "mongoose";

export enum CampaignStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
}

export interface ICampaign extends Document {
  businessId: mongoose.Types.ObjectId;
  campaignName: string;
  companyWebsite: string;
  uploadedContacts?: string;
  uploadedCsvFileName?: string;
  allowAutoLeads: boolean;
  revenueTarget?: { min?: number; max?: number };
  titles?: string[];
  companyLocation?: string[];
  employeeLocation?: string[];
  industry?: string[];
  keywords?: string[];
  status: CampaignStatus;
  companyLegalName?: string;
  signatoryName?: string;
  signatoryTitle?: string;
  signedAt?: Date;
  signatureBase64?: String,
  createdAt: Date;
}

const CampaignSchema = new Schema<ICampaign>({
  businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
  campaignName: { type: String, required: true },
  companyWebsite: String,
  uploadedContacts: String,
  uploadedCsvFileName: String,
  allowAutoLeads: { type: Boolean, default: false },
  revenueTarget: {
    min: Number,
    max: Number,
  },
  titles: [String],
  companyLocation: [String],
  employeeLocation: [String],
  industry: [String],
  keywords: [String],
  status: {
    type: String,
    enum: Object.values(CampaignStatus),
    default: CampaignStatus.DRAFT,
  },
  companyLegalName: String,
  signatoryName: String,
  signatoryTitle: String,
  signedAt: Date,
  signatureBase64: String,
  createdAt: { type: Date, default: Date.now },
});

CampaignSchema.index({ businessId: 1 });

export const Campaign = mongoose.model<ICampaign>("Campaign", CampaignSchema);
