"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";

import { readFormString } from "@/lib/form-data";
import { signInProjectair, signOutProjectair } from "@/lib/admin-auth";

export async function projectairSignInAction(formData: FormData): Promise<void> {
  const candidate = readFormString(formData, "access");
  await signInProjectair(candidate);
  redirect("/projectair" as Route);
}

export async function projectairSignOutAction(): Promise<void> {
  await signOutProjectair();
  redirect("/projectair" as Route);
}
