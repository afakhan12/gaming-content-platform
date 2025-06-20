import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['twitter-api-v2'],
   eslint: {
    ignoreDuringBuilds: true,
  },
   images: {
    unoptimized: true,
  },
};

export default nextConfig;
