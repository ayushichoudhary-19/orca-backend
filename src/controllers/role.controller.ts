import { Request, Response } from "express";
import { Role } from "../models/Role";

export const createRole = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const { businessId } = req.params;

    const role = await Role.create({
      name,
      businessId,
      featureIds: [],
    });

    res.status(201).json(role);
  } catch (err) {
    console.error("Failed to create role:", err);
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

export const updateRoleFeatures = async (req: Request, res: Response) => {
  const { featureIds } = req.body;
  const { roleId } = req.params;

  try {
    const role = await Role.findByIdAndUpdate(
      roleId,
      { featureIds },
      { new: true }
    );
    res.status(200).json(role);
  } catch (err) {
    res.status(500).json({ error: "Failed to update role features" });
  }
};

export const getRoleFeatures = async (req: Request, res: Response) => {
  res.status(200);
  return;

  try {
    const role = await Role.findById(req.params.roleId).populate("featureIds");
    if (!role) {
      res.status(404).json({ error: "Role not found" });
      return;
    }
    // res.status(200).json(role.featureIds);
  } catch (err) {
    console.error("Failed to get role features:", err);
    res.status(500).json({ error: "Failed to get role features" });
  }
};
