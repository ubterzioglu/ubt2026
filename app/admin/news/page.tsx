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
  getAllNewsUpdatesAdmin,
  createNewsUpdate,
  updateNewsUpdate,
  deleteNewsUpdate
} from "@/lib/news-updates";

interface AdminNewsPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function buildNewsErrorUrl(message?: string): string {
  const params = new URLSearchParams({ error: message || "Action failed." });
  return `/admin/news?${params.toString()}`;
}

export default async function AdminNewsPage({ searchParams }: AdminNewsPageProps) {
  const params = searchParams ? await searchParams : {};
  const hasAccess = await isAdminAuthenticated();

  if (!hasAccess) {
    return <AdminGate redirectTo="/admin/news" submitLabel="Open news manager" />;
  }

  const newsResult = await getAllNewsUpdatesAdmin();
  const createdParam = readSearchParam(params.created);
  const errorParam = readSearchParam(params.error);

  async function createAction(formData: FormData) {
    "use server";
    if (!(await isAdminAuthenticated())) {
      redirect("/admin/news" as Parameters<typeof redirect>[0]);
    }
    const title = readFormString(formData, "title");
    const summary = readFormString(formData, "summary");
    const imageUrl = readFormString(formData, "imageUrl");
    const detailHref = readFormString(formData, "detailHref");
    const isPublished = formData.get("isPublished") === "on";

    const result = await createNewsUpdate({
      title,
      summary,
      imageUrl: imageUrl.trim() || null,
      detailHref: detailHref.trim() || null,
      sortOrder: readSortOrder(formData),
      isPublished
    });

    if (!result.ok) {
      redirect(buildNewsErrorUrl(result.errorMessage) as Parameters<typeof redirect>[0]);
    }

    revalidatePath("/admin/news");
    redirect("/admin/news?created=1" as Parameters<typeof redirect>[0]);
  }

  async function togglePublishAction(formData: FormData) {
    "use server";
    if (!(await isAdminAuthenticated())) {
      redirect("/admin/news" as Parameters<typeof redirect>[0]);
    }
    const id = readFormString(formData, "id");
    const current = formData.get("isPublished") === "true";
    if (id) {
      const result = await updateNewsUpdate(id, { isPublished: !current });
      if (!result.ok) {
        redirect(buildNewsErrorUrl(result.errorMessage) as Parameters<typeof redirect>[0]);
      }
    }
    revalidatePath("/admin/news");
    redirect("/admin/news" as Parameters<typeof redirect>[0]);
  }

  async function deleteAction(formData: FormData) {
    "use server";
    if (!(await isAdminAuthenticated())) {
      redirect("/admin/news" as Parameters<typeof redirect>[0]);
    }
    const id = readFormString(formData, "id");
    if (id) {
      const result = await deleteNewsUpdate(id);
      if (!result.ok) {
        redirect(buildNewsErrorUrl(result.errorMessage) as Parameters<typeof redirect>[0]);
      }
    }
    revalidatePath("/admin/news");
    redirect("/admin/news" as Parameters<typeof redirect>[0]);
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Content"
        title="News & updates"
        description="Cards shown in the homepage news carousel."
      />

      {createdParam === "1" && (
        <FlashBanner tone="success">News item created successfully.</FlashBanner>
      )}
      {errorParam && <FlashBanner tone="error">{errorParam}</FlashBanner>}

      <AdminDisclosure
        title="Add new item"
        description="Title, summary, optional image and link"
        defaultOpen={newsResult.items.length === 0}
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
                placeholder="e.g. New feature launched"
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
                placeholder="Short description shown in the carousel card."
                className={adminInputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">Image URL</span>
              <input
                type="text"
                name="imageUrl"
                placeholder="/news/my-image.svg"
                className={adminInputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">Link (detail href)</span>
              <input
                type="text"
                name="detailHref"
                placeholder="/#section or https://..."
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
            Create news item
          </button>
        </form>
      </AdminDisclosure>

      <AdminListPanel
        title="All items"
        count={newsResult.items.length}
        emptyMessage="No news items yet. Use the form above to add the first one."
      >
        {newsResult.items.map((item) => (
          <PublishableRow
            key={item.id}
            id={item.id}
            title={item.title}
            summary={item.summary}
            isPublished={item.isPublished}
            badges={<AdminBadge>Order {item.sortOrder}</AdminBadge>}
            details={
              item.detailHref ? (
                <p className="mt-1 text-xs text-ink/50">
                  Link:{" "}
                  <a
                    href={item.detailHref}
                    className="text-accent hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {item.detailHref}
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
