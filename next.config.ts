import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['twitter-api-v2'],
   eslint: {
    ignoreDuringBuilds: true,
  },
 
};

export default nextConfig;
