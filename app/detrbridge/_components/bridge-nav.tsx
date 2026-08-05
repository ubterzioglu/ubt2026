import { DETRBRIDGE_BRAND_GRADIENT } from "@/app/detrbridge/_components/theme";

export type BridgeTabKey =
  | "welcome"
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
  /** true ise sekme çubukta doğrudan görünür; değilse sağdaki "Diğer" menüsünde. */
  primary?: boolean;
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
 * brand block, the günlük kullanılan sekmeler as inline pills, then — pushed
 * to the right — a "Diğer" dropdown holding the rest, secure badge and
 * sign-out.
 *
 * Sadece `primary` sekmeler çubukta durur; oylama sekmeleri (logo turları,
 * domain) menüye iner, çünkü yedi sekme telefonda taşıp çıkış düğmesini ekran
 * dışına itiyordu. Menü native `<details>` — bu yüzden bileşen hâlâ client JS
 * içermeyen bir Server Component ve sardığı düz `?tab=` linkleriyle aynı
 * şekilde çalışır.
 */
export function BridgeNav({
  activeTab,
  items,
  cardClass,
  cardInnerClass,
  signOutAction
}: BridgeNavProps) {
  const primary = items.filter((item) => item.primary);
  const others = items.filter((item) => !item.primary);
  // Aktif sekme menüdeyse, menü düğmesi onun adını ve aktif stilini alır —
  // yoksa hangi sekmede olduğun çubukta hiç görünmezdi.
  const activeInMenu = others.find((item) => item.key === activeTab) ?? null;

  // The dropdown panel is absolutely positioned and has to escape the header
  // box, so the shared card chrome is reused minus its overflow clip.
  const headerClass = cardClass.replace("overflow-hidden", "").trim();

  return (
    <header className={`sticky top-0 z-20 ${headerClass}`}>
      <div
        className={`${cardInnerClass} flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:px-5`}
      >
        <BrandBlock compact />

        <nav className="order-3 flex min-w-0 w-full flex-1 items-center gap-1.5 overflow-x-auto [scrollbar-width:none] sm:order-none sm:w-auto [&::-webkit-scrollbar]:hidden">
          {primary.map((item) => {
            const isActive = item.key === activeTab;
            return (
              <a
                key={item.key}
                href={`/detrbridge?tab=${item.key}`}
                aria-current={isActive ? "page" : undefined}
                className={
                  isActive
                    ? "flex shrink-0 items-center gap-2 rounded-[1.1rem] px-4 py-2.5 text-xs font-semibold tracking-tight text-white shadow-[0_10px_30px_-10px_rgba(30,58,138,0.7)] ring-1 ring-inset ring-white/15"
                    : "flex shrink-0 items-center gap-2 rounded-[1.1rem] border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-xs font-semibold tracking-tight text-white/60 transition hover:text-white"
                }
                style={isActive ? { backgroundImage: DETRBRIDGE_BRAND_GRADIENT } : undefined}
              >
                <span className="whitespace-nowrap">{item.label}</span>
                {item.count !== undefined ? (
                  <span className={countBadge(isActive)}>{item.count}</span>
                ) : null}
              </a>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {others.length > 0 ? (
            <details className="group relative shrink-0">
              <summary
                className={
                  activeInMenu
                    ? "flex cursor-pointer list-none items-center gap-1.5 rounded-[1.1rem] px-4 py-2.5 text-xs font-semibold tracking-tight text-white ring-1 ring-inset ring-white/15 [&::-webkit-details-marker]:hidden"
                    : "flex cursor-pointer list-none items-center gap-1.5 rounded-[1.1rem] border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs font-semibold tracking-tight text-white/70 transition hover:text-white [&::-webkit-details-marker]:hidden"
                }
                style={
                  activeInMenu ? { backgroundImage: DETRBRIDGE_BRAND_GRADIENT } : undefined
                }
              >
                <span className="whitespace-nowrap">
                  {activeInMenu ? activeInMenu.label : "Diğer"}
                </span>
                <span className={countBadge(Boolean(activeInMenu))}>
                  {activeInMenu?.count ?? others.length}
                </span>
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

              <div className="absolute right-0 top-full z-30 mt-2 flex w-64 max-w-[calc(100vw-2rem)] flex-col gap-1 rounded-[1.25rem] border border-white/10 bg-[#0b1118]/95 p-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl">
                {others.map((item) => (
                  <a
                    key={item.key}
                    href={`/detrbridge?tab=${item.key}`}
                    aria-current={item.key === activeTab ? "page" : undefined}
                    className={`flex items-center justify-between gap-2 rounded-[0.9rem] px-3 py-2.5 text-xs font-semibold tracking-tight transition hover:bg-white/[0.06] hover:text-white ${
                      item.key === activeTab ? "bg-white/[0.06] text-white" : "text-white/65"
                    }`}
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

          <span className="hidden sm:inline-flex">
            <SecureBadge />
          </span>
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
