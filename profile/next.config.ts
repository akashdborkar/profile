import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Local Strapi dev server
      { protocol: 'http', hostname: 'localhost', port: '1337', pathname: '/uploads/**' },
      // Production Strapi (Railway/Render — set NEXT_PUBLIC_STRAPI_HOST env var)
      ...(process.env.NEXT_PUBLIC_STRAPI_HOST
        ? [{ protocol: 'https' as const, hostname: process.env.NEXT_PUBLIC_STRAPI_HOST, pathname: '/uploads/**' }]
        : []),
    ],
  },
};

export default nextConfig;
