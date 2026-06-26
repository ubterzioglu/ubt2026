import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isTasksAdminAuthenticated } from "@/lib/admin-auth";
import { AdminGate } from "@/app/admin/_components/admin-gate";
import { tasksSignInAction, tasksSignOutAction } from "@/app/dm/_actions";
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

interface DmPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function readParam(value: string | string[] | undefined): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? "";
  return "";
}

const inputClass =
  "w-full rounded-[1.05rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition focus:border-accent/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-accent/15";

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
  todo: "border border-white/10 bg-white/[0.06] text-white/60",
  in_progress: "border border-sky-400/25 bg-sky-400/10 text-sky-300",
  done: "border border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  blocked: "border border-rose-400/25 bg-rose-400/10 text-rose-300"
};

const PRIORITY_BADGE: Record<ProjectTaskPriority, string> = {
  low: "border border-white/10 bg-white/[0.04] text-white/45",
  normal: "border border-white/10 bg-white/[0.06] text-white/60",
  high: "border border-amber-400/25 bg-amber-400/10 text-amber-300",
  top5: "border border-accent/40 bg-accent/15 text-accent"
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

export default async function DmPage({ searchParams }: DmPageProps) {
  const params = searchParams ? await searchParams : {};
  const hasAccess = await isTasksAdminAuthenticated();

  if (!hasAccess) {
    return (
      <AdminGate
        redirectTo="/dm"
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
      redirect("/dm" as Parameters<typeof redirect>[0]);
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

    revalidatePath("/dm");
    redirect("/dm?created=1" as Parameters<typeof redirect>[0]);
  }

  async function updateAction(formData: FormData) {
    "use server";
    if (!(await isTasksAdminAuthenticated())) {
      redirect("/dm" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    if (!id) {
      redirect("/dm" as Parameters<typeof redirect>[0]);
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

    revalidatePath("/dm");
    redirect("/dm?updated=1" as Parameters<typeof redirect>[0]);
  }

  async function inlineStatusAction(formData: FormData) {
    "use server";
    if (!(await isTasksAdminAuthenticated())) {
      redirect("/dm" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    const status = parseStatus((formData.get("status") as string | null) ?? "todo");
    if (id) {
      await updateProjectTask(id, { status });
    }
    revalidatePath("/dm");
    redirect("/dm" as Parameters<typeof redirect>[0]);
  }

  async function deleteAction(formData: FormData) {
    "use server";
    if (!(await isTasksAdminAuthenticated())) {
      redirect("/dm" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    if (id) {
      await deleteProjectTask(id);
    }
    revalidatePath("/dm");
    redirect("/dm" as Parameters<typeof redirect>[0]);
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
    return qs ? `/dm?${qs}` : "/dm";
  }

  const cardClass =
    "rounded-[1.6rem] bg-gradient-to-b from-white/12 via-white/[0.04] to-transparent p-[1.3px] shadow-[0_30px_90px_-30px_rgba(0,0,0,0.85)]";
  const cardInnerClass =
    "rounded-[1.55rem] bg-[#0b1118]/85 backdrop-blur-2xl";
  const chipActive =
    "rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white shadow-[0_8px_24px_-8px_rgba(27,122,110,0.8)]";
  const chipIdle =
    "rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/65 transition hover:border-accent/40 hover:text-white";
  const ghostButton =
    "inline-flex min-h-[34px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:border-accent/40 hover:text-white";

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#070b10] px-4 py-8 sm:px-6 lg:px-8">
      {/* Ambient glow field */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 55% at 18% 8%, rgba(27,122,110,0.30), transparent 60%)," +
            "radial-gradient(48% 50% at 88% 4%, rgba(202,124,71,0.18), transparent 58%)," +
            "radial-gradient(70% 80% at 50% 118%, rgba(27,122,110,0.16), transparent 60%)," +
            "linear-gradient(180deg, #080c12 0%, #06090d 55%, #04060a 100%)"
        }}
      />
      {/* Fine grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.3]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(120% 70% at 50% 0%, black, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(120% 70% at 50% 0%, black, transparent 75%)"
        }}
      />
      {/* Floating accent orbs */}
      <div
        aria-hidden
        className="animate-float pointer-events-none absolute -left-28 top-32 -z-10 h-72 w-72 rounded-full bg-accent/20 blur-[120px]"
      />
      <div
        aria-hidden
        className="animate-drift pointer-events-none absolute -right-24 top-[40rem] -z-10 h-80 w-80 rounded-full bg-sunrise/15 blur-[130px]"
      />

      <div className="animate-reveal mx-auto flex max-w-6xl flex-col gap-6">
        {/* Header */}
        <section className={cardClass}>
          <div className={`${cardInnerClass} relative overflow-hidden px-6 py-6 sm:px-8`}>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
            />
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3.5">
                <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-[#0f4f47] shadow-lg shadow-accent/30 ring-1 ring-white/15">
                  <span className="font-body text-lg font-extrabold tracking-tight text-white">
                    D
                  </span>
                  <span className="absolute -inset-px rounded-2xl ring-1 ring-inset ring-white/10" />
                </span>
                <div className="leading-tight">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent/90">
                    Proje yönetimi
                  </p>
                  <h1 className="mt-1 font-body text-[clamp(1.7rem,4vw,2.3rem)] font-bold tracking-[-0.035em] text-white">
                    Görev panosu
                  </h1>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  Secure
                </span>
                <form action={tasksSignOutAction}>
                  <button
                    type="submit"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:border-rose-400/40 hover:text-rose-300"
                  >
                    Çıkış yap
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {createdParam === "1" && (
          <div className="rounded-[1.35rem] border border-emerald-400/25 bg-emerald-400/10 px-5 py-4 text-sm font-medium text-emerald-300">
            Görev eklendi.
          </div>
        )}
        {updatedParam === "1" && (
          <div className="rounded-[1.35rem] border border-emerald-400/25 bg-emerald-400/10 px-5 py-4 text-sm font-medium text-emerald-300">
            Görev güncellendi.
          </div>
        )}

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Toplam görev", value: allTasks.length },
            { label: "Bitti", value: doneCount },
            { label: "İlk 5", value: top5Count },
            { label: "Sorumlu", value: owners.length }
          ].map((stat) => (
            <article key={stat.label} className={cardClass}>
              <div className={`${cardInnerClass} px-6 py-5`}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent/90">
                  {stat.label}
                </p>
                <p className="mt-2 font-body text-3xl font-bold text-white">
                  {stat.value}
                </p>
              </div>
            </article>
          ))}
        </section>

        {/* Add / edit form */}
        <section className={cardClass}>
          <div className={`${cardInnerClass} px-6 py-6 sm:px-8`}>
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-body text-xl font-semibold text-white">
                {editing ? "Görevi düzenle" : "Yeni görev ekle"}
              </h2>
              {editing ? (
                <a
                  href="/dm"
                  className="text-sm font-semibold text-accent transition hover:text-accent/80"
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
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
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
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
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
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
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
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
                    Durum
                  </span>
                  <select
                    name="status"
                    defaultValue={editing?.status ?? "todo"}
                    className={inputClass}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        className="bg-[#0b1118] text-white"
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
                    Öncelik
                  </span>
                  <select
                    name="priority"
                    defaultValue={editing?.priority ?? "normal"}
                    className={inputClass}
                  >
                    {PRIORITY_OPTIONS.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        className="bg-[#0b1118] text-white"
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
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
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
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
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
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
                className="group relative inline-flex min-h-[48px] items-center justify-center gap-2 overflow-hidden rounded-[1.05rem] px-6 py-3 text-sm font-bold tracking-tight text-white shadow-[0_12px_40px_-8px_rgba(27,122,110,0.7)] ring-1 ring-inset ring-white/15 transition duration-300 hover:shadow-[0_16px_50px_-8px_rgba(27,122,110,0.85)] focus:outline-none focus:ring-2 focus:ring-accent/60"
                style={{
                  backgroundImage:
                    "linear-gradient(110deg, rgb(27,122,110) 0%, rgb(34,150,135) 50%, rgb(27,122,110) 100%)"
                }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                />
                {editing ? "Değişiklikleri kaydet" : "Görev ekle"}
              </button>
            </form>
          </div>
        </section>

        {/* Filters */}
        <section className={cardClass}>
          <div className={`${cardInnerClass} px-6 py-5 sm:px-8`}>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
                  Sorumlu
                </span>
                <a
                  href={filterHref("", statusFilter)}
                  className={ownerFilter ? chipIdle : chipActive}
                >
                  Tümü
                </a>
                {OWNER_OPTIONS.map((owner) => (
                  <a
                    key={owner}
                    href={filterHref(owner, statusFilter)}
                    className={ownerFilter === owner ? chipActive : chipIdle}
                  >
                    {owner}
                  </a>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
                  Durum
                </span>
                <a
                  href={filterHref(ownerFilter, "")}
                  className={statusFilter ? chipIdle : chipActive}
                >
                  Tümü
                </a>
                {STATUS_OPTIONS.map((option) => (
                  <a
                    key={option.value}
                    href={filterHref(ownerFilter, option.value)}
                    className={statusFilter === option.value ? chipActive : chipIdle}
                  >
                    {option.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Task list */}
        <section className="space-y-6">
          {visibleTasks.length === 0 ? (
            <p className="rounded-[1.35rem] border border-dashed border-white/15 px-5 py-6 text-sm text-white/55">
              Bu filtreyle eşleşen görev yok.
            </p>
          ) : (
            Array.from(grouped.entries()).map(([owner, byCategory]) => (
              <div key={owner} className="space-y-3">
                <div className="flex items-center gap-3 px-1">
                  <h2 className="font-body text-xl font-semibold text-white">
                    {owner}
                  </h2>
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[11px] font-semibold text-white/55">
                    {Array.from(byCategory.values()).reduce(
                      (sum, list) => sum + list.length,
                      0
                    )}{" "}
                    görev
                  </span>
                </div>

                {Array.from(byCategory.entries()).map(([category, tasks]) => (
                  <div key={`${owner}-${category}`} className={cardClass}>
                    <div className={`${cardInnerClass} overflow-hidden`}>
                      <div className="border-b border-white/[0.07] bg-white/[0.03] px-5 py-3">
                        <h3 className="text-sm font-semibold text-white/85">
                          {category || "Genel"}
                        </h3>
                      </div>
                      <div className="divide-y divide-white/[0.06]">
                        {tasks.map((task) => (
                          <div
                            key={task.id}
                            className={`flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between ${
                              task.status === "done" ? "opacity-55" : ""
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
                                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">
                                    {task.dueTarget}
                                  </span>
                                ) : null}
                              </div>
                              <p
                                className={`mt-1.5 text-sm leading-6 text-white/90 ${
                                  task.status === "done" ? "line-through" : ""
                                }`}
                              >
                                {task.title}
                              </p>
                              {task.notes ? (
                                <p className="mt-1 text-xs leading-5 text-white/45">
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
                                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/80 outline-none transition focus:border-accent/55"
                                >
                                  {STATUS_OPTIONS.map((option) => (
                                    <option
                                      key={option.value}
                                      value={option.value}
                                      className="bg-[#0b1118] text-white"
                                    >
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                                <button type="submit" className={ghostButton}>
                                  Uygula
                                </button>
                              </form>
                              <div className="flex items-center gap-2">
                                <a
                                  href={`/dm?edit=${task.id}`}
                                  className={ghostButton}
                                >
                                  Düzenle
                                </a>
                                <form action={deleteAction}>
                                  <input type="hidden" name="id" value={task.id} />
                                  <button
                                    type="submit"
                                    className="inline-flex min-h-[34px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:border-rose-400/40 hover:bg-rose-400/10 hover:text-rose-300"
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
