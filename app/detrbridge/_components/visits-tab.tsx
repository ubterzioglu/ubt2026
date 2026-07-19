import type { DetrbridgeVisit } from "@/lib/detrbridge-visits";
import { DETRBRIDGE_BRAND_GRADIENT, DETRBRIDGE_GOLD } from "@/app/detrbridge/_components/theme";

interface VisitsTabProps {
  visits: DetrbridgeVisit[];
}

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function formatHours(hours: number): string {
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1).replace(".", ",");
}

/** Admin log: every unique visitor's first-ever arrival, newest first. */
export function VisitsTab({ visits }: VisitsTabProps) {
  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl">
      <div className="px-6 py-5 sm:px-8">
        <h2 className="flex items-center gap-2 font-body text-base font-semibold text-white">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold text-black"
            style={{ backgroundImage: DETRBRIDGE_BRAND_GRADIENT }}
          >
            ⏱
          </span>
          Giriş Logları
        </h2>
        <p className="mt-1 text-[13px] text-white/50">
          Her satır, benzersiz bir ziyaretçinin panele ilk gelişini gösterir.
        </p>
      </div>

      <div className="border-t border-white/[0.06]">
        {visits.length === 0 ? (
          <p className="px-6 py-8 text-center text-[13px] text-white/40 sm:px-8">
            Henüz kayıtlı giriş yok.
          </p>
        ) : (
          <ul className="divide-y divide-white/[0.06]">
            {visits.map((visit) => (
              <li
                key={visit.id}
                className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 sm:px-8"
              >
                <div>
                  <p className="text-sm font-semibold text-white">
                    {formatTimestamp(visit.firstSeenAt)}
                  </p>
                  {visit.userAgent ? (
                    <p className="mt-0.5 max-w-md truncate text-[11px] text-white/40">
                      {visit.userAgent}
                    </p>
                  ) : null}
                </div>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                  style={{
                    borderColor: "rgba(245,183,0,0.35)",
                    background: "rgba(245,183,0,0.10)",
                    color: DETRBRIDGE_GOLD
                  }}
                >
                  Paylaşımdan {formatHours(visit.hoursAfterShare)} saat sonra
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
