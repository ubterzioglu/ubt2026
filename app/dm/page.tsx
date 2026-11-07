import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { readSearchParam } from "@/lib/search-params";
import { readFormString } from "@/lib/form-data";
import { isTasksAdminAuthenticated } from "@/lib/admin-auth";
import { tasksSignInAction, tasksSignOutAction } from "@/app/dm/_actions";
import { requireDmAccess } from "@/app/dm/_auth";
import { DmLogin } from "@/app/dm/_components/dm-login";
import { TaskTable } from "@/app/dm/_components/task-table";
import { FindingsTab } from "@/app/dm/_components/findings-tab";
import { SocialTab } from "@/app/dm/_components/social-tab";
import { InfoTab, PROFILES } from "@/app/dm/_components/info-tab";
import { StatGrid } from "@/app/dm/_components/stat-grid";
import { ScraperTab } from "@/app/dm/_components/scraper/scraper-tab";
import { DM_NAV_ITEMS, DmNav } from "@/app/dm/_components/dm-nav";
import type { DmTabKey } from "@/app/dm/_components/dm-nav";
import { BoardGuide } from "@/app/dm/_components/board-guide";
import type { BoardGuideContent } from "@/app/dm/_components/board-guide";
import {
  FINDING_SEVERITY_BADGE,
  FINDING_STATUS_BADGE,
  PRIORITY_BADGE,
  STATUS_BADGE
} from "@/app/dm/_components/badge-styles";
import {
  DM_AMBIENT_BACKGROUND,
  DM_BRAND_GRADIENT,
  DM_CARD_CLASS,
  DM_CARD_INNER_CLASS,
  DM_GRID_TEXTURE,
  DM_INPUT_CLASS,
  DM_LABEL_CLASS
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

// Collapsed how-to card shown at the top of the Tasks tab.
const TASKS_GUIDE: BoardGuideContent = {
  title: "Bu sekme ne işe yarar? · Kullanım rehberi",
  intro:
    "Görevler, DesireMap ekibinin ortak yapılacaklar panosu. Her görevin " +
    "bir sahibi, önceliği ve durumu var; \"Yeni görev ekle\" ile eklenir, " +
    "listeden durumu tek tıkla değiştirilir.",
  sections: [
    {
      heading: "1 · Görev ekleme",
      text: "Yeni bir görevi panoya kaydetmek için:",
      steps: [
        "Sayfanın üstündeki 'Yeni görev ekle' akordeonuna tıkla — form açılır.",
        "Görev başlığını gir (zorunlu, 2–400 karakter).",
        "Sorumluyu seç veya yaz: Umut, Baran, Şahin, Ortak ya da Backlog.",
        "İstersen kategori (ör. 'Veri / mekan datası') ve hedef tarih (ör. 'Temmuz ortası') gir.",
        "Durum ve önceliği seç (varsayılan: Yapılacak / Normal).",
        "Gerekirse Not alanına detay veya bağımlılık yaz.",
        "'Görev ekle' butonuna bas — görev listenin başına eklenir."
      ]
    },
    {
      heading: "2 · Durumu güncelleme",
      text:
        "Formu açmadan tek görevin durumunu değiştirmek için liste " +
        "satırındaki durum rozetine tıkla; yeni durum hemen kaydedilir.",
      steps: [
        "Akış: Yapılacak → Devam ediyor → Bitti (ya da Bloke).",
        "Durum rozeti listede sağ tarafta, görev başlığının yanında görünür.",
        "Rozete tıklamak açılır menü gösterir; istediğin durumu seç."
      ]
    },
    {
      heading: "3 · Öncelik anlamları",
      text: "Öncelik, görevin ne kadar acil olduğunu gösterir:",
      steps: [
        "Düşük — bekleyebilir, arka plan işi.",
        "Normal — standart iş akışı, varsayılan öncelik.",
        "Yüksek — yakın zamanda ele alınmalı.",
        "İlk 5 — şu anki en kritik 5 işten biri, üst sıralarda tutulur."
      ]
    },
    {
      heading: "4 · Düzenleme ve silme",
      text: "Var olan bir görevi değiştirmek veya kaldırmak için:",
      steps: [
        "Liste satırındaki kalem (düzenle) ikonuna tıkla — form o görevin bilgileriyle açılır.",
        "Alanları güncelleyip 'Değişiklikleri kaydet' ile onayla, ya da 'İptal' ile vazgeç.",
        "Çöp kutusu ikonu görevi kalıcı olarak siler — bu işlem geri alınamaz."
      ]
    },
    {
      heading: "5 · Arama ve filtreleme",
      text: "Büyüyen listede hızlıca gezinmek için:",
      steps: [
        "Liste üstündeki arama kutusuna görev başlığından bir kelime yaz.",
        "Sorumlu filtresiyle sadece belirli bir kişinin görevlerini gör.",
        "Durum filtresiyle örneğin sadece 'Bloke' olan görevleri listele."
      ]
    }
  ]
};

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
  },
  rapor: {
    title: "Rapor",
    description: "Taranan tüm mekanların tam listesi — bağımsız sayfa."
  }
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

  const tabParam = readSearchParam(params.tab);
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
  const createdParam = readSearchParam(params.created);
  const updatedParam = readSearchParam(params.updated);
  const errorParam = readSearchParam(params.error);
  const editId = readSearchParam(params.edit);

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
  const selectedFindingId = readSearchParam(params.finding);
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
    await requireDmAccess();
    const result = await createProjectTask({
      title: readFormString(formData, "title"),
      owner: readFormString(formData, "owner", "Ortak"),
      category: readFormString(formData, "category"),
      status: parseStatus(readFormString(formData, "status", "todo")),
      priority: parsePriority(
        readFormString(formData, "priority", "normal")
      ),
      dueTarget: readFormString(formData, "dueTarget"),
      notes: readFormString(formData, "notes"),
      sortOrder: parseSortOrder(readFormString(formData, "sortOrder", "0"))
    });

    revalidatePath("/dm");
    const target = result.ok
      ? "/dm?created=1"
      : `/dm?error=${encodeURIComponent(result.errorMessage ?? "1")}`;
    redirect(target as Parameters<typeof redirect>[0]);
  }

  async function updateAction(formData: FormData) {
    "use server";
    await requireDmAccess();
    const id = readFormString(formData, "id");
    if (!id) {
      redirect("/dm" as Parameters<typeof redirect>[0]);
    }
    const result = await updateProjectTask(id, {
      title: readFormString(formData, "title"),
      owner: readFormString(formData, "owner", "Ortak"),
      category: readFormString(formData, "category"),
      status: parseStatus(readFormString(formData, "status", "todo")),
      priority: parsePriority(
        readFormString(formData, "priority", "normal")
      ),
      dueTarget: readFormString(formData, "dueTarget"),
      notes: readFormString(formData, "notes"),
      sortOrder: parseSortOrder(readFormString(formData, "sortOrder", "0"))
    });

    revalidatePath("/dm");
    const target = result.ok
      ? "/dm?updated=1"
      : `/dm?error=${encodeURIComponent(result.errorMessage ?? "1")}`;
    redirect(target as Parameters<typeof redirect>[0]);
  }

  async function inlineStatusAction(formData: FormData) {
    "use server";
    await requireDmAccess();
    const id = readFormString(formData, "id");
    const status = parseStatus(readFormString(formData, "status", "todo"));
    const result = id ? await updateProjectTask(id, { status }) : null;
    revalidatePath("/dm");
    const target =
      result && !result.ok
        ? `/dm?error=${encodeURIComponent(result.errorMessage ?? "1")}`
        : "/dm";
    redirect(target as Parameters<typeof redirect>[0]);
  }

  async function deleteAction(formData: FormData) {
    "use server";
    await requireDmAccess();
    const id = readFormString(formData, "id");
    const result = id ? await deleteProjectTask(id) : null;
    revalidatePath("/dm");
    const target =
      result && !result.ok
        ? `/dm?error=${encodeURIComponent(result.errorMessage ?? "1")}`
        : "/dm";
    redirect(target as Parameters<typeof redirect>[0]);
  }

  // --- Test findings actions ---

  function findingFile(formData: FormData): File | null {
    const value = formData.get("screenshot");
    return value instanceof File && value.size > 0 ? value : null;
  }

  async function createFindingAction(formData: FormData) {
    "use server";
    await requireDmAccess();
    const result = await createFinding(
      {
        title: readFormString(formData, "title"),
        area: readFormString(formData, "area"),
        owner: readFormString(formData, "owner", "Ortak"),
        status: normalizeFindingStatus(
          readFormString(formData, "status", "open")
        ),
        severity: normalizeFindingSeverity(
          readFormString(formData, "severity", "normal")
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
    await requireDmAccess();
    const id = readFormString(formData, "id");
    if (!id) {
      redirect("/dm?tab=findings" as Parameters<typeof redirect>[0]);
    }
    const result = await updateFinding(
      id,
      {
        title: readFormString(formData, "title"),
        area: readFormString(formData, "area"),
        owner: readFormString(formData, "owner", "Ortak"),
        status: normalizeFindingStatus(
          readFormString(formData, "status", "open")
        ),
        severity: normalizeFindingSeverity(
          readFormString(formData, "severity", "normal")
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
    await requireDmAccess();
    const id = readFormString(formData, "id");
    const result = id ? await deleteFinding(id) : null;
    revalidatePath("/dm");
    const target =
      result && !result.ok
        ? `/dm?tab=findings&error=${encodeURIComponent(result.errorMessage ?? "1")}`
        : "/dm?tab=findings";
    redirect(target as Parameters<typeof redirect>[0]);
  }

  async function resolveFindingAction(formData: FormData) {
    "use server";
    await requireDmAccess();
    const id = readFormString(formData, "id");
    const result = id ? await updateFinding(id, { status: "resolved" }) : null;
    revalidatePath("/dm");
    const target =
      result && !result.ok
        ? `/dm?tab=findings&error=${encodeURIComponent(result.errorMessage ?? "1")}`
        : "/dm?tab=findings";
    redirect(target as Parameters<typeof redirect>[0]);
  }

  async function addCommentAction(formData: FormData) {
    "use server";
    await requireDmAccess();
    const findingId = readFormString(formData, "finding");
    const body = readFormString(formData, "body");
    const author = readFormString(formData, "author", "Ortak");
    const result = findingId ? await addComment(findingId, body, author) : null;
    revalidatePath("/dm");
    const errorSuffix =
      result && !result.ok
        ? `&error=${encodeURIComponent(result.errorMessage ?? "1")}`
        : "";
    redirect(
      `/dm?tab=findings&finding=${findingId}${errorSuffix}#yorumlar` as Parameters<
        typeof redirect
      >[0]
    );
  }

  async function deleteCommentAction(formData: FormData) {
    "use server";
    await requireDmAccess();
    const id = readFormString(formData, "id");
    const findingId = readFormString(formData, "finding");
    const result = id ? await deleteComment(id) : null;
    revalidatePath("/dm");
    const errorSuffix =
      result && !result.ok
        ? `&error=${encodeURIComponent(result.errorMessage ?? "1")}`
        : "";
    redirect(
      `/dm?tab=findings&finding=${findingId}${errorSuffix}#yorumlar` as Parameters<
        typeof redirect
      >[0]
    );
  }

  // --- Social content actions ---

  async function toggleShareAction(formData: FormData) {
    "use server";
    await requireDmAccess();
    const id = readFormString(formData, "id");
    const platform = readFormString(formData, "platform");
    const shared = (formData.get("shared") as string | null) === "1";
    const result =
      id && platform ? await setPostShared(id, platform, shared) : null;
    revalidatePath("/dm");
    const target =
      result && !result.ok
        ? `/dm?tab=social&error=${encodeURIComponent(result.errorMessage ?? "1")}`
        : "/dm?tab=social";
    redirect(target as Parameters<typeof redirect>[0]);
  }

  const allTasks = tasksResult.items;
  const owners = Array.from(new Set(allTasks.map((task) => task.owner)));

  const allFindings = findingsResult.items;
  const findingOwners = Array.from(
    new Set(allFindings.map((f) => f.owner))
  );

  const allSocialPosts = socialResult.items;

  const navCounts: Partial<Record<DmTabKey, number>> = {
    tasks: allTasks.length,
    findings: allFindings.length,
    social: allSocialPosts.length,
    info: PROFILES.length
  };

  const doneCount = allTasks.filter((task) => task.status === "done").length;
  const top5Count = allTasks.filter((task) => task.priority === "top5").length;

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

      <div className="animate-reveal mx-auto flex w-full max-w-[88rem] flex-col gap-5">
        <DmNav
          activeTab={activeTab}
          items={DM_NAV_ITEMS.map((item) => ({
            ...item,
            count: navCounts[item.key]
          }))}
          signOutAction={tasksSignOutAction}
        />

        <div className="flex min-w-0 flex-col gap-5">
          {/* Active section header */}
          <section className={DM_CARD_CLASS}>
            <div className={`${DM_CARD_INNER_CLASS} px-5 py-4 sm:px-6`}>
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
        <BoardGuide guide={TASKS_GUIDE} />
        {/* Stats */}
        <StatGrid
          lift
          stats={[
            { label: "Toplam görev", value: allTasks.length },
            { label: "Bitti", value: doneCount },
            { label: "İlk 5", value: top5Count },
            { label: "Sorumlu", value: owners.length }
          ]}
        />

        {/* Add / edit form — collapsed accordion (auto-opens when editing) */}
        <section className={DM_CARD_CLASS}>
          <details
            open={Boolean(editing)}
            className={`group/acc overflow-hidden rounded-[1.55rem] ${DM_CARD_INNER_CLASS}`}
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
                  <span className={DM_LABEL_CLASS}>
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
                    className={DM_INPUT_CLASS}
                  />
                </label>
                <label className="block">
                  <span className={DM_LABEL_CLASS}>
                    Sorumlu
                  </span>
                  <input
                    type="text"
                    name="owner"
                    list="task-owners"
                    defaultValue={editing?.owner ?? "Ortak"}
                    placeholder="Umut / Baran / Şahin / Ortak"
                    className={DM_INPUT_CLASS}
                  />
                  <datalist id="task-owners">
                    {OWNER_OPTIONS.map((owner) => (
                      <option key={owner} value={owner} />
                    ))}
                  </datalist>
                </label>
                <label className="block">
                  <span className={DM_LABEL_CLASS}>
                    Kategori
                  </span>
                  <input
                    type="text"
                    name="category"
                    maxLength={120}
                    defaultValue={editing?.category ?? ""}
                    placeholder="ör. Veri / mekan datası"
                    className={DM_INPUT_CLASS}
                  />
                </label>
                <label className="block">
                  <span className={DM_LABEL_CLASS}>
                    Durum
                  </span>
                  <select
                    name="status"
                    defaultValue={editing?.status ?? "todo"}
                    className={DM_INPUT_CLASS}
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
                  <span className={DM_LABEL_CLASS}>
                    Öncelik
                  </span>
                  <select
                    name="priority"
                    defaultValue={editing?.priority ?? "normal"}
                    className={DM_INPUT_CLASS}
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
                  <span className={DM_LABEL_CLASS}>
                    Hedef tarih
                  </span>
                  <input
                    type="text"
                    name="dueTarget"
                    maxLength={80}
                    defaultValue={editing?.dueTarget ?? ""}
                    placeholder="ör. Temmuz ortası / Eylül-Ekim"
                    className={DM_INPUT_CLASS}
                  />
                </label>
                <label className="block">
                  <span className={DM_LABEL_CLASS}>
                    Sıra
                  </span>
                  <input
                    type="number"
                    name="sortOrder"
                    defaultValue={editing?.sortOrder ?? 0}
                    className={DM_INPUT_CLASS}
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className={DM_LABEL_CLASS}>
                    Not
                  </span>
                  <textarea
                    name="notes"
                    rows={2}
                    maxLength={1000}
                    defaultValue={editing?.notes ?? ""}
                    placeholder="Opsiyonel detay / bağımlılık"
                    className={DM_INPUT_CLASS}
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
        <section className={DM_CARD_CLASS}>
          <div className={`${DM_CARD_INNER_CLASS} px-4 py-4 sm:px-5`}>
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
            toggleShareAction={toggleShareAction}
          />
        ) : activeTab === "info" ? (
          <InfoTab />
        ) : (
          <ScraperTab params={params} />
        )}
        </div>
      </div>
    </main>
  );
}
