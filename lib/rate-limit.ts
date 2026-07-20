import "server-only";

import { headers } from "next/headers";

/**
 * In-memory per-key rate limiter for the personal sign-in endpoints in this
 * app. There is a single Node process behind this deployment (no serverless
 * fan-out for these routes), so an in-memory bucket is sufficient — no Redis
 * or external store needed for a handful of low-traffic login forms.
 */

const WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 10;

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/**
 * Returns true when `key` (e.g. `"elif-auth:203.0.113.4"`) is still allowed
 * to attempt a sign-in. Every call — successful or not — consumes one
 * attempt from the window; callers should only invoke this once per request.
 */
export function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (bucket.count >= MAX_ATTEMPTS) {
    return false;
  }

  bucket.count += 1;
  return true;
}

/**
 * Best-effort caller IP from the `x-forwarded-for` header set by the
 * reverse proxy in front of this app. Falls back to a constant so requests
 * without the header still share a (coarser) rate-limit bucket instead of
 * bypassing the limiter entirely.
 */
export async function getClientIp(): Promise<string> {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }
  return headerStore.get("x-real-ip")?.trim() || "unknown";
}
