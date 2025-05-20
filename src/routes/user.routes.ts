import express from "express";
import { getCurrentUser, createUser, updateFcmToken, registerSalesRep } from "../controllers/user.controller";
import { authenticate } from "../middleware/auth";
import { upload } from "../utils/upload";

const router = express.Router();
router.get("/me", authenticate, getCurrentUser);
router.post("/", createUser);
router.post("/fcm-token", authenticate, updateFcmToken);
// router.post("/register-sales-rep", upload.single("resume"), registerSalesRep);
router.post("/register-sales-rep", upload.none(),registerSalesRep);

export default router;