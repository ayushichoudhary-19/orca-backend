import { Request, Response } from "express";
import { parseLeadCsvService, getLeadsByCampaignService } from "../services/lead.service";
import mongoose from "mongoose";

export const parseLeadCsv = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const campaignId = req.body.campaignId;
    const fieldMappingRaw = req.body.fieldMapping;

    if (!file || !campaignId || !fieldMappingRaw) {
        res.status(400).json({ error: "File, campaignId, and fieldMapping are required." });
        return;
    }

    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
        res.status(400).json({ error: "Invalid campaignId format" });
        return;
    }      

    const fieldMapping = JSON.parse(fieldMappingRaw);

    const result = await parseLeadCsvService(file.buffer, campaignId, file.originalname, fieldMapping);

    res.status(200).json({
      success: true,
      inserted: result.insertedCount,
      duplicates: result.duplicateCount,
      errors: result.errors,
    });
    return;
  } catch (err) {
    console.error("CSV upload error:", err);
    res.status(500).json({ error: "Failed to process CSV upload." });
    return;
}
};

export const getLeadsByCampaign = async (req: Request, res: Response) => {
  const { campaignId } = req.params;

  if (!campaignId) {
    res.status(400).json({ error: "Campaign ID is required" });
    return;
  }

  try {
    const leads = await getLeadsByCampaignService(campaignId);
    res.status(200).json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ error: "Failed to fetch campaign leads" });
  }
};
