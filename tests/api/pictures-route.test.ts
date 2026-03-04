// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

import { GET } from "../../app/api/pictures/route";
import { MOCK_PICTURES } from "../../lib/mock-pics";

function mockPhoto(i: number) {
  return {
    id: `pic-${i}`,
    thumbKey: `id/${i + 10}/800/1600`,
    previewKey: `id/${i + 10}/1600/1200`,
    title: `Random picture ${i}`,
    description: null,
    cameraMake: null,
    cameraModel: null,
    lensModel: null,
    focalLength: null,
    aperture: null,
    shutter: null,
    iso: null,
    takenAt: null,
    tags: [] as string[],
  };
}

vi.mock("@/lib/env/server", () => ({
  serverEnv: { STORAGE_PUBLIC_BASE_URL: "https://picsum.photos" },
}));

const mockFindMany = vi.hoisted(() => vi.fn());
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    photo: {
      findMany: mockFindMany,
    },
  },
}));

describe("get /api/pictures", () => {
  it("returns the first page when cursor is omitted", async () => {
    mockFindMany.mockResolvedValueOnce(Array.from({ length: 10 }, (_, i) => mockPhoto(i)));

    const request = new NextRequest("http://localhost/api/pictures");
    const response = await GET(request);
    const body = await response.json();

    expect(body.pictures).toHaveLength(9);
    expect(body.pictures[0]).toMatchObject(MOCK_PICTURES[0]);
    expect(body.nextCursor).toBe("pic-8");
  });

  it("returns the first page with a next cursor", async () => {
    mockFindMany.mockResolvedValueOnce(Array.from({ length: 10 }, (_, i) => mockPhoto(i)));

    const request = new NextRequest("http://localhost/api/pictures?cursor=pic-0");
    const response = await GET(request);
    const body = await response.json();

    expect(body.pictures).toHaveLength(9);
    expect(body.pictures[0]).toMatchObject(MOCK_PICTURES[0]);
    expect(body.nextCursor).toBe("pic-8");
  });

  it("returns a final page without a next cursor", async () => {
    mockFindMany.mockResolvedValueOnce(Array.from({ length: 5 }, (_, i) => mockPhoto(i + 95)));

    const request = new NextRequest("http://localhost/api/pictures?cursor=pic-94");
    const response = await GET(request);
    const body = await response.json();

    expect(body.pictures).toHaveLength(5);
    expect(body.nextCursor).toBeNull();
  });
});
