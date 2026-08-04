import { UBTSA_BRAND_GRADIENT } from "@/app/ubtsa/_components/theme";

interface BoardHeaderProps {
  title: string;
  subtitle: string;
  sectionCount: number;
  itemCount: number;
  commentCount: number;
  /** Signed-in name, shown so it is obvious who comments get stamped with. */
  sessionName: string;
  signOutAction: () => void | Promise<void>;
}

/** Hero band: what this document is, how big it is, and who you are on it. */
export function BoardHeader({
  title,
  subtitle,
  sectionCount,
  itemCount,
  commentCount,
  sessionName,
  signOutAction
}: BoardHeaderProps) {
  return (
    <header
      className="overflow-hidden rounded-[1.4rem] px-6 py-7 text-white shadow-[0_24px_60px_-32px_rgba(15,118,110,0.7)] sm:px-8 sm:py-9"
      style={{ backgroundImage: UBTSA_BRAND_GRADIENT }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.3em] text-white/60">
            ubtsa · konsept panosu
          </p>
          <h1 className="mt-2.5 text-[clamp(1.6rem,3.4vw,2.5rem)] font-bold leading-[1.12] tracking-[-0.035em]">
            {title}
          </h1>
          <p className="mt-3 max-w-[62ch] text-[13.5px] leading-6 text-white/75">
            {subtitle}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[12px] font-semibold capitalize backdrop-blur-sm">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-emerald-300"
            />
            {sessionName}
          </span>
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-full border border-white/25 px-3 py-1.5 text-[12px] font-semibold text-white/80 transition hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              Çıkış
            </button>
          </form>
        </div>
      </div>

      <dl className="mt-6 flex flex-wrap gap-2.5">
        <Stat label="bölüm" value={sectionCount} />
        <Stat label="madde" value={itemCount} />
        <Stat label="yorum" value={commentCount} />
      </dl>
    </header>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[0.8rem] border border-white/20 bg-white/10 px-3.5 py-2 backdrop-blur-sm">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">
        {label}
      </dt>
      <dd className="text-[17px] font-bold tabular-nums leading-tight">{value}</dd>
    </div>
  );
}
