import type { DetrbridgeLogo } from "@/lib/detrbridge-logos";
import { DETRBRIDGE_BRAND_GRADIENT, DETRBRIDGE_GOLD } from "@/app/detrbridge/_components/theme";

type ServerFormAction = (formData: FormData) => void | Promise<void>;

interface LogosTabProps {
  logos: DetrbridgeLogo[];
  createAction: ServerFormAction;
  rateAction: ServerFormAction;
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

/** Read-only star rating badge, e.g. ★★★☆☆. */
function StarBadge({ rating }: { rating: number }) {
  const stars = "★★★★★".slice(0, rating) + "☆☆☆☆☆".slice(0, 5 - rating);
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[11px] font-semibold tracking-[0.08em]"
      style={{ color: DETRBRIDGE_GOLD }}
      title={`${rating}/5`}
    >
      {stars}
    </span>
  );
}

/**
 * Logo Seçimi panel: an upload form (file + name + 1-5 star rating) plus a
 * list of candidates sorted by rating, each with an inline rating editor,
 * a manual "Seç" toggle (mutually exclusive across the list), and delete.
 */
export function LogosTab({
  logos,
  createAction,
  rateAction,
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
          <form action={createAction} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="block sm:col-span-2 lg:col-span-1">
                <span className={formLabel}>
                  İsim <span style={{ color: DETRBRIDGE_GOLD }}>*</span>
                </span>
                <input
                  type="text"
                  name="name"
                  required
                  minLength={2}
                  maxLength={100}
                  placeholder="Logo adı"
                  className={darkInput}
                />
              </label>
              <label className="block">
                <span className={formLabel}>
                  Puan <span style={{ color: DETRBRIDGE_GOLD }}>*</span>
                </span>
                <select name="rating" required defaultValue="3" className={darkInput}>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <option key={value} value={value}>
                      {"★".repeat(value)} ({value})
                    </option>
                  ))}
                </select>
              </label>
              <label className="block sm:col-span-2 lg:col-span-1">
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
            </div>
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

      <section className="space-y-2">
        {logos.length === 0 ? (
          <p className="rounded-[1.3rem] border border-dashed border-white/15 px-5 py-8 text-center text-[13px] text-white/50">
            Henüz logo eklenmedi. Yukarıdan ilk adayı ekle.
          </p>
        ) : (
          logos.map((logo) => (
            <LogoRow
              key={logo.id}
              logo={logo}
              rateAction={rateAction}
              selectAction={selectAction}
              deleteAction={deleteAction}
            />
          ))
        )}
      </section>
    </div>
  );
}

interface LogoRowProps {
  logo: DetrbridgeLogo;
  rateAction: ServerFormAction;
  selectAction: ServerFormAction;
  deleteAction: ServerFormAction;
}

function LogoRow({ logo, rateAction, selectAction, deleteAction }: LogoRowProps) {
  return (
    <article
      className={`overflow-hidden rounded-[1.1rem] border bg-white/[0.03] backdrop-blur-xl transition hover:border-white/20 ${
        logo.isSelected ? "border-emerald-400/40" : "border-white/10"
      }`}
    >
      <div className="flex flex-wrap items-center gap-4 px-4 py-3 sm:flex-nowrap">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[0.7rem] border border-white/10 bg-white/[0.04]">
          {logo.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo.url}
              alt={logo.name}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-[10px] text-white/30">yok</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-body text-[14px] font-semibold text-white" title={logo.name}>
            {logo.name}
          </p>
          <p className="mt-0.5 text-[11px] text-white/40">
            {logo.fileName} · {formatFileSize(logo.sizeBytes)}
          </p>
        </div>

        <StarBadge rating={logo.rating} />

        <form action={rateAction} className="flex shrink-0 items-center gap-1.5">
          <input type="hidden" name="id" value={logo.id} />
          <select
            name="rating"
            defaultValue={String(logo.rating)}
            className="rounded-[0.6rem] border border-white/10 bg-white/[0.04] px-2 py-1 text-[12px] text-white outline-none focus:border-[#F5B700]/55"
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="inline-flex min-h-[30px] items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-semibold text-white/80 transition hover:border-[#F5B700]/40 hover:text-[#F5B700]"
          >
            Puanı güncelle
          </button>
        </form>

        {logo.isSelected ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
            ✓ Seçildi
          </span>
        ) : (
          <form action={selectAction} className="shrink-0">
            <input type="hidden" name="id" value={logo.id} />
            <button
              type="submit"
              className="inline-flex min-h-[30px] items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-semibold text-white/80 transition hover:border-emerald-400/40 hover:text-emerald-300"
            >
              Seç
            </button>
          </form>
        )}

        <form action={deleteAction} className="shrink-0">
          <input type="hidden" name="id" value={logo.id} />
          <button
            type="submit"
            className="inline-flex min-h-[30px] items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-semibold text-white/80 transition hover:border-rose-400/40 hover:bg-rose-400/10 hover:text-rose-300"
          >
            Sil
          </button>
        </form>
      </div>
    </article>
  );
}
