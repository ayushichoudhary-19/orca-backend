import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { handleUpload, handleStream } from "../controllers/upload.controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("file"), handleUpload);

router.get(
  "/stream/*",
  (req: Request, res: Response, next: NextFunction) => {
    (req as any).s3Key = req.params[0];
    next();
  },
  handleStream
);

export default router;
