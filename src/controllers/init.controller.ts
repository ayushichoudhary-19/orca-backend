import { Request, Response } from "express";
import * as initService from "../services/init.service";

export const createInitialFeatures = async (_req: Request, res: Response) => {
  try {
    const features = await initService.createInitialFeatures();
    res.status(201).json(features);
  } catch (err) {
    res.status(500).json({ error: "Failed to seed features" });
  }
};

export const createDefaultAdminRole = async (req: Request, res: Response) => {
  try {
    const role = await initService.createDefaultAdminRole(req.params.businessId, (req as any).user._id);
    res.status(201).json(role);
  } catch (err) {
    res.status(500).json({ error: "Failed to create admin role" });
  }
};
