"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";

import { signInTasksAdmin, signOutTasksAdmin } from "@/lib/admin-auth";

/**
 * Task-board gate sign-in for the standalone `/dm` board. Validates against the
 * task-board key (DESIREMAPTODO_ADMIN_ACCESS_KEY) and stores its own cookie, so
 * the board can be shared independently of the appointment-admin key.
 */
export async function tasksSignInAction(formData: FormData): Promise<void> {
  const candidate = String(formData.get("access") ?? "");
  await signInTasksAdmin(candidate);
  redirect("/dm" as Route);
}

/**
 * Sign out of the task board and return to its gate.
 */
export async function tasksSignOutAction(): Promise<void> {
  await signOutTasksAdmin();
  redirect("/dm" as Route);
}
