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
  createdAt: Date;
  fcmTokens: string[];
  campaignsSubscribedTo: string[];
  salesRepProfile?: SalesRepProfile;
}

const UserSchema = new Schema<IUser>({
  _id: { type: String, required: true },
  email: { type: String, required: true },
  name: { type: String },
  createdAt: { type: Date, default: Date.now },
  fcmTokens: { type: [String], default: [] },
  campaignsSubscribedTo: { type: [String], default: [] },
  salesRepProfile: {
    fullName: String,
    phoneNumber: String,
    resumeUrl: String,
    languages: [{ language: String, proficiency: String }],
    createdAt: { type: Date, default: Date.now },
  }
});

export const User = mongoose.model<IUser>("User", UserSchema);