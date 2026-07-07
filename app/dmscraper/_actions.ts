"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";

import { signInDmscraper, signOutDmscraper } from "@/lib/admin-auth";

/**
 * `/dmscraper` gate sign-in. Validates against the task-board key
 * (DESIREMAPTODO_ADMIN_ACCESS_KEY) and stores its own cookie scoped to
 * /dmscraper, so the scraper board stays isolated from `/dm` and `/dmscraper2`.
 */
export async function dmscraperSignInAction(formData: FormData): Promise<void> {
  const candidate = String(formData.get("access") ?? "");
  await signInDmscraper(candidate);
  redirect("/dmscraper" as Route);
}

/**
 * Sign out of the scraper board and return to its gate.
 */
export async function dmscraperSignOutAction(): Promise<void> {
  await signOutDmscraper();
  redirect("/dmscraper" as Route);
}
