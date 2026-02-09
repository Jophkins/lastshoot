# agents.md

Guidelines for contributors/agents working on this Next.js personal gallery project (single-user admin).

---

## 1) Project goal 🎯

Build a small personal photography portfolio:

- Public gallery pages (fast, SEO-friendly)
- Single-user admin: upload photos, edit metadata, manage visibility
- Photos stored in object storage
- Metadata (including EXIF-derived camera info) stored in Postgres
- Simple, maintainable architecture (no over-engineering)

Non-goals:

- Multi-user roles or permissions
- Complex CMS features
- Heavy media pipelines for MVP

---

## 2) Tech stack 🧱

- Next.js (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Postgres + Prisma (Supabase)
- Object storage (S3-compatible):
  - Preferred: Cloudflare R2
  - Acceptable: DigitalOcean Spaces
- Deploy: Vercel
- Uploads: Signed PUT URLs (client → storage)

Optional (later):

- Image processing worker (sharp)
- CDN/custom domain for image delivery

---

## 3) Architecture overview 🗺️

### Data separation

- **Files** → object storage
- **Metadata** → Postgres

### Image variants

- `original/` — private or non-public
- `preview/` — public, ~1600px width (webp/avif)
- `thumb/` — public, ~400px width (webp/avif)

### Object keys

Keys must be immutable and UUID-based:

- `original/<uuid>.<ext>`
- `preview/<uuid>.webp`
- `thumb/<uuid>.webp`

Never overwrite an existing key; generate a new UUID on replace.

---

## 4) Security model 🔐

- Single-user system
- `/admin/**` and write APIs require authentication
- Public routes are read-only
- Storage credentials are server-only
- Signed URLs are generated only after auth validation

Auth options:

- Auth.js / NextAuth
- Custom cookie-based session (acceptable for MVP)

---

## 5) Core flows 🔄

### Upload flow (recommended)

1. Admin selects images
2. Client reads EXIF locally (browser)
3. Client requests signed PUT URLs
4. Client uploads files directly to storage
5. Client commits metadata + EXIF to backend
6. Public gallery reads only from DB

### Delete / replace

- Use **soft delete** (`deletedAt`)
- Optional cleanup endpoint removes storage objects later
- Avoid immediate hard deletes (cache safety)

---

## 6) EXIF & camera metadata 📸

### Policy

- EXIF is read **once at upload time**
- EXIF is **never** parsed on page render
- Only useful, displayable fields are stored
- GPS data must be ignored or stripped

### Source

- EXIF is extracted in the **browser** (preferred for MVP)
- Server validates and persists EXIF fields
- Manual override in admin UI is allowed

### Fields to extract (recommended)

- Camera make (`Sony`)
- Camera model (`ILCE-7M4`, `A7 IV`)
- Lens model
- Focal length (mm)
- Aperture (f-number)
- Shutter speed (string, e.g. `1/200`)
- ISO
- Date taken

### Libraries

- Browser: `exifr`
- Server (optional): `exifr` / `sharp.metadata()`

---

## 7) API routes 🧩

### Signed upload URL

`POST /api/uploads/sign`

### Request:

{
"files": [
{ "filename": "IMG_0001.jpg", "contentType": "image/jpeg", "variant": "original" }
]
}

### Response:

{
"items": [
{
"variant": "original",
"key": "original/uuid.jpg",
"url": "https://signed-put-url"
}
]
}

### Commit photo metadata

`POST /api/photos/commit`

### Request:

{
"originalKey": "original/uuid.jpg",
"previewKey": "preview/uuid.webp",
"thumbKey": "thumb/uuid.webp",

"title": "Portrait",
"description": "Natural light",

"cameraMake": "Sony",
"cameraModel": "A7 IV",
"lensModel": "FE 35mm F1.8",
"focalLength": 35,
"aperture": 1.8,
"shutter": "1/200",
"iso": 100,
"takenAt": "2026-02-01T00:00:00.000Z",

"tags": ["portrait"],
"isPublished": true
}

### Admin management

`GET /api/photos`
`PATCH /api/photos/:id`
`POST /api/photos/:id/delete`
`POST /api/photos/:id/restore` -(optional)

## 8) Database schema (Prisma) 🗄️

### Recommended Photo fields:

`id`
`originalKey`
`previewKey`
`thumbKey`

### Content:

`title`
`description`
`tags[]`
`isPublished`

### Camera / EXIF:

`cameraMake`
`cameraModel`
`lensModel`
`focalLength`
`aperture`
`shutter`
`iso`
`takenAt`

### System:

`createdAt`
`updatedAt`
`deletedAt`

### Indexes:

`createdAt`
`takenAt`
`isPublished`
`deletedAt`

## 9) Storage configuration ☁️

### Environment variables:

`STORAGE_ENDPOINT`
`STORAGE_REGION`
`STORAGE_BUCKET`
`STORAGE_ACCESS_KEY_ID`
`STORAGE_SECRET_ACCESS_KEY`
`STORAGE_PUBLIC_BASE_URL`

### Notes:

- Preview/thumb are public or CDN-served
- Originals can remain private
- Bucket CORS must allow PUT from admin origin

##10) Image processing 🖼️

### MVP strategy:

- Preview/thumb generation in browser (canvas)
- Upload all variants via signed URLs

### Later:

- Server-side processing (sharp) via worker or queue

### Rules:

- No on-demand resizing at request time
- Prefer webp/avif for preview/thumb
- Originals are archival only

## 11) Caching & URLs 🚀

- Asset URLs must be immutable
- CDN caching should assume long TTL
- Replacing an image always means a new UUID

## 12) Code conventions ✅

- No business logic in React components
- Validation via zod
- Route handlers:
- auth check
- input validation
- no secrets returned
- Folder structure:
- `src/lib/` (db, storage, auth)
- `src/server/` (server-only utilities)
- `src/components/`
- `src/app/`

## 13) Local development 🧪

### Requirements:

- Node + pnpm
- Postgres (local or hosted)
- Dev storage bucket

### Commands:

`pnpm i`
`pnpm dev`
`pnpm lint`
`pnpm prisma migrate dev`
`pnpm prisma studio`

## 14) Deployment 📦

- Next.js → Vercel
- Postgres → Supabase / Neon
- Storage → DO Spaces

### Checklist:

- All env vars set
- Admin auth works
- Storage CORS configured
- Preview/thumb publicly accessible
- Originals not exposed

## 15) Common pitfalls ☠️

- Uploading files through Next.js API routes
- Parsing EXIF at render time
- Storing raw EXIF blobs
- Reusing storage keys
- Exposing GPS data
- No soft-delete strategy

## 16) Decision log 🧾

### All architectural changes must be recorded here:

- What changed
- Why
- Trade-offs
- Migration steps

### Example:

- “Moved EXIF parsing to client to avoid Vercel runtime limits.”
- “Switched preview format from JPG to WebP for size reduction.”

### Decisions made during MVP implementation:

- **Prisma 7 with @prisma/adapter-pg**: Prisma 7 removed `url` from datasource block. Created `prisma.config.ts` for migrations and use `PrismaPg` adapter in client. Trade-off: slightly more boilerplate vs Prisma 6, but aligns with Prisma's direction.
- **NextAuth v5 (beta) with Credentials provider, JWT sessions**: Single-user admin doesn't need DB sessions. Credentials checked against `ADMIN_USERNAME`/`ADMIN_PASSWORD_HASH` env vars. Trade-off: no OAuth convenience, but simplest possible setup for single-user.
- **ESLint `node/no-process-env` policy**: Kept strict rule globally but added override for `lib/env/**`, `lib/db/**`, and `prisma/**`. All env access funneled through `lib/env/server.ts` (zod-validated).
- **Preview/thumb generated in browser (canvas)**: Per agents.md MVP strategy. WebP output at ~1600px and ~400px. Trade-off: relies on browser capabilities, no server-side fallback yet.
- **EXIF extraction in browser via exifr, GPS excluded**: `gps: false` in exifr config, GPS fields never stored. Only safe metadata fields persisted.
- **Cursor-based pagination by ID**: Switched from numeric offset to Prisma cursor pagination using cuid IDs. More efficient for large datasets.
- **DigitalOcean Spaces with S3 SDK**: Using `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`. Originals get `private` ACL, preview/thumb get `public-read`.
- **next.config.ts remotePatterns for Spaces**: Added wildcard patterns for `*.digitaloceanspaces.com` and `*.cdn.digitaloceanspaces.com`.

## 17) Feel free to add something at your discretion after my approval.
