import mongoose, { Schema, Document } from "mongoose";

interface SalesRepProfile {
  fullName: string;
  phoneNumber: string;
  resumeUrl?: string;
  languages?: { language: string; proficiency: string }[];
  createdAt?: Date;
}

export interface IUser extends Document {
  _id: string;
  email: string;
  name?: string;
  role: "admin" | "sdr" | "ae"; 
  createdAt: Date;
  fcmTokens: string[];
  campaignsSubscribedTo: string[];
  businessId?: mongoose.Types.ObjectId;
  salesRepProfile?: SalesRepProfile;
}

const UserSchema = new Schema<IUser>({
  _id: { type: String, required: true },
  email: { type: String, required: true },
  name: { type: String },
  role: { type: String, enum: ["admin", "sdr", "ae"], required: true },
  createdAt: { type: Date, default: Date.now },
  fcmTokens: { type: [String], default: [] },
  campaignsSubscribedTo: { type: [String], default: [] },
  businessId: { type: Schema.Types.ObjectId, ref: "Business" },
  salesRepProfile: {
    fullName: String,
    phoneNumber: String,
    resumeUrl: String,
    languages: [{ language: String, proficiency: String }],
    createdAt: { type: Date, default: Date.now },
  }
});

export const User = mongoose.model<IUser>("User", UserSchema);