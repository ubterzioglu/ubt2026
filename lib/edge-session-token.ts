/**
 * Edge-runtime twin of the session-token helpers in `lib/secure-compare.ts`.
 *
 * `middleware.ts` runs on the edge runtime, where `node:crypto` (and therefore
 * `createHmac` / `timingSafeEqual`) is unavailable — and `secure-compare.ts` is
 * additionally marked `server-only`, so importing it there fails the build.
 * This module reimplements the same HMAC-SHA256 → lowercase-hex derivation on
 * top of Web Crypto, which the edge runtime does provide.
 *
 * The output is byte-for-byte identical to `deriveSessionToken`: same algorithm,
 * same key material, same hex encoding. That parity is load-bearing — cookies
 * are minted by Server Actions on the Node runtime and verified here on the
 * edge, so the two implementations must never diverge.
 */

const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** Edge-safe equivalent of `deriveSessionToken` from `lib/secure-compare.ts`. */
export async function deriveEdgeSessionToken(
  secret: string,
  label: string
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(label));
  return toHex(signature);
}

/**
 * Compares two strings without an early exit on the first differing character.
 * The edge runtime has no `timingSafeEqual`, so the difference is accumulated
 * with XOR over every character instead.
 */
function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) {
    difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return difference === 0;
}

/**
 * Verifies a token produced by `deriveSessionToken` (Node) or
 * {@link deriveEdgeSessionToken} (edge).
 *
 * Fails CLOSED on an empty secret: a missing env var must never let an empty
 * or forged cookie through.
 */
export async function verifyEdgeSessionToken(
  token: string,
  secret: string,
  label: string
): Promise<boolean> {
  if (!secret || !token) return false;
  const expected = await deriveEdgeSessionToken(secret, label);
  return constantTimeEquals(token, expected);
}
