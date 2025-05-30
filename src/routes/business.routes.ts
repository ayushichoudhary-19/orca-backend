import express from "express";
import {
  createBusiness,
  getBusinessById,
  getBusinessesByUser,
  updateBusinessDetails,
  updateBusinessStep,
} from "../controllers/business.controller";
import { authenticate } from "../middleware/auth";

const router = express.Router();
router.use(authenticate);

router.post("/", createBusiness);
router.get("/:id", getBusinessById);
router.get("/user/:userId", getBusinessesByUser);
router.patch("/:businessId/details", updateBusinessDetails);
router.patch("/:businessId/onboarding-step", updateBusinessStep);

export default router;
