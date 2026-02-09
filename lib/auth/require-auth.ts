import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

/**
 * Server-side helper for route handlers.
 * Returns the session if authenticated, or a 401 JSON response.
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    return {
      session: null,
      unauthorized: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      ),
    } as const;
  }

  return { session, unauthorized: null } as const;
}
