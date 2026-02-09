import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Mock images (will be removed after migration to DB)
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      // DigitalOcean Spaces CDN — matches any *.digitaloceanspaces.com subdomain
      {
        protocol: "https",
        hostname: "*.digitaloceanspaces.com",
      },
      // DigitalOcean Spaces CDN subdomain
      {
        protocol: "https",
        hostname: "*.cdn.digitaloceanspaces.com",
      },
    ],
  },
};

export default nextConfig;
