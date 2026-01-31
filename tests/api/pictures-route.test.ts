// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { GET } from "../../app/api/pictures/route";
import { MOCK_PICTURES } from "../../lib/mock-pics";

describe("get /api/pictures", () => {
  it("returns the first page when cursor is omitted", async () => {
    const request = new NextRequest("http://localhost/api/pictures");

    const response = await GET(request);
    const body = await response.json();

    expect(body.pictures).toHaveLength(9);
    expect(body.pictures[0]).toEqual(MOCK_PICTURES[0]);
    expect(body.nextCursor).toBe(9);
  });

  it("returns the first page with a next cursor", async () => {
    const request = new NextRequest("http://localhost/api/pictures?cursor=0");

    const response = await GET(request);
    const body = await response.json();

    expect(body.pictures).toHaveLength(9);
    expect(body.pictures[0]).toEqual(MOCK_PICTURES[0]);
    expect(body.nextCursor).toBe(9);
  });

  it("returns a final page without a next cursor", async () => {
    const lastCursor = Math.max(MOCK_PICTURES.length - 5, 0);
    const request = new NextRequest(`http://localhost/api/pictures?cursor=${lastCursor}`);

    const response = await GET(request);
    const body = await response.json();

    expect(body.pictures).toHaveLength(MOCK_PICTURES.length - lastCursor);
    expect(body.nextCursor).toBeNull();
  });
});
