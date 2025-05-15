import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME!;

export const uploadToS3 = async (buffer: Buffer, fileName: string, mimeType: string): Promise<string> => {
  const key = `uploads/${uuidv4()}-${fileName}`;

  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
    // ACL: "public-read",
  };

  await s3.upload(params).promise();
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};
