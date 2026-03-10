import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://35.238.104.251:8000/api/v1/:path*',
      },
      {
        source: '/auth/:path*', // For paths like /auth/register
        destination: 'http://35.238.104.251:8000/auth/:path*',
      }
    ];
  },
};

export default nextConfig;
