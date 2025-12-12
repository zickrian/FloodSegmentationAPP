import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable source maps in production to save space
  productionBrowserSourceMaps: false,
  
  // Optimize images with WebP format
  images: {
    formats: ['image/webp'],
  },
  
  // Enable compression
  compress: true,
  
  // Note: Removed rewrites() because backend is now deployed separately
  // Frontend will call backend directly via NEXT_PUBLIC_API_URL environment variable
  // For local development, set NEXT_PUBLIC_API_URL=http://localhost:8000
  // For production (Vercel), set NEXT_PUBLIC_API_URL=https://your-railway-backend.railway.app
};

export default nextConfig;
