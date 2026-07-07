// Kuyruk bölümü — /dm scraper-tab.tsx'in genişletilmiş hali: skor barı,
// relevanceReasons etiketleri, dil/kategori/ülke/şehir rozetleri ve kart
// başına TEK inceleme formu (not + çoklu submit: onay/ret/kopya/arşiv).

import { DM_BRAND_GRADIENT } from "@/app/dm/_components/theme";
import type {
  RadarCandidateCounts,
  RadarCandidateItem,
  RadarReviewStatus,
  RadarRunItem
} from "@/lib/radar-news";

interface QueueSectionProps {
  candidates: RadarCandidateItem[];
  counts: RadarCandidateCounts;
  lastRun: RadarRunItem | null;
  enabledSourceCount: number;
  totalSourceCount: number;
  statusFilter: RadarReviewStatus | "all";
  cardClass: string;
  cardInnerClass: string;
  inputClass: string;
  scanAction: () => Promise<void>;
  candidateStatusAction: (formData: FormData) => void | Promise<void>;
}

const STATUS_FILTERS: { value: RadarReviewStatus | "all"; label: string }[] = [
  { value: "pending", label: "Bekleyen" },
  { value: "approved", label: "Onaylı" },
  { value: "rejected", label: "Reddedilen" },
  { value: "duplicate", label: "Kopya" },
  { value: "archived", label: "Arşiv" },
  { value: "all", label: "Tümü" }
];

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
const metaBadge =
  "inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/45";

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

function scoreBarColor(score: number): string {
  if (score >= 30) return "#ff2d95";
  if (score >= 15) return "#a855f7";
  return "rgba(255,255,255,0.35)";
}

export function QueueSection({
  candidates,
  counts,
  lastRun,
  enabledSourceCount,
  totalSourceCount,
  statusFilter,
  cardClass,
  cardInnerClass,
  inputClass,
  scanAction,
  candidateStatusAction
}: QueueSectionProps) {
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
            value: `${enabledSourceCount} aktif / ${totalSourceCount}`
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
            <h2 className="font-body text-sm font-semibold text-white">Radar taraması</h2>
            <p className="mt-1 text-xs leading-5 text-white/50">
              Aktif ve terms-onaylı kaynakları tarar, yeni adayları kuyruğa ekler.
              Kaynaklar arası bekleme nedeniyle ~1-2 dk sürebilir.
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
            <h2 className="font-body text-sm font-semibold text-white">Haber kuyruğu</h2>
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
                    href={`/dmscraper?sec=kuyruk&rstatus=${option.value}`}
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
            {candidates.length === 0 ? (
              <p className="rounded-[1rem] border border-dashed border-white/15 px-4 py-8 text-center text-xs text-white/45">
                Bu filtreyle eşleşen aday yok. Yeni adaylar için tarama başlat.
              </p>
            ) : (
              candidates.map((candidate) => {
                const clampedScore = Math.max(0, Math.min(100, candidate.relevanceScore));
                return (
                  <article
                    key={candidate.id}
                    className="rounded-[1rem] border border-white/[0.08] bg-white/[0.02] px-3.5 py-3 transition hover:border-white/20"
                  >
                    <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
                      <div className="flex w-12 shrink-0 flex-col items-center gap-1">
                        <span
                          className="font-body text-sm font-bold tabular-nums text-white"
                          title={`Alaka skoru: ${candidate.relevanceScore}`}
                        >
                          {Math.round(clampedScore)}
                        </span>
                        <span className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                          <span
                            className="block h-full rounded-full"
                            style={{
                              width: `${clampedScore}%`,
                              background: scoreBarColor(clampedScore)
                            }}
                          />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <a
                          href={candidate.canonicalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-body text-[13px] font-semibold leading-snug text-white transition hover:text-[#67e8f9]"
                        >
                          {candidate.title}
                        </a>
                        <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-white/40">
                          <span>{candidate.sourceName}</span>
                          {candidate.language ? (
                            <span className={metaBadge}>{candidate.language}</span>
                          ) : null}
                          {candidate.category ? (
                            <span className={metaBadge}>{candidate.category}</span>
                          ) : null}
                          {candidate.country ? (
                            <span className={metaBadge}>{candidate.country}</span>
                          ) : null}
                          {candidate.city ? (
                            <span className={metaBadge}>{candidate.city}</span>
                          ) : null}
                          <span>{formatDate(candidate.publishedAt)}</span>
                        </p>
                        {candidate.summary ? (
                          <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-white/50">
                            {candidate.summary}
                          </p>
                        ) : null}
                        {candidate.relevanceReasons.length > 0 ? (
                          <p className="mt-1 flex flex-wrap gap-1">
                            {candidate.relevanceReasons.map((reason, index) => (
                              <span
                                key={`${reason.rule}-${index}`}
                                className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-semibold tabular-nums ${
                                  reason.score >= 0
                                    ? "border-emerald-400/25 bg-emerald-400/[0.07] text-emerald-300/90"
                                    : "border-[#ff2247]/30 bg-[#ff2247]/[0.08] text-[#ff9fb0]"
                                }`}
                                title={reason.rule}
                              >
                                {reason.value ?? reason.rule}
                                <span className="ml-1 opacity-70">
                                  {reason.score >= 0 ? `+${reason.score}` : reason.score}
                                </span>
                              </span>
                            ))}
                          </p>
                        ) : null}
                        {candidate.reviewNote ? (
                          <p className="mt-1 text-[11px] text-amber-200/70">
                            Not: {candidate.reviewNote}
                          </p>
                        ) : null}
                        {candidate.reviewStatus === "duplicate" &&
                        candidate.duplicateOfCandidateId ? (
                          <p className="mt-1 text-[10px] text-white/35">
                            Kopya → {candidate.duplicateOfCandidateId}
                          </p>
                        ) : null}
                      </div>
                      <form action={candidateStatusAction} className="w-full sm:w-auto">
                        <input type="hidden" name="id" value={candidate.id} />
                        <input type="hidden" name="rstatus" value={statusFilter} />
                        <div className="flex flex-col gap-1.5">
                          <textarea
                            name="note"
                            rows={1}
                            maxLength={500}
                            placeholder="İnceleme notu (ops.)"
                            defaultValue={candidate.reviewNote}
                            className={`${inputClass} min-w-[180px]`}
                          />
                          {candidate.reviewStatus === "pending" ? (
                            <>
                              <input
                                type="text"
                                name="duplicateOf"
                                placeholder="Kopya ise orijinal aday ID"
                                className={`${inputClass} min-w-[180px]`}
                              />
                              <div className="flex flex-wrap items-center gap-1.5">
                                <button
                                  type="submit"
                                  name="status"
                                  value="approved"
                                  className={`${actionButton} border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20`}
                                >
                                  Onayla
                                </button>
                                <button
                                  type="submit"
                                  name="status"
                                  value="rejected"
                                  className={`${actionButton} border-rose-400/30 bg-rose-400/10 text-rose-300 hover:bg-rose-400/20`}
                                >
                                  Reddet
                                </button>
                                <button
                                  type="submit"
                                  name="status"
                                  value="duplicate"
                                  className={`${actionButton} border-violet-400/30 bg-violet-400/10 text-violet-200 hover:bg-violet-400/20`}
                                  title="Orijinal aday ID'sini yukarıdaki alana gir"
                                >
                                  Kopya
                                </button>
                                <button
                                  type="submit"
                                  name="status"
                                  value="archived"
                                  className={`${actionButton} border-white/10 bg-white/[0.05] text-white/60 hover:text-white`}
                                >
                                  Arşivle
                                </button>
                              </div>
                            </>
                          ) : (
                            <button
                              type="submit"
                              name="status"
                              value="pending"
                              className={`${actionButton} border-white/10 bg-white/[0.05] text-white/60 hover:text-white`}
                            >
                              Kuyruğa geri al
                            </button>
                          )}
                        </div>
                      </form>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </section>
    </>
  );
}
