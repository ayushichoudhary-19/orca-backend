import { Types } from "mongoose";
import { User } from "../models/User";

interface CreateUserInput {
  firebaseUid: string;
  email: string;
  name: string;
  role?: "admin" | "ae" | "sdr";
  businessId?: string | Types.ObjectId;
}

export const findUserByFirebaseUid = async (firebaseUid: string) => {
  return await User.findOne({ firebaseUid }).lean();
};

export const createUser = async ({
  firebaseUid,
  email,
  name,
  role = "sdr",
  businessId,
}: CreateUserInput) => {
  return await User.findOneAndUpdate(
    { _id: firebaseUid },
    {
      _id: firebaseUid,
      email,
      name: name ?? null,
      role,
      businessId: businessId ?? null,
      fcmTokens: [],
      campaignsSubscribedTo: [],
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );
};

export const createOrUpdateSalesRep = async ({
  firebaseUid,
  email,
  fullName,
  phoneNumber,
  role = "sdr",
  languages,
}: {
  firebaseUid: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role?: "sdr" | "admin";
  languages?: { language: string; proficiency: string }[];
}) => {
  return await User.findOneAndUpdate(
    { _id: firebaseUid },
    {
      _id: firebaseUid,
      email,
      role,
      name: fullName,
      salesRepProfile: {
        fullName,
        phoneNumber,
        languages,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

export const updateUserFcmToken = async (userId: string, token: string) => {
  return await User.findByIdAndUpdate(
    userId,
    {
      $addToSet: { fcmTokens: token },
    },
    { new: true }
  );
};
