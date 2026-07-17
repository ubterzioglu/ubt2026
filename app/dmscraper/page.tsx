import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isDmscraperAuthenticated } from "@/lib/admin-auth";
import {
  dmscraperSignInAction,
  dmscraperSignOutAction
} from "@/app/dmscraper/_actions";
import { DmLogin } from "@/app/dm/_components/dm-login";
import {
  ScraperNav,
  type ScraperSectionKey
} from "@/app/dmscraper/_components/scraper-nav";
import { QueueSection } from "@/app/dmscraper/_components/queue-section";
import { SourcesSection } from "@/app/dmscraper/_components/sources-section";
import { RunsSection } from "@/app/dmscraper/_components/runs-section";
import { KeywordsSection } from "@/app/dmscraper/_components/keywords-section";
import {
  DM_AMBIENT_BACKGROUND,
  DM_GRID_TEXTURE
} from "@/app/dm/_components/theme";
import {
  createRadarKeywordAdmin,
  createRadarSourceAdmin,
  deleteRadarKeywordAdmin,
  getRadarCandidateCountsAdmin,
  getRadarCandidatesAdmin,
  getRadarKeywordsAdmin,
  getRadarRunsAdmin,
  getRadarSourceAdmin,
  getRadarSourcesAdmin,
  markRadarCandidateDuplicateAdmin,
  normalizeRadarReviewStatus,
  runRadarScanAdmin,
  setRadarCandidateStatusAdmin,
  setRadarSourceEnabledAdmin,
  updateRadarKeywordAdmin,
  updateRadarSourceAdmin
} from "@/lib/radar-news";
import type { RadarReviewStatus, RadarSourceInput } from "@/lib/radar-news";

// Radar taraması kaynaklar arası rate-limit beklemeleriyle ~2 dk sürebilir;
// server action'ın Vercel/Coolify'da erken kesilmemesi için segmenti yükselt.
export const maxDuration = 300;

export const metadata: Metadata = {
  robots: { index: false, follow: false }
};

interface DmscraperPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function readParam(value: string | string[] | undefined): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? "";
  return "";
}

const inputClass =
  "w-full rounded-[0.85rem] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white placeholder:text-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition focus:border-[#ff2d95]/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-[#ff2d95]/15";

const SECTION_META: Record<ScraperSectionKey, { title: string; description: string }> = {
  kuyruk: {
    title: "Haber kuyruğu",
    description:
      "Radar taraması adayları: skor, gerekçe etiketleri ve onay/ret/kopya/arşiv kararları."
  },
  kaynaklar: {
    title: "Kaynaklar",
    description:
      "RSS / Atom / GDELT kaynak tanımları. Terms doğrulanmadan kaynak aktif edilemez."
  },
  kosular: {
    title: "Koşular",
    description: "Tarama koşu geçmişi — durum, süre ve öğe sayaçları."
  },
  keywords: {
    title: "Keywords",
    description:
      "Alaka skorlama sözlüğü (Almanca, desiremap kategorileri). Negatifler ilk eşleşmede −40."
  }
};

function readSourceInput(formData: FormData): RadarSourceInput {
  return {
    name: (formData.get("name") as string | null) ?? "",
    endpointUrl: (formData.get("endpointUrl") as string | null) ?? "",
    websiteUrl: (formData.get("websiteUrl") as string | null) ?? "",
    sourceType: (formData.get("sourceType") as string | null) ?? "rss",
    adapterKey: (formData.get("adapterKey") as string | null) ?? "rss",
    language: (formData.get("language") as string | null) ?? "",
    country: (formData.get("country") as string | null) ?? "",
    categoryDefault: (formData.get("categoryDefault") as string | null) ?? "",
    trustLevel: (formData.get("trustLevel") as string | null) ?? "standard",
    queryText: (formData.get("queryText") as string | null) ?? "",
    maxItemsPerScan: Number(formData.get("maxItemsPerScan") ?? ""),
    timeoutMs: Number(formData.get("timeoutMs") ?? ""),
    // Server-side terms gate: işaret yoksa is_enabled aşağıda zaten false'a
    // düşer (data katmanı da ayrıca zorlar).
    termsChecked: (formData.get("termsChecked") as string | null) === "1",
    termsNotes: (formData.get("termsNotes") as string | null) ?? "",
    isEnabled: (formData.get("isEnabled") as string | null) === "1"
  };
}

export default async function DmscraperPage({ searchParams }: DmscraperPageProps) {
  const params = searchParams ? await searchParams : {};
  const hasAccess = await isDmscraperAuthenticated();

  if (!hasAccess) {
    return (
      <DmLogin
        signIn={dmscraperSignInAction}
        eyebrow="Admin erişimi"
        title="Radar haber scraper'ı"
        description="Radar tarama hattına erişim korunuyor. Devam etmek için DM admin anahtarını gir."
        submitLabel="Panoyu aç"
        guide={{
          title: "Bu pano ne işe yarar? · Kullanım rehberi",
          intro:
            "Radar, tanımlı haber kaynaklarını (RSS · Atom · GDELT) tarayıp " +
            "DesireMap kategorileriyle alakalı haberleri keyword sözlüğüne göre " +
            "skorlar ve aday kuyruğuna düşürür. Sen sadece kuyruğu inceleyip " +
            "onay/ret kararı verirsin. Kardeş pano /dmscraper2 ise haber değil " +
            "mekan arar — ikisi farklı işler.",
          sections: [
            {
              heading: "Haber kuyruğu",
              text:
                "Tarama adayları skor ve gerekçe etiketleriyle listelenir. " +
                "Onayla, reddet, kopya işaretle veya arşivle. Düşük skorlular " +
                "kuyruğa değil doğrudan arşive gider."
            },
            {
              heading: "Kaynaklar",
              text:
                "RSS / Atom / GDELT kaynak tanımları. Bir kaynağın kullanım " +
                "şartları (terms) onaylanmadan kaynak aktifleştirilemez. " +
                "Tarama buradaki aktif kaynaklar üzerinden koşar."
            },
            {
              heading: "Koşular",
              text:
                "Geçmiş taramaların durumu, süresi ve öğe sayaçları. Manuel " +
                "tarama başlatılabilir; kaynaklar arası bekleme nedeniyle bir " +
                "koşu ~2 dakika sürebilir."
            },
            {
              heading: "Keywords",
              text:
                "Almanca alaka skorlama sözlüğü (desiremap kategorileri). " +
                "Pozitif kelimeler skor ekler, negatif kelime ilk eşleşmede " +
                "−40 uygular. Eşik altı adaylar arşive yazılır."
            }
          ]
        }}
        subtitle="Radar scraper"
      />
    );
  }

  const secParam = readParam(params.sec);
  const activeSection: ScraperSectionKey =
    secParam === "kaynaklar"
      ? "kaynaklar"
      : secParam === "kosular"
        ? "kosular"
        : secParam === "keywords"
          ? "keywords"
          : "kuyruk";

  const radarStatusParam = readParam(params.rstatus);
  const statusFilter: RadarReviewStatus | "all" =
    radarStatusParam === "all"
      ? "all"
      : radarStatusParam
        ? normalizeRadarReviewStatus(radarStatusParam)
        : "pending";
  const editId = readParam(params.edit);
  const scanOkParam = readParam(params.scanok);
  const createdParam = readParam(params.created);
  const updatedParam = readParam(params.updated);
  const deletedParam = readParam(params.deleted);
  const errorParam = readParam(params.error);

  // Sayaçlar her zaman (nav rozeti); bölüm verileri yalnızca kendi görünümünde.
  const counts = await getRadarCandidateCountsAdmin();
  const sources =
    activeSection === "kuyruk" || activeSection === "kaynaklar"
      ? await getRadarSourcesAdmin()
      : [];
  const candidates =
    activeSection === "kuyruk" ? await getRadarCandidatesAdmin(statusFilter, 60) : [];
  const runs =
    activeSection === "kuyruk"
      ? await getRadarRunsAdmin(1)
      : activeSection === "kosular"
        ? await getRadarRunsAdmin(50)
        : [];
  const editingSource =
    activeSection === "kaynaklar" && editId ? await getRadarSourceAdmin(editId) : null;
  const keywords = activeSection === "keywords" ? await getRadarKeywordsAdmin(true) : [];
  const editingKeyword =
    activeSection === "keywords" && editId
      ? (keywords.find((keyword) => keyword.id === editId) ?? null)
      : null;

  // --- Server actions (her biri auth'u yeniden doğrular) ---

  async function scanAction() {
    "use server";
    if (!(await isDmscraperAuthenticated())) {
      redirect("/dmscraper" as Parameters<typeof redirect>[0]);
    }
    const result = await runRadarScanAdmin("manual");
    revalidatePath("/dmscraper");
    const target = result.ok
      ? `/dmscraper?sec=kuyruk&scanok=${result.summary?.insertedCount ?? 0}`
      : `/dmscraper?sec=kuyruk&error=${encodeURIComponent(result.errorMessage ?? "Tarama başarısız.")}`;
    redirect(target as Parameters<typeof redirect>[0]);
  }

  async function candidateStatusAction(formData: FormData) {
    "use server";
    if (!(await isDmscraperAuthenticated())) {
      redirect("/dmscraper" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    const status = normalizeRadarReviewStatus(
      (formData.get("status") as string | null) ?? "pending"
    );
    const note = (formData.get("note") as string | null) ?? "";
    const duplicateOf = (formData.get("duplicateOf") as string | null) ?? "";
    const backFilter = (formData.get("rstatus") as string | null) ?? "pending";

    let errorMessage = "";
    if (id) {
      const result =
        status === "duplicate"
          ? await markRadarCandidateDuplicateAdmin(id, duplicateOf, note)
          : await setRadarCandidateStatusAdmin(id, status, note);
      if (!result.ok) {
        errorMessage = result.errorMessage ?? "İşlem başarısız.";
      }
    }
    revalidatePath("/dmscraper");
    const base = `/dmscraper?sec=kuyruk&rstatus=${encodeURIComponent(backFilter)}`;
    redirect(
      (errorMessage
        ? `${base}&error=${encodeURIComponent(errorMessage)}`
        : base) as Parameters<typeof redirect>[0]
    );
  }

  async function sourceToggleAction(formData: FormData) {
    "use server";
    if (!(await isDmscraperAuthenticated())) {
      redirect("/dmscraper" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    const enabled = (formData.get("enabled") as string | null) === "1";
    let errorMessage = "";
    if (id) {
      if (enabled) {
        // Terms gate: doğrulanmamış kaynak UI toggle'ıyla da açılamaz.
        const source = await getRadarSourceAdmin(id);
        if (!source) {
          errorMessage = "Kaynak bulunamadı.";
        } else if (!source.termsChecked) {
          errorMessage = "Terms doğrulanmadan kaynak aktif edilemez — önce düzenleyip işaretle.";
        }
      }
      if (!errorMessage) {
        const result = await setRadarSourceEnabledAdmin(id, enabled);
        if (!result.ok) errorMessage = result.errorMessage ?? "Güncelleme başarısız.";
      }
    }
    revalidatePath("/dmscraper");
    const base = "/dmscraper?sec=kaynaklar";
    redirect(
      (errorMessage
        ? `${base}&error=${encodeURIComponent(errorMessage)}`
        : base) as Parameters<typeof redirect>[0]
    );
  }

  async function sourceCreateAction(formData: FormData) {
    "use server";
    if (!(await isDmscraperAuthenticated())) {
      redirect("/dmscraper" as Parameters<typeof redirect>[0]);
    }
    const result = await createRadarSourceAdmin(readSourceInput(formData));
    revalidatePath("/dmscraper");
    const target = result.ok
      ? "/dmscraper?sec=kaynaklar&created=1"
      : `/dmscraper?sec=kaynaklar&error=${encodeURIComponent(result.errorMessage ?? "Kaynak oluşturulamadı.")}`;
    redirect(target as Parameters<typeof redirect>[0]);
  }

  async function sourceUpdateAction(formData: FormData) {
    "use server";
    if (!(await isDmscraperAuthenticated())) {
      redirect("/dmscraper" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    if (!id) {
      redirect("/dmscraper?sec=kaynaklar" as Parameters<typeof redirect>[0]);
    }
    const result = await updateRadarSourceAdmin(id, readSourceInput(formData));
    revalidatePath("/dmscraper");
    const target = result.ok
      ? "/dmscraper?sec=kaynaklar&updated=1"
      : `/dmscraper?sec=kaynaklar&edit=${id}&error=${encodeURIComponent(result.errorMessage ?? "Kaynak güncellenemedi.")}`;
    redirect(target as Parameters<typeof redirect>[0]);
  }

  async function keywordCreateAction(formData: FormData) {
    "use server";
    if (!(await isDmscraperAuthenticated())) {
      redirect("/dmscraper" as Parameters<typeof redirect>[0]);
    }
    const result = await createRadarKeywordAdmin({
      keyword: (formData.get("keyword") as string | null) ?? "",
      language: (formData.get("language") as string | null) ?? "",
      category: (formData.get("category") as string | null) ?? "",
      weight: Number(formData.get("weight") ?? ""),
      isNegative: (formData.get("isNegative") as string | null) === "1",
      isEnabled: (formData.get("isEnabled") as string | null) === "1"
    });
    revalidatePath("/dmscraper");
    const target = result.ok
      ? "/dmscraper?sec=keywords&created=1"
      : `/dmscraper?sec=keywords&error=${encodeURIComponent(result.errorMessage ?? "Keyword eklenemedi.")}`;
    redirect(target as Parameters<typeof redirect>[0]);
  }

  async function keywordUpdateAction(formData: FormData) {
    "use server";
    if (!(await isDmscraperAuthenticated())) {
      redirect("/dmscraper" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    if (!id) {
      redirect("/dmscraper?sec=keywords" as Parameters<typeof redirect>[0]);
    }
    const result = await updateRadarKeywordAdmin(id, {
      keyword: (formData.get("keyword") as string | null) ?? "",
      language: (formData.get("language") as string | null) ?? "",
      category: (formData.get("category") as string | null) ?? "",
      weight: Number(formData.get("weight") ?? ""),
      isNegative: (formData.get("isNegative") as string | null) === "1",
      isEnabled: (formData.get("isEnabled") as string | null) === "1"
    });
    revalidatePath("/dmscraper");
    const target = result.ok
      ? "/dmscraper?sec=keywords&updated=1"
      : `/dmscraper?sec=keywords&edit=${id}&error=${encodeURIComponent(result.errorMessage ?? "Keyword güncellenemedi.")}`;
    redirect(target as Parameters<typeof redirect>[0]);
  }

  async function keywordDeleteAction(formData: FormData) {
    "use server";
    if (!(await isDmscraperAuthenticated())) {
      redirect("/dmscraper" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    let errorMessage = "";
    if (id) {
      const result = await deleteRadarKeywordAdmin(id);
      if (!result.ok) errorMessage = result.errorMessage ?? "Silme başarısız.";
    }
    revalidatePath("/dmscraper");
    const base = "/dmscraper?sec=keywords";
    redirect(
      (errorMessage
        ? `${base}&error=${encodeURIComponent(errorMessage)}`
        : `${base}&deleted=1`) as Parameters<typeof redirect>[0]
    );
  }

  const cardClass =
    "rounded-[1.6rem] bg-gradient-to-b from-white/12 via-white/[0.04] to-transparent p-[1.3px] shadow-[0_30px_90px_-30px_rgba(0,0,0,0.85)]";
  const cardInnerClass = "rounded-[1.55rem] bg-[#0a0712]/85 backdrop-blur-2xl";

  const enabledSources = sources.filter((source) => source.isEnabled);
  const lastRun = runs[0] ?? null;

  const flashMessage =
    scanOkParam !== ""
      ? `Tarama tamamlandı — ${scanOkParam} yeni aday kuyruğa eklendi.`
      : createdParam === "1"
        ? activeSection === "keywords"
          ? "Keyword eklendi."
          : "Kaynak eklendi."
        : updatedParam === "1"
          ? activeSection === "keywords"
            ? "Keyword güncellendi."
            : "Kaynak güncellendi."
          : deletedParam === "1"
            ? "Keyword silindi."
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
        <ScraperNav
          activeSection={activeSection}
          items={[
            { key: "kuyruk", label: "Kuyruk", count: counts.pending },
            { key: "kaynaklar", label: "Kaynaklar" },
            { key: "kosular", label: "Koşular" },
            { key: "keywords", label: "Keywords" }
          ]}
          cardClass={cardClass}
          cardInnerClass={cardInnerClass}
          signOutAction={dmscraperSignOutAction}
        />

        <div className="mt-5 flex min-w-0 flex-col gap-5 lg:mt-0">
          {/* Active section header */}
          <section className={cardClass}>
            <div className={`${cardInnerClass} px-5 py-4 sm:px-6`}>
              <p
                className="text-[9px] font-semibold uppercase tracking-[0.28em]"
                style={{ color: "#f0abfc" }}
              >
                DesireMap · radar scraper
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

          {activeSection === "kuyruk" ? (
            <QueueSection
              candidates={candidates}
              counts={counts}
              lastRun={lastRun}
              enabledSourceCount={enabledSources.length}
              totalSourceCount={sources.length}
              statusFilter={statusFilter}
              cardClass={cardClass}
              cardInnerClass={cardInnerClass}
              inputClass={inputClass}
              scanAction={scanAction}
              candidateStatusAction={candidateStatusAction}
            />
          ) : activeSection === "kaynaklar" ? (
            <SourcesSection
              sources={sources}
              editing={editingSource}
              cardClass={cardClass}
              cardInnerClass={cardInnerClass}
              inputClass={inputClass}
              createAction={sourceCreateAction}
              updateAction={sourceUpdateAction}
              toggleAction={sourceToggleAction}
            />
          ) : activeSection === "kosular" ? (
            <RunsSection runs={runs} cardClass={cardClass} cardInnerClass={cardInnerClass} />
          ) : (
            <KeywordsSection
              keywords={keywords}
              editing={editingKeyword}
              cardClass={cardClass}
              cardInnerClass={cardInnerClass}
              inputClass={inputClass}
              createAction={keywordCreateAction}
              updateAction={keywordUpdateAction}
              deleteAction={keywordDeleteAction}
            />
          )}
        </div>
      </div>
    </main>
  );
}
