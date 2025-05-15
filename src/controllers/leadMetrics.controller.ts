import { Request, Response } from "express";
import { getLeadMetrics } from "../services/leadMetrics.service";

export const getMetricsForCampaign = async (req: Request, res: Response) => {
  const { campaignId } = req.params;

  if (!campaignId) {
    res.status(400).json({ error: "campaignId is required" });
    return 
}

  try {
    const metrics = await getLeadMetrics(campaignId);
     res.status(200).json(metrics);
     return
  } catch (err) {
    console.error("Error fetching lead metrics:", err);
   res.status(500).json({ error: "Failed to fetch lead metrics" });
   return
  }
};
