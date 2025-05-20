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
  getTrainingsForSDR,
  getTrainingContentById,
  markTrainingComplete,
  getTrainingProgress
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
router.get("/:campaignId/sdr", getTrainingsForSDR);
router.get("/content/:id", getTrainingContentById);
router.post("/complete/:id", markTrainingComplete);
router.get("/progress/:campaignId/:salesRepId", getTrainingProgress);

export default router;
