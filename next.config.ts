import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  reactCompiler: true,
  experimental: {
    // Enable filesystem caching for `next dev`
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
