import { Request, Response } from "express";
import * as userService from "../services/user.service";
import { Invite } from "../models/Invite";
import { Types } from "mongoose";
import { User } from "../models/User";

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    console.log("Looking up user by UID:", req.user?.uid);

    const user = await User.findById(uid).lean();

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { uid, email, name } = req.body;
    const firebaseUid = uid;

    const invite = await Invite.findOne({ email });

    let role: "admin" | "ae" | "sdr" = "sdr";
    let businessId: Types.ObjectId | undefined = undefined;

    if (invite) {
      const allowedRoles = ["admin", "ae"] as const;
      if (allowedRoles.includes(invite.role as any)) {
        role = invite.role as "admin" | "ae";
        businessId = invite.businessId!;
        await Invite.deleteOne({ _id: invite._id });
      }
    }

    const user = await userService.createUser({
      firebaseUid,
      email,
      name,
      role,
      businessId,
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

    if (!uid || !email || !fullName || !phoneNumber) {
      res.status(400).json({
        error: "Missing required fields: uid, email, fullName, phoneNumber",
      });
      return;
    }

    const user = await userService.createOrUpdateSalesRep({
      firebaseUid: uid,
      email,
      fullName,
      phoneNumber,
      role: "sdr",
      languages: JSON.parse(languages),
    });

    res.status(201).json({ success: true });
  } catch (err) {
    console.error("Sales rep registration failed:", err);
    res.status(500).json({ error: "Failed to register sales rep" });
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
