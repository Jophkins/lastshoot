import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

import { MOCK_PICTURES } from "@/lib/mock-pics";

const PAGE_SIZE = 9;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cursorParam = searchParams.get("cursor");
  const cursor = cursorParam ? Number.parseInt(cursorParam, 10) : 0;

  const pictures = MOCK_PICTURES.slice(cursor, cursor + PAGE_SIZE);
  const nextCursor = pictures.length === PAGE_SIZE ? cursor + PAGE_SIZE : null;

  // IMPORTANT: the shape:
  return NextResponse.json({
    pictures,
    nextCursor,
  });
}
