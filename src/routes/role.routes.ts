import express from "express";
import {
  createRole,
  getRolesByBusiness,
} from "../controllers/role.controller";

const router = express.Router();

router.post("/", createRole);
router.get("/business/:businessId", getRolesByBusiness);

export default router;
