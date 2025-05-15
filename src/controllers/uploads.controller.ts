import { Request, Response } from "express";
import { uploadToS3 } from "../services/uploads.service";

export const uploadFileToS3 = async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: "No file provided" });
    return;
  }

  try {
    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;
    const mimeType = req.file.mimetype;

    const url = await uploadToS3(fileBuffer, fileName, mimeType);
    res.status(200).json({ url });
    return 
  } catch (err) {
    console.error("S3 upload error:", err);
    res.status(500).json({ error: "Failed to upload to S3" });
    return
  }
};