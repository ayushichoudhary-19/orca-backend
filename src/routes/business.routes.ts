import express from "express";
import {
  createBusiness,
  getBusinessById,
  getBusinessesByUser,
  updateBusinessDetails,
} from "../controllers/business.controller";

const router = express.Router();

router.post("/", createBusiness);
router.get("/:id", getBusinessById);
router.get("/user/:userId", getBusinessesByUser);
router.patch("/:businessId/details", updateBusinessDetails);

export default router;
