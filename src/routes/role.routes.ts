import express from "express";
import {
  createRole,
  getRolesByBusiness,
  getRoleFeatures,
  updateRoleFeatures,
} from "../controllers/role.controller";


const router = express.Router();

router.post("/business/:businessId", createRole);
router.get("/business/:businessId", getRolesByBusiness);
router.put("/:roleId/features", updateRoleFeatures);
router.get("/:roleId/features", getRoleFeatures);

export default router;
