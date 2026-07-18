"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isTasksAdminAuthenticated } from "@/lib/admin-auth";
import {
  cancelFinderJobAdmin,
  createFinderJobAdmin,
  normalizeFinderReviewStatus,
  releaseStuckFinderJobAdmin,
  requeueFinderJobAdmin,
  reviewFinderCandidateAdmin,
  runFinderJobAdmin,
  setFinderProviderEnabledAdmin,
  setFinderTemplateActiveAdmin,
  updateFinderTemplateAdmin
} from "@/lib/service-finder";

/**
 * Service Finder server actions for the /dm Scraper tab. Module-level (no
 * closures) so the ScraperTab server component can import them directly;
 * each re-validates the /dm gate before touching data.
 */

const TAB_BASE = "/dm?tab=scraper";

function parseLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseCommaList(value: string): string[] {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

async function requireDmAccess(): Promise<void> {
  if (!(await isTasksAdminAuthenticated())) {
    redirect("/dm" as Parameters<typeof redirect>[0]);
  }
}

export async function scraperJobCreateAction(formData: FormData): Promise<void> {
  await requireDmAccess();
  const city = ((formData.get("city") as string | null) ?? "").trim();
  const location = ((formData.get("location") as string | null) ?? "").trim();
  const result = await createFinderJobAdmin({
    title: (formData.get("title") as string | null) ?? "",
    templateId: ((formData.get("template") as string | null) ?? "") || undefined,
    locationLabel: location || city,
    city,
    freeformTopic: ((formData.get("topic") as string | null) ?? "") || undefined,
    softCapUsd: Number(formData.get("softCap") ?? ""),
    hardCapUsd: Number(formData.get("hardCap") ?? ""),
    maxQueries: Number(formData.get("maxQueries") ?? ""),
    seedUrls: parseLines((formData.get("seedUrls") as string | null) ?? "")
  });
  revalidatePath("/dm");
  const target = result.ok
    ? `${TAB_BASE}&sec=isler&ok=created&job=${result.id}`
    : `${TAB_BASE}&sec=isler&error=${encodeURIComponent(result.errorMessage ?? "İş oluşturulamadı.")}`;
  redirect(target as Parameters<typeof redirect>[0]);
}

export async function scraperJobRunAction(formData: FormData): Promise<void> {
  await requireDmAccess();
  const id = (formData.get("id") as string | null) ?? "";
  if (!id) {
    redirect(`${TAB_BASE}&sec=isler` as Parameters<typeof redirect>[0]);
  }
  const result = await runFinderJobAdmin(id);
  revalidatePath("/dm");
  const target = result.ok
    ? `${TAB_BASE}&sec=isler&job=${id}&ok=ran${result.candidates != null ? `&n=${result.candidates}` : ""}`
    : `${TAB_BASE}&sec=isler&job=${id}&error=${encodeURIComponent(result.errorMessage ?? "Tarama başarısız.")}`;
  redirect(target as Parameters<typeof redirect>[0]);
}

export async function scraperJobCancelAction(formData: FormData): Promise<void> {
  await requireDmAccess();
  const id = (formData.get("id") as string | null) ?? "";
  if (id) {
    await cancelFinderJobAdmin(id);
  }
  revalidatePath("/dm");
  redirect(`${TAB_BASE}&sec=isler` as Parameters<typeof redirect>[0]);
}

export async function scraperJobRequeueAction(formData: FormData): Promise<void> {
  await requireDmAccess();
  const id = (formData.get("id") as string | null) ?? "";
  if (id) {
    await requeueFinderJobAdmin(id);
  }
  revalidatePath("/dm");
  redirect(
    `${TAB_BASE}&sec=isler${id ? `&job=${id}` : ""}` as Parameters<typeof redirect>[0]
  );
}

export async function scraperJobReleaseAction(formData: FormData): Promise<void> {
  await requireDmAccess();
  const id = (formData.get("id") as string | null) ?? "";
  if (id) {
    await releaseStuckFinderJobAdmin(id);
  }
  revalidatePath("/dm");
  redirect(
    `${TAB_BASE}&sec=isler${id ? `&job=${id}` : ""}` as Parameters<typeof redirect>[0]
  );
}

export async function scraperCandidateReviewAction(
  formData: FormData
): Promise<void> {
  await requireDmAccess();
  const id = (formData.get("id") as string | null) ?? "";
  const jobRef = (formData.get("job") as string | null) ?? "";
  const status = normalizeFinderReviewStatus(
    (formData.get("status") as string | null) ?? "pending"
  );
  const note = (formData.get("note") as string | null) ?? "";
  const backFilter = (formData.get("cstatus") as string | null) ?? "pending";
  if (id) {
    await reviewFinderCandidateAdmin(id, status, note);
  }
  revalidatePath("/dm");
  redirect(
    `${TAB_BASE}&sec=isler&job=${jobRef}&cstatus=${encodeURIComponent(backFilter)}` as Parameters<
      typeof redirect
    >[0]
  );
}

export async function scraperTemplateToggleAction(
  formData: FormData
): Promise<void> {
  await requireDmAccess();
  const id = (formData.get("id") as string | null) ?? "";
  const active = (formData.get("active") as string | null) === "1";
  if (id) {
    await setFinderTemplateActiveAdmin(id, active);
  }
  revalidatePath("/dm");
  redirect(`${TAB_BASE}&sec=sablonlar` as Parameters<typeof redirect>[0]);
}

export async function scraperTemplateUpdateAction(
  formData: FormData
): Promise<void> {
  await requireDmAccess();
  const id = (formData.get("id") as string | null) ?? "";
  if (!id) {
    redirect(`${TAB_BASE}&sec=sablonlar` as Parameters<typeof redirect>[0]);
  }
  const result = await updateFinderTemplateAdmin(id, {
    label: (formData.get("label") as string | null) ?? undefined,
    queryTemplates: parseLines(
      (formData.get("queryTemplates") as string | null) ?? ""
    ),
    mustExcludeTerms: parseCommaList(
      (formData.get("mustExcludeTerms") as string | null) ?? ""
    )
  });
  revalidatePath("/dm");
  const target = result.ok
    ? `${TAB_BASE}&sec=sablonlar&ok=updated`
    : `${TAB_BASE}&sec=sablonlar&error=${encodeURIComponent(result.errorMessage ?? "Şablon güncellenemedi.")}`;
  redirect(target as Parameters<typeof redirect>[0]);
}

export async function scraperProviderToggleAction(
  formData: FormData
): Promise<void> {
  await requireDmAccess();
  const id = (formData.get("id") as string | null) ?? "";
  const enabled = (formData.get("enabled") as string | null) === "1";
  if (id) {
    await setFinderProviderEnabledAdmin(id, enabled);
  }
  revalidatePath("/dm");
  redirect(`${TAB_BASE}&sec=saglayicilar` as Parameters<typeof redirect>[0]);
}
