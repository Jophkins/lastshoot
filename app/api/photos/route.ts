import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/db/prisma";
import { serverEnv } from "@/lib/env/server";

const PAGE_SIZE = 20;

/**
 * GET /api/photos — Admin list (all photos including unpublished/deleted).
 */
export async function GET(req: NextRequest) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) {
    return unauthorized;
  }

  const { searchParams } = new URL(req.url);
  const cursorParam = searchParams.get("cursor");
  const filter = searchParams.get("filter"); // "published" | "draft" | "deleted" | null (all)

  const where: Record<string, unknown> = {};

  if (filter === "published") {
    where.isPublished = true;
    where.deletedAt = null;
  }
  else if (filter === "draft") {
    where.isPublished = false;
    where.deletedAt = null;
  }
  else if (filter === "deleted") {
    where.deletedAt = { not: null };
  }

  const photos = await prisma.photo.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1,
    ...(cursorParam
      ? { cursor: { id: cursorParam }, skip: 1 }
      : {}),
  });

  const hasNext = photos.length > PAGE_SIZE;
  const items = hasNext ? photos.slice(0, PAGE_SIZE) : photos;
  const nextCursor = hasNext ? items[items.length - 1].id : null;

  const baseUrl = serverEnv.STORAGE_PUBLIC_BASE_URL.replace(/\/$/, "");

  return NextResponse.json({
    photos: items.map((p: (typeof items)[number]) => ({
      id: p.id,
      thumbUrl: `${baseUrl}/${p.thumbKey}`,
      title: p.title,
      isPublished: p.isPublished,
      deletedAt: p.deletedAt,
      createdAt: p.createdAt,
    })),
    nextCursor,
  });
}
