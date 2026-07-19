import type { DetrbridgeTodoItem } from "@/lib/detrbridge-todos";
import { DETRBRIDGE_BRAND_GRADIENT, DETRBRIDGE_GOLD } from "@/app/detrbridge/_components/theme";

type ServerFormAction = (formData: FormData) => void | Promise<void>;

interface TodosTabProps {
  todos: DetrbridgeTodoItem[];
  editingId: string | null;
  createAction: ServerFormAction;
  updateAction: ServerFormAction;
  toggleAction: ServerFormAction;
  deleteAction: ServerFormAction;
  commentAction: ServerFormAction;
  deleteCommentAction: ServerFormAction;
  attachAction: ServerFormAction;
  deleteAttachmentAction: ServerFormAction;
}

const darkInput =
  "w-full rounded-[0.7rem] border border-white/10 bg-white/[0.04] px-3 py-2 text-[13px] text-white placeholder:text-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition focus:border-[#F5B700]/55 focus:bg-white/[0.06] focus:ring-4 focus:ring-[#F5B700]/12";
const formLabel =
  "mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50";

const TIMESTAMP_FORMAT = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Berlin"
});
const DUE_DATE_FORMAT = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC"
});

function formatTimestamp(iso: string): string {
  try {
    return TIMESTAMP_FORMAT.format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatDueDate(date: string): string {
  try {
    return DUE_DATE_FORMAT.format(new Date(`${date}T00:00:00Z`));
  } catch {
    return date;
  }
}

function todayInBerlin(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/**
 * "Görevler" panel: add/edit accordion form, then a list of todo rows each
 * with a status toggle, collapsible attachments and comment thread.
 * Ported from the retired /detr board — same CRUD surface, no per-session
 * "kim" prefill (detrbridge has no per-user identity, single shared gate).
 */
export function TodosTab({
  todos,
  editingId,
  createAction,
  updateAction,
  toggleAction,
  deleteAction,
  commentAction,
  deleteCommentAction,
  attachAction,
  deleteAttachmentAction
}: TodosTabProps) {
  const editing = editingId ? todos.find((item) => item.id === editingId) ?? null : null;
  const today = todayInBerlin();
  const openCount = todos.filter((item) => item.status === "open").length;
  const doneCount = todos.length - openCount;
  const overdueCount = todos.filter(
    (item) => item.status === "open" && item.dueDate !== null && item.dueDate < today
  ).length;
  const formOpen = Boolean(editing);

  return (
    <div className="space-y-5">
      <section className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {[
          { label: "Toplam", value: todos.length },
          { label: "Açık", value: openCount },
          { label: "Tamamlanan", value: doneCount },
          { label: "Geciken", value: overdueCount }
        ].map((stat) => (
          <article
            key={stat.label}
            className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-xl"
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: DETRBRIDGE_GOLD }}
            >
              {stat.label}
            </p>
            <p className="mt-1.5 font-body text-2xl font-bold text-white">
              {stat.value}
            </p>
          </article>
        ))}
      </section>

      <details
        open={formOpen}
        className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 sm:px-8 [&::-webkit-details-marker]:hidden">
          <h2 className="flex items-center gap-2 font-body text-base font-semibold text-white">
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold text-black"
              style={{ backgroundImage: DETRBRIDGE_BRAND_GRADIENT }}
            >
              +
            </span>
            {editing ? `Görevi düzenle · ${editing.title}` : "Yeni görev ekle"}
          </h2>
          <span className="flex items-center gap-3">
            {editing ? (
              <a
                href="/detrbridge?tab=todos"
                className="text-[13px] font-semibold"
                style={{ color: DETRBRIDGE_GOLD }}
              >
                İptal
              </a>
            ) : null}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white/40 transition-transform duration-200 group-open:rotate-180"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </summary>
        <form
          action={editing ? updateAction : createAction}
          className="space-y-4 px-6 pb-6 pt-1 sm:px-8"
        >
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block sm:col-span-2 lg:col-span-1">
              <span className={formLabel}>
                Görev <span style={{ color: DETRBRIDGE_GOLD }}>*</span>
              </span>
              <input
                type="text"
                name="title"
                required
                minLength={2}
                maxLength={300}
                defaultValue={editing?.title ?? ""}
                placeholder="Ne yapılacak?"
                className={darkInput}
              />
            </label>
            <label className="block">
              <span className={formLabel}>Kim</span>
              <input
                type="text"
                name="assignee"
                maxLength={100}
                defaultValue={editing?.assignee ?? ""}
                placeholder="Sorumlu kişi"
                className={darkInput}
              />
            </label>
            <label className="block">
              <span className={formLabel}>Ne zamana kadar</span>
              <input
                type="date"
                name="dueDate"
                defaultValue={editing?.dueDate ?? ""}
                className={`${darkInput} [color-scheme:dark]`}
              />
            </label>
            {!editing && (
              <label className="block sm:col-span-2 lg:col-span-3">
                <span className={formLabel}>Dosya (opsiyonel · en fazla 10 MB)</span>
                <input
                  type="file"
                  name="file"
                  className={`${darkInput} file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-[11px] file:font-semibold file:text-white/80`}
                />
              </label>
            )}
          </div>
          <button
            type="submit"
            className="inline-flex min-h-[44px] items-center justify-center rounded-[0.9rem] px-6 py-2.5 text-[13px] font-bold tracking-tight text-black shadow-[0_12px_40px_-8px_rgba(30,58,138,0.5)] ring-1 ring-inset ring-white/15 transition hover:shadow-[0_16px_50px_-8px_rgba(245,183,0,0.6)]"
            style={{ backgroundImage: DETRBRIDGE_BRAND_GRADIENT }}
          >
            {editing ? "Değişiklikleri kaydet" : "Görev ekle"}
          </button>
        </form>
      </details>

      <section className="space-y-2">
        {todos.length === 0 ? (
          <p className="rounded-[1.3rem] border border-dashed border-white/15 px-5 py-8 text-center text-[13px] text-white/50">
            Henüz görev yok. Yukarıdan ilk görevi ekle.
          </p>
        ) : (
          todos.map((item) => (
            <TodoRow
              key={item.id}
              item={item}
              today={today}
              toggleAction={toggleAction}
              deleteAction={deleteAction}
              commentAction={commentAction}
              deleteCommentAction={deleteCommentAction}
              attachAction={attachAction}
              deleteAttachmentAction={deleteAttachmentAction}
            />
          ))
        )}
      </section>
    </div>
  );
}

interface TodoRowProps {
  item: DetrbridgeTodoItem;
  today: string;
  toggleAction: ServerFormAction;
  deleteAction: ServerFormAction;
  commentAction: ServerFormAction;
  deleteCommentAction: ServerFormAction;
  attachAction: ServerFormAction;
  deleteAttachmentAction: ServerFormAction;
}

function TodoRow({
  item,
  today,
  toggleAction,
  deleteAction,
  commentAction,
  deleteCommentAction,
  attachAction,
  deleteAttachmentAction
}: TodoRowProps) {
  const isDone = item.status === "done";
  const isOverdue = !isDone && item.dueDate !== null && item.dueDate < today;

  return (
    <article
      className={`rounded-[0.95rem] border bg-white/[0.03] backdrop-blur-xl transition hover:border-white/20 ${
        isOverdue ? "border-rose-400/30" : "border-white/10"
      }`}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5 sm:flex-nowrap">
        <form action={toggleAction} className="shrink-0">
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="next" value={isDone ? "open" : "done"} />
          <button
            type="submit"
            title={isDone ? "Geri aç" : "Tamamlandı olarak işaretle"}
            className={`flex h-6 w-6 items-center justify-center rounded-full border text-[12px] font-bold transition ${
              isDone
                ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-300"
                : "border-white/15 bg-white/[0.05] text-transparent hover:border-emerald-400/50 hover:text-emerald-300/60"
            }`}
          >
            ✓
          </button>
        </form>

        <span
          className={`min-w-0 flex-1 truncate font-body text-[14px] font-semibold ${
            isDone ? "text-white/40 line-through" : "text-white"
          }`}
          title={item.title}
        >
          {item.title}
        </span>

        <span
          className="inline-flex max-w-[140px] shrink-0 items-center truncate rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-amber-300"
          title={`Sorumlu: ${item.assignee}`}
        >
          {item.assignee}
        </span>

        <span
          className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] ${
            isOverdue
              ? "border-rose-400/40 bg-rose-400/15 text-rose-300"
              : item.dueDate
                ? "border-sky-400/30 bg-sky-400/10 text-sky-300"
                : "border-white/10 bg-white/[0.04] text-white/40"
          }`}
          title={
            item.dueDate
              ? `Teslim: ${formatDueDate(item.dueDate)}${isOverdue ? " (gecikti)" : ""}`
              : "Teslim tarihi yok"
          }
        >
          {item.dueDate
            ? `${isOverdue ? "⚠ " : ""}${formatDueDate(item.dueDate)}`
            : "tarih —"}
        </span>

        <span
          className="hidden shrink-0 text-[11px] text-white/40 lg:inline"
          title={`Yazıldı: ${formatTimestamp(item.createdAt)}`}
        >
          {formatTimestamp(item.createdAt)}
        </span>

        <div className="flex shrink-0 items-center gap-1.5">
          <a
            href={`/detrbridge?tab=todos&edit=${item.id}`}
            className="inline-flex min-h-[30px] items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-semibold text-white/80 transition hover:border-[#F5B700]/40 hover:text-[#F5B700]"
          >
            Düzenle
          </a>
          <form action={deleteAction}>
            <input type="hidden" name="id" value={item.id} />
            <button
              type="submit"
              className="inline-flex min-h-[30px] items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-semibold text-white/80 transition hover:border-rose-400/40 hover:bg-rose-400/10 hover:text-rose-300"
            >
              Sil
            </button>
          </form>
        </div>
      </div>

      <details className="group/files border-t border-white/[0.06]">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-2 text-[11px] font-semibold text-white/45 transition hover:text-white/70 [&::-webkit-details-marker]:hidden">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
          Dosyalar ({item.attachments.length})
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white/30 transition-transform duration-200 group-open/files:rotate-180"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </summary>
        <div className="space-y-2 px-4 pb-3">
          {item.attachments.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 rounded-[0.7rem] border border-white/[0.06] bg-white/[0.02] px-3 py-2"
            >
              {file.url ? (
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 flex-1 truncate text-[13px] font-semibold text-sky-300 transition hover:text-sky-200"
                  title={file.fileName}
                >
                  {file.fileName}
                </a>
              ) : (
                <span
                  className="min-w-0 flex-1 truncate text-[13px] font-semibold text-white/40"
                  title={`${file.fileName} (bağlantı üretilemedi)`}
                >
                  {file.fileName}
                </span>
              )}
              <span className="shrink-0 text-[11px] text-white/35">
                {formatFileSize(file.sizeBytes)} · {formatTimestamp(file.createdAt)}
              </span>
              <form action={deleteAttachmentAction} className="shrink-0">
                <input type="hidden" name="attachmentId" value={file.id} />
                <button
                  type="submit"
                  title="Dosyayı sil"
                  className="text-[11px] font-semibold text-white/30 transition hover:text-rose-300"
                >
                  Sil
                </button>
              </form>
            </div>
          ))}
          <form
            action={attachAction}
            className="flex flex-col gap-2 sm:flex-row sm:items-center"
          >
            <input type="hidden" name="todoId" value={item.id} />
            <input
              type="file"
              name="file"
              required
              className={`${darkInput} file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-[11px] file:font-semibold file:text-white/80`}
            />
            <button
              type="submit"
              className="inline-flex min-h-[36px] shrink-0 items-center justify-center rounded-[0.7rem] px-4 py-1.5 text-[12px] font-bold text-black ring-1 ring-inset ring-white/15"
              style={{ backgroundImage: DETRBRIDGE_BRAND_GRADIENT }}
            >
              Yükle
            </button>
          </form>
        </div>
      </details>

      <details className="group/comments border-t border-white/[0.06]">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-2 text-[11px] font-semibold text-white/45 transition hover:text-white/70 [&::-webkit-details-marker]:hidden">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Yorumlar ({item.comments.length})
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white/30 transition-transform duration-200 group-open/comments:rotate-180"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </summary>
        <div className="space-y-2 px-4 pb-3">
          {item.comments.map((comment) => (
            <div
              key={comment.id}
              className="flex items-start gap-3 rounded-[0.7rem] border border-white/[0.06] bg-white/[0.02] px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-white/60">
                  {comment.author}
                  <span className="ml-2 font-normal text-white/35">
                    {formatTimestamp(comment.createdAt)}
                  </span>
                </p>
                <p className="mt-0.5 whitespace-pre-wrap break-words text-[13px] leading-5 text-white/80">
                  {comment.body}
                </p>
              </div>
              <form action={deleteCommentAction} className="shrink-0">
                <input type="hidden" name="commentId" value={comment.id} />
                <button
                  type="submit"
                  title="Yorumu sil"
                  className="text-[11px] font-semibold text-white/30 transition hover:text-rose-300"
                >
                  Sil
                </button>
              </form>
            </div>
          ))}
          <form
            action={commentAction}
            className="flex flex-col gap-2 sm:flex-row sm:items-center"
          >
            <input type="hidden" name="todoId" value={item.id} />
            <input
              type="text"
              name="author"
              maxLength={100}
              placeholder="İsim"
              className={`${darkInput} sm:max-w-[130px]`}
            />
            <input
              type="text"
              name="body"
              required
              maxLength={1000}
              placeholder="Yorum yaz…"
              className={darkInput}
            />
            <button
              type="submit"
              className="inline-flex min-h-[36px] shrink-0 items-center justify-center rounded-[0.7rem] px-4 py-1.5 text-[12px] font-bold text-black ring-1 ring-inset ring-white/15"
              style={{ backgroundImage: DETRBRIDGE_BRAND_GRADIENT }}
            >
              Gönder
            </button>
          </form>
        </div>
      </details>
    </article>
  );
}
