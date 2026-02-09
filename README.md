# Lastshoot — Personal Photography Portfolio

A minimal personal photography portfolio built with Next.js (App Router), Postgres, and DigitalOcean Spaces.

## Tech Stack

- **Next.js 15** (App Router, Turbopack)
- **TypeScript**
- **Tailwind CSS** + shadcn/ui
- **Postgres** + Prisma 7
- **DigitalOcean Spaces** (S3-compatible object storage)
- **NextAuth v5** (single-user Credentials auth)
- **Zod** for runtime validation

## Getting Started

### Prerequisites

- Node.js 20.19+ / 22.12+ / 24+
- pnpm
- PostgreSQL (local or hosted)
- DigitalOcean Spaces bucket (or any S3-compatible storage)

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment file and fill in values
cp .env.example .env

# Generate Prisma client
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

### Environment Variables

See `.env.example` for the full list. Key variables:

- `DATABASE_URL` — Postgres connection string
- `NEXTAUTH_URL` — App base URL (e.g. `http://localhost:3000`)
- `NEXTAUTH_SECRET` — Random secret for JWT signing
- `ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH` — Single admin credentials (bcrypt hash)
- `STORAGE_*` — DigitalOcean Spaces configuration
- `STORAGE_PUBLIC_BASE_URL` — CDN/public URL for serving images

### Generate Admin Password Hash

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your-password', 12).then(h => console.log(h))"
```

## Available Scripts

| Script             | Description                      |
| ------------------ | -------------------------------- |
| `pnpm dev`         | Start dev server with Turbopack  |
| `pnpm build`       | Production build                 |
| `pnpm lint`        | Run ESLint                       |
| `pnpm typecheck`   | Run TypeScript type checking     |
| `pnpm db:generate` | Generate Prisma client           |
| `pnpm db:migrate`  | Run Prisma migrations            |
| `pnpm db:studio`   | Open Prisma Studio               |
| `pnpm db:push`     | Push schema to DB (no migration) |

## Storage CORS Configuration

Your Spaces bucket needs CORS configured to allow PUT uploads from the admin origin:

```xml
<CORSConfiguration>
  <CORSRule>
    <AllowedOrigin>https://your-domain.com</AllowedOrigin>
    <AllowedMethod>PUT</AllowedMethod>
    <AllowedHeader>*</AllowedHeader>
    <MaxAgeSeconds>3600</MaxAgeSeconds>
  </CORSRule>
</CORSConfiguration>
```

## Architecture

- **Files** → DigitalOcean Spaces (original/preview/thumb variants)
- **Metadata** → Postgres (title, description, EXIF, tags, publish state)
- **Upload flow**: Admin selects files → EXIF extracted in browser → preview/thumb generated via canvas → signed PUT URLs → direct upload to Spaces → metadata committed to DB
- **Public gallery**: reads only published, non-deleted photos from DB
- **Soft-delete**: photos are never hard-deleted, `deletedAt` timestamp is used

## Deployment

- **App**: Vercel
- **Database**: Supabase / Neon
- **Storage**: DigitalOcean Spaces

### Checklist

- [ ] All env vars set in Vercel
- [ ] Admin auth working
- [ ] Storage CORS configured for production domain
- [ ] Preview/thumb publicly accessible
- [ ] Originals not publicly exposed
