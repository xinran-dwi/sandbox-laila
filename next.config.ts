import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the dev overlay out of preview screenshots — this repo's whole job is
  // pixel-faithful renders.
  devIndicators: false,
};

export default nextConfig;
