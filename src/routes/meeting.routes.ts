import express from "express";
import { getMeetingsByCampaign } from "../controllers/meeting.controller";

const router = express.Router();
router.get("/campaign/:campaignId", getMeetingsByCampaign);
export default router;        
 