import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'kr.cafe24obs.com',
      },
      {
        protocol: 'https',
        hostname: 'dukplace.com',
      }
    ],
  },
};

export default nextConfig;
