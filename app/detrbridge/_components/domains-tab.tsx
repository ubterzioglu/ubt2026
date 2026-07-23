import type { DetrbridgeDomain } from "@/lib/detrbridge-domains";
import { DETRBRIDGE_BRAND_GRADIENT, DETRBRIDGE_GOLD } from "@/app/detrbridge/_components/theme";
import { NumberPicker } from "@/app/detrbridge/_components/number-picker";
import { FilterBar } from "@/app/detrbridge/_components/filter-bar";

type ServerFormAction = (formData: FormData) => void | Promise<void>;

interface DomainsTabProps {
  domains: DetrbridgeDomain[];
  totalCount: number;
  query: string;
  minRating: string;
  createAction: ServerFormAction;
  voteAction: ServerFormAction;
  selectAction: ServerFormAction;
  deleteAction: ServerFormAction;
}

const darkInput =
  "w-full rounded-[0.7rem] border border-white/10 bg-white/[0.04] px-3 py-2 text-[13px] text-white placeholder:text-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition focus:border-[#F5B700]/55 focus:bg-white/[0.06] focus:ring-4 focus:ring-[#F5B700]/12";
const formLabel =
  "mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50";

/** Read-only average-rating badge, e.g. 7.2/10 (5 oy). */
const CURRENCY_SYMBOL: Record<string, string> = { EUR: "€", USD: "$", TRY: "₺" };

/** Yearly price block: discounted price, retail strikethrough, and % off. */
function PriceBlock({
  priceYearly,
  retailPriceYearly,
  priceCurrency
}: {
  priceYearly: number | null;
  retailPriceYearly: number | null;
  priceCurrency: string;
}) {
  if (priceYearly === null && retailPriceYearly === null) return null;
  const symbol = CURRENCY_SYMBOL[priceCurrency] ?? priceCurrency;
  const discountPct =
    priceYearly !== null && retailPriceYearly !== null && retailPriceYearly > 0
      ? Math.round((1 - priceYearly / retailPriceYearly) * 100)
      : null;

  return (
    <div className="flex items-center justify-between rounded-[0.8rem] border border-white/[0.06] bg-white/[0.02] px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
        Yıllık fiyat
      </p>
      <div className="flex items-center gap-2">
        {discountPct !== null && discountPct > 0 ? (
          <span
            className="inline-flex shrink-0 items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300"
            title={`${discountPct}% indirim`}
          >
            %{discountPct} OFF
          </span>
        ) : null}
        <span className="text-[13px] font-bold text-white">
          {priceYearly !== null ? `${symbol}${priceYearly.toFixed(2)}/yr` : "—"}
        </span>
        {retailPriceYearly !== null ? (
          <span className="text-[11px] text-white/40 line-through">
            {symbol}
            {retailPriceYearly.toFixed(2)}/yr
          </span>
        ) : null}
      </div>
    </div>
  );
}

function RatingBadge({
  averageRating,
  voteCount
}: {
  averageRating: number | null;
  voteCount: number;
}) {
  if (averageRating === null) {
    return (
      <span className="inline-flex shrink-0 items-center rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] font-semibold text-white/40">
        Henüz oy yok
      </span>
    );
  }
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[11px] font-semibold tracking-[0.08em]"
      style={{ color: DETRBRIDGE_GOLD }}
      title={`${averageRating.toFixed(1)}/10 · ${voteCount} oy`}
    >
      {averageRating.toFixed(1)}/10 ({voteCount})
    </span>
  );
}

/**
 * Domain Önerileri panel: same mechanics as Logo Seçimi (suggest, vote 1-10
 * with one vote per name per domain, rank by average, single-select "Seç")
 * but text-only — no file upload, since a domain suggestion is just a name.
 */
export function DomainsTab({
  domains,
  totalCount,
  query,
  minRating,
  createAction,
  voteAction,
  selectAction,
  deleteAction
}: DomainsTabProps) {
  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl">
        <div className="px-6 py-5 sm:px-8">
          <h2 className="flex items-center gap-2 font-body text-base font-semibold text-white">
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold text-black"
              style={{ backgroundImage: DETRBRIDGE_BRAND_GRADIENT }}
            >
              +
            </span>
            Yeni domain öner
          </h2>

          <details className="group/guide mt-3 overflow-hidden rounded-[1rem] border border-rose-400/40 bg-rose-400/[0.08] shadow-[0_0_0_1px_rgba(251,113,133,0.15)]">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-2.5 text-[12px] font-bold text-rose-300 transition hover:text-rose-200 [&::-webkit-details-marker]:hidden">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              Sistem nasıl çalışıyor?
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-auto text-rose-300/70 transition-transform duration-200 group-open/guide:rotate-180"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            <ol className="space-y-2 border-t border-rose-400/20 px-4 py-3 text-[13px] leading-5 text-white/70">
              <li>
                <span className="font-semibold text-white/85">① Domain öner</span> — ismini
                yaz; öneren olarak giriş yaptığın isim otomatik kaydedilir.
              </li>
              <li>
                <span className="font-semibold text-white/85">② Oy ver</span> — 1-10 arası
                puan verilir, kişi başı bir domaine tek oy hakkı vardır (tekrar oylarsan
                önceki oyunun yerine geçer).
              </li>
              <li>
                <span className="font-semibold text-white/85">③ Sıralama</span> — liste
                ortalama puana göre en yüksekten düşüğe sıralanır.
              </li>
              <li>
                <span className="font-semibold text-white/85">④ Seçim</span> — beğenilen
                domain &quot;Seç&quot; ile işaretlenir; her seferinde sadece bir domain
                seçili kalır.
              </li>
            </ol>
          </details>

          <form action={createAction} className="mt-4 space-y-4">
            <label className="block">
              <span className={formLabel}>
                Domain adı <span style={{ color: DETRBRIDGE_GOLD }}>*</span>
              </span>
              <input
                type="text"
                name="domainName"
                required
                minLength={3}
                maxLength={200}
                placeholder="örnek: corteqs.com"
                className={darkInput}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className={formLabel}>Yıllık fiyat (indirimli)</span>
                <input
                  type="number"
                  name="priceYearly"
                  step="0.01"
                  min="0"
                  placeholder="örnek: 7.43"
                  className={darkInput}
                />
              </label>
              <label className="block">
                <span className={formLabel}>Retail yıllık fiyat</span>
                <input
                  type="number"
                  name="retailPriceYearly"
                  step="0.01"
                  min="0"
                  placeholder="örnek: 12.69"
                  className={darkInput}
                />
              </label>
            </div>
            <label className="block">
              <span className={formLabel}>Para birimi</span>
              <select name="priceCurrency" defaultValue="EUR" className={darkInput}>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="TRY">TRY (₺)</option>
              </select>
            </label>
            <button
              type="submit"
              className="inline-flex min-h-[44px] items-center justify-center rounded-[0.9rem] px-6 py-2.5 text-[13px] font-bold tracking-tight text-black shadow-[0_12px_40px_-8px_rgba(30,58,138,0.5)] ring-1 ring-inset ring-white/15 transition hover:shadow-[0_16px_50px_-8px_rgba(245,183,0,0.6)]"
              style={{ backgroundImage: DETRBRIDGE_BRAND_GRADIENT }}
            >
              Domain öner
            </button>
          </form>
        </div>
      </section>

      <FilterBar
        tab="domains"
        totalCount={totalCount}
        visibleCount={domains.length}
        query={query}
        minRating={minRating}
        queryPlaceholder="Domain veya öneren adına göre ara..."
        countLabel="domain"
      />

      <section>
        {domains.length === 0 ? (
          <p className="rounded-[1.3rem] border border-dashed border-white/15 px-5 py-8 text-center text-[13px] text-white/50">
            {totalCount === 0
              ? "Henüz domain önerilmedi. Yukarıdan ilk öneriyi ekle."
              : "Filtreyle eşleşen domain bulunamadı."}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {domains.map((domain) => (
              <DomainRow
                key={domain.id}
                domain={domain}
                voteAction={voteAction}
                selectAction={selectAction}
                deleteAction={deleteAction}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

interface DomainRowProps {
  domain: DetrbridgeDomain;
  voteAction: ServerFormAction;
  selectAction: ServerFormAction;
  deleteAction: ServerFormAction;
}

function DomainRow({ domain, voteAction, selectAction, deleteAction }: DomainRowProps) {
  return (
    <article
      className={`flex flex-col overflow-hidden rounded-[1.2rem] border bg-white/[0.03] backdrop-blur-xl transition hover:border-white/20 ${
        domain.isSelected ? "border-emerald-400/40" : "border-white/10"
      }`}
    >
      <div className="relative flex items-center justify-between gap-2 border-b border-white/[0.06] bg-white/[0.04] px-4 py-4">
        <p
          className="truncate font-body text-[16px] font-bold text-white"
          title={domain.domainName}
        >
          {domain.domainName}
        </p>
        {domain.isSelected ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
            ✓ Seçildi
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="rounded-[0.8rem] border border-white/[0.06] bg-white/[0.02] px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
            Öneren
          </p>
          <p
            className="truncate font-body text-[14px] font-semibold text-white"
            title={domain.uploaderName}
          >
            {domain.uploaderName}
          </p>
        </div>

        <div className="flex items-center justify-between rounded-[0.8rem] border border-white/[0.06] bg-white/[0.02] px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
            Puan
          </p>
          <RatingBadge averageRating={domain.averageRating} voteCount={domain.voteCount} />
        </div>

        <PriceBlock
          priceYearly={domain.priceYearly}
          retailPriceYearly={domain.retailPriceYearly}
          priceCurrency={domain.priceCurrency}
        />

        <div className="mt-1 flex items-center gap-2">
          {domain.isSelected ? null : (
            <form action={selectAction} className="flex-1">
              <input type="hidden" name="id" value={domain.id} />
              <button
                type="submit"
                className="inline-flex min-h-[36px] w-full items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[12px] font-semibold text-white/80 transition hover:border-emerald-400/40 hover:text-emerald-300"
              >
                Seç
              </button>
            </form>
          )}
          <form action={deleteAction} className={domain.isSelected ? "flex-1" : undefined}>
            <input type="hidden" name="id" value={domain.id} />
            <button
              type="submit"
              className="inline-flex min-h-[36px] w-full items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[12px] font-semibold text-white/80 transition hover:border-rose-400/40 hover:bg-rose-400/10 hover:text-rose-300"
            >
              Sil
            </button>
          </form>
        </div>

        <form
          action={voteAction}
          className="mt-1 flex flex-col gap-2 border-t border-white/[0.06] pt-3"
        >
          <input type="hidden" name="domainId" value={domain.id} />
          <div className="flex items-center justify-between gap-2">
            <NumberPicker name="rating" defaultValue={5} min={1} max={10} />
          </div>
          <button
            type="submit"
            className="inline-flex min-h-[36px] items-center justify-center rounded-[0.7rem] px-4 py-1.5 text-[12px] font-bold text-black ring-1 ring-inset ring-white/15"
            style={{ backgroundImage: DETRBRIDGE_BRAND_GRADIENT }}
          >
            Oyla
          </button>
        </form>
      </div>
    </article>
  );
}
