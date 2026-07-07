"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";

import { signInDmscraper2, signOutDmscraper2 } from "@/lib/admin-auth";

/**
 * `/dmscraper2` gate sign-in. Validates against the task-board key
 * (DESIREMAPTODO_ADMIN_ACCESS_KEY) and stores its own cookie scoped to
 * /dmscraper2, so the finder board stays isolated from `/dm`.
 */
export async function dmscraper2SignInAction(formData: FormData): Promise<void> {
  const candidate = String(formData.get("access") ?? "");
  await signInDmscraper2(candidate);
  redirect("/dmscraper2" as Route);
}

/**
 * Sign out of the finder board and return to its gate.
 */
export async function dmscraper2SignOutAction(): Promise<void> {
  await signOutDmscraper2();
  redirect("/dmscraper2" as Route);
}
