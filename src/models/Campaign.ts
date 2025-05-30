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
  signatureBase64?: String;
  createdAt: Date;
  calendlyLink: String;
  weeklyEmailReports?: boolean;
  elevatorPitch?: string;
  fullTimeHiringNotes?: string;
  jobDescriptionImageUrl?: string;
  logoImageUrl?: string;
  qualifiedLeadPrice?: number;
  qualificationCriteria?: {
    companySize?: string;
    prospectTitle?: string;
    companyIndustry?: string;
    painPoint?: string;
  };
  campaignControls?: {
    selfSourced: boolean;
    dialerAllowed: boolean;
    marketplaceVisible: boolean;
    callbacksAllowed: boolean;
  };
  callingHours?: {
    SUNDAY?: boolean;
    MONDAY?: boolean;
    TUESDAY?: boolean;
    WEDNESDAY?: boolean;
    THURSDAY?: boolean;
    FRIDAY?: boolean;
    SATURDAY?: boolean;
  };
  accountExecutives?: string[];
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
  calendlyLink: String,
  weeklyEmailReports: { type: Boolean, default: false },
  elevatorPitch: String,
  fullTimeHiringNotes: String,
  jobDescriptionImageUrl: String,
  logoImageUrl: String,
  qualifiedLeadPrice: Number,
  qualificationCriteria: {
    companySize: String,
    prospectTitle: String,
    companyIndustry: String,
    painPoint: String,
  },
  campaignControls: {
    selfSourced: { type: Boolean, default: false },
    dialerAllowed: { type: Boolean, default: false },
    marketplaceVisible: { type: Boolean, default: true },
    callbacksAllowed: { type: Boolean, default: false },
  },
  callingHours: {
    SUNDAY: { type: Boolean, default: false },
    MONDAY: { type: Boolean, default: false },
    TUESDAY: { type: Boolean, default: true },
    WEDNESDAY: { type: Boolean, default: true },
    THURSDAY: { type: Boolean, default: false },
    FRIDAY: { type: Boolean, default: false },
    SATURDAY: { type: Boolean, default: false },
  },
  accountExecutives: [String],
});

CampaignSchema.index({ businessId: 1 });

export const Campaign = mongoose.model<ICampaign>("Campaign", CampaignSchema);
