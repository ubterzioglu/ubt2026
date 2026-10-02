import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: process.cwd(),
  // The /newdragoman proposal is read from disk at request time (it must not
  // live in public/, which would bypass its password gate), and a plain
  // fs.readFile is invisible to Next's tracer — list it so the standalone
  // build copies it.
  outputFileTracingIncludes: {
    "/newdragoman/content": ["./app/newdragoman/_content/**"]
  },
  // Lint runs locally via `npm run lint`; skipping it in `next build`
  // shaves the lint pass off every Coolify deployment.
  eslint: {
    ignoreDuringBuilds: true
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
    serverActions: {
      // Default is 1 MB, which silently caps the /dm screenshot (5 MB) and
      // /detrbridge logo (10 MB) uploads; headroom added for form overhead.
      bodySizeLimit: "12mb"
    }
  }
};

export default nextConfig;
