import express from "express";
import { createInvite, checkInviteExists } from "../controllers/invite.controller";

const router = express.Router();

router.post("/", createInvite);
router.get("/check", checkInviteExists); 

export default router;
