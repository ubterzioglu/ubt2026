import type { DetrbridgeLogo, DetrbridgeVoteEntry } from "@/lib/detrbridge-logos";
import { DETRBRIDGE_BRAND_GRADIENT, DETRBRIDGE_GOLD } from "@/app/detrbridge/_components/theme";
import { NumberPicker } from "@/app/detrbridge/_components/number-picker";
import { FilterBar } from "@/app/detrbridge/_components/filter-bar";

type ServerFormAction = (formData: FormData) => void | Promise<void>;

interface LogosTabProps {
  logos: DetrbridgeLogo[];
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

/** Human-readable file size (KB below 1 MB, MB otherwise). */
function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** The fixed panel of eligible voters, shown on every logo regardless of vote status. */
const DETRBRIDGE_VOTERS = ["Sefa", "Sümeyye", "Fatih", "UBT", "Şahin", "Murat", "Aslıhan"];

/**
 * Full voter roster per logo: everyone who voted shows green with their
 * rating, everyone who hasn't yet shows red. Matching is case-insensitive
 * so minor casing differences in stored names don't hide a vote.
 */
function VotesList({ votes }: { votes: DetrbridgeVoteEntry[] }) {
  const voteByLowerName = new Map(votes.map((vote) => [vote.voterName.trim().toLowerCase(), vote]));
  return (
    <div className="flex flex-wrap gap-1.5 border-t border-white/[0.06] pt-2">
      {DETRBRIDGE_VOTERS.map((voter) => {
        const vote = voteByLowerName.get(voter.toLowerCase());
        return (
          <span
            key={voter}
            className={
              vote
                ? "inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300"
                : "inline-flex items-center gap-1 rounded-full border border-rose-400/30 bg-rose-400/10 px-2 py-0.5 text-[11px] font-medium text-rose-300/80"
            }
          >
            {voter}
            {vote ? <span className="font-bold text-emerald-100">{vote.rating}</span> : null}
          </span>
        );
      })}
    </div>
  );
}

/** Read-only average-rating badge, e.g. 7.2/10 (5 oy). */
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
 * Logo Seçimi panel: an upload form (file + uploader's name) plus a list of
 * candidates sorted by average vote rating, each with a vote sub-form
 * (voter name + 1-5 stars — one vote per name per logo, re-voting updates
 * the existing vote), a manual "Seç" toggle (mutually exclusive across the
 * list), and delete.
 */
export function LogosTab({
  logos,
  totalCount,
  query,
  minRating,
  createAction,
  voteAction,
  selectAction,
  deleteAction
}: LogosTabProps) {
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
            Yeni logo ekle
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
                <span className="font-semibold text-white/85">① Logo yükle</span> — dosyayı
                seç; yükleyen olarak giriş yaptığın isim otomatik kaydedilir.
              </li>
              <li>
                <span className="font-semibold text-white/85">② Oy ver</span> — 1-10 arası
                puan verilir, kişi başı bir logoya tek oy hakkı vardır (tekrar oylarsan
                önceki oyunun yerine geçer).
              </li>
              <li>
                <span className="font-semibold text-white/85">③ Sıralama</span> — liste
                ortalama puana göre en yüksekten düşüğe sıralanır.
              </li>
              <li>
                <span className="font-semibold text-white/85">④ Seçim</span> — beğenilen
                logo &quot;Seç&quot; ile işaretlenir; her seferinde sadece bir logo seçili
                kalır.
              </li>
            </ol>
          </details>

          <form action={createAction} className="mt-4 space-y-4">
            <label className="block">
              <span className={formLabel}>
                Dosya <span style={{ color: DETRBRIDGE_GOLD }}>*</span> (en fazla 10 MB)
              </span>
              <input
                type="file"
                name="file"
                required
                className={`${darkInput} file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-[11px] file:font-semibold file:text-white/80`}
              />
            </label>
            <button
              type="submit"
              className="inline-flex min-h-[44px] items-center justify-center rounded-[0.9rem] px-6 py-2.5 text-[13px] font-bold tracking-tight text-black shadow-[0_12px_40px_-8px_rgba(30,58,138,0.5)] ring-1 ring-inset ring-white/15 transition hover:shadow-[0_16px_50px_-8px_rgba(245,183,0,0.6)]"
              style={{ backgroundImage: DETRBRIDGE_BRAND_GRADIENT }}
            >
              Logo ekle
            </button>
          </form>
        </div>
      </section>

      <FilterBar
        tab="logos"
        totalCount={totalCount}
        visibleCount={logos.length}
        query={query}
        minRating={minRating}
        queryPlaceholder="Yükleyene göre ara..."
        countLabel="logo"
      />

      <section>
        {logos.length === 0 ? (
          <p className="rounded-[1.3rem] border border-dashed border-white/15 px-5 py-8 text-center text-[13px] text-white/50">
            {totalCount === 0
              ? "Henüz logo eklenmedi. Yukarıdan ilk adayı ekle."
              : "Filtreyle eşleşen logo bulunamadı."}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {logos.map((logo) => (
              <LogoRow
                key={logo.id}
                logo={logo}
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

interface LogoRowProps {
  logo: DetrbridgeLogo;
  voteAction: ServerFormAction;
  selectAction: ServerFormAction;
  deleteAction: ServerFormAction;
}

function LogoRow({ logo, voteAction, selectAction, deleteAction }: LogoRowProps) {
  return (
    <article
      className={`flex flex-col overflow-hidden rounded-[1.2rem] border bg-white/[0.03] backdrop-blur-xl transition hover:border-white/20 ${
        logo.isSelected ? "border-emerald-400/40" : "border-white/10"
      }`}
    >
      <div className="relative flex aspect-square items-center justify-center overflow-hidden border-b border-white/[0.06] bg-white/[0.04] p-4">
        {logo.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo.url}
            alt={logo.uploaderName}
            className="h-full w-full object-contain"
          />
        ) : (
          <span className="text-[12px] text-white/30">Görsel yok</span>
        )}
        {logo.isSelected ? (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 backdrop-blur">
            ✓ Seçildi
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="rounded-[0.8rem] border border-white/[0.06] bg-white/[0.02] px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
            Yükleyen
          </p>
          <p
            className="truncate font-body text-[14px] font-semibold text-white"
            title={logo.uploaderName}
          >
            {logo.uploaderName}
          </p>
        </div>

        <div
          className="flex items-center justify-between rounded-[0.8rem] border border-white/[0.06] bg-white/[0.02] px-3 py-2"
          title={`${logo.fileName} · ${formatFileSize(logo.sizeBytes)}`}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
            Puan
          </p>
          <RatingBadge averageRating={logo.averageRating} voteCount={logo.voteCount} />
        </div>

        <VotesList votes={logo.votes} />

        <div className="mt-1 flex items-center gap-2">
          {logo.isSelected ? null : (
            <form action={selectAction} className="flex-1">
              <input type="hidden" name="id" value={logo.id} />
              <button
                type="submit"
                className="inline-flex min-h-[36px] w-full items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[12px] font-semibold text-white/80 transition hover:border-emerald-400/40 hover:text-emerald-300"
              >
                Seç
              </button>
            </form>
          )}
          <form action={deleteAction} className={logo.isSelected ? "flex-1" : undefined}>
            <input type="hidden" name="id" value={logo.id} />
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
          <input type="hidden" name="logoId" value={logo.id} />
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
