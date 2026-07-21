import { DETRBRIDGE_GOLD } from "@/app/detrbridge/_components/theme";

interface FilterBarProps {
  tab: "logos" | "domains";
  totalCount: number;
  visibleCount: number;
  query: string;
  minRating: string;
  queryPlaceholder: string;
  countLabel: string;
}

const inputClass =
  "w-full rounded-[0.7rem] border border-white/10 bg-white/[0.04] px-3 py-2 text-[13px] text-white placeholder:text-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition focus:border-[#F5B700]/55 focus:bg-white/[0.06] focus:ring-4 focus:ring-[#F5B700]/12";

/**
 * Shared count + filter bar for the Logo/Domain tabs: total item count, a
 * text search (name/uploader) and a minimum-rating select. A plain GET form
 * — no client JS — so it fits the rest of the page's ?tab= link pattern.
 */
export function FilterBar({
  tab,
  totalCount,
  visibleCount,
  query,
  minRating,
  queryPlaceholder,
  countLabel
}: FilterBarProps) {
  const hasActiveFilter = query.trim().length > 0 || minRating.length > 0;

  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl">
      <div className="flex flex-col gap-3 px-6 py-4 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[12px] font-semibold text-white/80"
            title={`Toplam ${totalCount} ${countLabel}`}
          >
            <span style={{ color: DETRBRIDGE_GOLD }}>{totalCount}</span>
            {countLabel}
            {hasActiveFilter ? (
              <span className="text-white/40">· {visibleCount} gösteriliyor</span>
            ) : null}
          </span>
        </div>

        <form
          method="get"
          action="/detrbridge"
          className="flex flex-col gap-2 sm:flex-row sm:items-center"
        >
          <input type="hidden" name="tab" value={tab} />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder={queryPlaceholder}
            className={`${inputClass} sm:flex-1`}
          />
          <select
            name="minRating"
            defaultValue={minRating}
            className={`${inputClass} sm:w-44`}
          >
            <option value="">Tüm puanlar</option>
            <option value="9">9+ puan</option>
            <option value="7">7+ puan</option>
            <option value="5">5+ puan</option>
            <option value="3">3+ puan</option>
          </select>
          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex min-h-[38px] flex-1 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] px-4 text-[12px] font-semibold text-white/85 transition hover:border-[#F5B700]/40 hover:text-[#F5B700] sm:flex-none"
            >
              Filtrele
            </button>
            {hasActiveFilter ? (
              <a
                href={`/detrbridge?tab=${tab}`}
                className="inline-flex min-h-[38px] flex-1 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] px-4 text-[12px] font-semibold text-white/50 transition hover:text-white/80 sm:flex-none"
              >
                Temizle
              </a>
            ) : null}
          </div>
        </form>
      </div>
    </section>
  );
}
