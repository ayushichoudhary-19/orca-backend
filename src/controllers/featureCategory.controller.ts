import { Request, Response } from "express";
import * as featureCategoryService from "../services/featureCategory.service";

export const createFeatureCategory = async (req: Request, res: Response) => {
  try {
    const category = await featureCategoryService.createFeatureCategory(req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: "Failed to create feature category" });
  }
};

export const getAllFeatureCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await featureCategoryService.getAllFeatureCategories();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch feature categories" });
  }
};
