import { Membership } from "../models/Membership";

export const getUserFeaturesForBusiness = async (
  userId: string,
  businessId: string
) => {
  const membership = await Membership.findOne({ userId, businessId }).populate({
    path: "roleId",
    populate: {
      path: "featureIds",
      model: "Feature",
    },
  });

  const features = (membership?.roleId as any)?.featureIds || [];
  return features.map((f: any) => f.name);
};

export const hasFeatureAccess = async (
  userId: string,
  businessId: string,
  featureName: string
): Promise<boolean> => {
  const features = await getUserFeaturesForBusiness(userId, businessId);
  return features.includes(featureName);
};
