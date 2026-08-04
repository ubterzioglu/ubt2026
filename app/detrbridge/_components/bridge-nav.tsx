import { DETRBRIDGE_BRAND_GRADIENT } from "@/app/detrbridge/_components/theme";

export type BridgeTabKey =
  | "logos"
  | "logos-round2"
  | "domains"
  | "todos"
  | "todos2"
  | "meeting-brief"
  | "visits";

export interface BridgeNavItem {
  key: BridgeTabKey;
  label: string;
  count?: number;
}

interface BridgeNavProps {
  activeTab: BridgeTabKey;
  items: BridgeNavItem[];
  cardClass: string;
  cardInnerClass: string;
  signOutAction: () => Promise<void>;
}

/** Compact brand block shared by the sidebar and the mobile top bar. */
function BrandBlock({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`relative flex items-center justify-center rounded-xl shadow-lg shadow-[#1E3A8A]/30 ring-1 ring-white/15 ${
          compact ? "h-8 w-8" : "h-10 w-10"
        }`}
        style={{ backgroundImage: DETRBRIDGE_BRAND_GRADIENT }}
      >
        <span
          className={`font-body font-extrabold tracking-tight text-black ${
            compact ? "text-sm" : "text-base"
          }`}
        >
          B
        </span>
        <span className="absolute -inset-px rounded-xl ring-1 ring-inset ring-white/10" />
      </span>
      <div className="leading-tight">
        <p
          className="text-[9px] font-semibold uppercase tracking-[0.28em]"
          style={{ color: "#93c5fd" }}
        >
          detrbridge
        </p>
        <p
          className={`mt-0.5 font-body font-bold tracking-[-0.03em] text-white ${
            compact ? "text-sm" : "text-lg"
          }`}
        >
          Panel
        </p>
      </div>
    </div>
  );
}

/** Live "Secure" badge. */
function SecureBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
      </span>
      Secure
    </span>
  );
}

function countBadge(isActive: boolean): string {
  return `rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
    isActive ? "bg-white/20 text-white" : "bg-white/[0.06] text-white/50"
  }`;
}

/**
 * `/detrbridge` navigation. A single sticky top bar on every breakpoint: brand
 * block, the *active* tab as a pill, a dropdown holding every other tab, then
 * secure badge + sign-out.
 *
 * Only the current tab is shown inline because the strip had grown to seven
 * entries and overflowed on phones, pushing the sign-out button off screen. The
 * dropdown is a native <details>, so this stays a Server Component with no
 * client JS — same as the plain ?tab= links it wraps.
 */
export function BridgeNav({
  activeTab,
  items,
  cardClass,
  cardInnerClass,
  signOutAction
}: BridgeNavProps) {
  const active = items.find((item) => item.key === activeTab) ?? items[0];
  const others = items.filter((item) => item.key !== active?.key);

  // The dropdown panel is absolutely positioned and has to escape the header
  // box, so the shared card chrome is reused minus its overflow clip.
  const headerClass = cardClass.replace("overflow-hidden", "").trim();

  return (
    <header className={`sticky top-0 z-20 ${headerClass}`}>
      <div
        className={`${cardInnerClass} flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5`}
      >
        <BrandBlock compact />

        <nav className="order-3 flex min-w-0 flex-1 items-center gap-2 sm:order-none">
          {active ? (
            <a
              href={`/detrbridge?tab=${active.key}`}
              aria-current="page"
              className="flex min-w-0 shrink items-center gap-2 rounded-[1.1rem] px-4 py-2.5 text-xs font-semibold tracking-tight text-white shadow-[0_10px_30px_-10px_rgba(30,58,138,0.7)] ring-1 ring-inset ring-white/15"
              style={{ backgroundImage: DETRBRIDGE_BRAND_GRADIENT }}
            >
              <span className="truncate">{active.label}</span>
              {active.count !== undefined ? (
                <span className={countBadge(true)}>{active.count}</span>
              ) : null}
            </a>
          ) : null}

          {others.length > 0 ? (
            <details className="group relative shrink-0">
              <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-[1.1rem] border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs font-semibold tracking-tight text-white/70 transition hover:text-white [&::-webkit-details-marker]:hidden">
                Diğer
                <span className={countBadge(false)}>{others.length}</span>
                <svg
                  aria-hidden
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform duration-200 group-open:rotate-180"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </summary>

              <div className="absolute left-0 top-full z-30 mt-2 flex w-64 max-w-[calc(100vw-2rem)] flex-col gap-1 rounded-[1.25rem] border border-white/10 bg-[#0b1118]/95 p-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl">
                {others.map((item) => (
                  <a
                    key={item.key}
                    href={`/detrbridge?tab=${item.key}`}
                    className="flex items-center justify-between gap-2 rounded-[0.9rem] px-3 py-2.5 text-xs font-semibold tracking-tight text-white/65 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    <span className="truncate">{item.label}</span>
                    {item.count !== undefined ? (
                      <span className={countBadge(false)}>{item.count}</span>
                    ) : null}
                  </a>
                ))}
              </div>
            </details>
          ) : null}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <SecureBadge />
          <form action={signOutAction}>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-white/80 transition hover:border-rose-400/40 hover:text-rose-300"
            >
              Çıkış
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
