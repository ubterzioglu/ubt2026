// Koşular bölümü: son 50 tarama koşusunun dökümü.

import type { RadarRunItem } from "@/lib/radar-news";

interface RunsSectionProps {
  runs: RadarRunItem[];
  cardClass: string;
  cardInnerClass: string;
}

const RUN_STATUS_BADGE: Record<string, string> = {
  running: "border border-cyan-400/35 bg-cyan-400/10 text-cyan-200",
  completed: "border border-emerald-400/35 bg-emerald-400/10 text-emerald-200",
  partial: "border border-amber-400/40 bg-amber-400/10 text-amber-100",
  failed: "border border-[#ff2247]/40 bg-[#ff2247]/10 text-[#ff9fb0]"
};

const RUN_STATUS_LABEL: Record<string, string> = {
  running: "Çalışıyor",
  completed: "Tamamlandı",
  partial: "Kısmi",
  failed: "Başarısız"
};

const TRIGGER_LABEL: Record<string, string> = {
  cron: "Zamanlanmış",
  manual: "Manuel",
  retry: "Tekrar"
};

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

function formatDuration(start: string, end: string | null): string {
  if (!end) return "—";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "—";
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds} sn`;
  return `${Math.floor(seconds / 60)} dk ${seconds % 60} sn`;
}

export function RunsSection({ runs, cardClass, cardInnerClass }: RunsSectionProps) {
  return (
    <section className={cardClass}>
      <div className={`${cardInnerClass} px-4 py-4 sm:px-5`}>
        <h2 className="font-body text-sm font-semibold text-white">Tarama geçmişi</h2>
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
                  className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ${
                    RUN_STATUS_BADGE[run.status] ?? RUN_STATUS_BADGE.completed
                  }`}
                >
                  {RUN_STATUS_LABEL[run.status] ?? run.status}
                </span>
                <span className="shrink-0 text-[10px] uppercase tracking-[0.12em] text-white/35">
                  {TRIGGER_LABEL[run.triggerType] ?? run.triggerType}
                </span>
                <span className="text-[11px] text-white/60">
                  {formatDate(run.startedAt)}
                </span>
                <span className="text-[11px] text-white/40">
                  {formatDuration(run.startedAt, run.completedAt)}
                </span>
                <span className="text-[11px] text-white/40">
                  {run.sourceCount} kaynak · {run.fetchedCount} çekildi ·{" "}
                  {run.insertedCount} yeni · {run.duplicateCount} kopya ·{" "}
                  {run.filteredCount} elendi
                  {run.failedSourceCount > 0 ? ` · ${run.failedSourceCount} kaynak hatalı` : ""}
                </span>
                {run.errorMessage ? (
                  <span className="text-[11px] text-rose-300/80">{run.errorMessage}</span>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
