import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isTasksAdminAuthenticated } from "@/lib/admin-auth";
import { tasksSignInAction, tasksSignOutAction } from "@/app/dm/_actions";
import { DmLogin } from "@/app/dm/_components/dm-login";
import { TaskTable } from "@/app/dm/_components/task-table";
import {
  DM_AMBIENT_BACKGROUND,
  DM_BRAND_GRADIENT,
  DM_GRID_TEXTURE
} from "@/app/dm/_components/theme";
import {
  getAllProjectTasksAdmin,
  getProjectTaskByIdAdmin,
  createProjectTask,
  updateProjectTask,
  deleteProjectTask
} from "@/lib/project-tasks";
import type {
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
  "w-full rounded-[0.85rem] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white placeholder:text-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition focus:border-[#ff2d95]/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-[#ff2d95]/15";

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
  todo: "border border-white/12 bg-white/[0.06] text-white/65",
  in_progress: "border border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
  done: "border border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  blocked: "border border-[#ff2247]/35 bg-[#ff2247]/10 text-[#ff8aa0]"
};

const PRIORITY_BADGE: Record<ProjectTaskPriority, string> = {
  low: "border border-white/10 bg-white/[0.04] text-white/45",
  normal: "border border-white/12 bg-white/[0.06] text-white/65",
  high: "border border-violet-400/35 bg-violet-400/12 text-violet-200",
  top5: "border border-[#ff2d95]/45 bg-[#ff2d95]/15 text-[#ff7bc0]"
};

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
      <DmLogin
        signIn={tasksSignInAction}
        eyebrow="Admin erişimi"
        title="DesireMap görev panosu"
        description="Bu özel pano DesireMap görev yönetimine erişimi korur. Devam etmek için admin anahtarını gir."
        submitLabel="Görev panosunu aç"
      />
    );
  }

  const tasksResult = await getAllProjectTasksAdmin();
  const createdParam = readParam(params.created);
  const updatedParam = readParam(params.updated);
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

  const doneCount = allTasks.filter((task) => task.status === "done").length;
  const top5Count = allTasks.filter((task) => task.priority === "top5").length;

  const cardClass =
    "rounded-[1.6rem] bg-gradient-to-b from-white/12 via-white/[0.04] to-transparent p-[1.3px] shadow-[0_30px_90px_-30px_rgba(0,0,0,0.85)]";
  const cardInnerClass =
    "rounded-[1.55rem] bg-[#0a0712]/85 backdrop-blur-2xl";

  return (
    <main
      className="relative isolate min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8"
      style={{ background: DM_AMBIENT_BACKGROUND }}
    >
      {/* Fine grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.3]"
        style={DM_GRID_TEXTURE}
      />
      {/* Floating neon orbs */}
      <div
        aria-hidden
        className="animate-float pointer-events-none absolute -left-28 top-32 -z-10 h-72 w-72 rounded-full blur-[120px]"
        style={{ background: "rgba(255,45,149,0.22)" }}
      />
      <div
        aria-hidden
        className="animate-drift pointer-events-none absolute -right-24 top-[40rem] -z-10 h-80 w-80 rounded-full blur-[130px]"
        style={{ background: "rgba(34,211,238,0.18)" }}
      />
      <div
        aria-hidden
        className="animate-float pointer-events-none absolute left-[35%] top-[18rem] -z-10 h-64 w-64 rounded-full blur-[140px]"
        style={{ background: "rgba(168,85,247,0.16)" }}
      />

      <div className="animate-reveal mx-auto flex max-w-6xl flex-col gap-6">
        {/* Header */}
        <section className={cardClass}>
          <div className={`${cardInnerClass} relative overflow-hidden px-5 py-4 sm:px-6`}>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
            />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="relative flex h-9 w-9 items-center justify-center rounded-xl shadow-lg shadow-[#ff2d95]/30 ring-1 ring-white/15"
                  style={{ backgroundImage: DM_BRAND_GRADIENT }}
                >
                  <span className="font-body text-sm font-extrabold tracking-tight text-white">
                    D
                  </span>
                  <span className="absolute -inset-px rounded-xl ring-1 ring-inset ring-white/10" />
                </span>
                <div className="leading-tight">
                  <p
                    className="text-[9px] font-semibold uppercase tracking-[0.28em]"
                    style={{ color: "#f0abfc" }}
                  >
                    Proje yönetimi
                  </p>
                  <h1 className="mt-0.5 font-body text-[clamp(1.1rem,2.6vw,1.5rem)] font-bold tracking-[-0.035em] text-white">
                    Görev panosu
                  </h1>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  Secure
                </span>
                <form action={tasksSignOutAction}>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-rose-400/40 hover:text-rose-300"
                  >
                    Çıkış yap
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {createdParam === "1" && (
          <div className="rounded-[1.1rem] border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-xs font-medium text-emerald-300">
            Görev eklendi.
          </div>
        )}
        {updatedParam === "1" && (
          <div className="rounded-[1.1rem] border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-xs font-medium text-emerald-300">
            Görev güncellendi.
          </div>
        )}

        {/* Stats */}
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Toplam görev", value: allTasks.length },
            { label: "Bitti", value: doneCount },
            { label: "İlk 5", value: top5Count },
            { label: "Sorumlu", value: owners.length }
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

        {/* Add / edit form */}
        <section className={cardClass}>
          <div className={`${cardInnerClass} px-4 py-4 sm:px-5`}>
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-body text-sm font-semibold text-white">
                {editing ? "Görevi düzenle" : "Yeni görev ekle"}
              </h2>
              {editing ? (
                <a
                  href="/dm"
                  className="text-xs font-semibold text-[#67e8f9] transition hover:text-[#67e8f9]/80"
                >
                  Düzenlemeyi iptal et
                </a>
              ) : null}
            </div>
            <form
              action={editing ? updateAction : createAction}
              className="mt-4 space-y-3"
            >
              {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
                    Görev <span className="text-[#ff2d95]">*</span>
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
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
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
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
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
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
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
                        className="bg-[#0a0712] text-white"
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
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
                        className="bg-[#0a0712] text-white"
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
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
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
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
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
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
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-[0.85rem] px-5 py-2.5 text-xs font-bold tracking-tight text-white shadow-[0_14px_44px_-10px_rgba(255,45,149,0.65)] ring-1 ring-inset ring-white/15 transition duration-300 hover:shadow-[0_18px_56px_-10px_rgba(168,85,247,0.85)] focus:outline-none focus:ring-2 focus:ring-[#ff2d95]/60"
                style={{ backgroundImage: DM_BRAND_GRADIENT }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                />
                {editing ? "Değişiklikleri kaydet" : "Görev ekle"}
              </button>
            </form>
          </div>
        </section>

        {/* Task list — search, filter, single flat list */}
        <section className={cardClass}>
          <div className={`${cardInnerClass} px-4 py-4 sm:px-5`}>
            <TaskTable
              tasks={allTasks}
              statusOptions={STATUS_OPTIONS}
              priorityOptions={PRIORITY_OPTIONS}
              owners={owners}
              statusBadge={STATUS_BADGE}
              priorityBadge={PRIORITY_BADGE}
              inlineStatusAction={inlineStatusAction}
              deleteAction={deleteAction}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
