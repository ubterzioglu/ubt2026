import type { UbtsaVisitsResult } from "@/lib/ubtsa-visits";

interface VisitsSectionProps {
  visits: UbtsaVisitsResult;
}

const DATE_FORMATTER = new Intl.DateTimeFormat("tr-TR", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Berlin"
});

export function formatSignedInAt(value: string): string {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : DATE_FORMATTER.format(parsed);
}

/** Kişi başına toplam giriş sayısı, yeniden eskiye listenin üstünde gösterilir. */
function countByName(names: string[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const name of names) {
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

/**
 * Giriş logları: kim ne zaman panoya girdi.
 *
 * Sadece başarılı girişler yazılır (başarısız denemeler değil) — amaç güvenlik
 * denetimi değil, "karşı taraf baktı mı" sorusunun cevabı.
 */
export function VisitsSection({ visits }: VisitsSectionProps) {
  const totals = countByName(visits.items.map((visit) => visit.name));

  return (
    <section
      id="giris-loglari"
      className="scroll-mt-6 rounded-[1.15rem] border border-slate-200/80 bg-white px-4 py-5 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.25)] sm:px-6 sm:py-6"
    >
      <header className="mb-4 border-b border-slate-100 pb-3.5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
          <span className="inline-flex h-7 items-center justify-center rounded-lg bg-slate-700 px-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white">
            Takip
          </span>
          <h2 className="text-[1.15rem] font-bold leading-snug tracking-[-0.02em] text-slate-800">
            Giriş Logları
          </h2>
          <span className="ml-auto flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-400">
            {totals.map(([name, count]) => (
              <span
                key={name}
                className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 capitalize tabular-nums text-slate-600"
              >
                {name} · {count}
              </span>
            ))}
          </span>
        </div>
      </header>

      {visits.source === "env-missing" && (
        <p className="rounded-[0.9rem] border border-amber-300/60 bg-amber-50 px-4 py-3 text-[13px] font-medium text-amber-800">
          Supabase bağlantısı yapılandırılmamış — giriş logları yüklenemiyor.
        </p>
      )}
      {visits.source === "error" && (
        <p className="rounded-[0.9rem] border border-rose-300/60 bg-rose-50 px-4 py-3 text-[13px] font-medium text-rose-700">
          Giriş logları yüklenirken hata oluştu: {visits.errorMessage}
        </p>
      )}
      {visits.source === "empty" && (
        <p className="rounded-[0.9rem] border border-dashed border-slate-200 px-4 py-6 text-center text-[13px] text-slate-400">
          Henüz kayıtlı giriş yok. Bu tablo, bu özellik eklendikten sonraki
          girişleri gösterir.
        </p>
      )}

      {visits.items.length > 0 && (
        <ol className="divide-y divide-slate-100">
          {visits.items.map((visit, index) => (
            <li
              key={visit.id}
              className="flex items-center gap-3 py-2.5 text-[13.5px]"
            >
              <span
                aria-hidden
                className="w-7 shrink-0 text-right text-[11px] font-bold tabular-nums text-slate-300"
              >
                {index + 1}
              </span>
              <span className="w-20 shrink-0 font-bold capitalize tracking-tight text-teal-800">
                {visit.name}
              </span>
              <span className="min-w-0 flex-1 text-slate-500">
                {formatSignedInAt(visit.signedInAt)}
              </span>
              {index === 0 && (
                <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-emerald-700">
                  Son
                </span>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
