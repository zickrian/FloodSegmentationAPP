import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Rewrite requests to the local running FastAPI backend
  async rewrites() {
    return [
      // API Routes
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8000/api/:path*",
      },
      // Health Check Endpoint
      {
        source: "/health",
        destination: "http://127.0.0.1:8000/health",
      },
      // Documentation (Optional)
      {
        source: "/docs",
        destination: "http://127.0.0.1:8000/docs",
      },
      {
        source: "/openapi.json",
        destination: "http://127.0.0.1:8000/openapi.json",
      },
    ];
  },
};

export default nextConfig;
