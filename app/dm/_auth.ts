import "server-only";

import { redirect } from "next/navigation";

import { isTasksAdminAuthenticated } from "@/lib/admin-auth";

export async function requireDmAccess(): Promise<void> {
  if (!(await isTasksAdminAuthenticated())) {
    redirect("/dm" as Parameters<typeof redirect>[0]);
  }
}
