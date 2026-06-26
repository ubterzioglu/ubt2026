"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";

import { signInBatubt, signOutBatubt } from "@/lib/admin-auth";

/**
 * BatuBT gate sign-in. Validates against BATUBT_ADMIN_ACCESS_KEY and stores its
 * own HttpOnly cookie, so the footer-client board can be shared with Batuhan
 * independently of the other admin keys. The key never appears in the URL.
 */
export async function batubtSignInAction(formData: FormData): Promise<void> {
  const candidate = String(formData.get("access") ?? "");
  await signInBatubt(candidate);
  redirect("/batubt" as Route);
}

/**
 * Sign out of the BatuBT board and return to its gate.
 */
export async function batubtSignOutAction(): Promise<void> {
  await signOutBatubt();
  redirect("/batubt" as Route);
}
