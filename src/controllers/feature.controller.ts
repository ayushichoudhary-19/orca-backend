import { Request, Response } from "express";
import { Feature } from "../models/Feature";

export const createFeature = async (req: Request, res: Response) => {
  try {
    const feature = await Feature.create(req.body);
    res.status(201).json(feature);
  } catch (err) {
    res.status(500).json({ error: "Failed to create feature" });
  }
};

export const getFeaturesByCategory = async (req: Request, res: Response) => {
  try {
    const features = await Feature.find({ categoryId: req.params.categoryId });
    res.status(200).json(features);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch features" });
  }
};

export const fetchAllFeatures = async (req: Request, res: Response) => {
  try {
    const features = await Feature.find({});
    res.status(200).json(features);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch features" });
  }
};