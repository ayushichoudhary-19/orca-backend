import mongoose, { Schema, Document } from "mongoose";

export interface ISalesRep extends Document {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  bio?: string;
  linkedin?: string;
  resumeUrl?: string;
  experienceYears?: number;
  createdAt: Date;
  updatedAt: Date;
}

const SalesRepSchema = new Schema<ISalesRep>(
  {
    userId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    bio: { type: String },
    linkedin: { type: String },
    resumeUrl: { type: String },
    experienceYears: { type: Number },
  },
  { timestamps: true }
);

export const SalesRep = mongoose.model<ISalesRep>(
  "SalesRep",
  SalesRepSchema
);
