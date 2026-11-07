import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { readSearchParam } from "@/lib/search-params";
import { isDetrbridgeAuthenticated, getDetrbridgeSessionName } from "@/lib/admin-auth";
import { DetrbridgeLogin } from "@/app/detrbridge/_components/detrbridge-login";
import {
  detrbridgeSignInAction,
  detrbridgeSignOutAction
} from "@/app/detrbridge/_actions";
import {
  BRIDGE_TAB_KEYS,
  BridgeNav,
  type BridgeNavItem,
  type BridgeTabKey
} from "@/app/detrbridge/_components/bridge-nav";
import { SourceStateBanner } from "@/components/source-state-banner";
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
  deleteAttachment,
  type DetrbridgeTodoBoard,
  type DetrbridgeTodoInput
} from "@/lib/detrbridge-todos";
import { readFormString } from "@/lib/form-data";
import { WelcomeTab } from "@/app/detrbridge/_components/welcome-tab";

export const metadata = {
  title: "detrbridge · Logo Seçimi",
  robots: { index: false, follow: false }
};

interface DetrbridgePageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
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

type RedirectTarget = Parameters<typeof redirect>[0];

async function requireDetrbridgeAuth(): Promise<void> {
  if (!(await isDetrbridgeAuthenticated())) {
    redirect("/detrbridge" as RedirectTarget);
  }
}

function tabUrl(tab: BridgeTabKey, errorMessage?: string): RedirectTarget {
  const base = `/detrbridge?tab=${tab}`;
  const url = errorMessage ? `${base}&error=${encodeURIComponent(errorMessage)}` : base;
  return url as RedirectTarget;
}

function readTodoInput(formData: FormData): DetrbridgeTodoInput {
  return {
    title: readFormString(formData, "title"),
    assignee: readFormString(formData, "assignee"),
    dueDate: readFormString(formData, "dueDate")
  };
}

function createTodoBoardActions(board: DetrbridgeTodoBoard) {
  async function createAction(formData: FormData) {
    "use server";
    await requireDetrbridgeAuth();
    const outcome = await createTodo(board, readTodoInput(formData));
    let attachError: string | null = null;
    const file = formData.get("file");
    if (outcome.ok && outcome.id && file instanceof File && file.size > 0) {
      const attached = await addAttachment(board, outcome.id, file);
      if (!attached.ok) {
        attachError = attached.errorMessage ?? "Dosya yüklenemedi.";
      }
    }
    revalidatePath("/detrbridge");
    if (!outcome.ok) {
      redirect(tabUrl(board, outcome.errorMessage ?? "Görev eklenemedi."));
    }
    redirect(
      tabUrl(
        board,
        attachError ? `Görev eklendi ama dosya yüklenemedi: ${attachError}` : undefined
      )
    );
  }

  async function updateAction(formData: FormData) {
    "use server";
    await requireDetrbridgeAuth();
    const id = readFormString(formData, "id");
    if (!id) {
      redirect(tabUrl(board));
    }
    const outcome = await updateTodo(board, id, readTodoInput(formData));
    revalidatePath("/detrbridge");
    redirect(
      tabUrl(board, outcome.ok ? undefined : (outcome.errorMessage ?? "Görev güncellenemedi."))
    );
  }

  async function toggleAction(formData: FormData) {
    "use server";
    await requireDetrbridgeAuth();
    const id = readFormString(formData, "id");
    const next = readFormString(formData, "next", "open") === "done" ? "done" : "open";
    if (id) {
      await setTodoStatus(board, id, next);
    }
    revalidatePath("/detrbridge");
    redirect(tabUrl(board));
  }

  async function archiveAction(formData: FormData) {
    "use server";
    await requireDetrbridgeAuth();
    const id = readFormString(formData, "id");
    const archived = readFormString(formData, "archived", "1") === "1";
    if (id) {
      await setTodoArchived(board, id, archived);
    }
    revalidatePath("/detrbridge");
    redirect(tabUrl(board));
  }

  async function commentAction(formData: FormData) {
    "use server";
    const author = await getDetrbridgeSessionName();
    if (!author) {
      redirect("/detrbridge" as RedirectTarget);
    }
    const todoId = readFormString(formData, "todoId");
    const body = readFormString(formData, "body");
    if (!todoId) {
      redirect(tabUrl(board));
    }
    const outcome = await addComment(board, todoId, body, author);
    revalidatePath("/detrbridge");
    redirect(
      tabUrl(board, outcome.ok ? undefined : (outcome.errorMessage ?? "Yorum eklenemedi."))
    );
  }

  async function deleteCommentAction(formData: FormData) {
    "use server";
    await requireDetrbridgeAuth();
    const commentId = readFormString(formData, "commentId");
    if (commentId) {
      await deleteComment(board, commentId);
    }
    revalidatePath("/detrbridge");
    redirect(tabUrl(board));
  }

  async function attachAction(formData: FormData) {
    "use server";
    await requireDetrbridgeAuth();
    const todoId = readFormString(formData, "todoId");
    const file = formData.get("file");
    if (!todoId || !(file instanceof File) || file.size === 0) {
      redirect(tabUrl(board));
    }
    const outcome = await addAttachment(board, todoId, file);
    revalidatePath("/detrbridge");
    redirect(
      tabUrl(board, outcome.ok ? undefined : (outcome.errorMessage ?? "Dosya yüklenemedi."))
    );
  }

  async function deleteAttachmentAction(formData: FormData) {
    "use server";
    await requireDetrbridgeAuth();
    const attachmentId = readFormString(formData, "attachmentId");
    if (attachmentId) {
      await deleteAttachment(board, attachmentId);
    }
    revalidatePath("/detrbridge");
    redirect(tabUrl(board));
  }

  return {
    createAction,
    updateAction,
    toggleAction,
    archiveAction,
    commentAction,
    deleteCommentAction,
    attachAction,
    deleteAttachmentAction
  };
}

const ROUND_2_PROMOTE_COUNT = 5;

type LogoTab = Extract<BridgeTabKey, "logos" | "logos-round2">;

function createLogoRoundActions(round: number, tab: LogoTab, fileMissingTarget: RedirectTarget) {
  async function createAction(formData: FormData) {
    "use server";
    const uploaderName = await getDetrbridgeSessionName();
    if (!uploaderName) {
      redirect("/detrbridge" as RedirectTarget);
    }
    const file = formData.get("file");
    if (!(file instanceof File)) {
      redirect(fileMissingTarget);
    }
    const outcome = await createLogo({ uploaderName }, file as File, round);
    revalidatePath("/detrbridge");
    redirect(tabUrl(tab, outcome.ok ? undefined : (outcome.errorMessage ?? "Logo eklenemedi.")));
  }

  async function voteAction(formData: FormData) {
    "use server";
    const voterName = await getDetrbridgeSessionName();
    if (!voterName) {
      redirect("/detrbridge" as RedirectTarget);
    }
    const logoId = readFormString(formData, "logoId");
    const rating = Number(readFormString(formData, "rating", "0"));
    const outcome = logoId
      ? await castVote(logoId, voterName, rating)
      : { ok: false, errorMessage: "Logo bulunamadı." };
    revalidatePath("/detrbridge");
    redirect(tabUrl(tab, outcome.ok ? undefined : (outcome.errorMessage ?? "Oy kaydedilemedi.")));
  }

  async function selectAction(formData: FormData) {
    "use server";
    await requireDetrbridgeAuth();
    const id = readFormString(formData, "id");
    if (id) {
      await selectLogo(id);
    }
    revalidatePath("/detrbridge");
    redirect(tabUrl(tab));
  }

  async function deleteAction(formData: FormData) {
    "use server";
    await requireDetrbridgeAuth();
    const id = readFormString(formData, "id");
    if (id) {
      await deleteLogo(id);
    }
    revalidatePath("/detrbridge");
    redirect(tabUrl(tab));
  }

  return { createAction, voteAction, selectAction, deleteAction };
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

  const requestedTab = readSearchParam(params.tab);
  // ?tab= yoksa ya da tanınmıyorsa karşılama sekmesi açılır.
  const activeTab: BridgeTabKey =
    (BRIDGE_TAB_KEYS as readonly string[]).includes(requestedTab)
      ? (requestedTab as BridgeTabKey)
      : "welcome";

  const errorParam = readSearchParam(params.error);
  const editTodoId = readSearchParam(params.edit) || null;
  const query = readSearchParam(params.q).trim();
  const minRatingParam = readSearchParam(params.minRating);
  const minRating = minRatingParam ? Number(minRatingParam) : null;
  const sessionName = await getDetrbridgeSessionName();
  const firstVisit = await recordDetrbridgeVisit();
  const result = activeTab === "logos" ? await getAllLogosAdmin(1) : null;
  const round2Result = activeTab === "logos-round2" ? await getAllLogosAdmin(2) : null;
  const visits = activeTab === "visits" ? await getDetrbridgeVisits() : [];
  const activeTodoBoard: DetrbridgeTodoBoard | null =
    activeTab === "todos" || activeTab === "todos2" ? activeTab : null;
  const todoBoardResult = activeTodoBoard ? await getAllTodosAdmin(activeTodoBoard) : null;
  const domainsResult = activeTab === "domains" ? await getAllDomainsAdmin() : null;
  const briefComments =
    activeTab === "meeting-brief" ? await getAllBriefComments() : null;
  const openBriefItemKey = readSearchParam(params.open) || null;
  const [logoCount, logoCountRound2, domainCount, todoCount, todo2Count] =
    await Promise.all([
      getLogoCount(1),
      getLogoCount(2),
      getDomainCount(),
      getActiveTodoCount("todos"),
      getActiveTodoCount("todos2")
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

  async function promoteAction() {
    "use server";
    await requireDetrbridgeAuth();
    await promoteTopLogosToRound2(ROUND_2_PROMOTE_COUNT);
    revalidatePath("/detrbridge");
    redirect("/detrbridge?tab=logos-round2" as RedirectTarget);
  }

  async function createDomainAction(formData: FormData) {
    "use server";
    const uploaderName = await getDetrbridgeSessionName();
    if (!uploaderName) {
      redirect("/detrbridge" as RedirectTarget);
    }
    const domainName = readFormString(formData, "domainName");
    const priceRaw = readFormString(formData, "priceYearly");
    const retailPriceRaw = readFormString(formData, "retailPriceYearly");
    const renewalPriceRaw = readFormString(formData, "renewalPriceYearly");
    const priceCurrency = readFormString(formData, "priceCurrency", "EUR");
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
      redirect("/detrbridge" as RedirectTarget);
    }
    const domainId = readFormString(formData, "domainId");
    const rating = Number(readFormString(formData, "rating", "0"));
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
    await requireDetrbridgeAuth();
    const id = readFormString(formData, "id");
    if (id) {
      await selectDomain(id);
    }
    revalidatePath("/detrbridge");
    redirect("/detrbridge?tab=domains" as RedirectTarget);
  }

  async function deleteDomainAction(formData: FormData) {
    "use server";
    await requireDetrbridgeAuth();
    const id = readFormString(formData, "id");
    if (id) {
      await deleteDomain(id);
    }
    revalidatePath("/detrbridge");
    redirect("/detrbridge?tab=domains" as RedirectTarget);
  }

  async function addBriefCommentAction(formData: FormData) {
    "use server";
    // Yazar oturumdan alınır — formdan gelen bir isme asla güvenilmez.
    const author = await getDetrbridgeSessionName();
    if (!author) {
      redirect("/detrbridge" as RedirectTarget);
    }
    const itemKey = readFormString(formData, "itemKey");
    const body = readFormString(formData, "body");
    const outcome = await addBriefComment(itemKey, body, author);
    revalidatePath("/detrbridge");
    redirect(
      briefItemUrl(
        itemKey,
        outcome.ok ? undefined : (outcome.errorMessage ?? "Yorum eklenemedi.")
      ) as RedirectTarget
    );
  }

  async function deleteBriefCommentAction(formData: FormData) {
    "use server";
    const author = await getDetrbridgeSessionName();
    if (!author) {
      redirect("/detrbridge" as RedirectTarget);
    }
    const commentId = readFormString(formData, "commentId");
    const itemKey = readFormString(formData, "itemKey");
    const outcome = await deleteBriefComment(commentId, author);
    revalidatePath("/detrbridge");
    redirect(
      briefItemUrl(
        itemKey,
        outcome.ok ? undefined : (outcome.errorMessage ?? "Yorum silinemedi.")
      ) as RedirectTarget
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
              <SourceStateBanner
                source={result.source}
                errorMessage={result.errorMessage}
                subject="Logolar"
              />

              <LogosTab
                logos={filteredLogos}
                allLogos={result.items}
                totalCount={result.items.length}
                query={query}
                minRating={minRatingParam}
                {...createLogoRoundActions(
                  1,
                  "logos",
                  `/detrbridge?error=${encodeURIComponent("Dosya seçilmedi.")}` as RedirectTarget
                )}
                readOnly
              />
            </>
          ) : null}

          {activeTab === "logos-round2" && round2Result ? (
            <>
              <SourceStateBanner
                source={round2Result.source}
                errorMessage={round2Result.errorMessage}
                subject="Logolar"
              />

              {round2Result.items.length === 0 ? (
                <div className="rounded-[1.3rem] border border-dashed border-white/15 px-5 py-8 text-center text-[13px] text-white/50">
                  <p className="mb-4">
                    {`2. Tur henüz başlamadı. 1. Turdaki en yüksek ${ROUND_2_PROMOTE_COUNT} logoyu bu tura taşı.`}
                  </p>
                  <form action={promoteAction}>
                    <button
                      type="submit"
                      className="inline-flex min-h-[44px] items-center justify-center rounded-[0.9rem] bg-emerald-400/90 px-6 py-2.5 text-[13px] font-bold tracking-tight text-black transition hover:bg-emerald-400"
                    >
                      {`İlk ${ROUND_2_PROMOTE_COUNT} Logoyu 2. Tura Taşı`}
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
                  {...createLogoRoundActions(
                    2,
                    "logos-round2",
                    tabUrl("logos-round2", "Dosya seçilmedi.")
                  )}
                />
              )}
            </>
          ) : null}

          {activeTab === "domains" && domainsResult ? (
            <>
              <SourceStateBanner
                source={domainsResult.source}
                errorMessage={domainsResult.errorMessage}
                subject="Domainler"
              />

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

          {activeTodoBoard && todoBoardResult ? (
            <>
              <SourceStateBanner
                source={todoBoardResult.source}
                errorMessage={todoBoardResult.errorMessage}
                subject="Görevler"
              />
              <TodosTab
                todos={todoBoardResult.items}
                editingId={editTodoId}
                tabKey={activeTodoBoard}
                {...createTodoBoardActions(activeTodoBoard)}
              />
            </>
          ) : null}

          {activeTab === "meeting-brief" && briefComments ? (
            <>
              <SourceStateBanner
                source={briefComments.source}
                errorMessage={briefComments.errorMessage}
                subject="Yorumlar"
                unavailableText="Özet okunabilir ama yorumlar yüklenemiyor."
              />
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
