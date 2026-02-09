import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/db/prisma";
import { updatePhotoSchema } from "@/lib/validations/photo";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * PATCH /api/photos/:id — Update photo metadata (auth-gated).
 */
export async function PATCH(req: NextRequest, context: RouteContext) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await context.params;
  const body = await req.json();
  const parsed = updatePhotoSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;

  const photo = await prisma.photo.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.tags !== undefined && { tags: data.tags }),
      ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
      ...(data.cameraMake !== undefined && { cameraMake: data.cameraMake }),
      ...(data.cameraModel !== undefined && { cameraModel: data.cameraModel }),
      ...(data.lensModel !== undefined && { lensModel: data.lensModel }),
      ...(data.focalLength !== undefined && { focalLength: data.focalLength }),
      ...(data.aperture !== undefined && { aperture: data.aperture }),
      ...(data.shutter !== undefined && { shutter: data.shutter }),
      ...(data.iso !== undefined && { iso: data.iso }),
      ...(data.takenAt !== undefined && { takenAt: new Date(data.takenAt) }),
    },
  });

  return NextResponse.json({
    id: photo.id,
    isPublished: photo.isPublished,
    updatedAt: photo.updatedAt,
  });
}
