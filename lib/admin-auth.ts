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

const ADMIN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

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

  // No key configured -> the gate is open, nothing to store.
  if (!accessKey) {
    return true;
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
 * Clears the admin session cookie (sign out).
 */
export async function signOutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete({ name: ADMIN_ACCESS_COOKIE, path: "/admin" });
}
