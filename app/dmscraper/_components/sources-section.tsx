// Kaynaklar bölümü: create accordion + kaynak başına düzenleme formu.
// terms_checked işaretlenmeden kaynak aktif edilemez (server action gate'i
// lib/radar-news.ts içinde ayrıca zorlar).

import { DM_BRAND_GRADIENT } from "@/app/dm/_components/theme";
import type { RadarSourceDetailItem, RadarSourceItem } from "@/lib/radar-news";

interface SourcesSectionProps {
  sources: RadarSourceItem[];
  editing: RadarSourceDetailItem | null;
  cardClass: string;
  cardInnerClass: string;
  inputClass: string;
  createAction: (formData: FormData) => void | Promise<void>;
  updateAction: (formData: FormData) => void | Promise<void>;
  toggleAction: (formData: FormData) => void | Promise<void>;
}

const actionButton =
  "inline-flex min-h-[28px] items-center justify-center rounded-full border px-2.5 py-1 text-[11px] font-semibold transition";

const SOURCE_TYPES = ["rss", "atom", "gdelt", "json_api"] as const;
const ADAPTER_KEYS = ["rss", "atom", "gdelt_doc_v2"] as const;
const TRUST_LEVELS = ["official", "high", "standard", "discovery_only"] as const;

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin"
  }).format(date);
}

function SourceFormFields({
  editing,
  inputClass
}: {
  editing: RadarSourceDetailItem | null;
  inputClass: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block">
        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
          Ad <span className="text-[#ff2d95]">*</span>
        </span>
        <input
          type="text"
          name="name"
          required
          minLength={2}
          maxLength={160}
          defaultValue={editing?.name ?? ""}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
          Endpoint URL <span className="text-[#ff2d95]">*</span>
        </span>
        <input
          type="url"
          name="endpointUrl"
          required
          defaultValue={editing?.endpointUrl ?? ""}
          placeholder="https://…"
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
          Website URL
        </span>
        <input
          type="url"
          name="websiteUrl"
          defaultValue={editing?.websiteUrl ?? ""}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
          Kaynak tipi
        </span>
        <select
          name="sourceType"
          defaultValue={editing?.sourceType ?? "rss"}
          className={inputClass}
        >
          {SOURCE_TYPES.map((type) => (
            <option key={type} value={type} className="bg-[#0a0712] text-white">
              {type}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
          Adapter
        </span>
        <select
          name="adapterKey"
          defaultValue={editing?.adapterKey ?? "rss"}
          className={inputClass}
        >
          {ADAPTER_KEYS.map((key) => (
            <option key={key} value={key} className="bg-[#0a0712] text-white">
              {key}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
          Güven seviyesi
        </span>
        <select
          name="trustLevel"
          defaultValue={editing?.trustLevel ?? "standard"}
          className={inputClass}
        >
          {TRUST_LEVELS.map((level) => (
            <option key={level} value={level} className="bg-[#0a0712] text-white">
              {level}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
          Dil
        </span>
        <input
          type="text"
          name="language"
          maxLength={8}
          defaultValue={editing?.language ?? "de"}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
          Ülke
        </span>
        <input
          type="text"
          name="country"
          maxLength={8}
          defaultValue={editing?.country ?? "DE"}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
          Varsayılan kategori
        </span>
        <input
          type="text"
          name="categoryDefault"
          maxLength={60}
          defaultValue={editing?.categoryDefault ?? ""}
          placeholder="regulierung / stadt / venue / branche / recht"
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
          Sorgu (GDELT query_text)
        </span>
        <input
          type="text"
          name="queryText"
          maxLength={500}
          defaultValue={editing?.queryText || editing?.configQuery || ""}
          placeholder='(Bordell OR "FKK-Club") sourcecountry:GM sourcelang:ger'
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
          Tarama başına maks. öğe (1–500)
        </span>
        <input
          type="number"
          name="maxItemsPerScan"
          min={1}
          max={500}
          defaultValue={editing?.maxItemsPerScan ?? 100}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
          Timeout ms (1000–60000)
        </span>
        <input
          type="number"
          name="timeoutMs"
          min={1000}
          max={60000}
          defaultValue={editing?.timeoutMs ?? 12000}
          className={inputClass}
        />
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
          Terms notları
        </span>
        <textarea
          name="termsNotes"
          rows={2}
          maxLength={500}
          defaultValue={editing?.termsNotes ?? ""}
          placeholder="Feed'in kullanım koşulları / atıf gereksinimi"
          className={inputClass}
        />
      </label>
      <label className="flex items-center gap-2 text-xs text-white/70">
        <input
          type="checkbox"
          name="termsChecked"
          value="1"
          defaultChecked={editing?.termsChecked ?? false}
          className="h-4 w-4 rounded border-white/20 bg-white/[0.06]"
        />
        ToS / kullanım koşulları doğrulandı
      </label>
      <label className="flex items-center gap-2 text-xs text-white/70">
        <input
          type="checkbox"
          name="isEnabled"
          value="1"
          defaultChecked={editing?.isEnabled ?? false}
          className="h-4 w-4 rounded border-white/20 bg-white/[0.06]"
        />
        Kaynak aktif (terms doğrulanmadan aktif edilemez)
      </label>
    </div>
  );
}

export function SourcesSection({
  sources,
  editing,
  cardClass,
  cardInnerClass,
  inputClass,
  createAction,
  updateAction,
  toggleAction
}: SourcesSectionProps) {
  return (
    <>
      {/* Yeni kaynak / düzenleme formu */}
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
              {editing ? "Kaynağı düzenle" : "Yeni kaynak ekle"}
            </h2>
            <span className="flex items-center gap-3">
              {editing ? (
                <a
                  href="/dmscraper?sec=kaynaklar"
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
              <SourceFormFields editing={editing} inputClass={inputClass} />
              <button
                type="submit"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-[0.85rem] px-5 py-2.5 text-xs font-bold tracking-tight text-white shadow-[0_14px_44px_-10px_rgba(255,45,149,0.65)] ring-1 ring-inset ring-white/15 transition duration-300"
                style={{ backgroundImage: DM_BRAND_GRADIENT }}
              >
                {editing ? "Değişiklikleri kaydet" : "Kaynak ekle"}
              </button>
            </form>
          </div>
        </details>
      </section>

      {/* Kaynak listesi */}
      <section className={cardClass}>
        <div className={`${cardInnerClass} px-4 py-4 sm:px-5`}>
          <h2 className="font-body text-sm font-semibold text-white">Kaynaklar</h2>
          <div className="mt-3 space-y-1.5">
            {sources.length === 0 ? (
              <p className="rounded-[1rem] border border-dashed border-white/15 px-4 py-8 text-center text-xs text-white/45">
                Henüz kaynak yok.
              </p>
            ) : (
              sources.map((source) => (
                <div
                  key={source.id}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-[0.9rem] border border-white/[0.06] bg-white/[0.02] px-3.5 py-2"
                >
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ${
                      source.isEnabled
                        ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                        : "border border-white/10 bg-white/[0.04] text-white/40"
                    }`}
                  >
                    {source.isEnabled ? "Aktif" : "Kapalı"}
                  </span>
                  {!source.termsChecked ? (
                    <span className="inline-flex shrink-0 items-center rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-amber-100">
                      Terms bekliyor
                    </span>
                  ) : null}
                  <span
                    className="min-w-0 flex-1 truncate text-[12px] font-semibold text-white/85"
                    title={source.endpointUrl}
                  >
                    {source.name}
                  </span>
                  <span className="shrink-0 text-[10px] uppercase tracking-[0.12em] text-white/35">
                    {source.sourceType}
                    {source.language ? ` · ${source.language}` : ""}
                  </span>
                  <span
                    className="hidden shrink-0 text-[10px] text-white/35 md:inline"
                    title={source.lastErrorMessage || undefined}
                  >
                    {source.lastErrorAt &&
                    (!source.lastSuccessAt || source.lastErrorAt > source.lastSuccessAt)
                      ? `Hata: ${formatDate(source.lastErrorAt)}`
                      : `Son başarı: ${formatDate(source.lastSuccessAt)}`}
                  </span>
                  <a
                    href={`/dmscraper?sec=kaynaklar&edit=${source.id}`}
                    className={`${actionButton} border-white/10 bg-white/[0.05] text-white/60 hover:border-[#67e8f9]/40 hover:text-[#67e8f9]`}
                  >
                    Düzenle
                  </a>
                  <form action={toggleAction}>
                    <input type="hidden" name="id" value={source.id} />
                    <input
                      type="hidden"
                      name="enabled"
                      value={source.isEnabled ? "0" : "1"}
                    />
                    <button
                      type="submit"
                      className={`${actionButton} border-white/10 bg-white/[0.05] text-white/60 hover:text-white`}
                    >
                      {source.isEnabled ? "Kapat" : "Aç"}
                    </button>
                  </form>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}
