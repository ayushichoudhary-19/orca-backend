import { Request, Response } from "express";
import * as membershipService from "../services/membership.service";

export const assignUserToBusiness = async (req: Request, res: Response) => {
  try {
    const membership = await membershipService.assignUser(req.body);
    res.status(201).json(membership);
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};

export const getMembershipsByUser = async (req: Request, res: Response) => {
  try {
    const memberships = await membershipService.getByUserId(req.params.userId);
    res.status(200).json(memberships);
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};

export const updateOnboardingStep = async (req: Request, res: Response) => {
  try {
    const updated = await membershipService.updateStep(
      req.params.membershipId,
      req.body.step
    );
    res.status(200).json(updated);
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};

export const isAdminForBusiness = async (req: Request, res: Response) => {
  try {
    const { userId, businessId } = req.query;
    const isAdmin = await membershipService.checkIfAdmin(
      userId as string,
      businessId as string
    );
    res.status(200).json({ isAdmin });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};
