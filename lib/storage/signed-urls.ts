import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { BUCKET, s3 } from "./client";

const SIGNED_URL_EXPIRES_IN = 600; // 10 minutes

export type Variant = "original" | "preview" | "thumb";

export type SignedUploadItem = {
  variant: Variant;
  key: string;
  url: string;
};

/**
 * Generate a signed PUT URL for a single file variant.
 */
export async function createSignedPutUrl(
  key: string,
  contentType: string,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
    ACL: key.startsWith("original/") ? "private" : "public-read",
  });

  return getSignedUrl(s3, command, { expiresIn: SIGNED_URL_EXPIRES_IN });
}

/**
 * Build an immutable, UUID-based object key for a given variant.
 */
export function buildObjectKey(
  variant: Variant,
  uuid: string,
  ext: string,
): string {
  // Preview and thumb are always webp
  const finalExt = variant === "original" ? ext : "webp";
  return `${variant}/${uuid}.${finalExt}`;
}
