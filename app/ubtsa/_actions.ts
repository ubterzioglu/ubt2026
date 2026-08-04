"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";

import { signInUbtsa, signOutUbtsa } from "@/lib/admin-auth";
import { recordUbtsaSignIn } from "@/lib/ubtsa-visits";

/**
 * ubtsa gate sign-in. Validates the name (against the allowlist) and the
 * password against UBTSA_PASSWORD and, on success, stores both in an HttpOnly
 * cookie. Credentials never appear in the URL — a rejected attempt only sets a
 * generic `?error=1` flag, so a wrong password is never echoed back.
 */
export async function ubtsaSignInAction(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "");
  const candidate = String(formData.get("access") ?? "");
  const signedInName = await signInUbtsa(name, candidate);
  if (signedInName) {
    await recordUbtsaSignIn(signedInName);
  }
  redirect((signedInName ? "/ubtsa" : "/ubtsa?error=1") as Route);
}

/**
 * Sign out of the ubtsa board and return to its gate.
 */
export async function ubtsaSignOutAction(): Promise<void> {
  await signOutUbtsa();
  redirect("/ubtsa" as Route);
}
