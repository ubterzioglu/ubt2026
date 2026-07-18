// İşler bölümü: yeni iş formu (accordion) + durum filtresi + iş listesi.
// Tüm mutasyonlar page.tsx'teki server action'lar üzerinden yürür.

import { DM_BRAND_GRADIENT } from "@/app/dm/_components/theme";
import type {
  FinderJobCounts,
  FinderJobListItem,
  FinderJobStatus,
  FinderTemplateItem
} from "@/lib/service-finder";
import { formatDate, formatUsd } from "@/app/dm/_components/scraper/format";

interface JobsSectionProps {
  jobs: FinderJobListItem[];
  counts: FinderJobCounts;
  templates: FinderTemplateItem[];
  statusFilter: FinderJobStatus | "all";
  cardClass: string;
  cardInnerClass: string;
  inputClass: string;
  createAction: (formData: FormData) => void | Promise<void>;
  runAction: (formData: FormData) => void | Promise<void>;
  cancelAction: (formData: FormData) => void | Promise<void>;
  requeueAction: (formData: FormData) => void | Promise<void>;
  releaseAction: (formData: FormData) => void | Promise<void>;
}

const STATUS_FILTERS: { value: FinderJobStatus | "all"; label: string }[] = [
  { value: "all", label: "Tümü" },
  { value: "queued", label: "Kuyrukta" },
  { value: "running", label: "Çalışıyor" },
  { value: "review", label: "İncelemede" },
  { value: "failed", label: "Başarısız" },
  { value: "budget_stopped", label: "Bütçe durdu" },
  { value: "cancelled", label: "İptal" }
];

export const JOB_STATUS_BADGE: Record<string, string> = {
  queued: "border border-white/[0.14] bg-white/[0.06] text-white/70",
  running: "border border-cyan-400/35 bg-cyan-400/10 text-cyan-200",
  review: "border border-violet-400/40 bg-violet-400/12 text-violet-100",
  completed: "border border-emerald-400/35 bg-emerald-400/10 text-emerald-200",
  failed: "border border-[#ff2247]/40 bg-[#ff2247]/10 text-[#ff9fb0]",
  cancelled: "border border-white/10 bg-white/[0.04] text-white/40",
  budget_stopped: "border border-amber-400/40 bg-amber-400/10 text-amber-100"
};

export const JOB_STATUS_LABEL: Record<string, string> = {
  queued: "Kuyrukta",
  running: "Çalışıyor",
  review: "İncelemede",
  completed: "Tamamlandı",
  failed: "Başarısız",
  cancelled: "İptal",
  budget_stopped: "Bütçe durdu"
};

const chipBase = "rounded-full px-3 py-1 text-[11px] font-semibold transition";
const chipIdle =
  "border border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.07] hover:text-white";
const actionButton =
  "inline-flex min-h-[28px] items-center justify-center rounded-full border px-2.5 py-1 text-[11px] font-semibold transition";

export function JobsSection({
  jobs,
  counts,
  templates,
  statusFilter,
  cardClass,
  cardInnerClass,
  inputClass,
  createAction,
  runAction,
  cancelAction,
  requeueAction,
  releaseAction
}: JobsSectionProps) {
  const activeTemplates = templates.filter((template) => template.isActive);
  const totalJobs =
    counts.queued +
    counts.running +
    counts.review +
    counts.completed +
    counts.failed +
    counts.cancelled +
    counts.budget_stopped;

  return (
    <>
      {/* Stats */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Toplam iş", value: String(totalJobs) },
          { label: "İncelemede", value: String(counts.review) },
          { label: "Kuyrukta", value: String(counts.queued) },
          { label: "Başarısız", value: String(counts.failed + counts.budget_stopped) }
        ].map((stat) => (
          <article
            key={stat.label}
            className={`${cardClass} transition duration-300 hover:-translate-y-0.5`}
          >
            <div className={`${cardInnerClass} px-4 py-3`}>
              <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#f0abfc]/90">
                {stat.label}
              </p>
              <p className="mt-1 font-body text-xl font-bold text-white">{stat.value}</p>
            </div>
          </article>
        ))}
      </section>

      {/* Yeni iş formu */}
      <section className={cardClass}>
        <details className={`group/acc overflow-hidden rounded-[1.55rem] ${cardInnerClass}`}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 transition hover:bg-white/[0.02] sm:px-5 [&::-webkit-details-marker]:hidden">
            <h2 className="flex items-center gap-2 font-body text-sm font-semibold text-white">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-lg text-white shadow-sm ring-1 ring-white/15"
                style={{ backgroundImage: DM_BRAND_GRADIENT }}
                aria-hidden
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
              </span>
              Yeni tarama işi
            </h2>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white/45 transition-transform duration-300 group-open/acc:rotate-180"
              aria-hidden
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          <div className="border-t border-white/[0.06] px-4 pb-4 pt-3 sm:px-5">
            <form action={createAction} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
                    Başlık <span className="text-[#ff2d95]">*</span>
                  </span>
                  <input
                    type="text"
                    name="title"
                    required
                    minLength={3}
                    maxLength={200}
                    placeholder="ör. FKK Club taraması — Köln"
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
                    Kategori şablonu
                  </span>
                  <select name="template" defaultValue="" className={inputClass}>
                    <option value="" className="bg-[#0a0712] text-white">
                      Şablonsuz (serbest konu)
                    </option>
                    {activeTemplates.map((template) => (
                      <option
                        key={template.id}
                        value={template.id}
                        className="bg-[#0a0712] text-white"
                      >
                        {template.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
                    Şehir <span className="text-[#ff2d95]">*</span>
                  </span>
                  <input
                    type="text"
                    name="city"
                    required
                    maxLength={80}
                    placeholder="ör. Köln"
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
                    Lokasyon etiketi
                  </span>
                  <input
                    type="text"
                    name="location"
                    maxLength={120}
                    placeholder="boşsa şehir kullanılır — ör. Köln, Deutschland"
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
                    Serbest konu (şablonsuzsa zorunlu)
                  </span>
                  <input
                    type="text"
                    name="topic"
                    maxLength={160}
                    placeholder="ör. Swingerclub"
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
                    Soft cap (USD)
                  </span>
                  <input
                    type="number"
                    name="softCap"
                    step="0.1"
                    min="0.1"
                    defaultValue="1.5"
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
                    Hard cap (USD)
                  </span>
                  <input
                    type="number"
                    name="hardCap"
                    step="0.1"
                    min="0.1"
                    defaultValue="3"
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
                    Maks. sorgu
                  </span>
                  <input
                    type="number"
                    name="maxQueries"
                    min="1"
                    max="50"
                    placeholder="şablon varsayılanı"
                    className={inputClass}
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
                    Ön adresler (seed URL — her satıra bir tane)
                  </span>
                  <textarea
                    name="seedUrls"
                    rows={2}
                    placeholder="https://…"
                    className={inputClass}
                  />
                </label>
              </div>
              <button
                type="submit"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-[0.85rem] px-5 py-2.5 text-xs font-bold tracking-tight text-white shadow-[0_14px_44px_-10px_rgba(255,45,149,0.65)] ring-1 ring-inset ring-white/15 transition duration-300 hover:shadow-[0_18px_56px_-10px_rgba(168,85,247,0.85)]"
                style={{ backgroundImage: DM_BRAND_GRADIENT }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                />
                İşi kuyruğa ekle
              </button>
            </form>
          </div>
        </details>
      </section>

      {/* İş listesi */}
      <section className={cardClass}>
        <div className={`${cardInnerClass} px-4 py-4 sm:px-5`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-body text-sm font-semibold text-white">İş kuyruğu</h2>
            <div className="flex flex-wrap items-center gap-1.5">
              {STATUS_FILTERS.map((option) => {
                const isActive = statusFilter === option.value;
                const count =
                  option.value === "all" ? totalJobs : counts[option.value];
                return (
                  <a
                    key={option.value}
                    href={`/dm?tab=scraper&sec=isler&jstatus=${option.value}`}
                    className={`${chipBase} ${
                      isActive ? "text-white ring-1 ring-inset ring-white/15" : chipIdle
                    }`}
                    style={isActive ? { backgroundImage: DM_BRAND_GRADIENT } : undefined}
                  >
                    {option.label}
                    <span className="ml-1.5 tabular-nums opacity-70">{count}</span>
                  </a>
                );
              })}
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {jobs.length === 0 ? (
              <p className="rounded-[1rem] border border-dashed border-white/15 px-4 py-8 text-center text-xs text-white/45">
                Bu filtreyle eşleşen iş yok. Yukarıdan yeni bir tarama işi ekle.
              </p>
            ) : (
              jobs.map((job) => (
                <article
                  key={job.id}
                  className="rounded-[1rem] border border-white/[0.08] bg-white/[0.02] px-3.5 py-3 transition hover:border-white/20"
                >
                  <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ${
                        JOB_STATUS_BADGE[job.status] ?? JOB_STATUS_BADGE.queued
                      }`}
                    >
                      {JOB_STATUS_LABEL[job.status] ?? job.status}
                    </span>
                    <div className="min-w-0 flex-1">
                      <a
                        href={`/dm?tab=scraper&sec=isler&job=${job.id}`}
                        className="font-body text-[13px] font-semibold leading-snug text-white transition hover:text-[#67e8f9]"
                      >
                        {job.title}
                      </a>
                      <p className="mt-0.5 text-[11px] text-white/40">
                        {[
                          job.categorySlug || job.roleKey,
                          job.city || job.locationLabel,
                          `${formatUsd(job.costTotalUsd)} / ${formatUsd(job.hardCapUsd)}`,
                          job.status === "review" && job.candidateCount > 0
                            ? `${job.candidateCount} aday`
                            : null,
                          formatDate(job.createdAt)
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      {job.lastErrorMessage ? (
                        <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-rose-300/80">
                          {job.lastErrorMessage}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <a
                        href={`/dm?tab=scraper&sec=isler&job=${job.id}`}
                        className={`${actionButton} border-white/10 bg-white/[0.05] text-white/60 hover:border-[#67e8f9]/40 hover:text-[#67e8f9]`}
                      >
                        Detay
                      </a>
                      {job.status === "queued" ? (
                        <>
                          <form action={runAction}>
                            <input type="hidden" name="id" value={job.id} />
                            <button
                              type="submit"
                              className={`${actionButton} border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20`}
                            >
                              Çalıştır
                            </button>
                          </form>
                          <form action={cancelAction}>
                            <input type="hidden" name="id" value={job.id} />
                            <button
                              type="submit"
                              className={`${actionButton} border-rose-400/30 bg-rose-400/10 text-rose-300 hover:bg-rose-400/20`}
                            >
                              İptal
                            </button>
                          </form>
                        </>
                      ) : null}
                      {job.status === "failed" ||
                      job.status === "budget_stopped" ||
                      job.status === "cancelled" ? (
                        <form action={requeueAction}>
                          <input type="hidden" name="id" value={job.id} />
                          <button
                            type="submit"
                            className={`${actionButton} border-white/10 bg-white/[0.05] text-white/60 hover:text-white`}
                          >
                            Tekrar kuyruğa al
                          </button>
                        </form>
                      ) : null}
                      {job.status === "running" ? (
                        <form action={releaseAction}>
                          <input type="hidden" name="id" value={job.id} />
                          <button
                            type="submit"
                            className={`${actionButton} border-amber-400/30 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20`}
                            title="Koşu yarıda kaldıysa işi failed'e çekip kilidi açar"
                          >
                            Serbest bırak
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}
