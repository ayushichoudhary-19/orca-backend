import { Request, Response } from "express";
import { Meeting } from "../models/Meeting";

export const getMeetingsByCampaign = async (req: Request, res: Response) => {
  const { campaignId } = req.params;
  const meetings = await Meeting.find({ campaignId }).sort({ time: -1 });
  res.status(200).json({ meetings });
};
