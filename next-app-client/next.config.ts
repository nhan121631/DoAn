import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    // output: 'export',
    // target: 'serverless', // add this line
    images: {
    // domains: ["antimatter.vn", "cdn.luatminhkhue.vn"],
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
