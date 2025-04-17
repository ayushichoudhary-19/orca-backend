import { Request, Response } from "express";
import { Role } from "../models/Role";

export const createRole = async (req: Request, res: Response) => {
  try {
    const role = await Role.create(req.body);
    res.status(201).json(role);
  } catch (err) {
    res.status(500).json({ error: "Failed to create role" });
  }
};

export const getRolesByBusiness = async (req: Request, res: Response) => {
  try {
    const roles = await Role.find({ businessId: req.params.businessId });
    res.status(200).json(roles);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch roles" });
  }
};