import express from "express";
import { getCurrentUser, createUser, updateFcmToken } from "../controllers/user.controller";
import { authenticate } from "../middleware/auth";

const router = express.Router();
router.get("/me", authenticate, getCurrentUser);
router.post("/", createUser);
router.post("/fcm-token", authenticate, updateFcmToken);

export default router;