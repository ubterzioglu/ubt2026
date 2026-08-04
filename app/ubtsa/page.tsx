import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getUbtsaSessionName, UBTSA_NAMES } from "@/lib/admin-auth";
import {
  addUbtsaComment,
  deleteUbtsaComment,
  getAllUbtsaComments
} from "@/lib/ubtsa-comments";
import {
  UBTSA_ITEM_COUNT,
  UBTSA_SECTIONS,
  UBTSA_SUBTITLE,
  UBTSA_TITLE
} from "@/content/ubtsa-konsept";
import { ubtsaSignInAction, ubtsaSignOutAction } from "@/app/ubtsa/_actions";
import { BoardHeader } from "@/app/ubtsa/_components/board-header";
import { KonseptNav } from "@/app/ubtsa/_components/konsept-nav";
import { KonseptSection } from "@/app/ubtsa/_components/konsept-section";
import { UbtsaLogin } from "@/app/ubtsa/_components/ubtsa-login";
import { UBTSA_PAGE_BACKGROUND } from "@/app/ubtsa/_components/theme";

export const metadata = {
  title: "ubtsa · Weiterbildung ve İş Birliği Konsepti",
  robots: { index: false, follow: false }
};

interface UbtsaPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function readParam(value: string | string[] | undefined): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? "";
  return "";
}

/**
 * Builds the post-action target: back to the madde that was just acted on,
 * expanded (?open) and scrolled into view (#anchor), with an optional error.
 */
function itemUrl(itemKey: string, errorMessage?: string): string {
  const query = new URLSearchParams({ open: itemKey });
  if (errorMessage) query.set("error", errorMessage);
  return `/ubtsa?${query.toString()}#${itemKey}`;
}

export default async function UbtsaPage({ searchParams }: UbtsaPageProps) {
  const params = searchParams ? await searchParams : {};
  const sessionName = await getUbtsaSessionName();

  if (!sessionName) {
    return (
      <UbtsaLogin
        signIn={ubtsaSignInAction}
        names={UBTSA_NAMES}
        errorMessage={
          readParam(params.error)
            ? "İsim veya şifre hatalı. Tekrar dene."
            : undefined
        }
      />
    );
  }

  const openItemKey = readParam(params.open) || null;
  const errorParam = readParam(params.error);
  const comments = await getAllUbtsaComments();

  async function addCommentAction(formData: FormData) {
    "use server";
    const author = await getUbtsaSessionName();
    if (!author) {
      redirect("/ubtsa" as Parameters<typeof redirect>[0]);
    }
    const itemKey = String(formData.get("itemKey") ?? "");
    const body = String(formData.get("body") ?? "");
    const outcome = await addUbtsaComment(itemKey, body, author);
    revalidatePath("/ubtsa");
    redirect(
      itemUrl(
        itemKey,
        outcome.ok ? undefined : (outcome.errorMessage ?? "Yorum eklenemedi.")
      ) as Parameters<typeof redirect>[0]
    );
  }

  async function deleteCommentAction(formData: FormData) {
    "use server";
    const author = await getUbtsaSessionName();
    if (!author) {
      redirect("/ubtsa" as Parameters<typeof redirect>[0]);
    }
    const commentId = String(formData.get("commentId") ?? "");
    const itemKey = String(formData.get("itemKey") ?? "");
    const outcome = await deleteUbtsaComment(commentId, author);
    revalidatePath("/ubtsa");
    redirect(
      itemUrl(
        itemKey,
        outcome.ok ? undefined : (outcome.errorMessage ?? "Yorum silinemedi.")
      ) as Parameters<typeof redirect>[0]
    );
  }

  return (
    <main
      className="min-h-screen px-4 py-6 sm:px-6 lg:px-8"
      style={{ background: UBTSA_PAGE_BACKGROUND }}
    >
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-5">
        <BoardHeader
          title={UBTSA_TITLE}
          subtitle={UBTSA_SUBTITLE}
          sectionCount={UBTSA_SECTIONS.length}
          itemCount={UBTSA_ITEM_COUNT}
          commentCount={comments.totalCount}
          sessionName={sessionName}
          signOutAction={ubtsaSignOutAction}
        />

        {comments.source === "env-missing" && (
          <p className="rounded-[1rem] border border-amber-300/60 bg-amber-50 px-5 py-3 text-[13px] font-medium text-amber-800">
            Supabase bağlantısı yapılandırılmamış (SUPABASE_SERVICE_ROLE_KEY
            eksik). Konsept okunabilir ama yorumlar yüklenemiyor.
          </p>
        )}
        {comments.source === "error" && (
          <p className="rounded-[1rem] border border-rose-300/60 bg-rose-50 px-5 py-3 text-[13px] font-medium text-rose-700">
            Yorumlar yüklenirken hata oluştu: {comments.errorMessage}
          </p>
        )}
        {errorParam && (
          <p
            role="alert"
            className="rounded-[1rem] border border-rose-300/60 bg-rose-50 px-5 py-3 text-[13px] font-medium text-rose-700"
          >
            Hata: {errorParam}
          </p>
        )}

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[268px_minmax(0,1fr)]">
          <KonseptNav commentsByItemKey={comments.byItemKey} />

          <div className="space-y-4">
            {UBTSA_SECTIONS.map((section) => (
              <KonseptSection
                key={section.id}
                section={section}
                commentsByItemKey={comments.byItemKey}
                sessionName={sessionName}
                openItemKey={openItemKey}
                addCommentAction={addCommentAction}
                deleteCommentAction={deleteCommentAction}
              />
            ))}

            <p className="pb-6 pt-2 text-center text-[12px] text-slate-400">
              Her maddeye tıklayarak yorum bırakabilirsin · ubterzioglu.de ·
              internal
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
