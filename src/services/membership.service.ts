import { Membership } from "../models/Membership";

export const assignUser = async (data: {
  userId: string;
  businessId: string;
  roleId: string;
}) => {
  const { userId, businessId, roleId } = data;

  if (!userId || !businessId || !roleId) {
    const error = new Error("Missing userId, businessId, or roleId");
    (error as any).statusCode = 400;
    throw error;
  }

  return await Membership.create({
    userId,
    businessId,
    roleId,
    onboardingStep: 0,
  });
};

export const getByUserId = async (userId: string) => {
  if (!userId) {
    const error = new Error("Missing userId");
    (error as any).statusCode = 400;
    throw error;
  }

  const memberships = await Membership.find({ userId })
    .populate({
      path: "roleId",
      select: "name featureIds",
      options: { lean: true },
    })
    .populate({
      path: "businessId",
      select: "name companyWebsite",
      options: { lean: true },
    })
    .lean();

  if (!memberships.length) {
    const error = new Error("No memberships found");
    (error as any).statusCode = 404;
    throw error;
  }

  return memberships;
};

export const updateStep = async (membershipId: string, step: number) => {
  if (typeof step !== "number") {
    const error = new Error("Invalid onboarding step");
    (error as any).statusCode = 400;
    throw error;
  }

  const updated = await Membership.findByIdAndUpdate(
    membershipId,
    { onboardingStep: step },
    { new: true }
  );

  if (!updated) {
    const error = new Error("Membership not found");
    (error as any).statusCode = 404;
    throw error;
  }

  return updated;
};

export const checkIfAdmin = async (userId: string, businessId: string) => {
  if (!userId || !businessId) {
    const error = new Error("Missing userId or businessId");
    (error as any).statusCode = 400;
    throw error;
  }

  const membership = await Membership.findOne({
    userId,
    businessId,
  }).populate("roleId");

  const roleName = (membership?.roleId as any)?.name?.toLowerCase();
  return roleName === "admin";
};
