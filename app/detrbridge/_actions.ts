"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";

import { signInDetrbridge, signOutDetrbridge } from "@/lib/admin-auth";

/**
 * detrbridge gate sign-in. Validates the password against DETRBRIDGE and, on
 * success, stores it in an HttpOnly cookie. Credentials never appear in the
 * URL.
 */
export async function detrbridgeSignInAction(formData: FormData): Promise<void> {
  const candidate = String(formData.get("access") ?? "");
  await signInDetrbridge(candidate);
  redirect("/detrbridge" as Route);
}

/**
 * Sign out of the detrbridge board and return to its gate.
 */
export async function detrbridgeSignOutAction(): Promise<void> {
  await signOutDetrbridge();
  redirect("/detrbridge" as Route);
}
