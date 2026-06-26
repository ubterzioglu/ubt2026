import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isTasksAdminAuthenticated } from "@/lib/admin-auth";
import { AdminGate } from "@/app/admin/_components/admin-gate";
import { tasksSignInAction, tasksSignOutAction } from "@/app/admin/_actions";
import {
  getAllProjectTasksAdmin,
  getProjectTaskByIdAdmin,
  createProjectTask,
  updateProjectTask,
  deleteProjectTask
} from "@/lib/project-tasks";
import type {
  ProjectTaskItem,
  ProjectTaskPriority,
  ProjectTaskStatus
} from "@/types/site";

interface AdminTasksPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function readParam(value: string | string[] | undefined): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? "";
  return "";
}

const inputClass =
  "w-full rounded-[1rem] border border-line/80 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent/55 focus:ring-2 focus:ring-accent/15";

const STATUS_OPTIONS: { value: ProjectTaskStatus; label: string }[] = [
  { value: "todo", label: "Yapılacak" },
  { value: "in_progress", label: "Devam ediyor" },
  { value: "done", label: "Bitti" },
  { value: "blocked", label: "Bloke" }
];

const PRIORITY_OPTIONS: { value: ProjectTaskPriority; label: string }[] = [
  { value: "low", label: "Düşük" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "Yüksek" },
  { value: "top5", label: "İlk 5" }
];

const OWNER_OPTIONS = ["Umut", "Baran", "Şahin", "Ortak", "Backlog"];

const STATUS_BADGE: Record<ProjectTaskStatus, string> = {
  todo: "bg-paper text-ink/65",
  in_progress: "bg-sky-100 text-sky-800",
  done: "bg-emerald-100 text-emerald-800",
  blocked: "bg-rose-100 text-rose-800"
};

const PRIORITY_BADGE: Record<ProjectTaskPriority, string> = {
  low: "bg-paper text-ink/55",
  normal: "bg-paper text-ink/65",
  high: "bg-amber-100 text-amber-800",
  top5: "bg-accent/15 text-accent"
};

function statusLabel(value: ProjectTaskStatus): string {
  return STATUS_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

function priorityLabel(value: ProjectTaskPriority): string {
  return (
    PRIORITY_OPTIONS.find((option) => option.value === value)?.label ?? value
  );
}

function parseStatus(value: string): ProjectTaskStatus {
  return STATUS_OPTIONS.some((option) => option.value === value)
    ? (value as ProjectTaskStatus)
    : "todo";
}

function parsePriority(value: string): ProjectTaskPriority {
  return PRIORITY_OPTIONS.some((option) => option.value === value)
    ? (value as ProjectTaskPriority)
    : "normal";
}

function parseSortOrder(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default async function AdminTasksPage({
  searchParams
}: AdminTasksPageProps) {
  const params = searchParams ? await searchParams : {};
  const hasAccess = await isTasksAdminAuthenticated();

  if (!hasAccess) {
    return (
      <AdminGate
        redirectTo="/admin/tasks"
        variant="dark"
        eyebrow="Admin erişimi"
        title="DesireMap görev panosu"
        description="Bu özel pano DesireMap görev yönetimine erişimi korur. Devam etmek için admin anahtarını gir."
        submitLabel="Görev panosunu aç"
        signInAction={tasksSignInAction}
      />
    );
  }

  const tasksResult = await getAllProjectTasksAdmin();
  const createdParam = readParam(params.created);
  const updatedParam = readParam(params.updated);
  const ownerFilter = readParam(params.owner);
  const statusFilter = readParam(params.status);
  const editId = readParam(params.edit);
  const editing = editId ? await getProjectTaskByIdAdmin(editId) : null;

  async function createAction(formData: FormData) {
    "use server";
    if (!(await isTasksAdminAuthenticated())) {
      redirect("/admin/tasks" as Parameters<typeof redirect>[0]);
    }
    await createProjectTask({
      title: (formData.get("title") as string | null) ?? "",
      owner: (formData.get("owner") as string | null) ?? "Ortak",
      category: (formData.get("category") as string | null) ?? "",
      status: parseStatus((formData.get("status") as string | null) ?? "todo"),
      priority: parsePriority(
        (formData.get("priority") as string | null) ?? "normal"
      ),
      dueTarget: (formData.get("dueTarget") as string | null) ?? "",
      notes: (formData.get("notes") as string | null) ?? "",
      sortOrder: parseSortOrder((formData.get("sortOrder") as string | null) ?? "0")
    });

    revalidatePath("/admin/tasks");
    redirect("/admin/tasks?created=1" as Parameters<typeof redirect>[0]);
  }

  async function updateAction(formData: FormData) {
    "use server";
    if (!(await isTasksAdminAuthenticated())) {
      redirect("/admin/tasks" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    if (!id) {
      redirect("/admin/tasks" as Parameters<typeof redirect>[0]);
    }
    await updateProjectTask(id, {
      title: (formData.get("title") as string | null) ?? "",
      owner: (formData.get("owner") as string | null) ?? "Ortak",
      category: (formData.get("category") as string | null) ?? "",
      status: parseStatus((formData.get("status") as string | null) ?? "todo"),
      priority: parsePriority(
        (formData.get("priority") as string | null) ?? "normal"
      ),
      dueTarget: (formData.get("dueTarget") as string | null) ?? "",
      notes: (formData.get("notes") as string | null) ?? "",
      sortOrder: parseSortOrder((formData.get("sortOrder") as string | null) ?? "0")
    });

    revalidatePath("/admin/tasks");
    redirect("/admin/tasks?updated=1" as Parameters<typeof redirect>[0]);
  }

  async function inlineStatusAction(formData: FormData) {
    "use server";
    if (!(await isTasksAdminAuthenticated())) {
      redirect("/admin/tasks" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    const status = parseStatus((formData.get("status") as string | null) ?? "todo");
    if (id) {
      await updateProjectTask(id, { status });
    }
    revalidatePath("/admin/tasks");
    redirect("/admin/tasks" as Parameters<typeof redirect>[0]);
  }

  async function deleteAction(formData: FormData) {
    "use server";
    if (!(await isTasksAdminAuthenticated())) {
      redirect("/admin/tasks" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    if (id) {
      await deleteProjectTask(id);
    }
    revalidatePath("/admin/tasks");
    redirect("/admin/tasks" as Parameters<typeof redirect>[0]);
  }

  const allTasks = tasksResult.items;
  const owners = Array.from(new Set(allTasks.map((task) => task.owner)));

  const visibleTasks = allTasks.filter((task) => {
    if (ownerFilter && task.owner !== ownerFilter) return false;
    if (statusFilter && task.status !== statusFilter) return false;
    return true;
  });

  // Group visible tasks by owner, then category, preserving query order.
  const grouped = new Map<string, Map<string, ProjectTaskItem[]>>();
  for (const task of visibleTasks) {
    if (!grouped.has(task.owner)) grouped.set(task.owner, new Map());
    const byCategory = grouped.get(task.owner)!;
    if (!byCategory.has(task.category)) byCategory.set(task.category, []);
    byCategory.get(task.category)!.push(task);
  }

  const doneCount = allTasks.filter((task) => task.status === "done").length;
  const top5Count = allTasks.filter((task) => task.priority === "top5").length;

  function filterHref(nextOwner: string, nextStatus: string): string {
    const query = new URLSearchParams();
    if (nextOwner) query.set("owner", nextOwner);
    if (nextStatus) query.set("status", nextStatus);
    const qs = query.toString();
    return qs ? `/admin/tasks?${qs}` : "/admin/tasks";
  }

  return (
    <main className="page-shell min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="section-panel px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                Proje yönetimi
              </p>
              <h1 className="mt-2 font-body text-[clamp(2rem,5vw,2.7rem)] font-semibold tracking-[-0.03em] text-ink">
                Görev panosu
              </h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="/admin"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/92"
              >
                Panoya dön
              </a>
              <form action={tasksSignOutAction}>
                <button
                  type="submit"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line/80 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-rose-300 hover:text-rose-700"
                >
                  Çıkış yap
                </button>
              </form>
            </div>
          </div>
        </section>

        {createdParam === "1" && (
          <div className="rounded-[1.35rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800">
            Görev eklendi.
          </div>
        )}
        {updatedParam === "1" && (
          <div className="rounded-[1.35rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800">
            Görev güncellendi.
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="section-panel px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              Toplam görev
            </p>
            <p className="mt-2 font-body text-3xl font-semibold text-ink">
              {allTasks.length}
            </p>
          </article>
          <article className="section-panel px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              Bitti
            </p>
            <p className="mt-2 font-body text-3xl font-semibold text-ink">
              {doneCount}
            </p>
          </article>
          <article className="section-panel px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              İlk 5
            </p>
            <p className="mt-2 font-body text-3xl font-semibold text-ink">
              {top5Count}
            </p>
          </article>
          <article className="section-panel px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              Sorumlu
            </p>
            <p className="mt-2 font-body text-3xl font-semibold text-ink">
              {owners.length}
            </p>
          </article>
        </section>

        <section className="section-panel px-6 py-6 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-body text-xl font-semibold text-ink">
              {editing ? "Görevi düzenle" : "Yeni görev ekle"}
            </h2>
            {editing ? (
              <a
                href="/admin/tasks"
                className="text-sm font-semibold text-accent hover:text-accent/80"
              >
                Düzenlemeyi iptal et
              </a>
            ) : null}
          </div>
          <form
            action={editing ? updateAction : createAction}
            className="mt-6 space-y-4"
          >
            {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-ink">
                  Görev <span className="text-accent">*</span>
                </span>
                <input
                  type="text"
                  name="title"
                  required
                  minLength={2}
                  maxLength={400}
                  defaultValue={editing?.title ?? ""}
                  placeholder="ör. Umut'a mekan datası için JSON formatını ver"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">
                  Sorumlu
                </span>
                <input
                  type="text"
                  name="owner"
                  list="task-owners"
                  defaultValue={editing?.owner ?? "Ortak"}
                  placeholder="Umut / Baran / Şahin / Ortak"
                  className={inputClass}
                />
                <datalist id="task-owners">
                  {OWNER_OPTIONS.map((owner) => (
                    <option key={owner} value={owner} />
                  ))}
                </datalist>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">
                  Kategori
                </span>
                <input
                  type="text"
                  name="category"
                  maxLength={120}
                  defaultValue={editing?.category ?? ""}
                  placeholder="ör. Veri / mekan datası"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">
                  Durum
                </span>
                <select
                  name="status"
                  defaultValue={editing?.status ?? "todo"}
                  className={inputClass}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">
                  Öncelik
                </span>
                <select
                  name="priority"
                  defaultValue={editing?.priority ?? "normal"}
                  className={inputClass}
                >
                  {PRIORITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">
                  Hedef tarih
                </span>
                <input
                  type="text"
                  name="dueTarget"
                  maxLength={80}
                  defaultValue={editing?.dueTarget ?? ""}
                  placeholder="ör. Temmuz ortası / Eylül-Ekim"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">
                  Sıra
                </span>
                <input
                  type="number"
                  name="sortOrder"
                  defaultValue={editing?.sortOrder ?? 0}
                  className={inputClass}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-ink">
                  Not
                </span>
                <textarea
                  name="notes"
                  rows={2}
                  maxLength={1000}
                  defaultValue={editing?.notes ?? ""}
                  placeholder="Opsiyonel detay / bağımlılık"
                  className={inputClass}
                />
              </label>
            </div>
            <button
              type="submit"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/95"
            >
              {editing ? "Değişiklikleri kaydet" : "Görev ekle"}
            </button>
          </form>
        </section>

        <section className="section-panel px-6 py-5 sm:px-8">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">
                Sorumlu
              </span>
              <a
                href={filterHref("", statusFilter)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  ownerFilter
                    ? "border border-line/80 bg-white text-ink hover:border-accent/40"
                    : "bg-accent text-white"
                }`}
              >
                Tümü
              </a>
              {OWNER_OPTIONS.map((owner) => (
                <a
                  key={owner}
                  href={filterHref(owner, statusFilter)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    ownerFilter === owner
                      ? "bg-accent text-white"
                      : "border border-line/80 bg-white text-ink hover:border-accent/40"
                  }`}
                >
                  {owner}
                </a>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">
                Durum
              </span>
              <a
                href={filterHref(ownerFilter, "")}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  statusFilter
                    ? "border border-line/80 bg-white text-ink hover:border-accent/40"
                    : "bg-accent text-white"
                }`}
              >
                Tümü
              </a>
              {STATUS_OPTIONS.map((option) => (
                <a
                  key={option.value}
                  href={filterHref(ownerFilter, option.value)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    statusFilter === option.value
                      ? "bg-accent text-white"
                      : "border border-line/80 bg-white text-ink hover:border-accent/40"
                  }`}
                >
                  {option.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          {visibleTasks.length === 0 ? (
            <p className="rounded-[1.35rem] border border-dashed border-line/80 px-5 py-6 text-sm text-ink/68">
              Bu filtreyle eşleşen görev yok.
            </p>
          ) : (
            Array.from(grouped.entries()).map(([owner, byCategory]) => (
              <div key={owner} className="space-y-3">
                <div className="flex items-center gap-3 px-1">
                  <h2 className="font-body text-xl font-semibold text-ink">
                    {owner}
                  </h2>
                  <span className="rounded-full bg-paper px-2.5 py-0.5 text-[11px] font-semibold text-ink/60">
                    {Array.from(byCategory.values()).reduce(
                      (sum, list) => sum + list.length,
                      0
                    )}{" "}
                    görev
                  </span>
                </div>

                {Array.from(byCategory.entries()).map(([category, tasks]) => (
                  <div
                    key={`${owner}-${category}`}
                    className="section-panel overflow-hidden px-0 py-0"
                  >
                    <div className="border-b border-line/70 bg-paper/60 px-5 py-3">
                      <h3 className="text-sm font-semibold text-ink">
                        {category || "Genel"}
                      </h3>
                    </div>
                    <div className="divide-y divide-line/60">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className={`flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between ${
                            task.status === "done" ? "opacity-60" : ""
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${STATUS_BADGE[task.status]}`}
                              >
                                {statusLabel(task.status)}
                              </span>
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${PRIORITY_BADGE[task.priority]}`}
                              >
                                {priorityLabel(task.priority)}
                              </span>
                              {task.dueTarget ? (
                                <span className="rounded-full bg-paper px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/55">
                                  {task.dueTarget}
                                </span>
                              ) : null}
                            </div>
                            <p
                              className={`mt-1.5 text-sm leading-6 text-ink ${
                                task.status === "done" ? "line-through" : ""
                              }`}
                            >
                              {task.title}
                            </p>
                            {task.notes ? (
                              <p className="mt-1 text-xs leading-5 text-ink/60">
                                {task.notes}
                              </p>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                            <form
                              action={inlineStatusAction}
                              className="flex items-center gap-2"
                            >
                              <input type="hidden" name="id" value={task.id} />
                              <select
                                name="status"
                                defaultValue={task.status}
                                className="rounded-full border border-line/80 bg-white px-3 py-1.5 text-xs font-semibold text-ink outline-none transition focus:border-accent/55"
                              >
                                {STATUS_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="submit"
                                className="inline-flex min-h-[34px] items-center justify-center rounded-full border border-line/80 bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-accent/40 hover:text-accent"
                              >
                                Uygula
                              </button>
                            </form>
                            <div className="flex items-center gap-2">
                              <a
                                href={`/admin/tasks?edit=${task.id}`}
                                className="inline-flex min-h-[34px] items-center justify-center rounded-full border border-line/80 bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-accent/40 hover:text-accent"
                              >
                                Düzenle
                              </a>
                              <form action={deleteAction}>
                                <input type="hidden" name="id" value={task.id} />
                                <button
                                  type="submit"
                                  className="inline-flex min-h-[34px] items-center justify-center rounded-full border border-line/80 bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                                >
                                  Sil
                                </button>
                              </form>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
