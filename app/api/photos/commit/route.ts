import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/db/prisma";
import { commitPhotoSchema } from "@/lib/validations/photo";

export async function POST(req: Request) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) {
    return unauthorized;
  }

  const body = await req.json();
  const parsed = commitPhotoSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;

  const photo = await prisma.photo.create({
    data: {
      originalKey: data.originalKey,
      previewKey: data.previewKey,
      thumbKey: data.thumbKey,

      title: data.title,
      description: data.description,
      tags: data.tags,
      isPublished: data.isPublished,

      cameraMake: data.cameraMake,
      cameraModel: data.cameraModel,
      lensModel: data.lensModel,
      focalLength: data.focalLength,
      aperture: data.aperture,
      shutter: data.shutter,
      iso: data.iso,
      takenAt: data.takenAt ? new Date(data.takenAt) : undefined,
    },
  });

  // Never return storage secrets — only public-safe fields
  return NextResponse.json({
    id: photo.id,
    isPublished: photo.isPublished,
    createdAt: photo.createdAt,
  }, { status: 201 });
}
