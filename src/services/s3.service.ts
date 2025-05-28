import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
  } from "@aws-sdk/client-s3";
  import { Readable } from "stream";
  import { v4 as uuidv4 } from "uuid";
  import { config } from "dotenv";
  
  config();
  
  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY!,
      secretAccessKey: process.env.AWS_SECRET_KEY!,
    },
  });
  
  const BUCKET_NAME = process.env.AWS_BUCKET_NAME!;
  
  export const uploadFileToS3 = async (
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    folder: string = "uploads"
  ): Promise<string> => {
    const key = `${folder}/${uuidv4()}-${originalName}`;
  
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      Metadata: {
          originalname: originalName
      }
    });
  
    await s3.send(command);
    return key;
  };
  
  export const getFileStreamFromS3 = async (key: string): Promise<{
    stream: Readable;
    contentType?: string;
    contentLength?: number;
    metadata?: Record<string, string>;
  }> => {
    let headResponse;
    try {
      headResponse = await s3.send(new HeadObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
    } catch (error: any) {
      console.error(`Error fetching metadata for S3 key ${key}:`, error);
      if (error.name === 'NoSuchKey') {
          throw error;
      }
    }
  
    const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key });
    const response = await s3.send(command);
  
    if (!response.Body || !(response.Body instanceof Readable)) {
      throw new Error("Could not retrieve file stream from S3.");
    }
  
    return {
      stream: response.Body as Readable,
      contentType: response.ContentType || headResponse?.ContentType,
      contentLength: response.ContentLength || headResponse?.ContentLength,
      metadata: response.Metadata || headResponse?.Metadata,
    };
  };