import { Request, Response } from "express";
import * as businessService from "../services/business.service";

export const createBusiness = async (req: Request, res: Response) => {
  try {
    const business = await businessService.createBusiness(req.body);
    res.status(201).json(business);
  } catch (err) {
    res.status(500).json({ error: "Failed to create business" });
  }
};

export const getBusinessById = async (req: Request, res: Response) => {
  try {
    const business = await businessService.getBusinessById(req.params.id);
    res.status(200).json(business);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch business" });
  }
};

export const getBusinessesByUser = async (req: Request, res: Response) => {
  try {
    const businesses = await businessService.getBusinessesByUser(
      req.params.userId
    );
    res.status(200).json(businesses);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch businesses" });
  }
};

export const updateBusinessDetails = async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;
    const { companySize, referralSource } = req.body;

    const updatedBusiness = await businessService.updateBusinessDetails(
      businessId,
      { companySize, referralSource }
    );

    if (!updatedBusiness) {
      res.status(404).json({ error: "Business not found" });
      return;
    }

    res.status(200).json(updatedBusiness);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update business details" });
  }
};
