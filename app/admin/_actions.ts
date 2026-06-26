"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";

import { signInAdmin, signOutAdmin } from "@/lib/admin-auth";

const ADMIN_PATHS = [
  "/admin",
  "/admin/slots",
  "/admin/appointments",
  "/admin/cv-reviews",
  "/admin/news",
  "/admin/blog",
  "/admin/bookmarks",
  "/admin/tasks"
] as const;

type AdminPath = (typeof ADMIN_PATHS)[number];

function safeAdminPath(value: string): AdminPath {
  return (ADMIN_PATHS as readonly string[]).includes(value)
    ? (value as AdminPath)
    : "/admin";
}

/**
 * Gate sign-in. The access key is read from the POSTed form body (not the URL),
 * validated, and stored in an HttpOnly cookie on success. We then redirect back
 * to the same admin path so the page re-renders and reads the cookie. The key is
 * never echoed into the URL on success or failure.
 *
 * Bind the target path as the first argument:
 *   adminSignInAction.bind(null, "/admin/slots")
 */
export async function adminSignInAction(
  redirectTo: string,
  formData: FormData
): Promise<void> {
  const candidate = String(formData.get("access") ?? "");
  await signInAdmin(candidate);
  redirect(safeAdminPath(redirectTo) as Route);
}

/**
 * Sign out and return to the dashboard gate.
 */
export async function adminSignOutAction(): Promise<void> {
  await signOutAdmin();
  redirect("/admin" as Route);
}
