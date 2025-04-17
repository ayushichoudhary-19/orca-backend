import express from "express";
import { getCurrentUser, createUser } from "../controllers/user.controller";

const router = express.Router();

router.get("/me", getCurrentUser);
router.post("/", createUser);

export default router;
