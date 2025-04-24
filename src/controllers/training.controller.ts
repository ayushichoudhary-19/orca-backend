import { Request, Response } from "express";
import * as trainingService from "../services/training.service";
import { TrainingModel } from "../models/Training";

export const seedDefaults = async (req: Request, res: Response) => {
  const { campaignId, adminId } = req.body;
  await trainingService.seedDefaultTrainings(campaignId, adminId);
  res.status(200).json({ message: "Default trainings seeded" });
};

export const deleteTraining = async (req: Request, res: Response) => {
  try {
    await trainingService.deleteTraining(req.params.id);
    res.status(204).send();
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const checkCoreCompletion = async (req: Request, res: Response) => {
  const { campaignId } = req.params;
  const complete = await trainingService.hasAllCoreTrainings(campaignId);
  res.status(200).json({ complete });
};

export const createTraining = async (req: Request, res: Response) => {
  try {
    const training = await trainingService.createTraining(req.body);
    res.status(201).json(training);
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};

export const getTrainingsByCampaign = async (req: Request, res: Response) => {
  try {
    const trainings = await trainingService.getTrainingsByCampaign(
      req.params.campaignId
    );
    res.status(200).json(trainings);
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};

export const getTrainingById = async (req: Request, res: Response) => {
  try {
    const training = await trainingService.getTrainingById(req.params.id);
    res.status(200).json(training);
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};

export const updateTraining = async (req: Request, res: Response) => {
  try {
    const training = await trainingService.updateTraining(
      req.params.id,
      req.body
    );
    res.status(200).json(training);
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};

export const toggleTrainingVisibility = async (req: Request, res: Response) => {
  try {
    const training = await trainingService.toggleVisibility(req.params.id);
    res.status(200).json(training);
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};

export const bulkUpdateVisibility = async (req: Request, res: Response) => {
  try {
    const updates = req.body.updates as { id: string; isVisible: boolean }[];

    await Promise.all(
      updates.map(({ id, isVisible }) =>
        TrainingModel.findByIdAndUpdate(id, { isVisible }, { new: false })
      )
    );

    res.status(200).json({ message: "Visibility updated successfully." });
  } catch (error: any) {
    console.error("Bulk visibility update failed:", error);
    res.status(500).json({ error: "Failed to update visibility" });
  }
};


export const publishTraining = async (req: Request, res: Response) => {
  try {
    const training = await trainingService.setPublishState(req.params.id, true);
    res.status(200).json(training);
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};

export const reorderTrainings = async (req: Request, res: Response) => {
  const { order } = req.body;
  for (const { id, sortOrder } of order) {
    await TrainingModel.findByIdAndUpdate(id, { sortOrder });
  }
  res.status(200).json({ message: "Reordered" });
};

