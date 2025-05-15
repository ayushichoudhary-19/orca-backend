import { Request, Response } from "express";
import * as userService from "../services/user.service";

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await userService.findUserByFirebaseUid(
      (req as any).user?.firebaseUid!
    );
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { uid, email, name } = req.body;
    const firebaseUid = uid;
    const user = await userService.createUser({ 
      firebaseUid, 
      email,
      name });
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create user" });
  }
};

export const updateFcmToken = async (req: Request, res: Response) => {
  try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      res.status(400).json({
        error: "User ID and FCM token are required",
      });
      return;
    }

    const updatedUser = await userService.updateUserFcmToken(userId, token);

    if (!updatedUser) {
      res.status(404).json({
        error: "User not found",
      });
      return;
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error updating FCM token:", err);
    res.status(500).json({
      error: "Failed to update FCM token",
    });
  }
};
