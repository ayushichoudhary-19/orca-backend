import { Request, Response } from "express";
import { SalesRep } from "../models/SalesRep";

export const createSalesRep = async (req: Request, res: Response) => {
  try {
    const { userId, fullName, email, phone, bio, linkedin, resumeUrl, experienceYears } = req.body;

    if (!userId || !fullName || !email || !phone) {
        res.status(400).json({ error: "Missing required fields" });
        return;
    }

    const existing = await SalesRep.findOne({ userId });
    if (existing) {
     res.status(409).json({ error: "SalesRep already exists" });
        return;
    }

    const rep = await SalesRep.create({
      userId,
      fullName,
      email,
      phone,
      bio,
      linkedin,
      resumeUrl,
      experienceYears,
    });

    res.status(201).json(rep);
  } catch (err) {
    console.error("Error creating sales rep:", err);
    res.status(500).json({ error: "Failed to create sales rep" });
  }
};
