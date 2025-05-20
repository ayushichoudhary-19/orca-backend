import { User } from "../models/User";

export const findUserByFirebaseUid = async (firebaseUid: string) => {
  return await User.findOne({ firebaseUid }).lean();
};

export const createUser = async (data: { firebaseUid: string; email: string, name:string }) => {
  return await User.findOneAndUpdate(
    { _id: data.firebaseUid },
    { 
      _id: data.firebaseUid,
      email: data.email,
      name: data.name ?? null,
      fcmTokens: [],
      campaignsSubscribedTo: [],
    },
    { 
      upsert: true,
      new: true,
      setDefaultsOnInsert: true 
    }
  );
};

export const createOrUpdateSalesRep = async ({
  firebaseUid,
  email,
  fullName,
  phoneNumber,
  // resumeUrl,
  languages,
}: {
  firebaseUid: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  // resumeUrl?: string;
  languages?: { language: string; proficiency: string }[];
}) => {
  return await User.findOneAndUpdate(
    { _id: firebaseUid },
    {
      _id: firebaseUid,
      email,
      salesRepProfile: {
        fullName,
        phoneNumber,
        // resumeUrl,
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
