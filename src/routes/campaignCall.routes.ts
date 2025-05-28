import express from "express";
import { startCallingLeads } from "../controllers/campaignCall.controller";

const router = express.Router();

router.post("/start/:campaignId", startCallingLeads);