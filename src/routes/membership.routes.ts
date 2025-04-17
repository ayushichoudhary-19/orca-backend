import express from "express";
import {
  assignUserToBusiness,
  getMembershipsByUser,
  updateOnboardingStep,
  isAdminForBusiness,
} from "../controllers/membership.controller";

const router = express.Router();

router.post("/", assignUserToBusiness);
router.get("/by-user/:userId", getMembershipsByUser);
router.patch("/:membershipId/onboarding-step", updateOnboardingStep);
router.get("/is-admin/:businessId", isAdminForBusiness);

export default router;
