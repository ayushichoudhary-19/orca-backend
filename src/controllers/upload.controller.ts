import { Request, Response } from "express";
import { uploadFileToS3, getFileStreamFromS3 } from "../services/s3.service";
import { S3ServiceException } from "@aws-sdk/client-s3";

export const handleUpload = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded." });
      return;
    }
    const file = req.file;
    const folder = req.body.folder || "general";

    const s3Key = await uploadFileToS3(
      file.buffer,
      file.originalname,
      file.mimetype,
      folder
    );

    res.status(201).json({
      message: "File uploaded successfully",
      key: s3Key,
    });
  } catch (error: any) {
    console.error("Error uploading file:", error);
    if (error instanceof S3ServiceException) {
        res.status(500).json({ message: "S3 upload error", details: error.message });
        return;
    }
    res.status(500).json({ message: "Failed to upload file.", details: error.message });
  }
};

export const handleStream = async (req: Request, res: Response) => {
  try {
    const key = (req as any).s3Key;
    if (!key) {
      res.status(400).json({ message: "Missing file key." });
      return;
    }

    const { stream, contentType, contentLength, metadata } = await getFileStreamFromS3(key);

    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }
    if (contentLength) {
      res.setHeader("Content-Length", contentLength.toString());
    }

    const fileName = metadata?.originalname || key.substring(key.lastIndexOf('/') + 1);
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);

    stream.pipe(res);

    stream.on('error', (err) => {
        console.error("S3 stream error:", err);
        if (!res.headersSent) {
            res.status(500).send("Error streaming file");
        } else {
            res.end();
        }
    });

  } catch (error: any) {
    console.error("Error streaming file:", error);
     if (error.name === 'NoSuchKey' || (error instanceof S3ServiceException && error.$metadata?.httpStatusCode === 404)) {
        res.status(404).json({ message: "File not found." });
        return;
    }
    if (error instanceof S3ServiceException) {
        res.status(500).json({ message: "S3 streaming error", details: error.message });
        return;
    }
    if (!res.headersSent) {
        res.status(500).json({ message: "Failed to stream file.", details: error.message });
    } else {
        res.end();
    }
  }
};