import { S3Client } from "@aws-sdk/client-s3";

import { serverEnv } from "@/lib/env/server";

export const s3 = new S3Client({
  endpoint: serverEnv.STORAGE_ENDPOINT,
  region: serverEnv.STORAGE_REGION,
  credentials: {
    accessKeyId: serverEnv.STORAGE_ACCESS_KEY_ID,
    secretAccessKey: serverEnv.STORAGE_SECRET_ACCESS_KEY,
  },
  forcePathStyle: false, // DO Spaces uses virtual-hosted-style URLs
});

export const BUCKET = serverEnv.STORAGE_BUCKET;
export const PUBLIC_BASE_URL = serverEnv.STORAGE_PUBLIC_BASE_URL;
