import { Feature } from "../models/Feature";
import { Role } from "../models/Role";

export const createInitialFeatures = async () => {
  const features = [
    { name: "do_onboarding", label: "Do Onboarding" },
    { name: "create_campaign", label: "Create Campaign" },
    { name: "upload_contacts", label: "Upload Contacts" },
    { name: "view_dashboard", label: "View Dashboard" },
  ];
  return await Feature.insertMany(features);
};

export const createDefaultAdminRole = async (businessId: string, createdBy: string) => {
  const features = await Feature.find();
  return await Role.create({
    name: "Admin",
    businessId,
    featureIds: features.map(f => f._id),
    createdBy,
  });
};
