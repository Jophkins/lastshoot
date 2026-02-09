import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/db/prisma";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * POST /api/photos/:id/delete — Soft-delete a photo (set deletedAt).
 */
export async function POST(_req: Request, context: RouteContext) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await context.params;

  await prisma.photo.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
