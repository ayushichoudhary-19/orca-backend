import express from "express";
import { handleCalendlyWebhook } from "../controllers/calendly.controller";

const router = express.Router();

router.post("/webhook", handleCalendlyWebhook);

export default router;
