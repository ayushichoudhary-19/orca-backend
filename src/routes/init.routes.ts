import express from "express";
import {
  createInitialFeatures,
  createDefaultAdminRole,
} from "../controllers/init.controller";

const router = express.Router();

router.get("/features", createInitialFeatures);
router.get("/roles/admin/:businessId", createDefaultAdminRole);

export default router;