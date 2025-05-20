import express from "express";
import {
  createFeature,
  getFeaturesByCategory,
  fetchAllFeatures,
} from "../controllers/feature.controller";

const router = express.Router();

router.post("/", createFeature);
router.get("/category/:categoryId", getFeaturesByCategory);
router.get("/", fetchAllFeatures);

export default router;
