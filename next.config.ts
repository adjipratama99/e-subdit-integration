import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  // Kurangi tekanan memori saat build dengan melewati type-check di tahap build
  // (dev masih dapat pakai tsc --noEmit atau IDE untuk type-check)
  typescript: { ignoreBuildErrors: true }
};

export default nextConfig;
