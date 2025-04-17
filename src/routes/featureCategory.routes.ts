import express from "express";
import {
  createFeatureCategory,
  getAllFeatureCategories,
} from "../controllers/featureCategory.controller";

const router = express.Router();

router.post("/", createFeatureCategory);
router.get("/", getAllFeatureCategories);

export default router;
