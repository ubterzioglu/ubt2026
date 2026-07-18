import "server-only";

import { cookies } from "next/headers";

import { getAdminAccessKey, hasAdminAccess } from "@/lib/appointments";

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
 * The `/dmscraper` service-finder board shares the task-board key
 * (DESIREMAPTODO_ADMIN_ACCESS_KEY) but keeps its own cookie scoped to
 * /dmscraper, so it stays isolated from `/dm`. Cost: the same password is
 * entered once per board — accepted trade-off, do not widen the path.
 * (The old radar news scraper that lived on this route was removed on
 * 2026-07-08; the service finder moved here from /dmscraper2.)
 */
export const DMSCRAPER_ACCESS_COOKIE = "ubt_dmscraper_access";

/**
 * True when the current request carries a valid `/dmscraper` session cookie.
 * Fails CLOSED: without a configured key nobody gets in.
 */
export async function isDmscraperAuthenticated(): Promise<boolean> {
  const accessKey = getTasksAdminAccessKey();
  if (!accessKey) return false;
  const cookieStore = await cookies();
  const candidate = cookieStore.get(DMSCRAPER_ACCESS_COOKIE)?.value ?? "";
  return candidate.trim() === accessKey;
}

/**
 * Validates the supplied key and, when correct, persists it in an HttpOnly
 * cookie scoped to /dmscraper. Returns whether the sign-in was accepted.
 */
export async function signInDmscraper(candidate: string): Promise<boolean> {
  const accessKey = getTasksAdminAccessKey();
  // Fail closed: without a configured key no sign-in is possible.
  if (!accessKey) return false;
  if (candidate.trim() !== accessKey) return false;

  const cookieStore = await cookies();
  cookieStore.set(DMSCRAPER_ACCESS_COOKIE, accessKey, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/dmscraper",
    maxAge: ADMIN_COOKIE_MAX_AGE_SECONDS
  });

  return true;
}

/**
 * Clears the `/dmscraper` session cookie (sign out). Expires it with the
 * exact attributes used at sign-in — see signOutBakcakanat for why.
 */
export async function signOutDmscraper(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(DMSCRAPER_ACCESS_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/dmscraper",
    maxAge: 0
  });
}

/**
 * The `/detr` todo board is gated by an e-mail allowlist plus a shared
 * password (ADMIN_QASS_DETR), each in its own cookie scoped to /detr so it
 * can be shared independently of every other admin key. RFC 6265
 * path-matching keeps the cookie isolated from all other boards.
 */
export const DETR_ACCESS_COOKIE = "ubt_detr_access";

/**
 * Default allowlist; override/extend without a deploy via the
 * DETR_ALLOWED_EMAILS env var (comma-separated, replaces this list).
 */
const DETR_DEFAULT_ALLOWED_EMAILS = [
  "eyersefa@gmail.com",
  "sumeyyanacar08@gmail.com",
  "fatihmclskn@gmail.com",
  "corteqssocial@gmail.com",
  "ubterzioglu@gmail.com",
  "ozbakirsahincande@gmail.com"
];

/**
 * Reads the DETR board password (empty string if not configured).
 * No fallback: the board is gated solely by ADMIN_QASS_DETR.
 */
function getDetrPassword(): string {
  return process.env.ADMIN_QASS_DETR?.trim() ?? "";
}

/** Normalized (lowercase) e-mail allowlist for the DETR board. */
function getDetrAllowedEmails(): string[] {
  const raw = process.env.DETR_ALLOWED_EMAILS?.trim();
  const list = raw ? raw.split(",") : DETR_DEFAULT_ALLOWED_EMAILS;
  return list.map((email) => email.trim().toLowerCase()).filter(Boolean);
}

/**
 * Returns the signed-in DETR e-mail, or null when the session is invalid.
 * The cookie stores `email|password`; both halves are re-validated on every
 * request, so a password change or allowlist removal revokes the session.
 * Fails CLOSED: without a configured password nobody gets in.
 */
export async function getDetrSessionEmail(): Promise<string | null> {
  const password = getDetrPassword();
  if (!password) return null;
  const cookieStore = await cookies();
  const value = cookieStore.get(DETR_ACCESS_COOKIE)?.value ?? "";
  const separator = value.lastIndexOf("|");
  if (separator < 0) return null;
  const email = value.slice(0, separator).trim().toLowerCase();
  const candidate = value.slice(separator + 1);
  if (candidate !== password) return null;
  if (!getDetrAllowedEmails().includes(email)) return null;
  return email;
}

/**
 * True when the current request carries a valid `/detr` session cookie.
 */
export async function isDetrAuthenticated(): Promise<boolean> {
  return (await getDetrSessionEmail()) !== null;
}

/**
 * Validates the supplied e-mail (against the allowlist) and password and,
 * when both are correct, persists them in an HttpOnly cookie scoped to
 * /detr. Returns whether sign-in succeeded.
 */
export async function signInDetr(
  email: string,
  candidate: string
): Promise<boolean> {
  const password = getDetrPassword();
  // Fail closed: without a configured password no sign-in is possible.
  if (!password) return false;
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return false;
  if (!getDetrAllowedEmails().includes(normalizedEmail)) return false;
  if (candidate.trim() !== password) return false;

  const cookieStore = await cookies();
  cookieStore.set(DETR_ACCESS_COOKIE, `${normalizedEmail}|${password}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/detr",
    maxAge: ADMIN_COOKIE_MAX_AGE_SECONDS
  });

  return true;
}

/**
 * Clears the `/detr` session cookie (sign out). Expires it with the exact
 * attributes used at sign-in — see signOutBakcakanat for why.
 */
export async function signOutDetr(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(DETR_ACCESS_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/detr",
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
