import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getDetrSessionEmail, isDetrAuthenticated } from "@/lib/admin-auth";
import { DetrLogin } from "@/app/detr/_components/detr-login";
import { detrSignInAction, detrSignOutAction } from "@/app/detr/_actions";
import {
  DETR_BRAND_GRADIENT,
  DETR_ORANGE
} from "@/app/detr/_components/theme";
import {
  getAllDetrTodosAdmin,
  getDetrTodoByIdAdmin,
  createDetrTodo,
  updateDetrTodo,
  setDetrTodoStatus,
  deleteDetrTodo,
  addDetrComment,
  deleteDetrComment
} from "@/lib/detr-todos";
import type { DetrTodoItem } from "@/lib/detr-todos";

export const metadata = {
  title: "DETR · Görev Panosu",
  robots: { index: false, follow: false }
};

interface DetrPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function readParam(value: string | string[] | undefined): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? "";
  return "";
}

// Shared dark input styling so every cell reads as one glass surface.
const darkInput =
  "w-full rounded-[0.7rem] border border-white/10 bg-white/[0.04] px-3 py-2 text-[13px] text-white placeholder:text-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition focus:border-[#FB923C]/55 focus:bg-white/[0.06] focus:ring-4 focus:ring-[#FB923C]/12";
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

/** Formats a plain yyyy-mm-dd date without timezone drift. */
function formatDueDate(date: string): string {
  try {
    return DUE_DATE_FORMAT.format(new Date(`${date}T00:00:00Z`));
  } catch {
    return date;
  }
}

/** Today's date (yyyy-mm-dd) in the board's home timezone. */
function todayInBerlin(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

export default async function DetrPage({ searchParams }: DetrPageProps) {
  const params = searchParams ? await searchParams : {};
  const sessionEmail = await getDetrSessionEmail();

  if (!sessionEmail) {
    return <DetrLogin signIn={detrSignInAction} />;
  }

  const result = await getAllDetrTodosAdmin();
  const createdParam = readParam(params.created);
  const updatedParam = readParam(params.updated);
  const deletedParam = readParam(params.deleted);
  const commentedParam = readParam(params.commented);
  const errorParam = readParam(params.error);
  const editId = readParam(params.edit);
  const editing = editId ? await getDetrTodoByIdAdmin(editId) : null;

  // Signed-in person's short name, used to prefill "kim" fields.
  const sessionName = sessionEmail.split("@")[0] ?? "Ortak";

  async function createAction(formData: FormData) {
    "use server";
    if (!(await isDetrAuthenticated())) {
      redirect("/detr" as Parameters<typeof redirect>[0]);
    }
    const outcome = await createDetrTodo({
      title: (formData.get("title") as string | null) ?? "",
      assignee: (formData.get("assignee") as string | null) ?? "",
      dueDate: (formData.get("dueDate") as string | null) ?? ""
    });
    revalidatePath("/detr");
    redirect(
      (outcome.ok
        ? "/detr?created=1"
        : `/detr?error=${encodeURIComponent(outcome.errorMessage ?? "Görev eklenemedi.")}`) as Parameters<
        typeof redirect
      >[0]
    );
  }

  async function updateAction(formData: FormData) {
    "use server";
    if (!(await isDetrAuthenticated())) {
      redirect("/detr" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    if (!id) {
      redirect("/detr" as Parameters<typeof redirect>[0]);
    }
    const outcome = await updateDetrTodo(id, {
      title: (formData.get("title") as string | null) ?? "",
      assignee: (formData.get("assignee") as string | null) ?? "",
      dueDate: (formData.get("dueDate") as string | null) ?? ""
    });
    revalidatePath("/detr");
    redirect(
      (outcome.ok
        ? "/detr?updated=1"
        : `/detr?error=${encodeURIComponent(outcome.errorMessage ?? "Görev güncellenemedi.")}`) as Parameters<
        typeof redirect
      >[0]
    );
  }

  async function toggleAction(formData: FormData) {
    "use server";
    if (!(await isDetrAuthenticated())) {
      redirect("/detr" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    const next =
      ((formData.get("next") as string | null) ?? "open") === "done"
        ? "done"
        : "open";
    if (id) {
      await setDetrTodoStatus(id, next);
    }
    revalidatePath("/detr");
    redirect("/detr" as Parameters<typeof redirect>[0]);
  }

  async function deleteAction(formData: FormData) {
    "use server";
    if (!(await isDetrAuthenticated())) {
      redirect("/detr" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    if (id) {
      await deleteDetrTodo(id);
    }
    revalidatePath("/detr");
    redirect("/detr?deleted=1" as Parameters<typeof redirect>[0]);
  }

  async function commentAction(formData: FormData) {
    "use server";
    if (!(await isDetrAuthenticated())) {
      redirect("/detr" as Parameters<typeof redirect>[0]);
    }
    const todoId = (formData.get("todoId") as string | null) ?? "";
    const body = (formData.get("body") as string | null) ?? "";
    const author = (formData.get("author") as string | null) ?? "";
    if (!todoId) {
      redirect("/detr" as Parameters<typeof redirect>[0]);
    }
    const outcome = await addDetrComment(todoId, body, author);
    revalidatePath("/detr");
    redirect(
      (outcome.ok
        ? "/detr?commented=1"
        : `/detr?error=${encodeURIComponent(outcome.errorMessage ?? "Yorum eklenemedi.")}`) as Parameters<
        typeof redirect
      >[0]
    );
  }

  async function deleteCommentAction(formData: FormData) {
    "use server";
    if (!(await isDetrAuthenticated())) {
      redirect("/detr" as Parameters<typeof redirect>[0]);
    }
    const commentId = (formData.get("commentId") as string | null) ?? "";
    if (commentId) {
      await deleteDetrComment(commentId);
    }
    revalidatePath("/detr");
    redirect("/detr" as Parameters<typeof redirect>[0]);
  }

  const todos = result.items;
  const today = todayInBerlin();
  const openCount = todos.filter((item) => item.status === "open").length;
  const doneCount = todos.length - openCount;
  const overdueCount = todos.filter(
    (item) => item.status === "open" && item.dueDate !== null && item.dueDate < today
  ).length;

  // Open the add-form accordion automatically only while editing a record.
  const formOpen = Boolean(editing);

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#090706] px-4 py-8 sm:px-6 lg:px-8">
      {/* Ambient glow field — black · orange · rose */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(55% 45% at 15% 8%, rgba(251,146,60,0.13), transparent 60%)," +
            "radial-gradient(45% 45% at 88% 4%, rgba(251,113,133,0.13), transparent 58%)," +
            "radial-gradient(70% 70% at 50% 120%, rgba(249,115,98,0.09), transparent 60%)," +
            "linear-gradient(180deg, #0b0908 0%, #090706 55%, #060404 100%)"
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.3]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(120% 80% at 50% 0%, black, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(120% 80% at 50% 0%, black, transparent 80%)"
        }}
      />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        {/* Header card */}
        <section className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl">
          <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="flex items-center gap-3">
              <span
                className="relative flex h-9 w-9 items-center justify-center rounded-xl ring-1 ring-white/15"
                style={{ backgroundImage: DETR_BRAND_GRADIENT }}
              >
                <span className="font-body text-sm font-extrabold tracking-tight text-black">
                  D
                </span>
              </span>
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.28em]"
                  style={{ color: DETR_ORANGE }}
                >
                  DETR
                </p>
                <h1 className="font-body text-[clamp(1.2rem,3vw,1.6rem)] font-bold tracking-[-0.03em] text-white">
                  Görev panosu
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="hidden truncate text-[12px] font-medium text-white/45 sm:inline"
                title={`Giriş: ${sessionEmail}`}
              >
                {sessionEmail}
              </span>
              <form action={detrSignOutAction}>
                <button
                  type="submit"
                  className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[13px] font-semibold text-white/80 transition hover:border-rose-400/40 hover:text-rose-300"
                >
                  Çıkış yap
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Feedback banners */}
        {createdParam === "1" && (
          <div className="rounded-[1.1rem] border border-emerald-400/25 bg-emerald-400/10 px-5 py-3 text-[13px] font-medium text-emerald-200">
            Görev eklendi.
          </div>
        )}
        {updatedParam === "1" && (
          <div className="rounded-[1.1rem] border border-emerald-400/25 bg-emerald-400/10 px-5 py-3 text-[13px] font-medium text-emerald-200">
            Görev güncellendi.
          </div>
        )}
        {commentedParam === "1" && (
          <div className="rounded-[1.1rem] border border-emerald-400/25 bg-emerald-400/10 px-5 py-3 text-[13px] font-medium text-emerald-200">
            Yorum eklendi.
          </div>
        )}
        {deletedParam === "1" && (
          <div className="rounded-[1.1rem] border border-rose-400/25 bg-rose-400/10 px-5 py-3 text-[13px] font-medium text-rose-200">
            Görev silindi.
          </div>
        )}
        {errorParam && (
          <div className="rounded-[1.1rem] border border-rose-400/25 bg-rose-400/10 px-5 py-3 text-[13px] font-medium text-rose-200">
            Hata: {errorParam}
          </div>
        )}
        {result.source === "env-missing" && (
          <div className="rounded-[1.1rem] border border-amber-400/25 bg-amber-400/10 px-5 py-3 text-[13px] font-medium text-amber-200">
            Supabase bağlantısı yapılandırılmamış (SUPABASE_SERVICE_ROLE_KEY
            eksik). Görevler yüklenemiyor.
          </div>
        )}
        {result.source === "error" && (
          <div className="rounded-[1.1rem] border border-rose-400/25 bg-rose-400/10 px-5 py-3 text-[13px] font-medium text-rose-200">
            Görevler yüklenirken hata oluştu: {result.errorMessage}
          </div>
        )}

        {/* Stats */}
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
                style={{ color: DETR_ORANGE }}
              >
                {stat.label}
              </p>
              <p className="mt-1.5 font-body text-2xl font-bold text-white">
                {stat.value}
              </p>
            </article>
          ))}
        </section>

        {/* Add / edit form — collapsed-by-default accordion; "Düzenle" opens it */}
        <details
          open={formOpen}
          className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 sm:px-8 [&::-webkit-details-marker]:hidden">
            <h2 className="flex items-center gap-2 font-body text-base font-semibold text-white">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold text-black"
                style={{ backgroundImage: DETR_BRAND_GRADIENT }}
              >
                +
              </span>
              {editing ? `Görevi düzenle · ${editing.title}` : "Yeni görev ekle"}
            </h2>
            <span className="flex items-center gap-3">
              {editing ? (
                <a
                  href="/detr"
                  className="text-[13px] font-semibold"
                  style={{ color: DETR_ORANGE }}
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
                  Görev <span style={{ color: DETR_ORANGE }}>*</span>
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
                  defaultValue={editing?.assignee ?? sessionName}
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
            </div>
            <button
              type="submit"
              className="inline-flex min-h-[44px] items-center justify-center rounded-[0.9rem] px-6 py-2.5 text-[13px] font-bold tracking-tight text-black shadow-[0_12px_40px_-8px_rgba(251,146,60,0.5)] ring-1 ring-inset ring-white/15 transition hover:shadow-[0_16px_50px_-8px_rgba(251,113,133,0.6)]"
              style={{ backgroundImage: DETR_BRAND_GRADIENT }}
            >
              {editing ? "Değişiklikleri kaydet" : "Görev ekle"}
            </button>
          </form>
        </details>

        {/* Todo list */}
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
                sessionName={sessionName}
                toggleAction={toggleAction}
                deleteAction={deleteAction}
                commentAction={commentAction}
                deleteCommentAction={deleteCommentAction}
              />
            ))
          )}
        </section>
      </div>
    </main>
  );
}

type ServerFormAction = (formData: FormData) => void | Promise<void>;

interface TodoRowProps {
  item: DetrTodoItem;
  today: string;
  sessionName: string;
  toggleAction: ServerFormAction;
  deleteAction: ServerFormAction;
  commentAction: ServerFormAction;
  deleteCommentAction: ServerFormAction;
}

/**
 * One todo card: status toggle, title, kim/ne-zamana-kadar/ne-zaman-yazıldı
 * badges, edit/delete actions and a collapsible comment thread below.
 */
function TodoRow({
  item,
  today,
  sessionName,
  toggleAction,
  deleteAction,
  commentAction,
  deleteCommentAction
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
        {/* 1) Status toggle */}
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

        {/* 2) Title — primary, takes remaining width */}
        <span
          className={`min-w-0 flex-1 truncate font-body text-[14px] font-semibold ${
            isDone ? "text-white/40 line-through" : "text-white"
          }`}
          title={item.title}
        >
          {item.title}
        </span>

        {/* 3) Kim */}
        <span
          className="inline-flex max-w-[140px] shrink-0 items-center truncate rounded-full border border-orange-400/30 bg-orange-400/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-orange-300"
          title={`Sorumlu: ${item.assignee}`}
        >
          {item.assignee}
        </span>

        {/* 4) Ne zamana kadar */}
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

        {/* 5) Ne zaman yazıldı (hidden on small screens) */}
        <span
          className="hidden shrink-0 text-[11px] text-white/40 lg:inline"
          title={`Yazıldı: ${formatTimestamp(item.createdAt)}`}
        >
          {formatTimestamp(item.createdAt)}
        </span>

        {/* 6) Actions */}
        <div className="flex shrink-0 items-center gap-1.5">
          <a
            href={`/detr?edit=${item.id}`}
            className="inline-flex min-h-[30px] items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-semibold text-white/80 transition hover:border-[#FB923C]/40 hover:text-[#FB923C]"
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

      {/* Comment thread */}
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
              defaultValue={sessionName}
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
              style={{ backgroundImage: DETR_BRAND_GRADIENT }}
            >
              Gönder
            </button>
          </form>
        </div>
      </details>
    </article>
  );
}
