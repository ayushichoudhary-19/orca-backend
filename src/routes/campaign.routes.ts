import express from "express";
import {
  createCampaign,
  getCampaignById,
  getCampaignsByBusiness,
  signCampaign,
  updateCampaignContacts,
  addContactsToCampaign,
  addIdealCustomerDetails,
  getCampaignStatus,
  getPublicCampaignsForMarketplace,
} from "../controllers/campaign.controller";
import { Campaign } from "../models/Campaign";
import { Meeting } from "../models/Meeting";

const router = express.Router();

router.post("/", createCampaign);
router.get("/public", getPublicCampaignsForMarketplace);
router.get("/:id", getCampaignById);
router.get("/business/:businessId", getCampaignsByBusiness);
router.patch("/:id/sign", signCampaign);
router.put("/:campaignId/contacts", updateCampaignContacts);
router.post("/:campaignId/contacts", addContactsToCampaign);
router.post("/:campaignId/details", addIdealCustomerDetails);
router.get("/:campaignId/status", getCampaignStatus);
router.post('/:id/calendly-link', async (req, res) => {
  const { id } = req.params;
  const { calendlyLink } = req.body;

  try {
    await Campaign.findByIdAndUpdate(id, { calendlyLink });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update Calendly link.' });
  }
});
router.get('/:id/meetings', async (req, res) => {
  const { id } = req.params;

  try {
    const meetings = await Meeting.find({ campaignId: id });
    res.status(200).json(meetings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch meetings.' });
  }
});
export default router;
