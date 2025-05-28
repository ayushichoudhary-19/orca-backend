import express from "express";
import { getMetricsForCampaign } from "../controllers/leadMetrics.controller";
import { parseLeadCsv, getLeadsByCampaign } from "../controllers/lead.controller";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/metrics/:campaignId", getMetricsForCampaign);
router.post("/upload", upload.single("file"), parseLeadCsv);
router.get("/campaign/:campaignId", getLeadsByCampaign);

export default router;
