import { User } from "../models/User";

export const findUserByFirebaseUid = async (firebaseUid: string) => {
  return await User.findOne({ firebaseUid }).lean();
};

export const createUser = async (data: { firebaseUid: string; email: string }) => {
  return await User.findOneAndUpdate(
    { _id: data.firebaseUid },
    { 
      _id: data.firebaseUid,
      firebaseUid: data.firebaseUid,
      email: data.email 
    },
    { 
      upsert: true,
      new: true,
      setDefaultsOnInsert: true 
    }
  );
};
