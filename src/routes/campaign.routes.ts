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
  getMyCampaigns,
  getPublicCampaignsForMarketplace,
  getCalendlyLinkByCampaignId,
  addCalendlyLink,
} from "../controllers/campaign.controller";
import { getMeetingsByCampaign } from "../controllers/meeting.controller";

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
router.post("/my-campaigns", getMyCampaigns);
router.post("/:id/calendly-link", addCalendlyLink);
router.get("/:id/calendly-link", getCalendlyLinkByCampaignId);
router.get("/:id/meetings", getMeetingsByCampaign)
export default router;
