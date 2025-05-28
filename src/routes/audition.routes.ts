import express from "express";
import { authenticate } from "../middleware/auth";
import {
  getRepsByCampaign,
  createAuditionQuestion,
  markAuditionRetry,
  approveRep,
  rejectRep,
  getCampaignStatus,
  getAuditionQuestions,
  submitAudition,
} from "../controllers/audition.controller";
import { SalesRepCampaignStatus } from "../models/SalesRepCampaignStatus";

const router = express.Router();

router.use(authenticate);

// Admin routes
router.get("/:campaignId/reps", getRepsByCampaign);
router.post("/:campaignId/questions", createAuditionQuestion);
router.put("/:campaignId/reps/:repId/retry", markAuditionRetry);
router.put("/:campaignId/reps/:repId/approve", approveRep);
router.put("/:campaignId/reps/:repId/reject", rejectRep);

router.get("/:campaignId/status/:repId", getCampaignStatus);
router.get("/:campaignId/questions", getAuditionQuestions);
router.post("/:campaignId/submit", submitAudition);

router.get("/:campaignId/reps/:repId/audition", async (req, res) => {
  const { campaignId, repId } = req.params;
  const record = await SalesRepCampaignStatus.findOne({
    campaignId,
    salesRepId: repId,
  }).populate("auditionResponses.questionId");
  res.json(record);
});

export default router;
