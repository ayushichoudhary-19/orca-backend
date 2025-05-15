import mongoose, { Document, Schema } from "mongoose";

export interface IPost extends Document {
  campaignId: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
}

export type PostInput = {
  campaignId: string;
  title: string;
  content: string;
  createdBy: string;
};

const PostSchema = new Schema<IPost>(
  {
    campaignId: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

const PostModel = mongoose.model<IPost>("Post", PostSchema);
export default PostModel;
