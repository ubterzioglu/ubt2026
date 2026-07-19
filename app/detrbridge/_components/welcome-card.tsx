import { DETRBRIDGE_BRAND_GRADIENT, DETRBRIDGE_GOLD } from "@/app/detrbridge/_components/theme";

interface WelcomeCardProps {
  isFirstVisit: boolean;
  hoursAfterShare: number;
}

function formatIstanbulDate(now: Date): { day: string; date: string; time: string } {
  const dayFormatter = new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    weekday: "long"
  });
  const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
  const timeFormatter = new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit"
  });
  return {
    day: dayFormatter.format(now),
    date: dateFormatter.format(now),
    time: timeFormatter.format(now)
  };
}

function formatHours(hours: number): string {
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1).replace(".", ",");
}

/**
 * Top-of-panel card: today's TR date/day, plus — on a visitor's first-ever
 * visit only — how many hours after UBT shared the link they showed up.
 */
export function WelcomeCard({ isFirstVisit, hoursAfterShare }: WelcomeCardProps) {
  const { day, date, time } = formatIstanbulDate(new Date());

  return (
    <section
      className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-[1px] backdrop-blur-xl"
      style={{ backgroundImage: DETRBRIDGE_BRAND_GRADIENT }}
    >
      <div className="rounded-[1.45rem] bg-[#07080d]/92 px-6 py-5 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.28em]"
              style={{ color: "#93c5fd" }}
            >
              {day}
            </p>
            <p className="mt-1 font-body text-lg font-bold tracking-tight text-white">
              {date} · {time}
            </p>
          </div>
          {isFirstVisit ? (
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold"
              style={{
                borderColor: "rgba(245,183,0,0.35)",
                background: "rgba(245,183,0,0.10)",
                color: DETRBRIDGE_GOLD
              }}
            >
              Hoş geldin
            </span>
          ) : null}
        </div>

        {isFirstVisit ? (
          <p className="mt-4 text-[13px] leading-6 text-white/70">
            UBT bunu paylaştıktan{" "}
            <span className="font-semibold text-white">{formatHours(hoursAfterShare)} saat</span>{" "}
            sonra siteye ilk defa geldin! Hoş geldin.
          </p>
        ) : null}
      </div>
    </section>
  );
}
