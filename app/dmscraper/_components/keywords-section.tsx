// Keywords bölümü: skorlama keyword'lerinin CRUD'u. Silme kalıcıdır (typo
// temizliği için); normal akışta devre dışı bırakma önerilir.

import { DM_BRAND_GRADIENT } from "@/app/dm/_components/theme";
import type { RadarKeywordItem } from "@/lib/radar-news";

interface KeywordsSectionProps {
  keywords: RadarKeywordItem[];
  editing: RadarKeywordItem | null;
  cardClass: string;
  cardInnerClass: string;
  inputClass: string;
  createAction: (formData: FormData) => void | Promise<void>;
  updateAction: (formData: FormData) => void | Promise<void>;
  deleteAction: (formData: FormData) => void | Promise<void>;
}

const actionButton =
  "inline-flex min-h-[28px] items-center justify-center rounded-full border px-2.5 py-1 text-[11px] font-semibold transition";

function KeywordFormFields({
  editing,
  inputClass
}: {
  editing: RadarKeywordItem | null;
  inputClass: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <label className="block">
        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
          Keyword <span className="text-[#ff2d95]">*</span>
        </span>
        <input
          type="text"
          name="keyword"
          required
          minLength={2}
          maxLength={120}
          defaultValue={editing?.keyword ?? ""}
          placeholder="ör. sperrbezirk"
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
          Dil <span className="text-[#ff2d95]">*</span>
        </span>
        <input
          type="text"
          name="language"
          required
          maxLength={8}
          defaultValue={editing?.language ?? "de"}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
          Kategori
        </span>
        <input
          type="text"
          name="category"
          maxLength={60}
          defaultValue={editing?.category ?? ""}
          placeholder="regulierung / stadt / venue / branche / recht / negativ"
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
          Ağırlık (0–100)
        </span>
        <input
          type="number"
          name="weight"
          min={0}
          max={100}
          defaultValue={editing?.weight ?? 20}
          className={inputClass}
        />
      </label>
      <label className="flex items-center gap-2 text-xs text-white/70">
        <input
          type="checkbox"
          name="isNegative"
          value="1"
          defaultChecked={editing?.isNegative ?? false}
          className="h-4 w-4 rounded border-white/20 bg-white/[0.06]"
        />
        Negatif (eşleşmede −40)
      </label>
      <label className="flex items-center gap-2 text-xs text-white/70">
        <input
          type="checkbox"
          name="isEnabled"
          value="1"
          defaultChecked={editing?.isEnabled ?? true}
          className="h-4 w-4 rounded border-white/20 bg-white/[0.06]"
        />
        Aktif
      </label>
    </div>
  );
}

export function KeywordsSection({
  keywords,
  editing,
  cardClass,
  cardInnerClass,
  inputClass,
  createAction,
  updateAction,
  deleteAction
}: KeywordsSectionProps) {
  const positives = keywords.filter((keyword) => !keyword.isNegative);
  const negatives = keywords.filter((keyword) => keyword.isNegative);

  const renderRow = (keyword: RadarKeywordItem) => (
    <div
      key={keyword.id}
      className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-[0.9rem] border border-white/[0.06] bg-white/[0.02] px-3.5 py-2"
    >
      <span
        className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ${
          keyword.isEnabled
            ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
            : "border border-white/10 bg-white/[0.04] text-white/40"
        }`}
      >
        {keyword.isEnabled ? "Aktif" : "Kapalı"}
      </span>
      <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-white/85">
        {keyword.keyword}
      </span>
      <span className="shrink-0 text-[10px] uppercase tracking-[0.12em] text-white/35">
        {[keyword.language, keyword.category].filter(Boolean).join(" · ")}
      </span>
      <span
        className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${
          keyword.isNegative
            ? "border border-[#ff2247]/40 bg-[#ff2247]/10 text-[#ff9fb0]"
            : "border border-white/[0.14] bg-white/[0.06] text-white/60"
        }`}
      >
        {keyword.isNegative ? "−40" : `+${keyword.weight}`}
      </span>
      <a
        href={`/dmscraper?sec=keywords&edit=${keyword.id}`}
        className={`${actionButton} border-white/10 bg-white/[0.05] text-white/60 hover:border-[#67e8f9]/40 hover:text-[#67e8f9]`}
      >
        Düzenle
      </a>
      <form action={deleteAction}>
        <input type="hidden" name="id" value={keyword.id} />
        <button
          type="submit"
          className={`${actionButton} border-rose-400/30 bg-rose-400/10 text-rose-300 hover:bg-rose-400/20`}
          title="Kalıcı siler — normalde devre dışı bırakmayı tercih et"
        >
          Sil
        </button>
      </form>
    </div>
  );

  return (
    <>
      {/* Yeni keyword / düzenleme formu */}
      <section className={cardClass}>
        <details
          open={Boolean(editing)}
          className={`group/acc overflow-hidden rounded-[1.55rem] ${cardInnerClass}`}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 transition hover:bg-white/[0.02] sm:px-5 [&::-webkit-details-marker]:hidden">
            <h2 className="flex items-center gap-2 font-body text-sm font-semibold text-white">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-lg text-white shadow-sm ring-1 ring-white/15"
                style={{ backgroundImage: DM_BRAND_GRADIENT }}
                aria-hidden
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
              </span>
              {editing ? "Keyword'ü düzenle" : "Yeni keyword ekle"}
            </h2>
            <span className="flex items-center gap-3">
              {editing ? (
                <a
                  href="/dmscraper?sec=keywords"
                  className="text-xs font-semibold text-[#67e8f9] transition hover:text-[#67e8f9]/80"
                >
                  İptal
                </a>
              ) : null}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white/45 transition-transform duration-300 group-open/acc:rotate-180"
                aria-hidden
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>
          </summary>
          <div className="border-t border-white/[0.06] px-4 pb-4 pt-3 sm:px-5">
            <form action={editing ? updateAction : createAction} className="space-y-3">
              {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
              <KeywordFormFields editing={editing} inputClass={inputClass} />
              <button
                type="submit"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-[0.85rem] px-5 py-2.5 text-xs font-bold tracking-tight text-white shadow-[0_14px_44px_-10px_rgba(255,45,149,0.65)] ring-1 ring-inset ring-white/15 transition duration-300"
                style={{ backgroundImage: DM_BRAND_GRADIENT }}
              >
                {editing ? "Değişiklikleri kaydet" : "Keyword ekle"}
              </button>
            </form>
          </div>
        </details>
      </section>

      {/* Pozitif keyword'ler */}
      <section className={cardClass}>
        <div className={`${cardInnerClass} px-4 py-4 sm:px-5`}>
          <h2 className="font-body text-sm font-semibold text-white">
            Pozitif keyword&apos;ler{" "}
            <span className="text-white/40">({positives.length})</span>
          </h2>
          <div className="mt-3 space-y-1.5">
            {positives.length === 0 ? (
              <p className="text-xs text-white/45">Pozitif keyword yok.</p>
            ) : (
              positives.map(renderRow)
            )}
          </div>
        </div>
      </section>

      {/* Negatif keyword'ler */}
      <section className={cardClass}>
        <div className={`${cardInnerClass} px-4 py-4 sm:px-5`}>
          <h2 className="font-body text-sm font-semibold text-white">
            Negatif keyword&apos;ler{" "}
            <span className="text-white/40">({negatives.length})</span>
          </h2>
          <div className="mt-3 space-y-1.5">
            {negatives.length === 0 ? (
              <p className="text-xs text-white/45">Negatif keyword yok.</p>
            ) : (
              negatives.map(renderRow)
            )}
          </div>
        </div>
      </section>
    </>
  );
}
