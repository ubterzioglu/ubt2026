import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { hasAdminAccess } from "@/lib/appointments";
import {
  getAllBookmarksAdmin,
  createBookmark,
  updateBookmark,
  deleteBookmark
} from "@/lib/featured-items";

interface AdminBookmarksPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function readParam(value: string | string[] | undefined): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? "";
  return "";
}

export default async function AdminBookmarksPage({ searchParams }: AdminBookmarksPageProps) {
  const params = searchParams ? await searchParams : {};
  const accessKey = readParam(params.access);
  const hasAccess = hasAdminAccess(accessKey);

  if (!hasAccess) {
    return (
      <main className="page-shell min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <section className="section-panel px-6 py-8 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
              Admin access
            </p>
            <h1 className="mt-3 font-body text-[clamp(2rem,5vw,2.6rem)] font-semibold tracking-[-0.03em] text-ink">
              Enter the admin key
            </h1>
            <form action="/admin/bookmarks" className="mt-8 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-ink">Access key</span>
                <input
                  type="password"
                  name="access"
                  className="w-full rounded-[1rem] border border-line/80 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent/55 focus:ring-2 focus:ring-accent/15"
                />
              </label>
              <button
                type="submit"
                className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent/95"
              >
                Open bookmarks manager
              </button>
            </form>
          </section>
        </div>
      </main>
    );
  }

  const bookmarksResult = await getAllBookmarksAdmin();
  const createdParam = readParam(params.created);

  async function createAction(formData: FormData) {
    "use server";
    const title = (formData.get("title") as string | null) ?? "";
    const summary = (formData.get("summary") as string | null) ?? "";
    const href = (formData.get("href") as string | null) ?? "";
    const badge = (formData.get("badge") as string | null) ?? "";
    const rawOrder = (formData.get("sortOrder") as string | null) ?? "0";
    const sortOrder = parseInt(rawOrder, 10);
    const isPublished = formData.get("isPublished") === "on";

    await createBookmark({
      title,
      summary,
      href: href.trim() || null,
      badge: badge.trim() || null,
      sortOrder: isNaN(sortOrder) ? 0 : sortOrder,
      isPublished
    });

    revalidatePath("/admin/bookmarks");
    const target = accessKey
      ? `/admin/bookmarks?access=${encodeURIComponent(accessKey)}&created=1`
      : "/admin/bookmarks?created=1";
    redirect(target as Parameters<typeof redirect>[0]);
  }

  async function togglePublishAction(formData: FormData) {
    "use server";
    const id = (formData.get("id") as string | null) ?? "";
    const current = formData.get("isPublished") === "true";
    if (id) {
      await updateBookmark(id, { isPublished: !current });
    }
    revalidatePath("/admin/bookmarks");
    const toggleTarget = accessKey
      ? `/admin/bookmarks?access=${encodeURIComponent(accessKey)}`
      : "/admin/bookmarks";
    redirect(toggleTarget as Parameters<typeof redirect>[0]);
  }

  async function deleteAction(formData: FormData) {
    "use server";
    const id = (formData.get("id") as string | null) ?? "";
    if (id) {
      await deleteBookmark(id);
    }
    revalidatePath("/admin/bookmarks");
    const deleteTarget = accessKey
      ? `/admin/bookmarks?access=${encodeURIComponent(accessKey)}`
      : "/admin/bookmarks";
    redirect(deleteTarget as Parameters<typeof redirect>[0]);
  }

  return (
    <main className="page-shell min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <section className="section-panel px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                Content management
              </p>
              <h1 className="mt-2 font-body text-[clamp(2rem,5vw,2.7rem)] font-semibold tracking-[-0.03em] text-ink">
                Bookmarks
              </h1>
            </div>
            <a
              href={
                accessKey ? `/admin?access=${encodeURIComponent(accessKey)}` : "/admin"
              }
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/92"
            >
              Back to dashboard
            </a>
          </div>
        </section>

        {createdParam === "1" && (
          <div className="rounded-[1.35rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800">
            Bookmark created successfully.
          </div>
        )}

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
                  className="w-full rounded-[1rem] border border-line/80 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent/55 focus:ring-2 focus:ring-accent/15"
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
                  className="w-full rounded-[1rem] border border-line/80 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent/55 focus:ring-2 focus:ring-accent/15"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">URL (href)</span>
                <input
                  type="url"
                  name="href"
                  placeholder="https://..."
                  className="w-full rounded-[1rem] border border-line/80 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent/55 focus:ring-2 focus:ring-accent/15"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">Badge</span>
                <input
                  type="text"
                  name="badge"
                  maxLength={40}
                  placeholder="e.g. Article, Tool, Video"
                  className="w-full rounded-[1rem] border border-line/80 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent/55 focus:ring-2 focus:ring-accent/15"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">Sort order</span>
                <input
                  type="number"
                  name="sortOrder"
                  defaultValue={0}
                  step={10}
                  className="w-full rounded-[1rem] border border-line/80 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent/55 focus:ring-2 focus:ring-accent/15"
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
              <article
                key={item.id}
                className={`section-panel px-6 py-5 sm:px-8 ${
                  item.isPublished ? "" : "opacity-60"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-body text-lg font-semibold text-ink">{item.title}</h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                          item.isPublished
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {item.isPublished ? "Published" : "Draft"}
                      </span>
                      <span className="rounded-full bg-paper px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/55">
                        Order {item.sortOrder}
                      </span>
                      {item.badge ? (
                        <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                          {item.badge}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1.5 text-sm leading-6 text-ink/68">{item.summary}</p>
                    {item.href ? (
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
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                    <form action={togglePublishAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <input
                        type="hidden"
                        name="isPublished"
                        value={String(item.isPublished)}
                      />
                      <button
                        type="submit"
                        className={`inline-flex min-h-[38px] items-center justify-center rounded-full px-4 py-2 text-xs font-semibold transition ${
                          item.isPublished
                            ? "border border-line/80 bg-white text-ink hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800"
                            : "border border-line/80 bg-white text-ink hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                        }`}
                      >
                        {item.isPublished ? "Unpublish" : "Publish"}
                      </button>
                    </form>
                    <form action={deleteAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <button
                        type="submit"
                        className="inline-flex min-h-[38px] items-center justify-center rounded-full border border-line/80 bg-white px-4 py-2 text-xs font-semibold text-ink transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </article>
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
