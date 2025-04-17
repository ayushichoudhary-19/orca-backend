import { Business } from "../models/Business";

export const createBusiness = async (data: { name: string; companyWebsite?: string; createdBy: string }) => {
  return await Business.create(data);
};

export const getBusinessById = async (id: string) => {
  return await Business.findById(id).lean();
};

export const getBusinessesByUser = async (userId: string) => {
  return await Business.find({ createdBy: userId }).lean();
};

export const updateBusinessDetails = async (
  businessId: string,
  data: {
    companySize?: string;
    referralSource?: string;
  }
) => {
  return await Business.findByIdAndUpdate(
    businessId,
    { $set: data },
    { new: true }
  );
};
