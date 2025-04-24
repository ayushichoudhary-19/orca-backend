import { Router } from "express";
import {
  createTraining,
  getTrainingsByCampaign,
  getTrainingById,
  updateTraining,
  deleteTraining,
  toggleTrainingVisibility,
  publishTraining,
  seedDefaults,
  checkCoreCompletion,
  reorderTrainings,
  bulkUpdateVisibility,
} from "../controllers/training.controller";
import { TRAINING_TYPES } from "../utils/trainingTypes";

const router = Router();

router.post("/", createTraining);
router.get("/campaign/:campaignId", getTrainingsByCampaign);
router.get("/:id", getTrainingById);
router.put("/:id", updateTraining);
router.patch("/:id/visibility", toggleTrainingVisibility);
router.patch("/:id/publish", publishTraining);
router.post("/seed-defaults", seedDefaults);
router.get("/check-core/:campaignId", checkCoreCompletion);
router.delete("/:id", deleteTraining);
router.post("/reorder", reorderTrainings);
router.post("/visibility-bulk", bulkUpdateVisibility);
router.get("/core-types", (req, res) => {
  res.status(200).json(TRAINING_TYPES);
});

export default router;
