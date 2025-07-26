import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const B2_APPLICATION_KEY_ID = process.env.B2_APPLICATION_KEY_ID;
const B2_APPLICATION_KEY = process.env.B2_APPLICATION_KEY;
const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME;
const B2_ENDPOINT = process.env.B2_ENDPOINT;

console.log('B2 Config:', {
  keyId: B2_APPLICATION_KEY_ID ? 'Set' : 'Not set',
  key: B2_APPLICATION_KEY ? 'Set' : 'Not set',
  bucket: B2_BUCKET_NAME,
  endpoint: B2_ENDPOINT
});

if (!B2_APPLICATION_KEY_ID || !B2_APPLICATION_KEY || !B2_BUCKET_NAME || !B2_ENDPOINT) {
  throw new Error('Missing Backblaze B2 configuration in environment variables');
}

export const s3Client = new S3Client({
  region: 'us-east-005',
  endpoint: B2_ENDPOINT,
  credentials: {
    accessKeyId: B2_APPLICATION_KEY_ID,
    secretAccessKey: B2_APPLICATION_KEY,
  },
  forcePathStyle: true,
  maxAttempts: 3,
});

export async function generatePresignedUrl(key, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: B2_BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

export async function deleteFile(key) {
  const command = new DeleteObjectCommand({
    Bucket: B2_BUCKET_NAME,
    Key: key,
  });

  return s3Client.send(command);
}

export function getFileUrl(key) {
  return `${B2_ENDPOINT}/${B2_BUCKET_NAME}/${key}`;
} 