import express from "express";
import {
  createFeature,
  getFeaturesByCategory,
} from "../controllers/feature.controller";

const router = express.Router();

router.post("/", createFeature);
router.get("/category/:categoryId", getFeaturesByCategory);

export default router;
