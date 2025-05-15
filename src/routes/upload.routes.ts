import express from "express";
import multer from "multer";
import { uploadFileToS3 } from "../controllers/uploads.controller";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("file"), uploadFileToS3);

export default router;
