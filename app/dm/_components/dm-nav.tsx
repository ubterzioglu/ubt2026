import {
  DM_BRAND_GRADIENT,
  DM_CARD_CLASS,
  DM_CARD_INNER_CLASS
} from "@/app/dm/_components/theme";

export type DmTabKey = "tasks" | "findings" | "social" | "info" | "scraper" | "rapor";

export interface DmNavItem {
  key: DmTabKey;
  label: string;
  count?: number;
  href?: string;
}

interface DmNavProps {
  activeTab: DmTabKey;
  items: DmNavItem[];
  signOutAction: () => Promise<void>;
}

export const DM_NAV_ITEMS: readonly DmNavItem[] = [
  { key: "tasks", label: "Görevler" },
  { key: "findings", label: "Test bulguları" },
  { key: "social", label: "İçerik" },
  { key: "info", label: "Önemli bilgiler" },
  { key: "scraper", label: "Scraper" },
  { key: "rapor", label: "Rapor", href: "/dm/rapor" }
];

function BrandBlock() {
  return (
    <div className="flex items-center gap-3">
      <span
        className="relative flex items-center justify-center rounded-xl shadow-lg shadow-[#ff2d95]/30 ring-1 ring-white/15 h-8 w-8"
        style={{ backgroundImage: DM_BRAND_GRADIENT }}
      >
        <span className="font-body font-extrabold tracking-tight text-white text-sm">
          D
        </span>
        <span className="absolute -inset-px rounded-xl ring-1 ring-inset ring-white/10" />
      </span>
      <div className="leading-tight">
        <p
          className="text-[9px] font-semibold uppercase tracking-[0.28em]"
          style={{ color: "#f0abfc" }}
        >
          Proje yönetimi
        </p>
        <p className="mt-0.5 font-body font-bold tracking-[-0.03em] text-white text-sm">
          DesireMap
        </p>
      </div>
    </div>
  );
}

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

function DesktopTopbar({ activeTab, items, signOutAction }: DmNavProps) {
  return (
    <div className={`hidden lg:block ${DM_CARD_CLASS}`}>
      <div
        className={`${DM_CARD_INNER_CLASS} flex items-center gap-4 px-4 py-3 xl:px-5`}
      >
        <div className="shrink-0 border-r border-white/[0.06] pr-4 xl:pr-5">
          <BrandBlock />
        </div>

        <nav className="flex min-w-0 flex-1 gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <a
                key={item.key}
                href={item.href ?? `/dm?tab=${item.key}`}
                className={`flex shrink-0 items-center gap-2 rounded-[1rem] px-3.5 py-2.5 text-[13px] font-semibold tracking-tight transition ${
                  isActive
                    ? "text-white shadow-[0_10px_30px_-10px_rgba(255,45,149,0.7)] ring-1 ring-inset ring-white/15"
                    : "text-white/55 hover:bg-white/[0.04] hover:text-white"
                }`}
                style={
                  isActive ? { backgroundImage: DM_BRAND_GRADIENT } : undefined
                }
              >
                <span>{item.label}</span>
                {item.count !== undefined ? (
                  <span className={countBadge(isActive)}>{item.count}</span>
                ) : null}
              </a>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2 border-l border-white/[0.06] pl-4 xl:pl-5">
          <SecureBadge />
          <form action={signOutAction}>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-rose-400/40 hover:text-rose-300"
            >
              Çıkış yap
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function DmNav({ activeTab, items, signOutAction }: DmNavProps) {
  return (
    <div className="flex flex-col gap-3 lg:sticky lg:top-4 lg:z-20">
      <div className={`lg:hidden ${DM_CARD_CLASS}`}>
        <div
          className={`${DM_CARD_INNER_CLASS} flex items-center justify-between gap-3 px-4 py-3`}
        >
          <BrandBlock />
          <div className="flex items-center gap-2">
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
      </div>

      <nav className={`lg:hidden ${DM_CARD_CLASS}`}>
        <div
          className={`${DM_CARD_INNER_CLASS} flex gap-1.5 overflow-x-auto p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
        >
          {items.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <a
                key={item.key}
                href={item.href ?? `/dm?tab=${item.key}`}
                className={`flex shrink-0 items-center gap-2 rounded-[1.1rem] px-4 py-2.5 text-xs font-semibold tracking-tight transition ${
                  isActive
                    ? "text-white shadow-[0_10px_30px_-10px_rgba(255,45,149,0.7)] ring-1 ring-inset ring-white/15"
                    : "text-white/55 hover:bg-white/[0.04] hover:text-white"
                }`}
                style={
                  isActive ? { backgroundImage: DM_BRAND_GRADIENT } : undefined
                }
              >
                {item.label}
                {item.count !== undefined ? (
                  <span className={countBadge(isActive)}>{item.count}</span>
                ) : null}
              </a>
            );
          })}
        </div>
      </nav>

      <DesktopTopbar
        activeTab={activeTab}
        items={items}
        signOutAction={signOutAction}
      />
    </div>
  );
}
