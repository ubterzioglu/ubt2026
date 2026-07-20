import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Constant-time string comparison. `candidate === secret` leaks timing
 * information about how many leading characters matched; this hashes both
 * sides to a fixed-length digest first so `timingSafeEqual` always compares
 * equal-length buffers regardless of the inputs' lengths.
 */
export function secureCompare(candidate: string, secret: string): boolean {
  const candidateDigest = createHmac("sha256", "secure-compare").update(candidate).digest();
  const secretDigest = createHmac("sha256", "secure-compare").update(secret).digest();
  return timingSafeEqual(candidateDigest, secretDigest);
}

/**
 * Derives an opaque session token from a board secret so the sign-in cookie
 * never carries the raw password as its value. The token is a keyed HMAC of
 * a stable label, signed with the secret itself — anyone who already knows
 * the password can compute it (so this is not a capability upgrade), but a
 * cookie leak alone no longer exposes the reusable literal password, and
 * rotating the password still invalidates every existing token because
 * verification re-derives and compares against the *current* secret.
 */
export function deriveSessionToken(secret: string, label: string): string {
  return createHmac("sha256", secret).update(label).digest("hex");
}

/** Verifies a token produced by {@link deriveSessionToken} in constant time. */
export function verifySessionToken(token: string, secret: string, label: string): boolean {
  const expected = deriveSessionToken(secret, label);
  if (token.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}
