import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
    domains: ["antimatter.vn", "cdn.luatminhkhue.vn"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};
export default nextConfig;
