import express from "express";
import { SalesRep } from "../models/SalesRep";
import { SalesRepCampaignStatus } from "../models/SalesRepCampaignStatus";

const router = express.Router();

router.post("/seed-reps", async (req, res) => {
  const { campaignId } = req.body;

  const rep = await SalesRep.create({
    userId: "rep123",
    fullName: "Ayushi Choudhary",
    email: "ayushi@example.com",
    phone: "9876543210",
    bio: "I'm a passionate cold caller.",
  });

  const campaignStatus = await SalesRepCampaignStatus.create({
    campaignId,
    salesRepId: rep._id,
    trainingProgress: 100,
    auditionStatus: "not_started",
    auditionAttempts: 0,
  });

  res.json({ rep, campaignStatus });
});

export default router;
