import { BoardGuide } from "@/app/dm/_components/board-guide";
import type { BoardGuideContent } from "@/app/dm/_components/board-guide";
import { JobsSection } from "@/app/dm/_components/scraper/jobs-section";
import { JobDetailSection } from "@/app/dm/_components/scraper/job-detail-section";
import { TemplatesSection } from "@/app/dm/_components/scraper/templates-section";
import { ProvidersSection } from "@/app/dm/_components/scraper/providers-section";
import { CostsSection } from "@/app/dm/_components/scraper/costs-section";
import {
  scraperCandidateReviewAction,
  scraperJobCancelAction,
  scraperJobCreateAction,
  scraperJobReleaseAction,
  scraperJobRequeueAction,
  scraperJobRunAction,
  scraperProviderToggleAction,
  scraperTemplateToggleAction,
  scraperTemplateUpdateAction
} from "@/app/dm/_scraper-actions";
import {
  getFinderCostSummaryAdmin,
  getFinderJobCountsAdmin,
  getFinderJobDetailAdmin,
  getFinderJobsAdmin,
  getFinderProvidersAdmin,
  getFinderTemplatesAdmin,
  normalizeFinderJobStatus,
  normalizeFinderReviewStatus
} from "@/lib/service-finder";
import type { FinderReviewStatus } from "@/lib/service-finder";

type FinderSectionKey = "isler" | "sablonlar" | "saglayicilar" | "maliyet";

// Collapsed how-to card shown at the top of the Scraper tab.
const FINDER_GUIDE: BoardGuideContent = {
  title: "Bu sekme ne işe yarar? · Kullanım rehberi",
  intro:
    "Service Finder, kategori + şehir bazlı mekan taraması yapar: " +
    "web'den aday mekanları arar, sayfalarından bilgi çıkarır ve " +
    "sınıflandırır (Tavily · SerpAPI · Gemini). Onayladığın adaylar " +
    "DesireMap mekan veritabanını besler. Dört alt bölümden oluşur — " +
    "üstteki şerit ile geçiş yaparsın.",
  sections: [
    {
      heading: "1 · İşler — yeni tarama başlatma",
      text: "Bir kategori + şehir için yeni tarama kuyruğa eklemek için:",
      steps: [
        "'İşler' bölümünde iş oluşturma formunu aç.",
        "Kategori (FKK / Bordell / Studio / Privat gibi bir şablon) ve şehir seç.",
        "İşi kuyruğa ekle — liste başında 'kuyrukta' durumuyla görünür.",
        "İş detayına girip 'Çalıştır'a bas — tarama başlar, tamamlanması birkaç dakika sürebilir.",
        "Bittiğinde bulunan aday mekanlar detay sayfasında listelenir."
      ]
    },
    {
      heading: "2 · İşler — adayları inceleme",
      text: "Bir tarama bitince adayları onaylamak/reddetmek için:",
      steps: [
        "İş detay sayfasında aday listesini aç (varsayılan filtre: 'Beklemede').",
        "Her adayın çıkarılan bilgilerini (isim, adres, iletişim vb.) incele.",
        "Doğru/kullanılabilir adayı 'Onayla' ile DesireMap veritabanına aktar.",
        "Alakasız veya hatalı adayı 'Reddet' ile ele.",
        "Durum filtresiyle daha önce onaylanan/reddedilenleri de görebilirsin."
      ]
    },
    {
      heading: "3 · Şablonlar",
      text: "Aramanın neyi bulacağını şekillendiren kategori + sorgu kalıpları:",
      steps: [
        "'Şablonlar' bölümünde mevcut şablon listesini gör (FKK · Bordell · Studio · Privat).",
        "Bir şablonu düzenlemek için kalem ikonuna tıkla.",
        "Almanca sorgu kalıplarını güncelle — bu kalıplar arama motoruna gönderilir.",
        "Bir şablonu aç/kapat anahtarıyla etkinleştir veya devre dışı bırak."
      ]
    },
    {
      heading: "4 · Sağlayıcılar",
      text: "Taramayı çalıştıran üç dış servis burada yönetilir:",
      steps: [
        "Tavily — arama ve sayfa içeriği ekstraksiyonu yapar; ZORUNLUDUR, anahtarı olmadan tarama çalışmaz.",
        "SerpAPI — Tavily az sonuç döndürünce devreye giren opsiyonel Google fallback'i.",
        "Gemini — bulunan adayları kategori/uygunluk açısından opsiyonel olarak sınıflandırır.",
        "Her sağlayıcının anahtar durumu (bağlı/eksik) ve açık/kapalı anahtarı bu bölümde görünür."
      ]
    },
    {
      heading: "5 · Maliyet",
      text: "Tarama harcamalarını izlemek için:",
      steps: [
        "'Maliyet' bölümünü aç.",
        "Son 30 gün ve tüm zamanlar sekmeleri arasında geçiş yap.",
        "Sağlayıcı bazlı dökümde arama, ekstraksiyon ve sınıflandırma maliyetlerini ayrı ayrı gör."
      ]
    }
  ]
};

function readParam(value: string | string[] | undefined): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? "";
  return "";
}

interface ScraperTabProps {
  params: Record<string, string | string[] | undefined>;
  cardClass: string;
  cardInnerClass: string;
  inputClass: string;
}

/**
 * Service Finder as a /dm tab. Server component: reads its own URL params
 * (?tab=scraper&sec=…&job=…), fetches per-section data and wires the
 * module-level scraper actions into the section components.
 */
export async function ScraperTab({
  params,
  cardClass,
  cardInnerClass,
  inputClass
}: ScraperTabProps) {
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
  const jobStatusFilter = normalizeFinderJobStatus(
    readParam(params.jstatus) || "all"
  );
  const candidateParam = readParam(params.cstatus);
  const candidateFilter: FinderReviewStatus | "all" =
    candidateParam === "all"
      ? "all"
      : candidateParam
        ? normalizeFinderReviewStatus(candidateParam)
        : "pending";
  const editId = readParam(params.edit);
  const flashOk = readParam(params.ok);

  // Chip rozetleri için sayaçlar her zaman; bölüm verileri yalnızca kendi
  // görünümünde çekilir.
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

  const flashMessage =
    flashOk === "created"
      ? "İş kuyruğa eklendi. Detaydan taramayı başlatabilirsin."
      : flashOk === "ran"
        ? `Tarama tamamlandı${readParam(params.n) ? ` — ${readParam(params.n)} aday incelemeye hazır.` : "."}`
        : flashOk === "updated"
          ? "Şablon güncellendi."
          : "";

  const sections: { key: FinderSectionKey; label: string; count?: number }[] = [
    { key: "isler", label: "İşler", count: jobCounts.review },
    { key: "sablonlar", label: "Şablonlar" },
    { key: "saglayicilar", label: "Sağlayıcılar" },
    { key: "maliyet", label: "Maliyet" }
  ];

  return (
    <>
      <BoardGuide
        guide={FINDER_GUIDE}
        cardClass={cardClass}
        cardInnerClass={cardInnerClass}
      />

      {/* Section chip strip (replaces the old standalone FinderNav sidebar) */}
      <section className={cardClass}>
        <div
          className={`${cardInnerClass} flex gap-1.5 overflow-x-auto p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
        >
          {sections.map((section) => {
            const isActive = activeSection === section.key;
            return (
              <a
                key={section.key}
                href={`/dm?tab=scraper&sec=${section.key}`}
                className={`flex shrink-0 items-center gap-2 rounded-[1.1rem] px-4 py-2 text-xs font-semibold tracking-tight transition ${
                  isActive
                    ? "bg-gradient-to-r from-[#ff2d95] via-[#a855f7] to-[#22d3ee] text-white shadow-[0_10px_30px_-10px_rgba(255,45,149,0.7)] ring-1 ring-inset ring-white/15"
                    : "text-white/55 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                {section.label}
                {section.count !== undefined ? (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-white/[0.06] text-white/50"
                    }`}
                  >
                    {section.count}
                  </span>
                ) : null}
              </a>
            );
          })}
        </div>
      </section>

      {flashMessage ? (
        <div className="rounded-[1.1rem] border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-xs font-medium text-emerald-300">
          {flashMessage}
        </div>
      ) : null}

      {activeSection === "isler" && jobDetail ? (
        <JobDetailSection
          detail={jobDetail}
          candidateFilter={candidateFilter}
          cardClass={cardClass}
          cardInnerClass={cardInnerClass}
          inputClass={inputClass}
          runAction={scraperJobRunAction}
          requeueAction={scraperJobRequeueAction}
          releaseAction={scraperJobReleaseAction}
          candidateReviewAction={scraperCandidateReviewAction}
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
            createAction={scraperJobCreateAction}
            runAction={scraperJobRunAction}
            cancelAction={scraperJobCancelAction}
            requeueAction={scraperJobRequeueAction}
            releaseAction={scraperJobReleaseAction}
          />
        </>
      ) : activeSection === "sablonlar" ? (
        <TemplatesSection
          templates={templates}
          editId={editId}
          cardClass={cardClass}
          cardInnerClass={cardInnerClass}
          inputClass={inputClass}
          toggleAction={scraperTemplateToggleAction}
          updateAction={scraperTemplateUpdateAction}
        />
      ) : activeSection === "saglayicilar" ? (
        <ProvidersSection
          providers={providers}
          cardClass={cardClass}
          cardInnerClass={cardInnerClass}
          toggleAction={scraperProviderToggleAction}
        />
      ) : (
        <CostsSection
          last30Days={costs30d}
          allTime={costsAllTime}
          cardClass={cardClass}
          cardInnerClass={cardInnerClass}
        />
      )}
    </>
  );
}
