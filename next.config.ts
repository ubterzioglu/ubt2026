import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Lint runs locally via `npm run lint`; skipping it in `next build`
  // shaves the lint pass off every Coolify deployment.
  eslint: {
    ignoreDuringBuilds: true
  },
  experimental: {
    optimizePackageImports: ["lucide-react"]
  }
};

export default nextConfig;
