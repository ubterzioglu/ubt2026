import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { readSearchParam } from "@/lib/search-params";
import { readFormString } from "@/lib/form-data";
import { readSortOrder } from "@/lib/sort-order";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminGate } from "@/app/admin/_components/admin-gate";
import { AdminPageHeader } from "@/app/admin/_components/admin-page-header";
import { FlashBanner } from "@/app/admin/_components/flash-banner";
import { PublishableRow } from "@/app/admin/_components/publishable-row";
import { adminInputClass } from "@/app/admin/_components/form-classes";
import {
  getAllBookmarksAdmin,
  createBookmark,
  updateBookmark,
  deleteBookmark
} from "@/lib/featured-items";

interface AdminBookmarksPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function buildBookmarksErrorUrl(message?: string): string {
  const params = new URLSearchParams({ error: message || "Action failed." });
  return `/admin/bookmarks?${params.toString()}`;
}

export default async function AdminBookmarksPage({ searchParams }: AdminBookmarksPageProps) {
  const params = searchParams ? await searchParams : {};
  const hasAccess = await isAdminAuthenticated();

  if (!hasAccess) {
    return <AdminGate redirectTo="/admin/bookmarks" submitLabel="Open bookmarks manager" />;
  }

  const bookmarksResult = await getAllBookmarksAdmin();
  const createdParam = readSearchParam(params.created);
  const errorParam = readSearchParam(params.error);

  async function createAction(formData: FormData) {
    "use server";
    if (!(await isAdminAuthenticated())) {
      redirect("/admin/bookmarks" as Parameters<typeof redirect>[0]);
    }
    const title = readFormString(formData, "title");
    const summary = readFormString(formData, "summary");
    const href = readFormString(formData, "href");
    const badge = readFormString(formData, "badge");
    const isPublished = formData.get("isPublished") === "on";

    const result = await createBookmark({
      title,
      summary,
      href: href.trim() || null,
      badge: badge.trim() || null,
      sortOrder: readSortOrder(formData),
      isPublished
    });

    if (!result.ok) {
      redirect(buildBookmarksErrorUrl(result.errorMessage) as Parameters<typeof redirect>[0]);
    }

    revalidatePath("/admin/bookmarks");
    redirect("/admin/bookmarks?created=1" as Parameters<typeof redirect>[0]);
  }

  async function togglePublishAction(formData: FormData) {
    "use server";
    if (!(await isAdminAuthenticated())) {
      redirect("/admin/bookmarks" as Parameters<typeof redirect>[0]);
    }
    const id = readFormString(formData, "id");
    const current = formData.get("isPublished") === "true";
    if (id) {
      const result = await updateBookmark(id, { isPublished: !current });
      if (!result.ok) {
        redirect(buildBookmarksErrorUrl(result.errorMessage) as Parameters<typeof redirect>[0]);
      }
    }
    revalidatePath("/admin/bookmarks");
    redirect("/admin/bookmarks" as Parameters<typeof redirect>[0]);
  }

  async function deleteAction(formData: FormData) {
    "use server";
    if (!(await isAdminAuthenticated())) {
      redirect("/admin/bookmarks" as Parameters<typeof redirect>[0]);
    }
    const id = readFormString(formData, "id");
    if (id) {
      const result = await deleteBookmark(id);
      if (!result.ok) {
        redirect(buildBookmarksErrorUrl(result.errorMessage) as Parameters<typeof redirect>[0]);
      }
    }
    revalidatePath("/admin/bookmarks");
    redirect("/admin/bookmarks" as Parameters<typeof redirect>[0]);
  }

  return (
    <main className="page-shell min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <AdminPageHeader eyebrow="Content management" title="Bookmarks" />

        {createdParam === "1" && (
          <FlashBanner tone="success">Bookmark created successfully.</FlashBanner>
        )}
        {errorParam && <FlashBanner tone="error">{errorParam}</FlashBanner>}

        <section className="section-panel px-6 py-6 sm:px-8">
          <h2 className="font-body text-xl font-semibold text-ink">Add new bookmark</h2>
          <form action={createAction} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-ink">
                  Title <span className="text-accent">*</span>
                </span>
                <input
                  type="text"
                  name="title"
                  required
                  minLength={2}
                  maxLength={200}
                  placeholder="e.g. Useful resource"
                  className={adminInputClass}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-ink">
                  Summary <span className="text-accent">*</span>
                </span>
                <textarea
                  name="summary"
                  required
                  minLength={5}
                  maxLength={500}
                  rows={3}
                  placeholder="Short description of the bookmark."
                  className={adminInputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">URL (href)</span>
                <input
                  type="url"
                  name="href"
                  placeholder="https://..."
                  className={adminInputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">Badge</span>
                <input
                  type="text"
                  name="badge"
                  maxLength={40}
                  placeholder="e.g. Article, Tool, Video"
                  className={adminInputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">Sort order</span>
                <input
                  type="number"
                  name="sortOrder"
                  defaultValue={0}
                  step={10}
                  className={adminInputClass}
                />
              </label>
              <div className="flex items-center gap-3 self-end pb-3">
                <input
                  type="checkbox"
                  name="isPublished"
                  id="isPublished"
                  defaultChecked
                  className="h-4 w-4 rounded border-line/80 accent-accent"
                />
                <label htmlFor="isPublished" className="text-sm font-medium text-ink">
                  Publish immediately
                </label>
              </div>
            </div>
            <button
              type="submit"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/95"
            >
              Create bookmark
            </button>
          </form>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-4 px-1">
            <h2 className="font-body text-xl font-semibold text-ink">
              All bookmarks
              <span className="ml-2 font-body text-base font-normal text-ink/50">
                ({bookmarksResult.items.length})
              </span>
            </h2>
          </div>

          {bookmarksResult.items.length > 0 ? (
            bookmarksResult.items.map((item) => (
              <PublishableRow
                key={item.id}
                id={item.id}
                title={item.title}
                summary={item.summary}
                isPublished={item.isPublished}
                badges={
                  <>
                    <span className="rounded-full bg-paper px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/55">
                      Order {item.sortOrder}
                    </span>
                    {item.badge ? (
                      <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                        {item.badge}
                      </span>
                    ) : null}
                  </>
                }
                details={
                  item.href ? (
                    <p className="mt-1 text-xs text-ink/50">
                      URL:{" "}
                      <a
                        href={item.href}
                        className="text-accent hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.href}
                      </a>
                    </p>
                  ) : null
                }
                togglePublishAction={togglePublishAction}
                deleteAction={deleteAction}
              />
            ))
          ) : (
            <p className="rounded-[1.35rem] border border-dashed border-line/80 px-5 py-6 text-sm text-ink/68">
              No bookmarks yet. Use the form above to add the first one.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
