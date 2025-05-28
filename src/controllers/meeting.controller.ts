import { Request, Response } from "express";
import { Meeting } from "../models/Meeting";

export const getMeetingsByCampaign = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const meetings = await Meeting.find({ campaignId: id });
    res.status(200).json(meetings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch meetings." });
  }
};