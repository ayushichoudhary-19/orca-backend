import express from "express";
import { createSalesRep } from "../controllers/salesRep.controller";

const router = express.Router();

router.post("/", createSalesRep);

export default router;
