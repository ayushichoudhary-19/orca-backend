import { Request, Response } from "express";
import * as userService from "../services/user.service";
import { assignUser } from "../services/membership.service";

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
      name,
    });
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create user" });
  }
};

export const registerSalesRep = async (req: Request, res: Response) => {
  try {
    const { uid, email, fullName, phoneNumber, languages } = req.body;
    // const resumeUrl = req.file?.path;
    const SDR_ROLE_ID = process.env.SDR_ROLE_ID!;

    console.log("Received SDR registration:", {
      uid,
      email,
      fullName,
      phoneNumber,
      // resume: req.file?.path,
      languages,
      SDR_ROLE_ID: process.env.SDR_ROLE_ID,
    });

    if (!uid || !email || !fullName || !phoneNumber || !SDR_ROLE_ID) {
      res
        .status(400)
        .json({
          error:
            "Missing required fields: " + uid
              ? ""
              : "uid, " + email
              ? ""
              : "email, " + fullName
              ? ""
              : "fullName, " + phoneNumber
              ? ""
              : "phoneNumber, " + SDR_ROLE_ID
              ? ""
              : "SDR_ROLE_ID",
        });
      return;
    }

    const user = await userService.createOrUpdateSalesRep({
      firebaseUid: uid,
      email,
      fullName,
      phoneNumber,
      // resumeUrl,
      languages: JSON.parse(languages),
    });

    await assignUser({
      userId: uid,
      roleId: SDR_ROLE_ID,
    });

    res.status(201).json({ success: true });
    return;
  } catch (err) {
    console.error("Sales rep registration failed:", err);
    res.status(500).json({ error: "Failed to register sales rep" });
    return;
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
