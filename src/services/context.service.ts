import { ContextModel } from "../models/Context";

export const getContextsByCampaign = async (campaignId: string) => {
  return await ContextModel.find({ campaignId }).sort({ createdAt: -1 });
};

export const createContext = async (data: any) => {
  if (!data.campaignId || !data.type || !data.content) {
    throw new Error("Missing required fields: campaignId, type, or content");
  }
  return await ContextModel.create(data);
};

export const updateContext = async (id: string, data: any) => {
  return await ContextModel.findByIdAndUpdate(id, data, { new: true });
};

export const deleteContext = async (id: string) => {
  return await ContextModel.findByIdAndDelete(id);
};
