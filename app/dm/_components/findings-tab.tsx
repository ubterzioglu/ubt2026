import { DM_BRAND_GRADIENT } from "@/app/dm/_components/theme";
import { FindingTable } from "@/app/dm/_components/finding-table";
import type {
  FindingComment,
  TestFindingItem,
  TestFindingSeverity,
  TestFindingStatus
} from "@/types/site";

interface OptionMeta<T extends string> {
  value: T;
  label: string;
}

interface FindingsTabProps {
  findings: TestFindingItem[];
  owners: string[];
  ownerOptions: string[];
  statusOptions: OptionMeta<TestFindingStatus>[];
  severityOptions: OptionMeta<TestFindingSeverity>[];
  statusBadge: Record<TestFindingStatus, string>;
  severityBadge: Record<TestFindingSeverity, string>;
  editing: TestFindingItem | null;
  selected: TestFindingItem | null;
  comments: FindingComment[];
  cardClass: string;
  cardInnerClass: string;
  inputClass: string;
  createAction: (formData: FormData) => void | Promise<void>;
  updateAction: (formData: FormData) => void | Promise<void>;
  deleteAction: (formData: FormData) => void | Promise<void>;
  resolveAction: (formData: FormData) => void | Promise<void>;
  addCommentAction: (formData: FormData) => void | Promise<void>;
  deleteCommentAction: (formData: FormData) => void | Promise<void>;
}

const labelClass =
  "mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50";

export function FindingsTab({
  findings,
  owners,
  ownerOptions,
  statusOptions,
  severityOptions,
  statusBadge,
  severityBadge,
  editing,
  selected,
  comments,
  cardClass,
  cardInnerClass,
  inputClass,
  createAction,
  updateAction,
  deleteAction,
  resolveAction,
  addCommentAction,
  deleteCommentAction
}: FindingsTabProps) {
  const openCount = findings.filter((f) => f.status === "open").length;
  const criticalCount = findings.filter((f) => f.severity === "critical").length;
  const resolvedCount = findings.filter((f) => f.status === "resolved").length;

  return (
    <>
      {/* Stats */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Toplam bulgu", value: findings.length },
          { label: "Açık", value: openCount },
          { label: "Kritik", value: criticalCount },
          { label: "Çözüldü", value: resolvedCount }
        ].map((stat) => (
          <article key={stat.label} className={cardClass}>
            <div className={`${cardInnerClass} px-4 py-3`}>
              <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#f0abfc]/90">
                {stat.label}
              </p>
              <p className="mt-1 font-body text-xl font-bold text-white">
                {stat.value}
              </p>
            </div>
          </article>
        ))}
      </section>

      {/* Add / edit finding — accordion (auto-opens when editing) */}
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
              {editing ? "Bulguyu düzenle" : "Yeni bulgu ekle"}
            </h2>
            <span className="flex items-center gap-3">
              {editing ? (
                <a
                  href="/dm?tab=findings"
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
            <form
              action={editing ? updateAction : createAction}
              encType="multipart/form-data"
              className="space-y-3"
            >
              {editing ? (
                <input type="hidden" name="id" value={editing.id} />
              ) : null}
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className={labelClass}>
                    Bulgu <span className="text-[#ff2d95]">*</span>
                  </span>
                  <input
                    type="text"
                    name="title"
                    required
                    minLength={2}
                    maxLength={400}
                    defaultValue={editing?.title ?? ""}
                    placeholder="ör. Rezervasyon butonu mobilde tıklanmıyor"
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Sorumlu</span>
                  <input
                    type="text"
                    name="owner"
                    list="finding-owners"
                    defaultValue={editing?.owner ?? "Ortak"}
                    placeholder="Umut / Baran / Şahin / Ortak"
                    className={inputClass}
                  />
                  <datalist id="finding-owners">
                    {ownerOptions.map((owner) => (
                      <option key={owner} value={owner} />
                    ))}
                  </datalist>
                </label>
                <label className="block">
                  <span className={labelClass}>Alan / sayfa</span>
                  <input
                    type="text"
                    name="area"
                    maxLength={120}
                    defaultValue={editing?.area ?? ""}
                    placeholder="ör. Login / Rezervasyon / Mobil"
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Durum</span>
                  <select
                    name="status"
                    defaultValue={editing?.status ?? "open"}
                    className={inputClass}
                  >
                    {statusOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        className="bg-[#0a0712] text-white"
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className={labelClass}>Önem</span>
                  <select
                    name="severity"
                    defaultValue={editing?.severity ?? "normal"}
                    className={inputClass}
                  >
                    {severityOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        className="bg-[#0a0712] text-white"
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className={labelClass}>
                    Screenshot{" "}
                    <span className="font-normal normal-case tracking-normal text-white/30">
                      (opsiyonel · max 5MB)
                    </span>
                  </span>
                  <input
                    type="file"
                    name="screenshot"
                    accept="image/*"
                    className="block w-full text-xs text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-white/15"
                  />
                  {editing?.screenshotUrl ? (
                    <span className="mt-1.5 flex items-center gap-2 text-[11px] text-white/40">
                      Mevcut görsel var — yeni seçersen değiştirilir.
                      <a
                        href={editing.screenshotUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#67e8f9] hover:underline"
                      >
                        Görüntüle
                      </a>
                    </span>
                  ) : null}
                </label>
              </div>
              <button
                type="submit"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-[0.85rem] px-5 py-2.5 text-xs font-bold tracking-tight text-white shadow-[0_14px_44px_-10px_rgba(255,45,149,0.65)] ring-1 ring-inset ring-white/15 transition duration-300 hover:shadow-[0_18px_56px_-10px_rgba(168,85,247,0.85)] focus:outline-none focus:ring-2 focus:ring-[#ff2d95]/60"
                style={{ backgroundImage: DM_BRAND_GRADIENT }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                />
                {editing ? "Değişiklikleri kaydet" : "Bulgu ekle"}
              </button>
            </form>
          </div>
        </details>
      </section>

      {/* Finding list */}
      <section className={cardClass}>
        <div className={`${cardInnerClass} px-4 py-4 sm:px-5`}>
          <FindingTable
            findings={findings}
            statusOptions={statusOptions}
            severityOptions={severityOptions}
            owners={owners}
            statusBadge={statusBadge}
            severityBadge={severityBadge}
            resolveAction={resolveAction}
            deleteAction={deleteAction}
          />
        </div>
      </section>

      {/* Comments panel for the selected finding */}
      {selected ? (
        <section id="yorumlar" className={cardClass}>
          <div className={`${cardInnerClass} px-4 py-4 sm:px-5`}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f0abfc]/90">
                  Yorumlar
                </p>
                <h3 className="mt-0.5 truncate font-body text-sm font-semibold text-white">
                  {selected.title}
                </h3>
              </div>
              <a
                href="/dm?tab=findings"
                className="shrink-0 text-xs font-semibold text-white/50 transition hover:text-white"
              >
                Kapat
              </a>
            </div>

            {selected.screenshotUrl ? (
              <a
                href={selected.screenshotUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 block max-w-xs overflow-hidden rounded-xl border border-white/10 ring-1 ring-inset ring-white/10 transition hover:border-[#67e8f9]/45"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selected.screenshotUrl}
                  alt={selected.title}
                  className="w-full object-cover"
                />
              </a>
            ) : null}

            <ul className="mt-4 space-y-2">
              {comments.length === 0 ? (
                <li className="rounded-lg border border-dashed border-white/10 px-3 py-3 text-xs text-white/45">
                  Henüz yorum yok.
                </li>
              ) : (
                comments.map((comment) => (
                  <li
                    key={comment.id}
                    className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] font-semibold text-[#67e8f9]">
                        {comment.author}
                      </span>
                      <form action={deleteCommentAction}>
                        <input type="hidden" name="id" value={comment.id} />
                        <input
                          type="hidden"
                          name="finding"
                          value={selected.id}
                        />
                        <button
                          type="submit"
                          title="Yorumu sil"
                          className="text-[11px] text-white/35 transition hover:text-rose-300"
                        >
                          Sil
                        </button>
                      </form>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-white/80">
                      {comment.body}
                    </p>
                  </li>
                ))
              )}
            </ul>

            <form action={addCommentAction} className="mt-3 space-y-2">
              <input type="hidden" name="finding" value={selected.id} />
              <div className="grid gap-2 sm:grid-cols-[8rem_minmax(0,1fr)]">
                <input
                  type="text"
                  name="author"
                  list="finding-owners"
                  defaultValue="Ortak"
                  placeholder="Yazan"
                  className={inputClass}
                />
                <input
                  type="text"
                  name="body"
                  required
                  minLength={1}
                  maxLength={1000}
                  placeholder="Yorum ekle…"
                  className={inputClass}
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-[0.85rem] border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-semibold text-white/85 transition hover:border-[#67e8f9]/45 hover:text-white"
              >
                Yorum ekle
              </button>
            </form>
          </div>
        </section>
      ) : null}
    </>
  );
}
