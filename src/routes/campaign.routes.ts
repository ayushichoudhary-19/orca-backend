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
} from "../controllers/campaign.controller";

const router = express.Router();

router.post("/", createCampaign);
router.get("/:id", getCampaignById);
router.get("/business/:businessId", getCampaignsByBusiness);
router.patch("/:id/sign", signCampaign);
router.put("/:campaignId/contacts", updateCampaignContacts);
router.post("/:campaignId/contacts", addContactsToCampaign);
router.post("/:campaignId/details", addIdealCustomerDetails);
router.get("/:campaignId/status", getCampaignStatus);

export default router;
