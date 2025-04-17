import { Request, Response, NextFunction } from "express";
import { hasFeatureAccess } from "../services/rbac.service";

export const checkPermission = (featureName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id;
    const businessId = req.params.businessId || req.body.businessId;

    if (!userId || !businessId) {
      return res.status(400).json({ error: "User ID or Business ID missing" });
    }

    const allowed = await hasFeatureAccess(userId, businessId, featureName);

    if (!allowed) {
      return res.status(403).json({ error: "Access denied" });
    }

    next();
  };
};