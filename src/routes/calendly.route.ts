import express from "express";
import { handleCalendlyWebhook } from "../controllers/calendly.controller";
import {
  handleCalendlyOAuthCallback,
  startCalendlyOAuth,
} from "../controllers/calendly.controller";

const router = express.Router();

router.post("/webhook", handleCalendlyWebhook);

router.get("/oauth/start", startCalendlyOAuth);
router.get("/oauth/callback", handleCalendlyOAuthCallback);

export default router;
