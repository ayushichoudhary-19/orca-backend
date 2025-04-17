import { Request, Response } from "express";
import * as userService from "../services/user.service";

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await userService.findUserByFirebaseUid((req as any).user?.firebaseUid!);
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { uid, email } = req.body;
    const firebaseUid = uid;
    const user = await userService.createUser({ firebaseUid, email });
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create user" });
  }
};
