import mongoose, { Schema } from "mongoose";

export interface IFeature extends Document {
  name: string;
  label: string;
  categoryId: mongoose.Types.ObjectId;
}

const FeatureSchema = new Schema<IFeature>({
  name: { type: String, required: true },
  label: { type: String, required: true },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: "FeatureCategory",
    required: true,
  },
});

export const Feature = mongoose.model<IFeature>("Feature", FeatureSchema);
