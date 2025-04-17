import { FeatureCategory } from "../models/FeatureCategory";

export const createFeatureCategory = async (data: { name: string }) => {
  return await FeatureCategory.create(data);
};

export const getAllFeatureCategories = async () => {
  return await FeatureCategory.find();
};
