import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isTasksAdminAuthenticated } from "@/lib/admin-auth";
import { tasksSignInAction, tasksSignOutAction } from "@/app/dm/_actions";
import { DmLogin } from "@/app/dm/_components/dm-login";
import { TaskTable } from "@/app/dm/_components/task-table";
import { FindingsTab } from "@/app/dm/_components/findings-tab";
import { SocialTab } from "@/app/dm/_components/social-tab";
import { InfoTab } from "@/app/dm/_components/info-tab";
import { ScraperTab } from "@/app/dm/_components/scraper/scraper-tab";
import { DmNav } from "@/app/dm/_components/dm-nav";
import type { DmTabKey } from "@/app/dm/_components/dm-nav";
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
import {
  getAllFindingsAdmin,
  getFindingByIdAdmin,
  getFindingCommentsAdmin,
  createFinding,
  updateFinding,
  deleteFinding,
  addComment,
  deleteComment,
  normalizeFindingStatus,
  normalizeFindingSeverity
} from "@/lib/test-findings";
import { getAllSocialPostsAdmin, setPostShared } from "@/lib/social-posts";
import type {
  ProjectTaskPriority,
  ProjectTaskStatus,
  TestFindingSeverity,
  TestFindingStatus
} from "@/types/site";

export const metadata: Metadata = {
  robots: { index: false, follow: false }
};

// Scraper sekmesindeki tarama (arama + ekstraksiyon + sınıflandırma) server
// action içinde senkron koşar ve birkaç dakikayı bulabilir; segmenti yükselt.
export const maxDuration = 300;

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

// Per-section header copy for the content column.
const SECTION_META: Record<DmTabKey, { title: string; description: string }> = {
  tasks: {
    title: "Görevler",
    description: "Sahiplik, öncelik ve durum takibiyle DesireMap görev panosu."
  },
  findings: {
    title: "Test bulguları",
    description:
      "Test sırasında yakalanan bulgular, ekran görüntüleri ve yorum akışı."
  },
  social: {
    title: "İçerik",
    description: "Sosyal içerik planı ve platform bazlı paylaşım durumu."
  },
  info: {
    title: "Önemli bilgiler",
    description: "Ekip için kritik erişim bilgileri ve referanslar."
  },
  scraper: {
    title: "Service Finder",
    description:
      "Kategori + şehir bazlı mekan taraması — Tavily · SerpAPI · Gemini."
  }
};

const STATUS_BADGE: Record<ProjectTaskStatus, string> = {
  todo: "border border-white/[0.14] bg-gradient-to-b from-white/[0.10] to-white/[0.02] text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
  in_progress:
    "border border-cyan-400/35 bg-gradient-to-b from-cyan-400/[0.18] to-cyan-400/[0.04] text-cyan-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_10px_-2px_rgba(34,211,238,0.45)]",
  done: "border border-emerald-400/35 bg-gradient-to-b from-emerald-400/[0.16] to-emerald-400/[0.04] text-emerald-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_2px_10px_-2px_rgba(16,185,129,0.4)]",
  blocked:
    "border border-[#ff2247]/40 bg-gradient-to-b from-[#ff2247]/[0.20] to-[#ff2247]/[0.04] text-[#ff9fb0] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_2px_10px_-2px_rgba(255,34,71,0.45)]"
};

const PRIORITY_BADGE: Record<ProjectTaskPriority, string> = {
  low: "border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent text-white/50",
  normal:
    "border border-white/[0.14] bg-gradient-to-b from-white/[0.10] to-white/[0.02] text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
  high: "border border-violet-400/40 bg-gradient-to-b from-violet-400/[0.20] to-violet-400/[0.05] text-violet-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_10px_-2px_rgba(168,85,247,0.5)]",
  top5: "border border-[#ff2d95]/50 bg-gradient-to-b from-[#ff2d95]/[0.28] to-[#ff2d95]/[0.06] text-[#ffd0e6] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_3px_14px_-3px_rgba(255,45,149,0.6)]"
};

const FINDING_STATUS_OPTIONS: { value: TestFindingStatus; label: string }[] = [
  { value: "open", label: "Açık" },
  { value: "investigating", label: "İnceleniyor" },
  { value: "resolved", label: "Çözüldü" },
  { value: "wontfix", label: "Geçersiz" }
];

const FINDING_SEVERITY_OPTIONS: {
  value: TestFindingSeverity;
  label: string;
}[] = [
  { value: "low", label: "Düşük" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "Yüksek" },
  { value: "critical", label: "Kritik" }
];

const FINDING_STATUS_BADGE: Record<TestFindingStatus, string> = {
  open: "border border-[#ff2247]/40 bg-gradient-to-b from-[#ff2247]/[0.20] to-[#ff2247]/[0.04] text-[#ff9fb0] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_2px_10px_-2px_rgba(255,34,71,0.45)]",
  investigating:
    "border border-amber-400/40 bg-gradient-to-b from-amber-400/[0.20] to-amber-400/[0.04] text-amber-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_10px_-2px_rgba(251,191,36,0.5)]",
  resolved:
    "border border-emerald-400/35 bg-gradient-to-b from-emerald-400/[0.16] to-emerald-400/[0.04] text-emerald-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_2px_10px_-2px_rgba(16,185,129,0.4)]",
  wontfix:
    "border border-white/[0.14] bg-gradient-to-b from-white/[0.10] to-white/[0.02] text-white/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
};

const FINDING_SEVERITY_BADGE: Record<TestFindingSeverity, string> = {
  low: "border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent text-white/50",
  normal:
    "border border-white/[0.14] bg-gradient-to-b from-white/[0.10] to-white/[0.02] text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
  high: "border border-violet-400/40 bg-gradient-to-b from-violet-400/[0.20] to-violet-400/[0.05] text-violet-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_10px_-2px_rgba(168,85,247,0.5)]",
  critical:
    "border border-[#ff2d95]/50 bg-gradient-to-b from-[#ff2d95]/[0.28] to-[#ff2d95]/[0.06] text-[#ffd0e6] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_3px_14px_-3px_rgba(255,45,149,0.6)]"
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

  const tabParam = readParam(params.tab);
  const activeTab: DmTabKey =
    tabParam === "findings"
      ? "findings"
      : tabParam === "social"
        ? "social"
        : tabParam === "info"
          ? "info"
          : tabParam === "scraper"
            ? "scraper"
            : "tasks";
  const createdParam = readParam(params.created);
  const updatedParam = readParam(params.updated);
  const errorParam = readParam(params.error);
  const editId = readParam(params.edit);

  const tasksResult = await getAllProjectTasksAdmin();
  const editing =
    activeTab === "tasks" && editId
      ? await getProjectTaskByIdAdmin(editId)
      : null;

  // Findings data — fetched regardless so the stats/tab badge are accurate,
  // but the editing/selected lookups only run on the findings tab.
  const findingsResult = await getAllFindingsAdmin();
  const editingFinding =
    activeTab === "findings" && editId
      ? await getFindingByIdAdmin(editId)
      : null;
  const selectedFindingId = readParam(params.finding);
  const selectedFinding =
    activeTab === "findings" && selectedFindingId
      ? findingsResult.items.find((f) => f.id === selectedFindingId) ?? null
      : null;
  const selectedComments = selectedFinding
    ? await getFindingCommentsAdmin(selectedFinding.id)
    : [];

  // Social content posts — fetched regardless so the tab badge stays accurate.
  const socialResult = await getAllSocialPostsAdmin();

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

  // --- Test findings actions ---

  function findingFile(formData: FormData): File | null {
    const value = formData.get("screenshot");
    return value instanceof File && value.size > 0 ? value : null;
  }

  async function createFindingAction(formData: FormData) {
    "use server";
    if (!(await isTasksAdminAuthenticated())) {
      redirect("/dm" as Parameters<typeof redirect>[0]);
    }
    const result = await createFinding(
      {
        title: (formData.get("title") as string | null) ?? "",
        area: (formData.get("area") as string | null) ?? "",
        owner: (formData.get("owner") as string | null) ?? "Ortak",
        status: normalizeFindingStatus(
          (formData.get("status") as string | null) ?? "open"
        ),
        severity: normalizeFindingSeverity(
          (formData.get("severity") as string | null) ?? "normal"
        ),
        sortOrder: 0
      },
      findingFile(formData)
    );
    revalidatePath("/dm");
    const target = result.ok
      ? "/dm?tab=findings&created=1"
      : `/dm?tab=findings&error=${encodeURIComponent(result.errorMessage ?? "1")}`;
    redirect(target as Parameters<typeof redirect>[0]);
  }

  async function updateFindingAction(formData: FormData) {
    "use server";
    if (!(await isTasksAdminAuthenticated())) {
      redirect("/dm" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    if (!id) {
      redirect("/dm?tab=findings" as Parameters<typeof redirect>[0]);
    }
    const result = await updateFinding(
      id,
      {
        title: (formData.get("title") as string | null) ?? "",
        area: (formData.get("area") as string | null) ?? "",
        owner: (formData.get("owner") as string | null) ?? "Ortak",
        status: normalizeFindingStatus(
          (formData.get("status") as string | null) ?? "open"
        ),
        severity: normalizeFindingSeverity(
          (formData.get("severity") as string | null) ?? "normal"
        )
      },
      findingFile(formData)
    );
    revalidatePath("/dm");
    const target = result.ok
      ? "/dm?tab=findings&updated=1"
      : `/dm?tab=findings&error=${encodeURIComponent(result.errorMessage ?? "1")}`;
    redirect(target as Parameters<typeof redirect>[0]);
  }

  async function deleteFindingAction(formData: FormData) {
    "use server";
    if (!(await isTasksAdminAuthenticated())) {
      redirect("/dm" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    if (id) {
      await deleteFinding(id);
    }
    revalidatePath("/dm");
    redirect("/dm?tab=findings" as Parameters<typeof redirect>[0]);
  }

  async function resolveFindingAction(formData: FormData) {
    "use server";
    if (!(await isTasksAdminAuthenticated())) {
      redirect("/dm" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    if (id) {
      await updateFinding(id, { status: "resolved" });
    }
    revalidatePath("/dm");
    redirect("/dm?tab=findings" as Parameters<typeof redirect>[0]);
  }

  async function addCommentAction(formData: FormData) {
    "use server";
    if (!(await isTasksAdminAuthenticated())) {
      redirect("/dm" as Parameters<typeof redirect>[0]);
    }
    const findingId = (formData.get("finding") as string | null) ?? "";
    const body = (formData.get("body") as string | null) ?? "";
    const author = (formData.get("author") as string | null) ?? "Ortak";
    if (findingId) {
      await addComment(findingId, body, author);
    }
    revalidatePath("/dm");
    redirect(
      `/dm?tab=findings&finding=${findingId}#yorumlar` as Parameters<
        typeof redirect
      >[0]
    );
  }

  async function deleteCommentAction(formData: FormData) {
    "use server";
    if (!(await isTasksAdminAuthenticated())) {
      redirect("/dm" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    const findingId = (formData.get("finding") as string | null) ?? "";
    if (id) {
      await deleteComment(id);
    }
    revalidatePath("/dm");
    redirect(
      `/dm?tab=findings&finding=${findingId}#yorumlar` as Parameters<
        typeof redirect
      >[0]
    );
  }

  // --- Social content actions ---

  async function toggleShareAction(formData: FormData) {
    "use server";
    if (!(await isTasksAdminAuthenticated())) {
      redirect("/dm" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    const platform = (formData.get("platform") as string | null) ?? "";
    const shared = (formData.get("shared") as string | null) === "1";
    if (id && platform) {
      await setPostShared(id, platform, shared);
    }
    revalidatePath("/dm");
    redirect("/dm?tab=social" as Parameters<typeof redirect>[0]);
  }

  const allTasks = tasksResult.items;
  const owners = Array.from(new Set(allTasks.map((task) => task.owner)));

  const allFindings = findingsResult.items;
  const findingOwners = Array.from(
    new Set(allFindings.map((f) => f.owner))
  );

  const allSocialPosts = socialResult.items;

  const doneCount = allTasks.filter((task) => task.status === "done").length;
  const top5Count = allTasks.filter((task) => task.priority === "top5").length;

  const cardClass =
    "rounded-[1.6rem] bg-gradient-to-b from-white/12 via-white/[0.04] to-transparent p-[1.3px] shadow-[0_30px_90px_-30px_rgba(0,0,0,0.85)]";
  const cardInnerClass =
    "rounded-[1.55rem] bg-[#0a0712]/85 backdrop-blur-2xl";

  return (
    <main
      // overflow-x-clip (hidden DEĞİL): overflow-hidden ancestor'ı sticky'yi
      // kırar — sidebar'ın lg:sticky çalışması için clip şart.
      className="relative isolate min-h-screen overflow-x-clip px-4 py-8 sm:px-6 lg:px-8"
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

      <div className="animate-reveal mx-auto w-full max-w-[88rem] lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:items-start lg:gap-6">
        {/* Left navigation — sidebar on desktop, top bar + strip on mobile */}
        <DmNav
          activeTab={activeTab}
          items={[
            { key: "tasks", label: "Görevler", count: allTasks.length },
            {
              key: "findings",
              label: "Test bulguları",
              count: allFindings.length
            },
            { key: "social", label: "İçerik", count: allSocialPosts.length },
            { key: "info", label: "Önemli bilgiler", count: 6 },
            { key: "scraper", label: "Scraper" }
          ]}
          cardClass={cardClass}
          cardInnerClass={cardInnerClass}
          signOutAction={tasksSignOutAction}
        />

        {/* Content column */}
        <div className="mt-5 flex min-w-0 flex-col gap-5 lg:mt-0">
          {/* Active section header */}
          <section className={cardClass}>
            <div className={`${cardInnerClass} px-5 py-4 sm:px-6`}>
              <p
                className="text-[9px] font-semibold uppercase tracking-[0.28em]"
                style={{ color: "#f0abfc" }}
              >
                DesireMap · iç panel
              </p>
              <h1 className="mt-1 font-body text-[clamp(1.15rem,2.6vw,1.5rem)] font-bold tracking-[-0.035em] text-white">
                {SECTION_META[activeTab].title}
              </h1>
              <p className="mt-1 text-xs leading-5 text-white/50">
                {SECTION_META[activeTab].description}
              </p>
            </div>
          </section>

        {createdParam === "1" && (
          <div className="rounded-[1.1rem] border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-xs font-medium text-emerald-300">
            {activeTab === "findings" ? "Bulgu eklendi." : "Görev eklendi."}
          </div>
        )}
        {updatedParam === "1" && (
          <div className="rounded-[1.1rem] border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-xs font-medium text-emerald-300">
            {activeTab === "findings" ? "Bulgu güncellendi." : "Görev güncellendi."}
          </div>
        )}
        {errorParam ? (
          <div className="rounded-[1.1rem] border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-xs font-medium text-rose-200">
            {errorParam}
          </div>
        ) : null}

        {activeTab === "tasks" ? (
        <>
        {/* Stats */}
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Toplam görev", value: allTasks.length },
            { label: "Bitti", value: doneCount },
            { label: "İlk 5", value: top5Count },
            { label: "Sorumlu", value: owners.length }
          ].map((stat) => (
            <article
              key={stat.label}
              className={`${cardClass} transition duration-300 hover:-translate-y-0.5`}
            >
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

        {/* Add / edit form — collapsed accordion (auto-opens when editing) */}
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
                {editing ? "Görevi düzenle" : "Yeni görev ekle"}
              </h2>
              <span className="flex items-center gap-3">
                {editing ? (
                  <a
                    href="/dm"
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
              className="space-y-3"
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
          </details>
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
        </>
        ) : activeTab === "findings" ? (
          <FindingsTab
            findings={allFindings}
            owners={findingOwners}
            ownerOptions={OWNER_OPTIONS}
            statusOptions={FINDING_STATUS_OPTIONS}
            severityOptions={FINDING_SEVERITY_OPTIONS}
            statusBadge={FINDING_STATUS_BADGE}
            severityBadge={FINDING_SEVERITY_BADGE}
            editing={editingFinding}
            selected={selectedFinding}
            comments={selectedComments}
            cardClass={cardClass}
            cardInnerClass={cardInnerClass}
            inputClass={inputClass}
            createAction={createFindingAction}
            updateAction={updateFindingAction}
            deleteAction={deleteFindingAction}
            resolveAction={resolveFindingAction}
            addCommentAction={addCommentAction}
            deleteCommentAction={deleteCommentAction}
          />
        ) : activeTab === "social" ? (
          <SocialTab
            posts={allSocialPosts}
            cardClass={cardClass}
            cardInnerClass={cardInnerClass}
            toggleShareAction={toggleShareAction}
          />
        ) : activeTab === "info" ? (
          <InfoTab cardClass={cardClass} cardInnerClass={cardInnerClass} />
        ) : (
          <ScraperTab
            params={params}
            cardClass={cardClass}
            cardInnerClass={cardInnerClass}
            inputClass={inputClass}
          />
        )}
        </div>
      </div>
    </main>
  );
}
