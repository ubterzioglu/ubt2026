import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isDmscraper2Authenticated } from "@/lib/admin-auth";
import {
  dmscraper2SignInAction,
  dmscraper2SignOutAction
} from "@/app/dmscraper2/_actions";
import { DmLogin } from "@/app/dm/_components/dm-login";
import { BoardGuide } from "@/app/dm/_components/board-guide";
import type { BoardGuideContent } from "@/app/dm/_components/board-guide";
import {
  FinderNav,
  type FinderSectionKey
} from "@/app/dmscraper2/_components/finder-nav";
import { JobsSection } from "@/app/dmscraper2/_components/jobs-section";
import { JobDetailSection } from "@/app/dmscraper2/_components/job-detail-section";
import { TemplatesSection } from "@/app/dmscraper2/_components/templates-section";
import { ProvidersSection } from "@/app/dmscraper2/_components/providers-section";
import { CostsSection } from "@/app/dmscraper2/_components/costs-section";
import {
  DM_AMBIENT_BACKGROUND,
  DM_GRID_TEXTURE
} from "@/app/dm/_components/theme";
import {
  cancelFinderJobAdmin,
  createFinderJobAdmin,
  getFinderCostSummaryAdmin,
  getFinderJobCountsAdmin,
  getFinderJobDetailAdmin,
  getFinderJobsAdmin,
  getFinderProvidersAdmin,
  getFinderTemplatesAdmin,
  normalizeFinderJobStatus,
  normalizeFinderReviewStatus,
  releaseStuckFinderJobAdmin,
  requeueFinderJobAdmin,
  reviewFinderCandidateAdmin,
  runFinderJobAdmin,
  setFinderProviderEnabledAdmin,
  setFinderTemplateActiveAdmin,
  updateFinderTemplateAdmin
} from "@/lib/service-finder";
import type { FinderReviewStatus } from "@/lib/service-finder";

// Tarama (arama + ekstraksiyon + sınıflandırma) server action içinde senkron
// koşar ve birkaç dakikayı bulabilir; segment süresini yükselt.
export const maxDuration = 300;

export const metadata: Metadata = {
  robots: { index: false, follow: false }
};

interface Dmscraper2PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function readParam(value: string | string[] | undefined): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? "";
  return "";
}

const inputClass =
  "w-full rounded-[0.85rem] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white placeholder:text-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition focus:border-[#ff2d95]/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-[#ff2d95]/15";

// Collapsed how-to card shown at the top of the board after sign-in.
const FINDER_GUIDE: BoardGuideContent = {
  title: "Bu pano ne işe yarar? · Kullanım rehberi",
  intro:
    "Service Finder, kategori + şehir bazlı MEKAN taraması yapar: " +
    "web'den aday mekanları arar, sayfalarından bilgi çıkarır ve " +
    "sınıflandırır (Tavily · SerpAPI · Gemini). Kardeş pano " +
    "/dmscraper ise mekan değil HABER tarar — ikisi farklı işler.",
  sections: [
    {
      heading: "Tarama işleri",
      text:
        "Kategori + şehir seçip işi kuyruğa ekle ve çalıştır. İş " +
        "birkaç dakika sürebilir; bitince aday mekanları tek tek " +
        "inceleyip onaylar veya reddedersin."
    },
    {
      heading: "Kategori şablonları",
      text:
        "Aranacak kategoriler ve Almanca sorgu kalıpları (FKK · " +
        "Bordell · Studio · Privat). Şablonu düzenleyerek aramanın " +
        "ne bulacağını şekillendirirsin."
    },
    {
      heading: "Sağlayıcılar",
      text:
        "Tavily arama+ekstraksiyon için ZORUNLU; SerpAPI az sonuçta " +
        "Google fallback'i; Gemini sınıflandırma yapar. Anahtar " +
        "durumları burada görünür."
    },
    {
      heading: "Maliyetler",
      text:
        "Sağlayıcı bazlı harcama dökümü — arama, ekstraksiyon ve " +
        "sınıflandırma adımlarının maliyeti ayrı ayrı izlenir."
    }
  ]
};

const SECTION_META: Record<FinderSectionKey, { title: string; description: string }> = {
  isler: {
    title: "Tarama işleri",
    description:
      "Kategori + şehir bazlı mekan taramaları: kuyruğa ekle, çalıştır, adayları incele."
  },
  sablonlar: {
    title: "Kategori şablonları",
    description:
      "Aranacak kategoriler ve Almanca sorgu kalıpları (FKK · Bordell · Studio · Privat)."
  },
  saglayicilar: {
    title: "Sağlayıcılar",
    description: "Tavily / SerpAPI / Gemini yapılandırması ve anahtar durumu."
  },
  maliyet: {
    title: "Maliyetler",
    description: "Sağlayıcı bazlı harcama dökümü (arama · ekstraksiyon · sınıflandırma)."
  }
};

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

export default async function Dmscraper2Page({ searchParams }: Dmscraper2PageProps) {
  const params = searchParams ? await searchParams : {};
  const hasAccess = await isDmscraper2Authenticated();

  if (!hasAccess) {
    return (
      <DmLogin
        signIn={dmscraper2SignInAction}
        eyebrow="Admin erişimi"
        title="Service Finder"
        description="Mekan tarama hattına erişim korunuyor. Devam etmek için DM admin anahtarını gir."
        submitLabel="Panoyu aç"
        subtitle="Service finder"
      />
    );
  }

  const secParam = readParam(params.sec);
  const activeSection: FinderSectionKey =
    secParam === "sablonlar"
      ? "sablonlar"
      : secParam === "saglayicilar"
        ? "saglayicilar"
        : secParam === "maliyet"
          ? "maliyet"
          : "isler";

  const jobId = readParam(params.job);
  const jobStatusFilter = normalizeFinderJobStatus(readParam(params.jstatus) || "all");
  const candidateParam = readParam(params.cstatus);
  const candidateFilter: FinderReviewStatus | "all" =
    candidateParam === "all"
      ? "all"
      : candidateParam
        ? normalizeFinderReviewStatus(candidateParam)
        : "pending";
  const editId = readParam(params.edit);
  const flashOk = readParam(params.ok);
  const errorParam = readParam(params.error);

  // Nav rozeti için sayaçlar her zaman; bölüm verileri yalnızca kendi görünümünde.
  const jobCounts = await getFinderJobCountsAdmin();
  const templates =
    activeSection === "isler" || activeSection === "sablonlar"
      ? await getFinderTemplatesAdmin()
      : [];
  const jobs =
    activeSection === "isler" && !jobId
      ? await getFinderJobsAdmin(jobStatusFilter, 40)
      : [];
  const jobDetail =
    activeSection === "isler" && jobId
      ? await getFinderJobDetailAdmin(jobId, candidateFilter)
      : null;
  const providers =
    activeSection === "saglayicilar" ? await getFinderProvidersAdmin() : [];
  const costsAllTime =
    activeSection === "maliyet" ? await getFinderCostSummaryAdmin() : [];
  const costs30d =
    activeSection === "maliyet"
      ? await getFinderCostSummaryAdmin(
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        )
      : [];

  // --- Server actions (her biri auth'u yeniden doğrular) ---

  async function jobCreateAction(formData: FormData) {
    "use server";
    if (!(await isDmscraper2Authenticated())) {
      redirect("/dmscraper2" as Parameters<typeof redirect>[0]);
    }
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
    revalidatePath("/dmscraper2");
    const target = result.ok
      ? `/dmscraper2?sec=isler&ok=created&job=${result.id}`
      : `/dmscraper2?sec=isler&error=${encodeURIComponent(result.errorMessage ?? "İş oluşturulamadı.")}`;
    redirect(target as Parameters<typeof redirect>[0]);
  }

  async function jobRunAction(formData: FormData) {
    "use server";
    if (!(await isDmscraper2Authenticated())) {
      redirect("/dmscraper2" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    if (!id) {
      redirect("/dmscraper2?sec=isler" as Parameters<typeof redirect>[0]);
    }
    const result = await runFinderJobAdmin(id);
    revalidatePath("/dmscraper2");
    const target = result.ok
      ? `/dmscraper2?sec=isler&job=${id}&ok=ran${result.candidates != null ? `&n=${result.candidates}` : ""}`
      : `/dmscraper2?sec=isler&job=${id}&error=${encodeURIComponent(result.errorMessage ?? "Tarama başarısız.")}`;
    redirect(target as Parameters<typeof redirect>[0]);
  }

  async function jobCancelAction(formData: FormData) {
    "use server";
    if (!(await isDmscraper2Authenticated())) {
      redirect("/dmscraper2" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    if (id) {
      await cancelFinderJobAdmin(id);
    }
    revalidatePath("/dmscraper2");
    redirect("/dmscraper2?sec=isler" as Parameters<typeof redirect>[0]);
  }

  async function jobRequeueAction(formData: FormData) {
    "use server";
    if (!(await isDmscraper2Authenticated())) {
      redirect("/dmscraper2" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    if (id) {
      await requeueFinderJobAdmin(id);
    }
    revalidatePath("/dmscraper2");
    redirect(
      `/dmscraper2?sec=isler${id ? `&job=${id}` : ""}` as Parameters<typeof redirect>[0]
    );
  }

  async function jobReleaseAction(formData: FormData) {
    "use server";
    if (!(await isDmscraper2Authenticated())) {
      redirect("/dmscraper2" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    if (id) {
      await releaseStuckFinderJobAdmin(id);
    }
    revalidatePath("/dmscraper2");
    redirect(
      `/dmscraper2?sec=isler${id ? `&job=${id}` : ""}` as Parameters<typeof redirect>[0]
    );
  }

  async function candidateReviewAction(formData: FormData) {
    "use server";
    if (!(await isDmscraper2Authenticated())) {
      redirect("/dmscraper2" as Parameters<typeof redirect>[0]);
    }
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
    revalidatePath("/dmscraper2");
    redirect(
      `/dmscraper2?sec=isler&job=${jobRef}&cstatus=${encodeURIComponent(backFilter)}` as Parameters<
        typeof redirect
      >[0]
    );
  }

  async function templateToggleAction(formData: FormData) {
    "use server";
    if (!(await isDmscraper2Authenticated())) {
      redirect("/dmscraper2" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    const active = (formData.get("active") as string | null) === "1";
    if (id) {
      await setFinderTemplateActiveAdmin(id, active);
    }
    revalidatePath("/dmscraper2");
    redirect("/dmscraper2?sec=sablonlar" as Parameters<typeof redirect>[0]);
  }

  async function templateUpdateAction(formData: FormData) {
    "use server";
    if (!(await isDmscraper2Authenticated())) {
      redirect("/dmscraper2" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    if (!id) {
      redirect("/dmscraper2?sec=sablonlar" as Parameters<typeof redirect>[0]);
    }
    const result = await updateFinderTemplateAdmin(id, {
      label: (formData.get("label") as string | null) ?? undefined,
      queryTemplates: parseLines((formData.get("queryTemplates") as string | null) ?? ""),
      mustExcludeTerms: parseCommaList(
        (formData.get("mustExcludeTerms") as string | null) ?? ""
      )
    });
    revalidatePath("/dmscraper2");
    const target = result.ok
      ? "/dmscraper2?sec=sablonlar&ok=updated"
      : `/dmscraper2?sec=sablonlar&error=${encodeURIComponent(result.errorMessage ?? "Şablon güncellenemedi.")}`;
    redirect(target as Parameters<typeof redirect>[0]);
  }

  async function providerToggleAction(formData: FormData) {
    "use server";
    if (!(await isDmscraper2Authenticated())) {
      redirect("/dmscraper2" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    const enabled = (formData.get("enabled") as string | null) === "1";
    if (id) {
      await setFinderProviderEnabledAdmin(id, enabled);
    }
    revalidatePath("/dmscraper2");
    redirect("/dmscraper2?sec=saglayicilar" as Parameters<typeof redirect>[0]);
  }

  const cardClass =
    "rounded-[1.6rem] bg-gradient-to-b from-white/12 via-white/[0.04] to-transparent p-[1.3px] shadow-[0_30px_90px_-30px_rgba(0,0,0,0.85)]";
  const cardInnerClass = "rounded-[1.55rem] bg-[#0a0712]/85 backdrop-blur-2xl";

  const flashMessage =
    flashOk === "created"
      ? "İş kuyruğa eklendi. Detaydan taramayı başlatabilirsin."
      : flashOk === "ran"
        ? `Tarama tamamlandı${readParam(params.n) ? ` — ${readParam(params.n)} aday incelemeye hazır.` : "."}`
        : flashOk === "updated"
          ? "Şablon güncellendi."
          : "";

  return (
    <main
      className="relative isolate min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8"
      style={{ background: DM_AMBIENT_BACKGROUND }}
    >
      {/* Fine grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.3]"
        style={DM_GRID_TEXTURE}
      />
      {/* Floating neon orbs */}
      <div
        aria-hidden
        className="animate-float pointer-events-none absolute -left-28 top-32 -z-10 h-72 w-72 rounded-full blur-[120px]"
        style={{ background: "rgba(255,45,149,0.22)" }}
      />
      <div
        aria-hidden
        className="animate-drift pointer-events-none absolute -right-24 top-[40rem] -z-10 h-80 w-80 rounded-full blur-[130px]"
        style={{ background: "rgba(34,211,238,0.18)" }}
      />

      <div className="animate-reveal mx-auto w-full max-w-[88rem] lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:items-start lg:gap-6">
        <FinderNav
          activeSection={activeSection}
          items={[
            { key: "isler", label: "İşler", count: jobCounts.review },
            { key: "sablonlar", label: "Şablonlar" },
            { key: "saglayicilar", label: "Sağlayıcılar" },
            { key: "maliyet", label: "Maliyet" }
          ]}
          cardClass={cardClass}
          cardInnerClass={cardInnerClass}
          signOutAction={dmscraper2SignOutAction}
        />

        <div className="mt-5 flex min-w-0 flex-col gap-5 lg:mt-0">
          <BoardGuide
            guide={FINDER_GUIDE}
            cardClass={cardClass}
            cardInnerClass={cardInnerClass}
          />

          {/* Active section header */}
          <section className={cardClass}>
            <div className={`${cardInnerClass} px-5 py-4 sm:px-6`}>
              <p
                className="text-[9px] font-semibold uppercase tracking-[0.28em]"
                style={{ color: "#f0abfc" }}
              >
                DesireMap · service finder
              </p>
              <h1 className="mt-1 font-body text-[clamp(1.15rem,2.6vw,1.5rem)] font-bold tracking-[-0.035em] text-white">
                {SECTION_META[activeSection].title}
              </h1>
              <p className="mt-1 text-xs leading-5 text-white/50">
                {SECTION_META[activeSection].description}
              </p>
            </div>
          </section>

          {flashMessage ? (
            <div className="rounded-[1.1rem] border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-xs font-medium text-emerald-300">
              {flashMessage}
            </div>
          ) : null}
          {errorParam ? (
            <div className="rounded-[1.1rem] border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-xs font-medium text-rose-200">
              {errorParam}
            </div>
          ) : null}

          {activeSection === "isler" && jobDetail ? (
            <JobDetailSection
              detail={jobDetail}
              candidateFilter={candidateFilter}
              cardClass={cardClass}
              cardInnerClass={cardInnerClass}
              inputClass={inputClass}
              runAction={jobRunAction}
              requeueAction={jobRequeueAction}
              releaseAction={jobReleaseAction}
              candidateReviewAction={candidateReviewAction}
            />
          ) : activeSection === "isler" ? (
            <>
              {jobId && !jobDetail ? (
                <div className="rounded-[1.1rem] border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-xs font-medium text-rose-200">
                  İş bulunamadı.
                </div>
              ) : null}
              <JobsSection
                jobs={jobs}
                counts={jobCounts}
                templates={templates}
                statusFilter={jobStatusFilter}
                cardClass={cardClass}
                cardInnerClass={cardInnerClass}
                inputClass={inputClass}
                createAction={jobCreateAction}
                runAction={jobRunAction}
                cancelAction={jobCancelAction}
                requeueAction={jobRequeueAction}
                releaseAction={jobReleaseAction}
              />
            </>
          ) : activeSection === "sablonlar" ? (
            <TemplatesSection
              templates={templates}
              editId={editId}
              cardClass={cardClass}
              cardInnerClass={cardInnerClass}
              inputClass={inputClass}
              toggleAction={templateToggleAction}
              updateAction={templateUpdateAction}
            />
          ) : activeSection === "saglayicilar" ? (
            <ProvidersSection
              providers={providers}
              cardClass={cardClass}
              cardInnerClass={cardInnerClass}
              toggleAction={providerToggleAction}
            />
          ) : (
            <CostsSection
              last30Days={costs30d}
              allTime={costsAllTime}
              cardClass={cardClass}
              cardInnerClass={cardInnerClass}
            />
          )}
        </div>
      </div>
    </main>
  );
}
