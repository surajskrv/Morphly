import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    return [
      {
        source: '/favicon.ico',
        destination: '/icon.png',
      },
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`,
      },
      {
        source: '/auth/:path*', // For paths like /auth/register
        destination: `${backendUrl}/auth/:path*`,
      }
    ];
  },
};

export default nextConfig;
