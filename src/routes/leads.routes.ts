import express from "express";
import { getMetricsForCampaign } from "../controllers/leadMetrics.controller";
import { parseLeadCsv } from "../controllers/lead.controller";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/metrics/:campaignId", getMetricsForCampaign);
router.post("/upload", upload.single("file"), parseLeadCsv);

export default router;
