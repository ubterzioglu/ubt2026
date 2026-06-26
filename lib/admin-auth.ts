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

/**
 * True when the current request carries a valid task-board session cookie.
 */
export async function isTasksAdminAuthenticated(): Promise<boolean> {
  const accessKey = getTasksAdminAccessKey();
  // No key configured anywhere -> gate is open.
  if (!accessKey) return true;
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
  if (!accessKey) return true;
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
 * Clears the task-board session cookie (sign out).
 */
export async function signOutTasksAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete({ name: TASKS_ADMIN_ACCESS_COOKIE, path: "/dm" });
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
  // No key configured -> gate is open.
  if (!accessKey) return true;
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
  if (!accessKey) return true;
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
 * Clears the BatuBT session cookie (sign out).
 */
export async function signOutBatubt(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete({ name: BATUBT_ADMIN_ACCESS_COOKIE, path: "/batubt" });
}
