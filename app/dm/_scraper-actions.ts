"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { readFormString } from "@/lib/form-data";
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

function parseOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  return trimmed ? Number(trimmed) : undefined;
}

async function requireDmAccess(): Promise<void> {
  if (!(await isTasksAdminAuthenticated())) {
    redirect("/dm" as Parameters<typeof redirect>[0]);
  }
}

export async function scraperJobCreateAction(formData: FormData): Promise<void> {
  await requireDmAccess();
  const city = (readFormString(formData, "city")).trim();
  const location = (readFormString(formData, "location")).trim();
  const result = await createFinderJobAdmin({
    title: readFormString(formData, "title"),
    templateId: (readFormString(formData, "template")) || undefined,
    locationLabel: location || city,
    city,
    freeformTopic: (readFormString(formData, "topic")) || undefined,
    softCapUsd: Number(formData.get("softCap") ?? ""),
    hardCapUsd: Number(formData.get("hardCap") ?? ""),
    maxQueries: parseOptionalNumber(readFormString(formData, "maxQueries")),
    seedUrls: parseLines(readFormString(formData, "seedUrls"))
  });
  revalidatePath("/dm");
  const target = result.ok
    ? `${TAB_BASE}&sec=isler&ok=created&job=${result.id}`
    : `${TAB_BASE}&sec=isler&error=${encodeURIComponent(result.errorMessage ?? "İş oluşturulamadı.")}`;
  redirect(target as Parameters<typeof redirect>[0]);
}

export async function scraperJobRunAction(formData: FormData): Promise<void> {
  await requireDmAccess();
  const id = readFormString(formData, "id");
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
  const id = readFormString(formData, "id");
  const result = id ? await cancelFinderJobAdmin(id) : null;
  revalidatePath("/dm");
  const target = result && !result.ok
    ? `${TAB_BASE}&sec=isler&error=${encodeURIComponent(result.errorMessage ?? "İş iptal edilemedi.")}`
    : `${TAB_BASE}&sec=isler`;
  redirect(target as Parameters<typeof redirect>[0]);
}

export async function scraperJobRequeueAction(formData: FormData): Promise<void> {
  await requireDmAccess();
  const id = readFormString(formData, "id");
  const result = id ? await requeueFinderJobAdmin(id) : null;
  revalidatePath("/dm");
  const target = `${TAB_BASE}&sec=isler${id ? `&job=${id}` : ""}${
    result && !result.ok
      ? `&error=${encodeURIComponent(result.errorMessage ?? "İş yeniden kuyruğa alınamadı.")}`
      : ""
  }`;
  redirect(target as Parameters<typeof redirect>[0]);
}

export async function scraperJobReleaseAction(formData: FormData): Promise<void> {
  await requireDmAccess();
  const id = readFormString(formData, "id");
  const result = id ? await releaseStuckFinderJobAdmin(id) : null;
  revalidatePath("/dm");
  const target = `${TAB_BASE}&sec=isler${id ? `&job=${id}` : ""}${
    result && !result.ok
      ? `&error=${encodeURIComponent(result.errorMessage ?? "İş serbest bırakılamadı.")}`
      : ""
  }`;
  redirect(target as Parameters<typeof redirect>[0]);
}

export async function scraperCandidateReviewAction(
  formData: FormData
): Promise<void> {
  await requireDmAccess();
  const id = readFormString(formData, "id");
  const jobRef = readFormString(formData, "job");
  const status = normalizeFinderReviewStatus(
    readFormString(formData, "status", "pending")
  );
  const note = readFormString(formData, "note");
  const backFilter = readFormString(formData, "cstatus", "pending");
  const result = id ? await reviewFinderCandidateAdmin(id, status, note) : null;
  revalidatePath("/dm");
  const target = `${TAB_BASE}&sec=isler&job=${jobRef}&cstatus=${encodeURIComponent(backFilter)}${
    result && !result.ok
      ? `&error=${encodeURIComponent(result.errorMessage ?? "Aday güncellenemedi.")}`
      : ""
  }`;
  redirect(target as Parameters<typeof redirect>[0]);
}

export async function scraperTemplateToggleAction(
  formData: FormData
): Promise<void> {
  await requireDmAccess();
  const id = readFormString(formData, "id");
  const active = (formData.get("active") as string | null) === "1";
  const result = id ? await setFinderTemplateActiveAdmin(id, active) : null;
  revalidatePath("/dm");
  const target = result && !result.ok
    ? `${TAB_BASE}&sec=sablonlar&error=${encodeURIComponent(result.errorMessage ?? "Şablon güncellenemedi.")}`
    : `${TAB_BASE}&sec=sablonlar`;
  redirect(target as Parameters<typeof redirect>[0]);
}

export async function scraperTemplateUpdateAction(
  formData: FormData
): Promise<void> {
  await requireDmAccess();
  const id = readFormString(formData, "id");
  if (!id) {
    redirect(`${TAB_BASE}&sec=sablonlar` as Parameters<typeof redirect>[0]);
  }
  const result = await updateFinderTemplateAdmin(id, {
    label: (formData.get("label") as string | null) ?? undefined,
    queryTemplates: parseLines(
      readFormString(formData, "queryTemplates")
    ),
    mustExcludeTerms: parseCommaList(
      readFormString(formData, "mustExcludeTerms")
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
  const id = readFormString(formData, "id");
  const enabled = (formData.get("enabled") as string | null) === "1";
  const result = id ? await setFinderProviderEnabledAdmin(id, enabled) : null;
  revalidatePath("/dm");
  const target = result && !result.ok
    ? `${TAB_BASE}&sec=saglayicilar&error=${encodeURIComponent(result.errorMessage ?? "Sağlayıcı güncellenemedi.")}`
    : `${TAB_BASE}&sec=saglayicilar`;
  redirect(target as Parameters<typeof redirect>[0]);
}
