import mongoose, { Schema } from "mongoose";

export interface IFeatureCategory extends Document {
  name: string;
}

const FeatureCategorySchema = new Schema<IFeatureCategory>({
  name: { type: String, required: true },
});

export const FeatureCategory = mongoose.model<IFeatureCategory>(
  "FeatureCategory",
  FeatureCategorySchema
);
