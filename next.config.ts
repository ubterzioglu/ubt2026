import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Lint runs locally via `npm run lint`; skipping it in `next build`
  // shaves the lint pass off every Coolify deployment.
  eslint: {
    ignoreDuringBuilds: true
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
    serverActions: {
      // Default is 1 MB, which silently caps the /dm screenshot (5 MB) and
      // /detr attachment (10 MB) uploads; headroom added for form overhead.
      bodySizeLimit: "12mb"
    }
  }
};

export default nextConfig;
