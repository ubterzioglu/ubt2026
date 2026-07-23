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
import { WelcomeCard } from "@/app/detrbridge/_components/welcome-card";
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
  deleteLogo
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
import {
  getAllTodosAdmin,
  createTodo,
  updateTodo,
  setTodoStatus,
  deleteTodo,
  addComment,
  deleteComment,
  addAttachment,
  deleteAttachment
} from "@/lib/detrbridge-todos";

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
  const activeTab: BridgeTabKey =
    requestedTab === "visits"
      ? "visits"
      : requestedTab === "todos"
        ? "todos"
        : requestedTab === "domains"
          ? "domains"
          : "logos";

  const errorParam = readParam(params.error);
  const editTodoId = readParam(params.edit) || null;
  const query = readParam(params.q).trim();
  const minRatingParam = readParam(params.minRating);
  const minRating = minRatingParam ? Number(minRatingParam) : null;
  const sessionName = await getDetrbridgeSessionName();
  const firstVisit = await recordDetrbridgeVisit();
  const result = activeTab === "logos" ? await getAllLogosAdmin() : null;
  const visits = activeTab === "visits" ? await getDetrbridgeVisits() : [];
  const todosResult = activeTab === "todos" ? await getAllTodosAdmin() : null;
  const domainsResult = activeTab === "domains" ? await getAllDomainsAdmin() : null;
  const [logoCount, domainCount] = await Promise.all([getLogoCount(), getDomainCount()]);

  const filteredLogos =
    result?.items.filter(
      (logo) =>
        matchesText([logo.uploaderName], query) && matchesRating(logo.averageRating, minRating)
    ) ?? [];
  const filteredDomains =
    domainsResult?.items.filter(
      (domain) =>
        matchesText([domain.domainName, domain.uploaderName], query) &&
        matchesRating(domain.averageRating, minRating)
    ) ?? [];

  const NAV_ITEMS: BridgeNavItem[] = [
    { key: "logos", label: "Logo Seçimi", count: logoCount },
    { key: "domains", label: "Domain Önerileri", count: domainCount },
    { key: "todos", label: "Görevler" },
    { key: "visits", label: "Giriş Logları" }
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
        ? "/detrbridge"
        : `/detrbridge?error=${encodeURIComponent(outcome.errorMessage ?? "Logo eklenemedi.")}`) as Parameters<
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
        ? "/detrbridge"
        : `/detrbridge?error=${encodeURIComponent(outcome.errorMessage ?? "Oy kaydedilemedi.")}`) as Parameters<
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
    redirect("/detrbridge" as Parameters<typeof redirect>[0]);
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
    redirect("/detrbridge" as Parameters<typeof redirect>[0]);
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
    const priceCurrency = (formData.get("priceCurrency") as string | null) ?? "EUR";
    const outcome = await createDomain(uploaderName, domainName, {
      priceYearly: priceRaw ? Number(priceRaw) : null,
      retailPriceYearly: retailPriceRaw ? Number(retailPriceRaw) : null,
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

  async function deleteTodoAction(formData: FormData) {
    "use server";
    if (!(await isDetrbridgeAuthenticated())) {
      redirect("/detrbridge" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    if (id) {
      await deleteTodo(id);
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

      <div className="mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-[260px_1fr]">
        <BridgeNav
          activeTab={activeTab}
          items={NAV_ITEMS}
          cardClass={cardClass}
          cardInnerClass={cardInnerClass}
          signOutAction={detrbridgeSignOutAction}
        />

        <div className="space-y-4">
          <WelcomeCard
            isFirstVisit={firstVisit.isFirstVisit}
            hoursAfterShare={firstVisit.hoursAfterShare}
          />

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
                totalCount={result.items.length}
                query={query}
                minRating={minRatingParam}
                createAction={createAction}
                voteAction={voteAction}
                selectAction={selectAction}
                deleteAction={deleteAction}
              />
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
                deleteAction={deleteTodoAction}
                commentAction={commentTodoAction}
                deleteCommentAction={deleteCommentTodoAction}
                attachAction={attachTodoAction}
                deleteAttachmentAction={deleteAttachmentTodoAction}
              />
            </>
          ) : null}

          {activeTab === "visits" ? <VisitsTab visits={visits} /> : null}
        </div>
      </div>
    </main>
  );
}
