"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";

import { signInBakcakanat, signOutBakcakanat } from "@/lib/admin-auth";

/**
 * Akçakanat gate sign-in. Validates against BAKCAKANAT_PASSWORD and stores its
 * own HttpOnly cookie, so the domain board can be shared independently of the
 * other admin keys. The password never appears in the URL.
 */
export async function bakcakanatSignInAction(formData: FormData): Promise<void> {
  const candidate = String(formData.get("access") ?? "");
  await signInBakcakanat(candidate);
  redirect("/bakcakanat" as Route);
}

/**
 * Sign out of the Akçakanat board and return to its gate.
 */
export async function bakcakanatSignOutAction(): Promise<void> {
  await signOutBakcakanat();
  redirect("/bakcakanat" as Route);
}
