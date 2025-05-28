import { Request, Response } from "express";
import { startCallingLeadsService } from "../services/campaignCall.service";

export const startCallingLeads = async (req: Request, res: Response) => {
  const { campaignId } = req.params;

  if (!campaignId) {
    res.status(400).json({ error: "Campaign ID is required" });
    return;
  }

  try {
    const session = await startCallingLeadsService(campaignId);
    res.status(200).json({ success: true, session });
  } catch (error) {
    console.error("Failed to start calling leads:", error);
    res.status(500).json({ error: "Failed to start calling leads" });
  }
};