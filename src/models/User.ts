import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  _id: string;
  email: string;
  name?: string;
  createdAt: Date;
  fcmTokens: string[];
  campaignsSubscribedTo: string[];
}

const UserSchema = new Schema<IUser>({
  _id: { type: String, required: true },
  email: { type: String, required: true },
  name: { type: String },
  createdAt: { type: Date, default: Date.now },
  fcmTokens: { type: [String], default: [] },
  campaignsSubscribedTo: { type: [String], default: [] },
});

export const User = mongoose.model<IUser>("User", UserSchema);

