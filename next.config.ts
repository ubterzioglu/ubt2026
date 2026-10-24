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
  },
  async headers() {
    const contentSecurityPolicy = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.clarity.ms https://*.clarity.ms https://gc.zgo.at",
      "style-src 'self' 'unsafe-inline'",
      "img-src * data: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https: wss:",
      "form-action 'self' https://formsubmit.co",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests"
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains"
          },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
