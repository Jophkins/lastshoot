import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { serverEnv } from "@/lib/env/server";

const PAGE_SIZE = 9;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cursorParam = searchParams.get("cursor"); // cuid string or null

  const photos = await prisma.photo.findMany({
    where: {
      isPublished: true,
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1, // fetch one extra to check if there's a next page
    ...(cursorParam
      ? {
          cursor: { id: cursorParam },
          skip: 1, // skip the cursor item itself
        }
      : {}),
    select: {
      id: true,
      thumbKey: true,
      previewKey: true,
      title: true,
      description: true,
      cameraMake: true,
      cameraModel: true,
      lensModel: true,
      focalLength: true,
      aperture: true,
      shutter: true,
      iso: true,
      takenAt: true,
      tags: true,
    },
  });

  const hasNext = photos.length > PAGE_SIZE;
  const items = hasNext ? photos.slice(0, PAGE_SIZE) : photos;
  const nextCursor = hasNext ? items[items.length - 1].id : null;

  const baseUrl = serverEnv.STORAGE_PUBLIC_BASE_URL.replace(/\/$/, "");

  const pictures = items.map((photo: (typeof items)[number]) => ({
    id: photo.id,
    url: `${baseUrl}/${photo.thumbKey}`,
    previewUrl: `${baseUrl}/${photo.previewKey}`,
    alt: photo.title ?? undefined,
    title: photo.title,
    description: photo.description,
    cameraMake: photo.cameraMake,
    cameraModel: photo.cameraModel,
    lensModel: photo.lensModel,
    focalLength: photo.focalLength,
    aperture: photo.aperture,
    shutter: photo.shutter,
    iso: photo.iso,
    takenAt: photo.takenAt,
    tags: photo.tags,
  }));

  return NextResponse.json({
    pictures,
    nextCursor,
  });
}
