import { TrainingModel } from "../models/Training";
import { TRAINING_TYPES } from "../utils/trainingTypes";

export const seedDefaultTrainings = async (
  campaignId: string,
  adminId: string
) => {
  const existing = await TrainingModel.find({
    campaignId,
    type: { $ne: null },
  });
  if (existing.length > 0) return;

  await TrainingModel.insertMany(
    TRAINING_TYPES.map((t, i) => ({
      campaignId,
      type: t.type,
      title: t.title,
      description: t.description,
      sections: [],
      isVisible: true,
      isPublished: false,
      sortOrder: i,
      lastSavedAt: new Date(),
      lastEditedBy: adminId,
    }))
  );
};

export const hasAllCoreTrainings = async (
  campaignId: string
): Promise<boolean> => {
  const existing = await TrainingModel.find({
    campaignId,
    type: { $ne: null },
  }).lean();
  const typesPresent = new Set(existing.map((t) => t.type));
  return TRAINING_TYPES.every((t) => typesPresent.has(t.type));
};

export const deleteTraining = async (id: string) => {
  const training = await TrainingModel.findById(id);
  if (!training) throw new Error("Training not found");
  if (training.type) throw new Error("Core trainings cannot be deleted");
  await training.deleteOne();
};

export const createTraining = async (data: any) => {
  if (!data.title || !data.campaignId) {
    const error = new Error("Missing title or campaignId");
    (error as any).statusCode = 400;
    throw error;
  }

  return await TrainingModel.create({
    ...data,
    isVisible: true,
    isPublished: false,
    sortOrder: data.sortOrder || 0,
    lastSavedAt: new Date(),
  });
};

export const getTrainingsByCampaign = async (campaignId: string) => {
  return await TrainingModel.find({ campaignId }).sort({ sortOrder: 1 }).lean();
};

export const getTrainingById = async (id: string) => {
  const training = await TrainingModel.findById(id).lean();
  if (!training) {
    const error = new Error("Training not found");
    (error as any).statusCode = 404;
    throw error;
  }
  return training;
};

export const updateTraining = async (id: string, data: any) => {
  const training = await TrainingModel.findByIdAndUpdate(
    id,
    { ...data, lastSavedAt: new Date() },
    { new: true }
  );

  if (!training) {
    const error = new Error("Training not found");
    (error as any).statusCode = 404;
    throw error;
  }

  return training;
};

export const toggleVisibility = async (id: string) => {
  const training = await TrainingModel.findById(id);
  if (!training) {
    const error = new Error("Training not found");
    (error as any).statusCode = 404;
    throw error;
  }

  training.isVisible = !training.isVisible;
  training.lastSavedAt = new Date();
  return await training.save();
};

export const setPublishState = async (id: string, isPublished: boolean) => {
  const training = await TrainingModel.findByIdAndUpdate(
    id,
    { isPublished, lastSavedAt: new Date() },
    { new: true }
  );

  if (!training) {
    const error = new Error("Training not found");
    (error as any).statusCode = 404;
    throw error;
  }

  return training;
};
