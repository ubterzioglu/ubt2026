import { DM_BRAND_GRADIENT } from "@/app/dm/_components/theme";
import type {
  RadarCandidateCounts,
  RadarCandidateItem,
  RadarReviewStatus,
  RadarRunItem,
  RadarSourceItem
} from "@/lib/radar-news";

interface ScraperTabProps {
  sources: RadarSourceItem[];
  runs: RadarRunItem[];
  candidates: RadarCandidateItem[];
  counts: RadarCandidateCounts;
  statusFilter: RadarReviewStatus | "all";
  cardClass: string;
  cardInnerClass: string;
  scanAction: () => Promise<void>;
  candidateStatusAction: (formData: FormData) => void | Promise<void>;
  sourceToggleAction: (formData: FormData) => void | Promise<void>;
}

const STATUS_FILTERS: { value: RadarReviewStatus | "all"; label: string }[] = [
  { value: "pending", label: "Bekleyen" },
  { value: "approved", label: "Onaylı" },
  { value: "rejected", label: "Reddedilen" },
  { value: "archived", label: "Arşiv" },
  { value: "all", label: "Tümü" }
];

const RUN_STATUS_BADGE: Record<string, string> = {
  running:
    "border border-cyan-400/35 bg-cyan-400/10 text-cyan-200",
  completed:
    "border border-emerald-400/35 bg-emerald-400/10 text-emerald-200",
  partial:
    "border border-amber-400/40 bg-amber-400/10 text-amber-100",
  failed:
    "border border-[#ff2247]/40 bg-[#ff2247]/10 text-[#ff9fb0]"
};

const RUN_STATUS_LABEL: Record<string, string> = {
  running: "Çalışıyor",
  completed: "Tamamlandı",
  partial: "Kısmi",
  failed: "Başarısız"
};

const chipBase = "rounded-full px-3 py-1 text-[11px] font-semibold transition";
const chipIdle =
  "border border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.07] hover:text-white";
const actionButton =
  "inline-flex min-h-[28px] items-center justify-center rounded-full border px-2.5 py-1 text-[11px] font-semibold transition";

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin"
  }).format(date);
}

function scoreBadgeClass(score: number): string {
  if (score >= 30) {
    return "border border-[#ff2d95]/50 bg-[#ff2d95]/15 text-[#ffd0e6]";
  }
  if (score >= 15) {
    return "border border-violet-400/40 bg-violet-400/12 text-violet-100";
  }
  return "border border-white/[0.14] bg-white/[0.06] text-white/60";
}

/**
 * Radar haber scraper'ı (corteqsmvp portu): kaynak tarama, aday kuyruğu
 * inceleme (onay/ret/arşiv) ve tarama geçmişi. Tüm mutasyonlar page.tsx'teki
 * server action'lar üzerinden yürür.
 */
export function ScraperTab({
  sources,
  runs,
  candidates,
  counts,
  statusFilter,
  cardClass,
  cardInnerClass,
  scanAction,
  candidateStatusAction,
  sourceToggleAction
}: ScraperTabProps) {
  const enabledSources = sources.filter((source) => source.isEnabled);
  const lastRun = runs[0] ?? null;

  return (
    <>
      {/* Stats + scan trigger */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Bekleyen aday", value: String(counts.pending) },
          { label: "Onaylanan", value: String(counts.approved) },
          {
            label: "Son tarama",
            value: lastRun
              ? `${RUN_STATUS_LABEL[lastRun.status] ?? lastRun.status} · ${formatDate(lastRun.startedAt)}`
              : "Henüz yok"
          },
          {
            label: "Kaynaklar",
            value: `${enabledSources.length} aktif / ${sources.length}`
          }
        ].map((stat) => (
          <article
            key={stat.label}
            className={`${cardClass} transition duration-300 hover:-translate-y-0.5`}
          >
            <div className={`${cardInnerClass} px-4 py-3`}>
              <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#f0abfc]/90">
                {stat.label}
              </p>
              <p className="mt-1 truncate font-body text-lg font-bold text-white">
                {stat.value}
              </p>
            </div>
          </article>
        ))}
      </section>

      {/* Manual scan */}
      <section className={cardClass}>
        <div
          className={`${cardInnerClass} flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5`}
        >
          <div>
            <h2 className="font-body text-sm font-semibold text-white">
              Radar taraması
            </h2>
            <p className="mt-1 text-xs leading-5 text-white/50">
              Aktif kaynakları (GDELT + RSS) tarar, yeni adayları kuyruğa ekler.
              Kaynaklar arası bekleme nedeniyle ~1 dk sürebilir.
            </p>
          </div>
          <form action={scanAction}>
            <button
              type="submit"
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-[0.85rem] px-5 py-2.5 text-xs font-bold tracking-tight text-white shadow-[0_14px_44px_-10px_rgba(255,45,149,0.65)] ring-1 ring-inset ring-white/15 transition duration-300 hover:shadow-[0_18px_56px_-10px_rgba(168,85,247,0.85)]"
              style={{ backgroundImage: DM_BRAND_GRADIENT }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"
              />
              Taramayı başlat
            </button>
          </form>
        </div>
      </section>

      {/* Candidate queue */}
      <section className={cardClass}>
        <div className={`${cardInnerClass} px-4 py-4 sm:px-5`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-body text-sm font-semibold text-white">
              Haber kuyruğu
            </h2>
            <div className="flex flex-wrap items-center gap-1.5">
              {STATUS_FILTERS.map((option) => {
                const isActive = statusFilter === option.value;
                const count =
                  option.value === "all"
                    ? counts.pending +
                      counts.approved +
                      counts.rejected +
                      counts.duplicate +
                      counts.archived
                    : counts[option.value];
                return (
                  <a
                    key={option.value}
                    href={`/dm?tab=scraper&rstatus=${option.value}`}
                    className={`${chipBase} ${
                      isActive
                        ? "text-white ring-1 ring-inset ring-white/15"
                        : chipIdle
                    }`}
                    style={
                      isActive ? { backgroundImage: DM_BRAND_GRADIENT } : undefined
                    }
                  >
                    {option.label}
                    <span className="ml-1.5 tabular-nums opacity-70">{count}</span>
                  </a>
                );
              })}
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {candidates.length === 0 ? (
              <p className="rounded-[1rem] border border-dashed border-white/15 px-4 py-8 text-center text-xs text-white/45">
                Bu filtreyle eşleşen aday yok. Yeni adaylar için tarama başlat.
              </p>
            ) : (
              candidates.map((candidate) => (
                <article
                  key={candidate.id}
                  className="rounded-[1rem] border border-white/[0.08] bg-white/[0.02] px-3.5 py-3 transition hover:border-white/20"
                >
                  <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${scoreBadgeClass(candidate.relevanceScore)}`}
                      title={`Alaka skoru: ${candidate.relevanceScore}`}
                    >
                      {Math.round(candidate.relevanceScore)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <a
                        href={candidate.canonicalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-body text-[13px] font-semibold leading-snug text-white transition hover:text-[#67e8f9]"
                      >
                        {candidate.title}
                      </a>
                      <p className="mt-0.5 text-[11px] text-white/40">
                        {[
                          candidate.sourceName,
                          candidate.language,
                          candidate.country,
                          formatDate(candidate.publishedAt)
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      {candidate.summary ? (
                        <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-white/50">
                          {candidate.summary}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {candidate.reviewStatus === "pending" ? (
                        <>
                          <form action={candidateStatusAction}>
                            <input type="hidden" name="id" value={candidate.id} />
                            <input type="hidden" name="status" value="approved" />
                            <input type="hidden" name="rstatus" value={statusFilter} />
                            <button
                              type="submit"
                              className={`${actionButton} border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20`}
                            >
                              Onayla
                            </button>
                          </form>
                          <form action={candidateStatusAction}>
                            <input type="hidden" name="id" value={candidate.id} />
                            <input type="hidden" name="status" value="rejected" />
                            <input type="hidden" name="rstatus" value={statusFilter} />
                            <button
                              type="submit"
                              className={`${actionButton} border-rose-400/30 bg-rose-400/10 text-rose-300 hover:bg-rose-400/20`}
                            >
                              Reddet
                            </button>
                          </form>
                          <form action={candidateStatusAction}>
                            <input type="hidden" name="id" value={candidate.id} />
                            <input type="hidden" name="status" value="archived" />
                            <input type="hidden" name="rstatus" value={statusFilter} />
                            <button
                              type="submit"
                              className={`${actionButton} border-white/10 bg-white/[0.05] text-white/60 hover:text-white`}
                            >
                              Arşivle
                            </button>
                          </form>
                        </>
                      ) : (
                        <form action={candidateStatusAction}>
                          <input type="hidden" name="id" value={candidate.id} />
                          <input type="hidden" name="status" value="pending" />
                          <input type="hidden" name="rstatus" value={statusFilter} />
                          <button
                            type="submit"
                            className={`${actionButton} border-white/10 bg-white/[0.05] text-white/60 hover:text-white`}
                          >
                            Kuyruğa geri al
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Scan history */}
      <section className={cardClass}>
        <div className={`${cardInnerClass} px-4 py-4 sm:px-5`}>
          <h2 className="font-body text-sm font-semibold text-white">
            Tarama geçmişi
          </h2>
          <div className="mt-3 space-y-1.5">
            {runs.length === 0 ? (
              <p className="text-xs text-white/45">Henüz tarama yapılmadı.</p>
            ) : (
              runs.map((run) => (
                <div
                  key={run.id}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-[0.9rem] border border-white/[0.06] bg-white/[0.02] px-3.5 py-2"
                >
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ${RUN_STATUS_BADGE[run.status] ?? RUN_STATUS_BADGE.completed}`}
                  >
                    {RUN_STATUS_LABEL[run.status] ?? run.status}
                  </span>
                  <span className="text-[11px] text-white/60">
                    {formatDate(run.startedAt)}
                  </span>
                  <span className="text-[11px] text-white/40">
                    {run.sourceCount} kaynak · {run.fetchedCount} çekildi ·{" "}
                    {run.insertedCount} yeni · {run.duplicateCount} kopya ·{" "}
                    {run.filteredCount} elendi
                    {run.failedSourceCount > 0
                      ? ` · ${run.failedSourceCount} kaynak hatalı`
                      : ""}
                  </span>
                  {run.errorMessage ? (
                    <span className="text-[11px] text-rose-300/80">
                      {run.errorMessage}
                    </span>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Sources */}
      <section className={cardClass}>
        <div className={`${cardInnerClass} px-4 py-4 sm:px-5`}>
          <h2 className="font-body text-sm font-semibold text-white">Kaynaklar</h2>
          <div className="mt-3 space-y-1.5">
            {sources.map((source) => (
              <div
                key={source.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-[0.9rem] border border-white/[0.06] bg-white/[0.02] px-3.5 py-2"
              >
                <span
                  className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ${
                    source.isEnabled
                      ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                      : "border border-white/10 bg-white/[0.04] text-white/40"
                  }`}
                >
                  {source.isEnabled ? "Aktif" : "Kapalı"}
                </span>
                <span
                  className="min-w-0 flex-1 truncate text-[12px] font-semibold text-white/85"
                  title={source.endpointUrl}
                >
                  {source.name}
                </span>
                <span className="shrink-0 text-[10px] uppercase tracking-[0.12em] text-white/35">
                  {source.sourceType}
                  {source.language ? ` · ${source.language}` : ""}
                </span>
                <span
                  className="hidden shrink-0 text-[10px] text-white/35 md:inline"
                  title={source.lastErrorMessage || undefined}
                >
                  {source.lastErrorAt &&
                  (!source.lastSuccessAt ||
                    source.lastErrorAt > source.lastSuccessAt)
                    ? `Hata: ${formatDate(source.lastErrorAt)}`
                    : `Son başarı: ${formatDate(source.lastSuccessAt)}`}
                </span>
                <form action={sourceToggleAction}>
                  <input type="hidden" name="id" value={source.id} />
                  <input
                    type="hidden"
                    name="enabled"
                    value={source.isEnabled ? "0" : "1"}
                  />
                  <button
                    type="submit"
                    className={`${actionButton} border-white/10 bg-white/[0.05] text-white/60 hover:border-[#67e8f9]/40 hover:text-[#67e8f9]`}
                  >
                    {source.isEnabled ? "Kapat" : "Aç"}
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
