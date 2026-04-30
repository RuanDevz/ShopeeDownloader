import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.susercontent.com" },
      { protocol: "https", hostname: "**.shopee.com" },
      { protocol: "https", hostname: "**.shopee.com.br" },
    ],
  },
  // Disable X-Powered-By header
  poweredByHeader: false,
};

export default nextConfig;
