import { NextResponse } from "next/server";
import crypto from "node:crypto";

import type { SignedUploadItem } from "@/lib/storage/signed-urls";

import { requireAuth } from "@/lib/auth/require-auth";
import { buildObjectKey, createSignedPutUrl } from "@/lib/storage/signed-urls";
import { signUploadRequestSchema } from "@/lib/validations/upload";

export async function POST(req: Request) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) {
    return unauthorized;
  }

  const body = await req.json();
  const parsed = signUploadRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const uuid = crypto.randomUUID();
  const items: SignedUploadItem[] = [];

  for (const file of parsed.data.files) {
    const ext = file.filename.split(".").pop() ?? "jpg";
    const key = buildObjectKey(file.variant, uuid, ext);
    const url = await createSignedPutUrl(key, file.contentType);

    items.push({ variant: file.variant, key, url });
  }

  return NextResponse.json({ items });
}
