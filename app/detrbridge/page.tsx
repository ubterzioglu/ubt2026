import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isDetrbridgeAuthenticated, getDetrbridgeSessionName } from "@/lib/admin-auth";
import { DetrbridgeLogin } from "@/app/detrbridge/_components/detrbridge-login";
import {
  detrbridgeSignInAction,
  detrbridgeSignOutAction
} from "@/app/detrbridge/_actions";
import {
  BridgeNav,
  type BridgeNavItem,
  type BridgeTabKey
} from "@/app/detrbridge/_components/bridge-nav";
import { LogosTab } from "@/app/detrbridge/_components/logos-tab";
import { VisitsTab } from "@/app/detrbridge/_components/visits-tab";
import {
  DETRBRIDGE_AMBIENT_BACKGROUND,
  DETRBRIDGE_GRID_TEXTURE
} from "@/app/detrbridge/_components/theme";
import {
  getAllLogosAdmin,
  getLogoCount,
  createLogo,
  castVote,
  selectLogo,
  deleteLogo,
  promoteTopLogosToRound2
} from "@/lib/detrbridge-logos";
import { recordDetrbridgeVisit, getDetrbridgeVisits } from "@/lib/detrbridge-visits";
import { DomainsTab } from "@/app/detrbridge/_components/domains-tab";
import {
  getAllDomainsAdmin,
  getDomainCount,
  createDomain,
  castDomainVote,
  selectDomain,
  deleteDomain
} from "@/lib/detrbridge-domains";
import { TodosTab } from "@/app/detrbridge/_components/todos-tab";
import { MeetingBriefTab } from "@/app/detrbridge/_components/meeting-brief-tab";
import {
  addBriefComment,
  deleteBriefComment,
  getAllBriefComments
} from "@/lib/detrbridge-brief-comments";
import {
  getAllTodosAdmin,
  getActiveTodoCount,
  createTodo,
  updateTodo,
  setTodoStatus,
  setTodoArchived,
  addComment,
  deleteComment,
  addAttachment,
  deleteAttachment
} from "@/lib/detrbridge-todos";
import {
  getAllTodos2Admin,
  getActiveTodo2Count,
  createTodo2,
  updateTodo2,
  setTodo2Status,
  setTodo2Archived,
  addComment2,
  deleteComment2,
  addAttachment2,
  deleteAttachment2
} from "@/lib/detrbridge-todos2";
import { WelcomeTab } from "@/app/detrbridge/_components/welcome-tab";

export const metadata = {
  title: "detrbridge · Logo Seçimi",
  robots: { index: false, follow: false }
};

interface DetrbridgePageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function readParam(value: string | string[] | undefined): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? "";
  return "";
}

function matchesRating(averageRating: number | null, minRating: number | null): boolean {
  if (minRating === null) return true;
  return averageRating !== null && averageRating >= minRating;
}

function matchesText(names: string[], query: string): boolean {
  if (!query) return true;
  const needle = query.toLowerCase();
  return names.some((name) => name.toLowerCase().includes(needle));
}

/**
 * Post-action target for the "Toplantı Özeti" tab: back to the madde that was
 * just acted on, with its thread expanded (?open) and scrolled into view
 * (#anchor), plus an optional error message.
 */
function briefItemUrl(itemKey: string, errorMessage?: string): string {
  const query = new URLSearchParams({ tab: "meeting-brief" });
  if (itemKey) query.set("open", itemKey);
  if (errorMessage) query.set("error", errorMessage);
  return `/detrbridge?${query.toString()}${itemKey ? `#${itemKey}` : ""}`;
}

const cardClass =
  "overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl";
const cardInnerClass = "";

export default async function DetrbridgePage({ searchParams }: DetrbridgePageProps) {
  const params = searchParams ? await searchParams : {};
  const authenticated = await isDetrbridgeAuthenticated();

  if (!authenticated) {
    return <DetrbridgeLogin signIn={detrbridgeSignInAction} />;
  }

  const requestedTab = readParam(params.tab);
  const KNOWN_TABS: readonly BridgeTabKey[] = [
    "welcome",
    "todos2",
    "meeting-brief",
    "visits",
    "todos",
    "logos",
    "logos-round2",
    "domains"
  ];
  // ?tab= yoksa ya da tanınmıyorsa karşılama sekmesi açılır.
  const activeTab: BridgeTabKey =
    (KNOWN_TABS as readonly string[]).includes(requestedTab)
      ? (requestedTab as BridgeTabKey)
      : "welcome";

  const errorParam = readParam(params.error);
  const editTodoId = readParam(params.edit) || null;
  const query = readParam(params.q).trim();
  const minRatingParam = readParam(params.minRating);
  const minRating = minRatingParam ? Number(minRatingParam) : null;
  const sessionName = await getDetrbridgeSessionName();
  const firstVisit = await recordDetrbridgeVisit();
  const result = activeTab === "logos" ? await getAllLogosAdmin(1) : null;
  const round2Result = activeTab === "logos-round2" ? await getAllLogosAdmin(2) : null;
  const visits = activeTab === "visits" ? await getDetrbridgeVisits() : [];
  const todosResult = activeTab === "todos" ? await getAllTodosAdmin() : null;
  const todos2Result = activeTab === "todos2" ? await getAllTodos2Admin() : null;
  const domainsResult = activeTab === "domains" ? await getAllDomainsAdmin() : null;
  const briefComments =
    activeTab === "meeting-brief" ? await getAllBriefComments() : null;
  const openBriefItemKey = readParam(params.open) || null;
  const [logoCount, logoCountRound2, domainCount, todoCount, todo2Count] =
    await Promise.all([
      getLogoCount(1),
      getLogoCount(2),
      getDomainCount(),
      getActiveTodoCount(),
      getActiveTodo2Count()
    ]);

  const filteredLogos =
    result?.items.filter(
      (logo) =>
        matchesText([logo.uploaderName], query) && matchesRating(logo.averageRating, minRating)
    ) ?? [];
  const filteredLogosRound2 =
    round2Result?.items.filter(
      (logo) =>
        matchesText([logo.uploaderName], query) && matchesRating(logo.averageRating, minRating)
    ) ?? [];
  const filteredDomains =
    domainsResult?.items.filter(
      (domain) =>
        matchesText([domain.domainName, domain.uploaderName], query) &&
        matchesRating(domain.averageRating, minRating)
    ) ?? [];

  // Çubukta duran sekmeler (primary) günlük kullanılanlar; oylama sekmeleri
  // sağdaki "Diğer" menüsüne iner.
  const NAV_ITEMS: BridgeNavItem[] = [
    { key: "welcome", label: "Hoş Geldiniz", primary: true },
    { key: "todos2", label: "Toplantı Konuları", count: todo2Count, primary: true },
    { key: "meeting-brief", label: "Toplantı Özeti", primary: true },
    { key: "visits", label: "Giriş Logları", primary: true },
    { key: "todos", label: "Görevler", count: todoCount, primary: true },
    { key: "logos", label: "Logo Seçimi · 1. Tur", count: logoCount },
    { key: "logos-round2", label: "Logo Seçimi · 2. Tur", count: logoCountRound2 },
    { key: "domains", label: "Domain Önerileri", count: domainCount }
  ];

  async function createAction(formData: FormData) {
    "use server";
    const uploaderName = await getDetrbridgeSessionName();
    if (!uploaderName) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const file = formData.get("file");
    if (!(file instanceof File)) {
      redirect(
        `/detrbridge?error=${encodeURIComponent("Dosya seçilmedi.")}` as Parameters<
          typeof redirect
        >[0]
      );
    }
    const outcome = await createLogo({ uploaderName }, file as File);
    revalidatePath("/detrbridge");
    redirect(
      (outcome.ok
        ? "/detrbridge?tab=logos"
        : `/detrbridge?tab=logos&error=${encodeURIComponent(outcome.errorMessage ?? "Logo eklenemedi.")}`) as Parameters<
        typeof redirect
      >[0]
    );
  }

  async function voteAction(formData: FormData) {
    "use server";
    const voterName = await getDetrbridgeSessionName();
    if (!voterName) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const logoId = (formData.get("logoId") as string | null) ?? "";
    const rating = Number((formData.get("rating") as string | null) ?? "0");
    const outcome = logoId
      ? await castVote(logoId, voterName, rating)
      : { ok: false, errorMessage: "Logo bulunamadı." };
    revalidatePath("/detrbridge");
    redirect(
      (outcome.ok
        ? "/detrbridge?tab=logos"
        : `/detrbridge?tab=logos&error=${encodeURIComponent(outcome.errorMessage ?? "Oy kaydedilemedi.")}`) as Parameters<
        typeof redirect
      >[0]
    );
  }

  async function selectAction(formData: FormData) {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    if (id) {
      await selectLogo(id);
    }
    revalidatePath("/detrbridge");
    redirect("/detrbridge?tab=logos" as Parameters<typeof redirect>[0]);
  }

  async function deleteAction(formData: FormData) {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    if (id) {
      await deleteLogo(id);
    }
    revalidatePath("/detrbridge");
    redirect("/detrbridge?tab=logos" as Parameters<typeof redirect>[0]);
  }

  async function createRound2Action(formData: FormData) {
    "use server";
    const uploaderName = await getDetrbridgeSessionName();
    if (!uploaderName) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const file = formData.get("file");
    if (!(file instanceof File)) {
      redirect(
        `/detrbridge?tab=logos-round2&error=${encodeURIComponent("Dosya seçilmedi.")}` as Parameters<
          typeof redirect
        >[0]
      );
    }
    const outcome = await createLogo({ uploaderName }, file as File, 2);
    revalidatePath("/detrbridge");
    redirect(
      (outcome.ok
        ? "/detrbridge?tab=logos-round2"
        : `/detrbridge?tab=logos-round2&error=${encodeURIComponent(outcome.errorMessage ?? "Logo eklenemedi.")}`) as Parameters<
        typeof redirect
      >[0]
    );
  }

  async function voteRound2Action(formData: FormData) {
    "use server";
    const voterName = await getDetrbridgeSessionName();
    if (!voterName) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const logoId = (formData.get("logoId") as string | null) ?? "";
    const rating = Number((formData.get("rating") as string | null) ?? "0");
    const outcome = logoId
      ? await castVote(logoId, voterName, rating)
      : { ok: false, errorMessage: "Logo bulunamadı." };
    revalidatePath("/detrbridge");
    redirect(
      (outcome.ok
        ? "/detrbridge?tab=logos-round2"
        : `/detrbridge?tab=logos-round2&error=${encodeURIComponent(outcome.errorMessage ?? "Oy kaydedilemedi.")}`) as Parameters<
        typeof redirect
      >[0]
    );
  }

  async function selectRound2Action(formData: FormData) {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    if (id) {
      await selectLogo(id);
    }
    revalidatePath("/detrbridge");
    redirect("/detrbridge?tab=logos-round2" as Parameters<typeof redirect>[0]);
  }

  async function deleteRound2Action(formData: FormData) {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    if (id) {
      await deleteLogo(id);
    }
    revalidatePath("/detrbridge");
    redirect("/detrbridge?tab=logos-round2" as Parameters<typeof redirect>[0]);
  }

  async function promoteAction() {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    await promoteTopLogosToRound2(5);
    revalidatePath("/detrbridge");
    redirect("/detrbridge?tab=logos-round2" as Parameters<typeof redirect>[0]);
  }

  async function createDomainAction(formData: FormData) {
    "use server";
    const uploaderName = await getDetrbridgeSessionName();
    if (!uploaderName) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const domainName = (formData.get("domainName") as string | null) ?? "";
    const priceRaw = (formData.get("priceYearly") as string | null) ?? "";
    const retailPriceRaw = (formData.get("retailPriceYearly") as string | null) ?? "";
    const renewalPriceRaw = (formData.get("renewalPriceYearly") as string | null) ?? "";
    const priceCurrency = (formData.get("priceCurrency") as string | null) ?? "EUR";
    const outcome = await createDomain(uploaderName, domainName, {
      priceYearly: priceRaw ? Number(priceRaw) : null,
      retailPriceYearly: retailPriceRaw ? Number(retailPriceRaw) : null,
      renewalPriceYearly: renewalPriceRaw ? Number(renewalPriceRaw) : null,
      priceCurrency
    });
    revalidatePath("/detrbridge");
    redirect(
      (outcome.ok
        ? "/detrbridge?tab=domains"
        : `/detrbridge?tab=domains&error=${encodeURIComponent(outcome.errorMessage ?? "Domain eklenemedi.")}`) as Parameters<
        typeof redirect
      >[0]
    );
  }

  async function voteDomainAction(formData: FormData) {
    "use server";
    const voterName = await getDetrbridgeSessionName();
    if (!voterName) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const domainId = (formData.get("domainId") as string | null) ?? "";
    const rating = Number((formData.get("rating") as string | null) ?? "0");
    const outcome = domainId
      ? await castDomainVote(domainId, voterName, rating)
      : { ok: false, errorMessage: "Domain bulunamadı." };
    revalidatePath("/detrbridge");
    redirect(
      (outcome.ok
        ? "/detrbridge?tab=domains"
        : `/detrbridge?tab=domains&error=${encodeURIComponent(outcome.errorMessage ?? "Oy kaydedilemedi.")}`) as Parameters<
        typeof redirect
      >[0]
    );
  }

  async function selectDomainAction(formData: FormData) {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    if (id) {
      await selectDomain(id);
    }
    revalidatePath("/detrbridge");
    redirect("/detrbridge?tab=domains" as Parameters<typeof redirect>[0]);
  }

  async function deleteDomainAction(formData: FormData) {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    if (id) {
      await deleteDomain(id);
    }
    revalidatePath("/detrbridge");
    redirect("/detrbridge?tab=domains" as Parameters<typeof redirect>[0]);
  }

  async function createTodoAction(formData: FormData) {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const outcome = await createTodo({
      title: (formData.get("title") as string | null) ?? "",
      assignee: (formData.get("assignee") as string | null) ?? "",
      dueDate: (formData.get("dueDate") as string | null) ?? ""
    });
    let attachError: string | null = null;
    const file = formData.get("file");
    if (outcome.ok && outcome.id && file instanceof File && file.size > 0) {
      const attached = await addAttachment(outcome.id, file);
      if (!attached.ok) {
        attachError = attached.errorMessage ?? "Dosya yüklenemedi.";
      }
    }
    revalidatePath("/detrbridge");
    redirect(
      (outcome.ok
        ? attachError
          ? `/detrbridge?tab=todos&error=${encodeURIComponent(`Görev eklendi ama dosya yüklenemedi: ${attachError}`)}`
          : "/detrbridge?tab=todos"
        : `/detrbridge?tab=todos&error=${encodeURIComponent(outcome.errorMessage ?? "Görev eklenemedi.")}`) as Parameters<
        typeof redirect
      >[0]
    );
  }

  async function updateTodoAction(formData: FormData) {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    if (!id) {
      redirect("/detrbridge?tab=todos" as Parameters<typeof redirect>[0]);
    }
    const outcome = await updateTodo(id, {
      title: (formData.get("title") as string | null) ?? "",
      assignee: (formData.get("assignee") as string | null) ?? "",
      dueDate: (formData.get("dueDate") as string | null) ?? ""
    });
    revalidatePath("/detrbridge");
    redirect(
      (outcome.ok
        ? "/detrbridge?tab=todos"
        : `/detrbridge?tab=todos&error=${encodeURIComponent(outcome.errorMessage ?? "Görev güncellenemedi.")}`) as Parameters<
        typeof redirect
      >[0]
    );
  }

  async function toggleTodoAction(formData: FormData) {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    const next =
      ((formData.get("next") as string | null) ?? "open") === "done" ? "done" : "open";
    if (id) {
      await setTodoStatus(id, next);
    }
    revalidatePath("/detrbridge");
    redirect("/detrbridge?tab=todos" as Parameters<typeof redirect>[0]);
  }

  async function archiveTodoAction(formData: FormData) {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    const archived = ((formData.get("archived") as string | null) ?? "1") === "1";
    if (id) {
      await setTodoArchived(id, archived);
    }
    revalidatePath("/detrbridge");
    redirect("/detrbridge?tab=todos" as Parameters<typeof redirect>[0]);
  }

  async function commentTodoAction(formData: FormData) {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const todoId = (formData.get("todoId") as string | null) ?? "";
    const body = (formData.get("body") as string | null) ?? "";
    const author = (formData.get("author") as string | null) ?? "";
    if (!todoId) {
      redirect("/detrbridge?tab=todos" as Parameters<typeof redirect>[0]);
    }
    const outcome = await addComment(todoId, body, author);
    revalidatePath("/detrbridge");
    redirect(
      (outcome.ok
        ? "/detrbridge?tab=todos"
        : `/detrbridge?tab=todos&error=${encodeURIComponent(outcome.errorMessage ?? "Yorum eklenemedi.")}`) as Parameters<
        typeof redirect
      >[0]
    );
  }

  async function deleteCommentTodoAction(formData: FormData) {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const commentId = (formData.get("commentId") as string | null) ?? "";
    if (commentId) {
      await deleteComment(commentId);
    }
    revalidatePath("/detrbridge");
    redirect("/detrbridge?tab=todos" as Parameters<typeof redirect>[0]);
  }

  async function attachTodoAction(formData: FormData) {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const todoId = (formData.get("todoId") as string | null) ?? "";
    const file = formData.get("file");
    if (!todoId || !(file instanceof File) || file.size === 0) {
      redirect("/detrbridge?tab=todos" as Parameters<typeof redirect>[0]);
    }
    const outcome = await addAttachment(todoId, file as File);
    revalidatePath("/detrbridge");
    redirect(
      (outcome.ok
        ? "/detrbridge?tab=todos"
        : `/detrbridge?tab=todos&error=${encodeURIComponent(outcome.errorMessage ?? "Dosya yüklenemedi.")}`) as Parameters<
        typeof redirect
      >[0]
    );
  }

  async function deleteAttachmentTodoAction(formData: FormData) {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const attachmentId = (formData.get("attachmentId") as string | null) ?? "";
    if (attachmentId) {
      await deleteAttachment(attachmentId);
    }
    revalidatePath("/detrbridge");
    redirect("/detrbridge?tab=todos" as Parameters<typeof redirect>[0]);
  }

  async function createTodo2Action(formData: FormData) {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const outcome = await createTodo2({
      title: (formData.get("title") as string | null) ?? "",
      assignee: (formData.get("assignee") as string | null) ?? "",
      dueDate: (formData.get("dueDate") as string | null) ?? ""
    });
    let attachError: string | null = null;
    const file = formData.get("file");
    if (outcome.ok && outcome.id && file instanceof File && file.size > 0) {
      const attached = await addAttachment2(outcome.id, file);
      if (!attached.ok) {
        attachError = attached.errorMessage ?? "Dosya yüklenemedi.";
      }
    }
    revalidatePath("/detrbridge");
    redirect(
      (outcome.ok
        ? attachError
          ? `/detrbridge?tab=todos2&error=${encodeURIComponent(`Görev eklendi ama dosya yüklenemedi: ${attachError}`)}`
          : "/detrbridge?tab=todos2"
        : `/detrbridge?tab=todos2&error=${encodeURIComponent(outcome.errorMessage ?? "Görev eklenemedi.")}`) as Parameters<
        typeof redirect
      >[0]
    );
  }

  async function updateTodo2Action(formData: FormData) {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    if (!id) {
      redirect("/detrbridge?tab=todos2" as Parameters<typeof redirect>[0]);
    }
    const outcome = await updateTodo2(id, {
      title: (formData.get("title") as string | null) ?? "",
      assignee: (formData.get("assignee") as string | null) ?? "",
      dueDate: (formData.get("dueDate") as string | null) ?? ""
    });
    revalidatePath("/detrbridge");
    redirect(
      (outcome.ok
        ? "/detrbridge?tab=todos2"
        : `/detrbridge?tab=todos2&error=${encodeURIComponent(outcome.errorMessage ?? "Görev güncellenemedi.")}`) as Parameters<
        typeof redirect
      >[0]
    );
  }

  async function toggleTodo2Action(formData: FormData) {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    const next =
      ((formData.get("next") as string | null) ?? "open") === "done" ? "done" : "open";
    if (id) {
      await setTodo2Status(id, next);
    }
    revalidatePath("/detrbridge");
    redirect("/detrbridge?tab=todos2" as Parameters<typeof redirect>[0]);
  }

  async function archiveTodo2Action(formData: FormData) {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    const archived = ((formData.get("archived") as string | null) ?? "1") === "1";
    if (id) {
      await setTodo2Archived(id, archived);
    }
    revalidatePath("/detrbridge");
    redirect("/detrbridge?tab=todos2" as Parameters<typeof redirect>[0]);
  }

  async function commentTodo2Action(formData: FormData) {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const todoId = (formData.get("todoId") as string | null) ?? "";
    const body = (formData.get("body") as string | null) ?? "";
    const author = (formData.get("author") as string | null) ?? "";
    if (!todoId) {
      redirect("/detrbridge?tab=todos2" as Parameters<typeof redirect>[0]);
    }
    const outcome = await addComment2(todoId, body, author);
    revalidatePath("/detrbridge");
    redirect(
      (outcome.ok
        ? "/detrbridge?tab=todos2"
        : `/detrbridge?tab=todos2&error=${encodeURIComponent(outcome.errorMessage ?? "Yorum eklenemedi.")}`) as Parameters<
        typeof redirect
      >[0]
    );
  }

  async function deleteCommentTodo2Action(formData: FormData) {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const commentId = (formData.get("commentId") as string | null) ?? "";
    if (commentId) {
      await deleteComment2(commentId);
    }
    revalidatePath("/detrbridge");
    redirect("/detrbridge?tab=todos2" as Parameters<typeof redirect>[0]);
  }

  async function attachTodo2Action(formData: FormData) {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const todoId = (formData.get("todoId") as string | null) ?? "";
    const file = formData.get("file");
    if (!todoId || !(file instanceof File) || file.size === 0) {
      redirect("/detrbridge?tab=todos2" as Parameters<typeof redirect>[0]);
    }
    const outcome = await addAttachment2(todoId, file as File);
    revalidatePath("/detrbridge");
    redirect(
      (outcome.ok
        ? "/detrbridge?tab=todos2"
        : `/detrbridge?tab=todos2&error=${encodeURIComponent(outcome.errorMessage ?? "Dosya yüklenemedi.")}`) as Parameters<
        typeof redirect
      >[0]
    );
  }

  async function deleteAttachmentTodo2Action(formData: FormData) {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const attachmentId = (formData.get("attachmentId") as string | null) ?? "";
    if (attachmentId) {
      await deleteAttachment2(attachmentId);
    }
    revalidatePath("/detrbridge");
    redirect("/detrbridge?tab=todos2" as Parameters<typeof redirect>[0]);
  }

  async function addBriefCommentAction(formData: FormData) {
    "use server";
    // Yazar oturumdan alınır — formdan gelen bir isme asla güvenilmez.
    const author = await getDetrbridgeSessionName();
    if (!author) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const itemKey = (formData.get("itemKey") as string | null) ?? "";
    const body = (formData.get("body") as string | null) ?? "";
    const outcome = await addBriefComment(itemKey, body, author);
    revalidatePath("/detrbridge");
    redirect(
      briefItemUrl(
        itemKey,
        outcome.ok ? undefined : (outcome.errorMessage ?? "Yorum eklenemedi.")
      ) as Parameters<typeof redirect>[0]
    );
  }

  async function deleteBriefCommentAction(formData: FormData) {
    "use server";
    const author = await getDetrbridgeSessionName();
    if (!author) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const commentId = (formData.get("commentId") as string | null) ?? "";
    const itemKey = (formData.get("itemKey") as string | null) ?? "";
    const outcome = await deleteBriefComment(commentId, author);
    revalidatePath("/detrbridge");
    redirect(
      briefItemUrl(
        itemKey,
        outcome.ok ? undefined : (outcome.errorMessage ?? "Yorum silinemedi.")
      ) as Parameters<typeof redirect>[0]
    );
  }

  return (
    <main
      className="relative isolate min-h-screen overflow-x-clip px-4 py-8 sm:px-6 lg:px-8"
      style={{ background: DETRBRIDGE_AMBIENT_BACKGROUND }}
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.3]"
        style={DETRBRIDGE_GRID_TEXTURE}
      />

      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5">
        <BridgeNav
          activeTab={activeTab}
          items={NAV_ITEMS}
          cardClass={cardClass}
          cardInnerClass={cardInnerClass}
          signOutAction={detrbridgeSignOutAction}
        />

        <div className="space-y-4">
          {activeTab === "welcome" ? (
            <WelcomeTab
              sessionName={sessionName ?? ""}
              isFirstVisit={firstVisit.isFirstVisit}
              hoursAfterShare={firstVisit.hoursAfterShare}
              items={NAV_ITEMS.filter((item) => item.key !== "welcome")}
            />
          ) : null}

          {errorParam && (
            <div className="rounded-[1.1rem] border border-rose-400/25 bg-rose-400/10 px-5 py-3 text-[13px] font-medium text-rose-200">
              Hata: {errorParam}
            </div>
          )}

          {activeTab === "logos" && result ? (
            <>
              {result.source === "env-missing" && (
                <div className="rounded-[1.1rem] border border-amber-400/25 bg-amber-400/10 px-5 py-3 text-[13px] font-medium text-amber-200">
                  Supabase bağlantısı yapılandırılmamış
                  (SUPABASE_SERVICE_ROLE_KEY eksik). Logolar yüklenemiyor.
                </div>
              )}
              {result.source === "error" && (
                <div className="rounded-[1.1rem] border border-rose-400/25 bg-rose-400/10 px-5 py-3 text-[13px] font-medium text-rose-200">
                  Logolar yüklenirken hata oluştu: {result.errorMessage}
                </div>
              )}

              <LogosTab
                logos={filteredLogos}
                allLogos={result.items}
                totalCount={result.items.length}
                query={query}
                minRating={minRatingParam}
                createAction={createAction}
                voteAction={voteAction}
                selectAction={selectAction}
                deleteAction={deleteAction}
                readOnly
              />
            </>
          ) : null}

          {activeTab === "logos-round2" && round2Result ? (
            <>
              {round2Result.source === "env-missing" && (
                <div className="rounded-[1.1rem] border border-amber-400/25 bg-amber-400/10 px-5 py-3 text-[13px] font-medium text-amber-200">
                  Supabase bağlantısı yapılandırılmamış
                  (SUPABASE_SERVICE_ROLE_KEY eksik). Logolar yüklenemiyor.
                </div>
              )}
              {round2Result.source === "error" && (
                <div className="rounded-[1.1rem] border border-rose-400/25 bg-rose-400/10 px-5 py-3 text-[13px] font-medium text-rose-200">
                  Logolar yüklenirken hata oluştu: {round2Result.errorMessage}
                </div>
              )}

              {round2Result.items.length === 0 ? (
                <div className="rounded-[1.3rem] border border-dashed border-white/15 px-5 py-8 text-center text-[13px] text-white/50">
                  <p className="mb-4">
                    2. Tur henüz başlamadı. 1. Turdaki en yüksek 5 logoyu bu tura taşı.
                  </p>
                  <form action={promoteAction}>
                    <button
                      type="submit"
                      className="inline-flex min-h-[44px] items-center justify-center rounded-[0.9rem] bg-emerald-400/90 px-6 py-2.5 text-[13px] font-bold tracking-tight text-black transition hover:bg-emerald-400"
                    >
                      İlk 5 Logoyu 2. Tura Taşı
                    </button>
                  </form>
                </div>
              ) : (
                <LogosTab
                  logos={filteredLogosRound2}
                  allLogos={round2Result.items}
                  totalCount={round2Result.items.length}
                  query={query}
                  minRating={minRatingParam}
                  createAction={createRound2Action}
                  voteAction={voteRound2Action}
                  selectAction={selectRound2Action}
                  deleteAction={deleteRound2Action}
                />
              )}
            </>
          ) : null}

          {activeTab === "domains" && domainsResult ? (
            <>
              {domainsResult.source === "env-missing" && (
                <div className="rounded-[1.1rem] border border-amber-400/25 bg-amber-400/10 px-5 py-3 text-[13px] font-medium text-amber-200">
                  Supabase bağlantısı yapılandırılmamış
                  (SUPABASE_SERVICE_ROLE_KEY eksik). Domainler yüklenemiyor.
                </div>
              )}
              {domainsResult.source === "error" && (
                <div className="rounded-[1.1rem] border border-rose-400/25 bg-rose-400/10 px-5 py-3 text-[13px] font-medium text-rose-200">
                  Domainler yüklenirken hata oluştu: {domainsResult.errorMessage}
                </div>
              )}

              <DomainsTab
                domains={filteredDomains}
                allDomains={domainsResult.items}
                totalCount={domainsResult.items.length}
                query={query}
                minRating={minRatingParam}
                createAction={createDomainAction}
                voteAction={voteDomainAction}
                selectAction={selectDomainAction}
                deleteAction={deleteDomainAction}
              />
            </>
          ) : null}

          {activeTab === "todos" && todosResult ? (
            <>
              {todosResult.source === "env-missing" && (
                <div className="rounded-[1.1rem] border border-amber-400/25 bg-amber-400/10 px-5 py-3 text-[13px] font-medium text-amber-200">
                  Supabase bağlantısı yapılandırılmamış
                  (SUPABASE_SERVICE_ROLE_KEY eksik). Görevler yüklenemiyor.
                </div>
              )}
              {todosResult.source === "error" && (
                <div className="rounded-[1.1rem] border border-rose-400/25 bg-rose-400/10 px-5 py-3 text-[13px] font-medium text-rose-200">
                  Görevler yüklenirken hata oluştu: {todosResult.errorMessage}
                </div>
              )}
              <TodosTab
                todos={todosResult.items}
                editingId={editTodoId}
                createAction={createTodoAction}
                updateAction={updateTodoAction}
                toggleAction={toggleTodoAction}
                archiveAction={archiveTodoAction}
                commentAction={commentTodoAction}
                deleteCommentAction={deleteCommentTodoAction}
                attachAction={attachTodoAction}
                deleteAttachmentAction={deleteAttachmentTodoAction}
              />
            </>
          ) : null}

          {activeTab === "todos2" && todos2Result ? (
            <>
              {todos2Result.source === "env-missing" && (
                <div className="rounded-[1.1rem] border border-amber-400/25 bg-amber-400/10 px-5 py-3 text-[13px] font-medium text-amber-200">
                  Supabase bağlantısı yapılandırılmamış
                  (SUPABASE_SERVICE_ROLE_KEY eksik). Görevler yüklenemiyor.
                </div>
              )}
              {todos2Result.source === "error" && (
                <div className="rounded-[1.1rem] border border-rose-400/25 bg-rose-400/10 px-5 py-3 text-[13px] font-medium text-rose-200">
                  Görevler yüklenirken hata oluştu: {todos2Result.errorMessage}
                </div>
              )}
              <TodosTab
                todos={todos2Result.items}
                editingId={editTodoId}
                tabKey="todos2"
                createAction={createTodo2Action}
                updateAction={updateTodo2Action}
                toggleAction={toggleTodo2Action}
                archiveAction={archiveTodo2Action}
                commentAction={commentTodo2Action}
                deleteCommentAction={deleteCommentTodo2Action}
                attachAction={attachTodo2Action}
                deleteAttachmentAction={deleteAttachmentTodo2Action}
              />
            </>
          ) : null}

          {activeTab === "meeting-brief" && briefComments ? (
            <>
              {briefComments.source === "env-missing" && (
                <div className="rounded-[1.1rem] border border-amber-400/25 bg-amber-400/10 px-5 py-3 text-[13px] font-medium text-amber-200">
                  Supabase bağlantısı yapılandırılmamış
                  (SUPABASE_SERVICE_ROLE_KEY eksik). Özet okunabilir ama yorumlar
                  yüklenemiyor.
                </div>
              )}
              {briefComments.source === "error" && (
                <div className="rounded-[1.1rem] border border-rose-400/25 bg-rose-400/10 px-5 py-3 text-[13px] font-medium text-rose-200">
                  Yorumlar yüklenirken hata oluştu: {briefComments.errorMessage}
                </div>
              )}
              <MeetingBriefTab
                commentsByItemKey={briefComments.byItemKey}
                sessionName={sessionName ?? ""}
                openItemKey={openBriefItemKey}
                addCommentAction={addBriefCommentAction}
                deleteCommentAction={deleteBriefCommentAction}
              />
            </>
          ) : null}

          {activeTab === "visits" ? <VisitsTab visits={visits} /> : null}
        </div>
      </div>
    </main>
  );
}
