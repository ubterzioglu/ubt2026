"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";

import { signInDetrbridge, signOutDetrbridge } from "@/lib/admin-auth";
import { recordDetrbridgeSignIn } from "@/lib/detrbridge-visits";

/**
 * detrbridge gate sign-in. Validates the name (against the allowlist) and
 * password against DETRBRIDGE and, on success, stores both in an HttpOnly
 * cookie and logs the sign-in (admin login log). Credentials never appear
 * in the URL.
 */
export async function detrbridgeSignInAction(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "");
  const candidate = String(formData.get("access") ?? "");
  const signedInName = await signInDetrbridge(name, candidate);
  if (signedInName) {
    await recordDetrbridgeSignIn(signedInName);
  }
  redirect("/detrbridge" as Route);
}

/**
 * Sign out of the detrbridge board and return to its gate.
 */
export async function detrbridgeSignOutAction(): Promise<void> {
  await signOutDetrbridge();
  redirect("/detrbridge" as Route);
}
