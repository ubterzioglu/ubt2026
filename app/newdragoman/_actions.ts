"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";

import { signInNewdragoman, signOutNewdragoman } from "@/lib/admin-auth";

/**
 * /newdragoman gate sign-in. Validates against the board password and stores
 * its own HttpOnly cookie, so the proposal can be shared independently of the
 * other admin keys. The password never appears in the URL.
 */
export async function newdragomanSignInAction(formData: FormData): Promise<void> {
  const candidate = String(formData.get("access") ?? "");
  await signInNewdragoman(candidate);
  redirect("/newdragoman" as Route);
}

/**
 * Sign out of the proposal and return to its gate.
 */
export async function newdragomanSignOutAction(): Promise<void> {
  await signOutNewdragoman();
  redirect("/newdragoman" as Route);
}
