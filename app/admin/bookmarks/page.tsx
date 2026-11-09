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
import { AdminBadge, AdminDisclosure, AdminListPanel } from "@/app/admin/_components/admin-panels";
import { adminInputClass, adminPrimaryButtonClass } from "@/app/admin/_components/form-classes";
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
    <>
      <AdminPageHeader
        eyebrow="Content"
        title="Bookmarks"
        description="Curated links shown in the bookmarks section."
      />

      {createdParam === "1" && (
        <FlashBanner tone="success">Bookmark created successfully.</FlashBanner>
      )}
      {errorParam && <FlashBanner tone="error">{errorParam}</FlashBanner>}

      <AdminDisclosure
        title="Add new bookmark"
        description="Title, summary, URL and badge"
        defaultOpen={bookmarksResult.items.length === 0}
      >
        <form action={createAction} className="space-y-4">
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
          <button type="submit" className={adminPrimaryButtonClass}>
            Create bookmark
          </button>
        </form>
      </AdminDisclosure>

      <AdminListPanel
        title="All bookmarks"
        count={bookmarksResult.items.length}
        emptyMessage="No bookmarks yet. Use the form above to add the first one."
      >
        {bookmarksResult.items.map((item) => (
          <PublishableRow
            key={item.id}
            id={item.id}
            title={item.title}
            summary={item.summary}
            isPublished={item.isPublished}
            badges={
              <>
                <AdminBadge>Order {item.sortOrder}</AdminBadge>
                {item.badge ? <AdminBadge tone="accent">{item.badge}</AdminBadge> : null}
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
        ))}
      </AdminListPanel>
    </>
  );
}
