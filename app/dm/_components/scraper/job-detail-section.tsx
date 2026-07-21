// İş detayı: durum kartı + aday inceleme kuyruğu + sorgu/kaynak/olay dökümleri.
// Aday kartı başına TEK form — çoklu submit butonu (name="status") ile karar verilir.

import { DM_BRAND_GRADIENT } from "@/app/dm/_components/theme";
import type {
  FinderJobDetail,
  FinderReviewStatus
} from "@/lib/service-finder";
import { formatDate, formatUsd } from "@/app/dm/_components/scraper/format";
import {
  JOB_STATUS_BADGE,
  JOB_STATUS_LABEL
} from "@/app/dm/_components/scraper/jobs-section";

interface JobDetailSectionProps {
  detail: FinderJobDetail;
  candidateFilter: FinderReviewStatus | "all";
  cardClass: string;
  cardInnerClass: string;
  inputClass: string;
  runAction: (formData: FormData) => void | Promise<void>;
  requeueAction: (formData: FormData) => void | Promise<void>;
  releaseAction: (formData: FormData) => void | Promise<void>;
  candidateReviewAction: (formData: FormData) => void | Promise<void>;
}

const CANDIDATE_FILTERS: { value: FinderReviewStatus | "all"; label: string }[] = [
  { value: "pending", label: "Bekleyen" },
  { value: "approved", label: "Onaylı" },
  { value: "rejected", label: "Reddedilen" },
  { value: "needs_edit", label: "Düzenleme ister" },
  { value: "all", label: "Tümü" }
];

const REVIEW_BADGE: Record<string, string> = {
  pending: "border border-white/[0.14] bg-white/[0.06] text-white/70",
  approved: "border border-emerald-400/35 bg-emerald-400/10 text-emerald-200",
  rejected: "border border-[#ff2247]/40 bg-[#ff2247]/10 text-[#ff9fb0]",
  needs_edit: "border border-amber-400/40 bg-amber-400/10 text-amber-100",
  published: "border border-violet-400/40 bg-violet-400/12 text-violet-100"
};

const FETCH_STATUS_LABEL: Record<string, string> = {
  discovered: "Keşfedildi",
  queued: "Kuyrukta",
  fetched: "Çekildi",
  blocked_robots: "robots engelledi",
  failed: "Hatalı",
  duplicate: "Kopya",
  irrelevant: "Alakasız"
};

const chipBase = "rounded-full px-3 py-1 text-[11px] font-semibold transition";
const chipIdle =
  "border border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.07] hover:text-white";
const actionButton =
  "inline-flex min-h-[28px] items-center justify-center rounded-full border px-2.5 py-1 text-[11px] font-semibold transition";

function confidenceBadgeClass(score: number): string {
  if (score >= 70) return "border border-emerald-400/40 bg-emerald-400/12 text-emerald-200";
  if (score >= 50) return "border border-violet-400/40 bg-violet-400/12 text-violet-100";
  return "border border-white/[0.14] bg-white/[0.06] text-white/60";
}

export function JobDetailSection({
  detail,
  candidateFilter,
  cardClass,
  cardInnerClass,
  inputClass,
  runAction,
  requeueAction,
  releaseAction,
  candidateReviewAction
}: JobDetailSectionProps) {
  const { job, queries, sources, candidates, events } = detail;
  const progressStage =
    typeof job.progress["stage"] === "string" ? (job.progress["stage"] as string) : "";

  return (
    <>
      {/* Durum kartı */}
      <section className={cardClass}>
        <div className={`${cardInnerClass} px-4 py-4 sm:px-5`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ${
                    JOB_STATUS_BADGE[job.status] ?? JOB_STATUS_BADGE.queued
                  }`}
                >
                  {JOB_STATUS_LABEL[job.status] ?? job.status}
                </span>
                <h2 className="font-body text-sm font-semibold text-white">{job.title}</h2>
              </div>
              <p className="mt-1 text-[11px] text-white/40">
                {[
                  job.categorySlug || job.roleKey,
                  job.city || job.locationLabel,
                  `Maliyet ${formatUsd(job.costTotalUsd)} (soft ${formatUsd(job.softCapUsd)} · hard ${formatUsd(job.hardCapUsd)})`,
                  `${job.attempts}. deneme`,
                  progressStage && job.status === "running" ? `aşama: ${progressStage}` : null,
                  formatDate(job.createdAt)
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {job.lastErrorMessage ? (
                <p className="mt-1 text-[11px] leading-5 text-rose-300/80">
                  {job.lastErrorCode ? `[${job.lastErrorCode}] ` : ""}
                  {job.lastErrorMessage}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <a
                href="/dm?tab=scraper&sec=isler"
                className={`${actionButton} border-white/10 bg-white/[0.05] text-white/60 hover:text-white`}
              >
                ← İş listesi
              </a>
              {job.status === "queued" ? (
                <form action={runAction}>
                  <input type="hidden" name="id" value={job.id} />
                  <button
                    type="submit"
                    className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-[0.85rem] px-4 py-2 text-xs font-bold tracking-tight text-white shadow-[0_14px_44px_-10px_rgba(255,45,149,0.65)] ring-1 ring-inset ring-white/15 transition duration-300"
                    style={{ backgroundImage: DM_BRAND_GRADIENT }}
                  >
                    Taramayı başlat
                  </button>
                </form>
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
                  >
                    Serbest bırak
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Aday kuyruğu */}
      <section className={cardClass}>
        <div className={`${cardInnerClass} px-4 py-4 sm:px-5`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-body text-sm font-semibold text-white">
              Adaylar <span className="text-white/40">({candidates.length})</span>
            </h2>
            <div className="flex flex-wrap items-center gap-1.5">
              {CANDIDATE_FILTERS.map((option) => {
                const isActive = candidateFilter === option.value;
                return (
                  <a
                    key={option.value}
                    href={`/dm?tab=scraper&sec=isler&job=${job.id}&cstatus=${option.value}`}
                    className={`${chipBase} ${
                      isActive ? "text-white ring-1 ring-inset ring-white/15" : chipIdle
                    }`}
                    style={isActive ? { backgroundImage: DM_BRAND_GRADIENT } : undefined}
                  >
                    {option.label}
                  </a>
                );
              })}
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {candidates.length === 0 ? (
              <p className="rounded-[1rem] border border-dashed border-white/15 px-4 py-8 text-center text-xs text-white/45">
                Bu filtreyle eşleşen aday yok.
              </p>
            ) : (
              candidates.map((candidate) => (
                <article
                  key={candidate.id}
                  className="rounded-[1rem] border border-white/[0.08] bg-white/[0.02] px-3.5 py-3 transition hover:border-white/20"
                >
                  <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${confidenceBadgeClass(candidate.confidenceScore)}`}
                      title={`Güven skoru: ${candidate.confidenceScore}`}
                    >
                      {Math.round(candidate.confidenceScore)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {candidate.websiteUrl ? (
                          <a
                            href={candidate.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-body text-[13px] font-semibold leading-snug text-white transition hover:text-[#67e8f9]"
                          >
                            {candidate.canonicalName}
                          </a>
                        ) : (
                          <span className="font-body text-[13px] font-semibold leading-snug text-white">
                            {candidate.canonicalName}
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ${
                            REVIEW_BADGE[candidate.reviewStatus] ?? REVIEW_BADGE.pending
                          }`}
                        >
                          {candidate.reviewStatus}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-white/40">
                        {[
                          candidate.categorySlug,
                          [candidate.street, candidate.houseNumber].filter(Boolean).join(" ") ||
                            candidate.addressLine,
                          [candidate.postalCode, candidate.city].filter(Boolean).join(" "),
                          candidate.languages.join("/")
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      {candidate.services.length > 0 ? (
                        <p className="mt-0.5 text-[11px] text-white/45">
                          {candidate.services.slice(0, 8).join(", ")}
                        </p>
                      ) : null}
                      {candidate.contacts.length > 0 ? (
                        <p className="mt-0.5 text-[11px] text-white/50">
                          {candidate.contacts
                            .map((contact) => `${contact.type}: ${contact.value}`)
                            .join(" · ")}
                        </p>
                      ) : null}
                      {candidate.selfStatements.length > 0 ? (
                        <details className="mt-1">
                          <summary className="cursor-pointer text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-200/60 hover:text-amber-200/90">
                            Öz-tanım ({candidate.selfStatements.length})
                          </summary>
                          <ul className="mt-1 space-y-1">
                            {candidate.selfStatements.map((entry, index) => (
                              <li
                                key={index}
                                className="rounded-[0.6rem] border border-amber-400/[0.12] bg-amber-400/[0.04] px-2.5 py-1.5 text-[11px] italic leading-4 text-amber-100/70"
                              >
                                “{entry.quote}”
                              </li>
                            ))}
                          </ul>
                        </details>
                      ) : null}
                      {candidate.evidence.length > 0 ? (
                        <details className="mt-1">
                          <summary className="cursor-pointer text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35 hover:text-white/60">
                            Kanıt alıntıları ({candidate.evidence.length})
                          </summary>
                          <ul className="mt-1 space-y-1">
                            {candidate.evidence.map((entry, index) => (
                              <li
                                key={index}
                                className="rounded-[0.6rem] border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-[11px] italic leading-4 text-white/55"
                              >
                                “{entry.quote}”
                              </li>
                            ))}
                          </ul>
                        </details>
                      ) : null}
                      {candidate.sourceUrls.length > 0 ? (
                        <p className="mt-1 truncate text-[10px] text-white/30">
                          Kaynak:{" "}
                          <a
                            href={candidate.sourceUrls[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#67e8f9]/70 hover:text-[#67e8f9]"
                          >
                            {candidate.sourceUrls[0]}
                          </a>
                        </p>
                      ) : null}
                      {candidate.reviewNotes ? (
                        <p className="mt-1 text-[11px] text-amber-200/70">
                          Not: {candidate.reviewNotes}
                        </p>
                      ) : null}
                    </div>
                    <form action={candidateReviewAction} className="w-full sm:w-auto">
                      <input type="hidden" name="id" value={candidate.id} />
                      <input type="hidden" name="job" value={job.id} />
                      <input type="hidden" name="cstatus" value={candidateFilter} />
                      <div className="flex flex-col gap-1.5">
                        <textarea
                          name="note"
                          rows={1}
                          maxLength={500}
                          placeholder="İnceleme notu (ops.)"
                          defaultValue={candidate.reviewNotes}
                          className={`${inputClass} min-w-[180px]`}
                        />
                        <div className="flex flex-wrap items-center gap-1.5">
                          {candidate.reviewStatus === "pending" ? (
                            <>
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
                                value="needs_edit"
                                className={`${actionButton} border-amber-400/30 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20`}
                              >
                                Düzenleme ister
                              </button>
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
                      </div>
                    </form>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Sorgular */}
      <section className={cardClass}>
        <div className={`${cardInnerClass} px-4 py-4 sm:px-5`}>
          <h2 className="font-body text-sm font-semibold text-white">
            Sorgular <span className="text-white/40">({queries.length})</span>
          </h2>
          <div className="mt-3 space-y-1.5">
            {queries.length === 0 ? (
              <p className="text-xs text-white/45">Henüz sorgu çalışmadı.</p>
            ) : (
              queries.map((query) => (
                <div
                  key={query.id}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-[0.9rem] border border-white/[0.06] bg-white/[0.02] px-3.5 py-2"
                >
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ${
                      query.status === "succeeded"
                        ? "border border-emerald-400/35 bg-emerald-400/10 text-emerald-200"
                        : "border border-[#ff2247]/40 bg-[#ff2247]/10 text-[#ff9fb0]"
                    }`}
                  >
                    {query.providerKey}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[12px] text-white/80">
                    {query.queryText}
                  </span>
                  <span className="shrink-0 text-[10px] text-white/35">
                    {query.resultCount} sonuç · {formatUsd(query.estimatedCostUsd)} ·{" "}
                    {formatDate(query.executedAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Kaynaklar */}
      <section className={cardClass}>
        <div className={`${cardInnerClass} px-4 py-4 sm:px-5`}>
          <h2 className="font-body text-sm font-semibold text-white">
            Kaynak URL&apos;leri <span className="text-white/40">({sources.length})</span>
          </h2>
          <div className="mt-3 space-y-1.5">
            {sources.length === 0 ? (
              <p className="text-xs text-white/45">Henüz kaynak keşfedilmedi.</p>
            ) : (
              sources.map((source) => (
                <div
                  key={source.id}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-[0.9rem] border border-white/[0.06] bg-white/[0.02] px-3.5 py-2"
                >
                  <span className="inline-flex shrink-0 items-center rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/50">
                    {FETCH_STATUS_LABEL[source.fetchStatus] ?? source.fetchStatus}
                  </span>
                  <a
                    href={source.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-0 flex-1 truncate text-[12px] text-white/70 transition hover:text-[#67e8f9]"
                    title={source.sourceTitle || source.sourceUrl}
                  >
                    {source.sourceDomain}
                    <span className="text-white/35"> — {source.sourceTitle || source.sourceUrl}</span>
                  </a>
                  <span className="shrink-0 text-[10px] uppercase tracking-[0.12em] text-white/30">
                    {source.providerKey}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Olay günlüğü */}
      <section className={cardClass}>
        <div className={`${cardInnerClass} px-4 py-4 sm:px-5`}>
          <h2 className="font-body text-sm font-semibold text-white">Olay günlüğü</h2>
          <div className="mt-3 space-y-1.5">
            {events.length === 0 ? (
              <p className="text-xs text-white/45">Henüz olay yok.</p>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[0.9rem] border border-white/[0.06] bg-white/[0.02] px-3.5 py-2"
                >
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ${
                      event.eventLevel === "error"
                        ? "border border-[#ff2247]/40 bg-[#ff2247]/10 text-[#ff9fb0]"
                        : event.eventLevel === "warn"
                          ? "border border-amber-400/40 bg-amber-400/10 text-amber-100"
                          : "border border-white/10 bg-white/[0.04] text-white/50"
                    }`}
                  >
                    {event.eventType}
                  </span>
                  <span className="min-w-0 flex-1 text-[11px] text-white/60">
                    {event.message}
                  </span>
                  <span className="shrink-0 text-[10px] text-white/30">
                    {formatDate(event.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}
