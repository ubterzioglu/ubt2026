import "server-only";

import { cookies } from "next/headers";

import { getAdminAccessKey, hasAdminAccess } from "@/lib/appointments";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { deriveSessionToken, secureCompare, verifySessionToken } from "@/lib/secure-compare";

/**
 * Cookie-based admin session.
 *
 * The access key is NEVER carried in the URL/query string (which leaks into
 * browser history, server access logs and the Referer header). Instead the
 * gate form posts the key to a server action that validates it and stores it
 * in an HttpOnly cookie. Admin pages then read the key from that cookie.
 */
export const ADMIN_ACCESS_COOKIE = "ubt_admin_access";

/**
 * The task board has its own access key/cookie so it can be shared with the
 * project team without handing out the appointment-admin key. Falls back to
 * the appointment-admin key only if its own key is not configured.
 */
export const TASKS_ADMIN_ACCESS_COOKIE = "ubt_tasks_admin_access";

/**
 * The BatuBT footer-client board has its own access key/cookie so it can be
 * shared with Batuhan independently of the appointment- and task-admin keys.
 */
export const BATUBT_ADMIN_ACCESS_COOKIE = "ubt_batubt_access";

/**
 * The Akçakanat domain board (/bakcakanat) has its own password/cookie so it
 * can be shared independently of every other admin key.
 */
export const BAKCAKANAT_ACCESS_COOKIE = "ubt_bakcakanat_access";

const ADMIN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

/**
 * Reads the task-board admin key (empty string if neither it nor the
 * appointment-admin fallback is configured).
 */
function getTasksAdminAccessKey(): string {
  const taskKey = process.env.DESIREMAPTODO_ADMIN_ACCESS_KEY?.trim();
  if (taskKey) return taskKey;
  // Fallback keeps the board reachable if only the shared admin key is set.
  return process.env.APPOINTMENT_ADMIN_ACCESS_KEY?.trim() ?? "";
}

/**
 * Reads the access key from the admin session cookie (empty string if absent).
 */
export async function getAdminAccessFromCookie(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_ACCESS_COOKIE)?.value ?? "";
}

/**
 * True when the current request already carries a valid admin session cookie.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const accessKey = await getAdminAccessFromCookie();
  return hasAdminAccess(accessKey);
}

/**
 * Validates the supplied key and, when correct, persists it in an HttpOnly
 * cookie. Returns whether the sign-in was accepted.
 */
export async function signInAdmin(candidate: string): Promise<boolean> {
  const accessKey = getAdminAccessKey();

  // Fail closed: without a configured key no sign-in is possible.
  if (!accessKey) {
    return false;
  }

  if (candidate.trim() !== accessKey) {
    return false;
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_ACCESS_COOKIE, accessKey, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: ADMIN_COOKIE_MAX_AGE_SECONDS
  });

  return true;
}

/**
 * Clears the admin session cookie (sign out). Expires it with the exact
 * attributes used at sign-in — see signOutBakcakanat for why.
 */
export async function signOutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_ACCESS_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 0
  });
}

/**
 * True when the current request carries a valid task-board session cookie.
 */
export async function isTasksAdminAuthenticated(): Promise<boolean> {
  const accessKey = getTasksAdminAccessKey();
  // Fail closed: no key configured anywhere -> nobody gets in.
  if (!accessKey) return false;
  const cookieStore = await cookies();
  const candidate = cookieStore.get(TASKS_ADMIN_ACCESS_COOKIE)?.value ?? "";
  return candidate.trim() === accessKey;
}

/**
 * Validates the supplied task-board key and, when correct, persists it in an
 * HttpOnly cookie. Returns whether the sign-in was accepted.
 */
export async function signInTasksAdmin(candidate: string): Promise<boolean> {
  const accessKey = getTasksAdminAccessKey();
  // Fail closed: without a configured key no sign-in is possible.
  if (!accessKey) return false;
  if (candidate.trim() !== accessKey) return false;

  const cookieStore = await cookies();
  cookieStore.set(TASKS_ADMIN_ACCESS_COOKIE, accessKey, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/dm",
    maxAge: ADMIN_COOKIE_MAX_AGE_SECONDS
  });

  return true;
}

/**
 * Clears the task-board session cookie (sign out). Expires it with the exact
 * attributes used at sign-in — see signOutBakcakanat for why.
 */
export async function signOutTasksAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(TASKS_ADMIN_ACCESS_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/dm",
    maxAge: 0
  });
}

/**
 * Reads the BatuBT footer-board admin key (empty string if not configured).
 * No fallback: the board is gated solely by BATUBT_ADMIN_ACCESS_KEY.
 */
function getBatubtAdminAccessKey(): string {
  return process.env.BATUBT_ADMIN_ACCESS_KEY?.trim() ?? "";
}

/**
 * True when the current request carries a valid BatuBT session cookie.
 */
export async function isBatubtAuthenticated(): Promise<boolean> {
  const accessKey = getBatubtAdminAccessKey();
  // Fail closed: no key configured -> nobody gets in.
  if (!accessKey) return false;
  const cookieStore = await cookies();
  const candidate = cookieStore.get(BATUBT_ADMIN_ACCESS_COOKIE)?.value ?? "";
  return candidate.trim() === accessKey;
}

/**
 * Validates the supplied BatuBT key and, when correct, persists it in an
 * HttpOnly cookie scoped to /batubt. Returns whether the sign-in was accepted.
 */
export async function signInBatubt(candidate: string): Promise<boolean> {
  const accessKey = getBatubtAdminAccessKey();
  // Fail closed: without a configured key no sign-in is possible.
  if (!accessKey) return false;
  if (candidate.trim() !== accessKey) return false;

  const cookieStore = await cookies();
  cookieStore.set(BATUBT_ADMIN_ACCESS_COOKIE, accessKey, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/batubt",
    maxAge: ADMIN_COOKIE_MAX_AGE_SECONDS
  });

  return true;
}

/**
 * Clears the BatuBT session cookie (sign out). Expires it with the exact
 * attributes used at sign-in — see signOutBakcakanat for why.
 */
export async function signOutBatubt(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(BATUBT_ADMIN_ACCESS_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/batubt",
    maxAge: 0
  });
}

/**
 * Reads the Akçakanat domain-board password (empty string if not configured).
 * No fallback: the board is gated solely by BAKCAKANAT_PASSWORD.
 */
function getBakcakanatPassword(): string {
  return process.env.BAKCAKANAT_PASSWORD?.trim() ?? "";
}

/**
 * True when the current request carries a valid Akçakanat session cookie.
 *
 * Fails CLOSED: if BAKCAKANAT_PASSWORD is not configured (e.g. missing on the
 * production host), nobody gets in — the board must never be publicly
 * reachable just because an env var was forgotten.
 */
export async function isBakcakanatAuthenticated(): Promise<boolean> {
  const password = getBakcakanatPassword();
  if (!password) return false;
  const cookieStore = await cookies();
  const candidate = cookieStore.get(BAKCAKANAT_ACCESS_COOKIE)?.value ?? "";
  return candidate.trim() === password;
}

/**
 * Validates the supplied password and, when correct, persists it in an
 * HttpOnly cookie scoped to /bakcakanat. Returns whether sign-in succeeded.
 */
export async function signInBakcakanat(candidate: string): Promise<boolean> {
  const password = getBakcakanatPassword();
  // Fail closed: without a configured password no sign-in is possible.
  if (!password) return false;
  if (candidate.trim() !== password) return false;

  const cookieStore = await cookies();
  cookieStore.set(BAKCAKANAT_ACCESS_COOKIE, password, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/bakcakanat",
    maxAge: ADMIN_COOKIE_MAX_AGE_SECONDS
  });

  return true;
}

/**
 * Clears the Akçakanat session cookie (sign out).
 *
 * Expires the cookie with the exact attributes used at sign-in instead of
 * `cookies().delete()`: the plain deletion Set-Cookie carries no Secure/
 * HttpOnly/SameSite flags, and browsers can refuse to drop a Secure cookie
 * (set in production over HTTPS) without attribute parity.
 */
export async function signOutBakcakanat(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(BAKCAKANAT_ACCESS_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/bakcakanat",
    maxAge: 0
  });
}

/**
 * The `/detrbridge` logo-selection board is gated by a name allowlist plus
 * a shared password (DETRBRIDGE), mirroring the /detr todo board's
 * email-allowlist pattern but with plain first names instead of emails.
 * The cookie stores `name|password`; both halves are re-validated on every
 * request, so a password change or allowlist removal revokes every
 * session. Fails CLOSED: without a configured password nobody gets in.
 */
export const DETRBRIDGE_ACCESS_COOKIE = "ubt_detrbridge_access";

/** Allowlisted names for the detrbridge board (lowercase, no diacritics-sensitivity issues). */
const DETRBRIDGE_ALLOWED_NAMES = [
  "sefa",
  "sümeyye",
  "fatih",
  "ubt",
  "şahin",
  "murat",
  "aslıhan"
];

/**
 * Reads the detrbridge board password (empty string if not configured).
 * No fallback: the board is gated solely by DETRBRIDGE.
 */
function getDetrbridgePassword(): string {
  return process.env.DETRBRIDGE?.trim() ?? "";
}

/** Normalized (lowercase) name allowlist for the detrbridge board. */
function getDetrbridgeAllowedNames(): string[] {
  return DETRBRIDGE_ALLOWED_NAMES.map((name) => name.trim().toLowerCase());
}

/**
 * Returns the signed-in detrbridge name, or null when the session is
 * invalid. Fails CLOSED: without a configured password nobody gets in.
 */
export async function getDetrbridgeSessionName(): Promise<string | null> {
  const password = getDetrbridgePassword();
  if (!password) return null;
  const cookieStore = await cookies();
  const value = cookieStore.get(DETRBRIDGE_ACCESS_COOKIE)?.value ?? "";
  const separator = value.lastIndexOf("|");
  if (separator < 0) return null;
  const name = value.slice(0, separator).trim().toLowerCase();
  const candidate = value.slice(separator + 1);
  if (candidate !== password) return null;
  if (!getDetrbridgeAllowedNames().includes(name)) return null;
  return name;
}

/**
 * True when the current request carries a valid detrbridge session cookie.
 *
 * Fails CLOSED: if DETRBRIDGE is not configured, nobody gets in — the board
 * must never be publicly reachable just because an env var was forgotten.
 */
export async function isDetrbridgeAuthenticated(): Promise<boolean> {
  return (await getDetrbridgeSessionName()) !== null;
}

/**
 * Validates the supplied name (against the allowlist) and password and,
 * when both are correct, persists them in an HttpOnly cookie scoped to
 * /detrbridge. Returns whether sign-in succeeded.
 */
export async function signInDetrbridge(
  name: string,
  candidate: string
): Promise<boolean> {
  const password = getDetrbridgePassword();
  // Fail closed: without a configured password no sign-in is possible.
  if (!password) return false;
  const normalizedName = name.trim().toLowerCase();
  if (!normalizedName) return false;
  if (!getDetrbridgeAllowedNames().includes(normalizedName)) return false;
  if (candidate.trim() !== password) return false;

  const cookieStore = await cookies();
  cookieStore.set(DETRBRIDGE_ACCESS_COOKIE, `${normalizedName}|${password}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/detrbridge",
    maxAge: ADMIN_COOKIE_MAX_AGE_SECONDS
  });

  return true;
}

/**
 * Clears the detrbridge session cookie (sign out). Expires it with the
 * exact attributes used at sign-in — see signOutBakcakanat for why.
 */
export async function signOutDetrbridge(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(DETRBRIDGE_ACCESS_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/detrbridge",
    maxAge: 0
  });
}
