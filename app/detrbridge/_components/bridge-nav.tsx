import { DETRBRIDGE_BRAND_GRADIENT } from "@/app/detrbridge/_components/theme";

export type BridgeTabKey = "logos" | "domains" | "todos" | "visits";

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
 * `/detrbridge` navigation. A single sticky top bar on every breakpoint:
 * brand block, a horizontally scrollable tab strip, then secure badge +
 * sign-out. Plain links (?tab=) — no client JS needed. Adding another panel
 * later means extending BridgeTabKey and the items list, nothing structural.
 */
export function BridgeNav({
  activeTab,
  items,
  cardClass,
  cardInnerClass,
  signOutAction
}: BridgeNavProps) {
  return (
    <header className={`sticky top-0 z-20 ${cardClass}`}>
      <div
        className={`${cardInnerClass} flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5`}
      >
        <BrandBlock compact />

        <nav className="order-3 flex min-w-0 flex-1 gap-1.5 overflow-x-auto py-0.5 [scrollbar-width:none] sm:order-none [&::-webkit-scrollbar]:hidden">
          {items.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <a
                key={item.key}
                href={`/detrbridge?tab=${item.key}`}
                className={`flex shrink-0 items-center gap-2 rounded-[1.1rem] px-4 py-2.5 text-xs font-semibold tracking-tight transition ${
                  isActive
                    ? "text-white shadow-[0_10px_30px_-10px_rgba(30,58,138,0.7)] ring-1 ring-inset ring-white/15"
                    : "text-white/55 hover:bg-white/[0.04] hover:text-white"
                }`}
                style={
                  isActive ? { backgroundImage: DETRBRIDGE_BRAND_GRADIENT } : undefined
                }
              >
                {item.label}
                {item.count !== undefined ? (
                  <span className={countBadge(isActive)}>{item.count}</span>
                ) : null}
              </a>
            );
          })}
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
