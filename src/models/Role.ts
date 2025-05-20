import mongoose, { Schema } from "mongoose";

export interface IRole extends Document {
  name: string;
  businessId: mongoose.Types.ObjectId;
  featureIds: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
}

const RoleSchema = new Schema<IRole>({
  name: { type: String, required: true },
  businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
  featureIds: [{ type: Schema.Types.ObjectId, ref: "Feature" }],
});

export const Role = mongoose.model<IRole>("Role", RoleSchema);
