import { Request, Response } from "express";
import { Invite } from "../models/Invite";

export const createInvite = async (req: Request, res: Response) => {
  try {
    const { email, role, type, businessId, campaignId } = req.body;

    if (!email || !role || !type) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const invite = new Invite({
      email,
      role,
      type,
      businessId,
      campaignId,
    });

    await invite.save();
    res.status(201).json({ success: true, invite });
    return;
  } catch (err) {
    console.error("Error creating invite:", err);
    res.status(500).json({ error: "Failed to create invite" });
    return;
  }
};

export const checkInviteExists = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    if (!email || typeof email !== "string") {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const invite = await Invite.findOne({ email });
    res.status(200).json({ exists: !!invite });
  } catch (err) {
    res.status(500).json({ error: "Failed to check invite" });
  }
};
