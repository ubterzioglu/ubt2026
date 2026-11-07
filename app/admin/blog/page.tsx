import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { readSearchParam } from "@/lib/search-params";
import { readFormString } from "@/lib/form-data";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminGate } from "@/app/admin/_components/admin-gate";
import { AdminPageHeader } from "@/app/admin/_components/admin-page-header";
import { FlashBanner } from "@/app/admin/_components/flash-banner";
import { PublishableRow } from "@/app/admin/_components/publishable-row";
import { adminInputClass } from "@/app/admin/_components/form-classes";
import {
  getAllBlogPostsAdmin,
  getBlogPostByIdAdmin,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost
} from "@/lib/blog-posts";

interface AdminBlogPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function buildBlogErrorUrl(message?: string, editId?: string): string {
  const params = new URLSearchParams({ error: message || "Action failed." });
  if (editId) {
    params.set("edit", editId);
  }
  return `/admin/blog?${params.toString()}`;
}

export default async function AdminBlogPage({ searchParams }: AdminBlogPageProps) {
  const params = searchParams ? await searchParams : {};
  const hasAccess = await isAdminAuthenticated();

  if (!hasAccess) {
    return <AdminGate redirectTo="/admin/blog" submitLabel="Open blog manager" />;
  }

  const blogResult = await getAllBlogPostsAdmin();
  const createdParam = readSearchParam(params.created);
  const updatedParam = readSearchParam(params.updated);
  const errorParam = readSearchParam(params.error);
  const editId = readSearchParam(params.edit);
  const editing = editId ? await getBlogPostByIdAdmin(editId) : null;

  async function createAction(formData: FormData) {
    "use server";
    if (!(await isAdminAuthenticated())) {
      redirect("/admin/blog" as Parameters<typeof redirect>[0]);
    }
    const title = readFormString(formData, "title");
    const slug = readFormString(formData, "slug");
    const summary = readFormString(formData, "summary");
    const content = readFormString(formData, "content");
    const coverImageUrl = readFormString(formData, "coverImageUrl");
    const isPublished = formData.get("isPublished") === "on";

    const result = await createBlogPost({
      title,
      slug: slug.trim() || undefined,
      summary,
      content,
      coverImageUrl: coverImageUrl.trim() || null,
      isPublished
    });

    if (!result.ok) {
      redirect(buildBlogErrorUrl(result.errorMessage) as Parameters<typeof redirect>[0]);
    }

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    redirect("/admin/blog?created=1" as Parameters<typeof redirect>[0]);
  }

  async function updateAction(formData: FormData) {
    "use server";
    if (!(await isAdminAuthenticated())) {
      redirect("/admin/blog" as Parameters<typeof redirect>[0]);
    }
    const id = readFormString(formData, "id");
    if (!id) {
      redirect("/admin/blog" as Parameters<typeof redirect>[0]);
    }
    const title = readFormString(formData, "title");
    const slug = readFormString(formData, "slug");
    const summary = readFormString(formData, "summary");
    const content = readFormString(formData, "content");
    const coverImageUrl = readFormString(formData, "coverImageUrl");
    const isPublished = formData.get("isPublished") === "on";

    const result = await updateBlogPost(id, {
      title,
      slug: slug.trim() || undefined,
      summary,
      content,
      coverImageUrl: coverImageUrl.trim() || null,
      isPublished
    });

    if (!result.ok) {
      redirect(buildBlogErrorUrl(result.errorMessage, id) as Parameters<typeof redirect>[0]);
    }

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    redirect("/admin/blog?updated=1" as Parameters<typeof redirect>[0]);
  }

  async function togglePublishAction(formData: FormData) {
    "use server";
    if (!(await isAdminAuthenticated())) {
      redirect("/admin/blog" as Parameters<typeof redirect>[0]);
    }
    const id = readFormString(formData, "id");
    const current = formData.get("isPublished") === "true";
    if (id) {
      const result = await updateBlogPost(id, { isPublished: !current });
      if (!result.ok) {
        redirect(buildBlogErrorUrl(result.errorMessage) as Parameters<typeof redirect>[0]);
      }
    }
    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    redirect("/admin/blog" as Parameters<typeof redirect>[0]);
  }

  async function deleteAction(formData: FormData) {
    "use server";
    if (!(await isAdminAuthenticated())) {
      redirect("/admin/blog" as Parameters<typeof redirect>[0]);
    }
    const id = readFormString(formData, "id");
    if (id) {
      const result = await deleteBlogPost(id);
      if (!result.ok) {
        redirect(buildBlogErrorUrl(result.errorMessage) as Parameters<typeof redirect>[0]);
      }
    }
    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    redirect("/admin/blog" as Parameters<typeof redirect>[0]);
  }

  return (
    <main className="page-shell min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <AdminPageHeader eyebrow="Content management" title="Blog" />

        {createdParam === "1" && (
          <FlashBanner tone="success">Blog post created successfully.</FlashBanner>
        )}
        {updatedParam === "1" && (
          <FlashBanner tone="success">Blog post updated successfully.</FlashBanner>
        )}
        {errorParam && <FlashBanner tone="error">{errorParam}</FlashBanner>}

        <section className="section-panel px-6 py-6 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-body text-xl font-semibold text-ink">
              {editing ? "Edit post" : "Add new post"}
            </h2>
            {editing ? (
              <a href="/admin/blog" className="text-sm font-semibold text-accent hover:text-accent/80">
                Cancel edit
              </a>
            ) : null}
          </div>
          <form
            action={editing ? updateAction : createAction}
            className="mt-6 space-y-4"
          >
            {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
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
                  defaultValue={editing?.title ?? ""}
                  placeholder="e.g. How I test flaky end-to-end flows"
                  className={adminInputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">
                  Slug <span className="text-ink/45">(optional)</span>
                </span>
                <input
                  type="text"
                  name="slug"
                  maxLength={120}
                  defaultValue={editing?.slug ?? ""}
                  placeholder="auto-generated from title"
                  className={adminInputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">Cover image URL</span>
                <input
                  type="text"
                  name="coverImageUrl"
                  defaultValue={editing?.coverImageUrl ?? ""}
                  placeholder="https://..."
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
                  rows={2}
                  defaultValue={editing?.summary ?? ""}
                  placeholder="Short description shown in the blog list card."
                  className={adminInputClass}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-ink">
                  Content (Markdown) <span className="text-accent">*</span>
                </span>
                <textarea
                  name="content"
                  required
                  minLength={1}
                  rows={14}
                  defaultValue={editing?.content ?? ""}
                  placeholder={"# Heading\n\nWrite the post body in **Markdown**. Lists, links, tables and code blocks are supported."}
                  className={`${adminInputClass} font-mono`}
                />
              </label>
              <div className="flex items-center gap-3 self-end pb-3">
                <input
                  type="checkbox"
                  name="isPublished"
                  id="isPublished"
                  defaultChecked={editing?.isPublished ?? false}
                  className="h-4 w-4 rounded border-line/80 accent-accent"
                />
                <label htmlFor="isPublished" className="text-sm font-medium text-ink">
                  Published (visible on /blog)
                </label>
              </div>
            </div>
            <button
              type="submit"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/95"
            >
              {editing ? "Save changes" : "Create blog post"}
            </button>
          </form>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-4 px-1">
            <h2 className="font-body text-xl font-semibold text-ink">
              All posts
              <span className="ml-2 font-body text-base font-normal text-ink/50">
                ({blogResult.items.length})
              </span>
            </h2>
          </div>

          {blogResult.items.length > 0 ? (
            blogResult.items.map((item) => (
              <PublishableRow
                key={item.id}
                id={item.id}
                title={item.title}
                summary={item.summary}
                isPublished={item.isPublished}
                badges={
                  <span className="rounded-full bg-paper px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/55">
                    /{item.slug}
                  </span>
                }
                details={
                  <p className="mt-1 text-xs text-ink/50">
                    View:{" "}
                    <a
                      href={`/blog/${item.slug}`}
                      className="text-accent hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      /blog/{item.slug}
                    </a>
                  </p>
                }
                leadingActions={
                  <a
                    href={`/admin/blog?edit=${item.id}`}
                    className="inline-flex min-h-[38px] items-center justify-center rounded-full border border-line/80 bg-white px-4 py-2 text-xs font-semibold text-ink transition hover:border-accent/40 hover:text-accent"
                  >
                    Edit
                  </a>
                }
                togglePublishAction={togglePublishAction}
                deleteAction={deleteAction}
              />
            ))
          ) : (
            <p className="rounded-[1.35rem] border border-dashed border-line/80 px-5 py-6 text-sm text-ink/68">
              No blog posts yet. Use the form above to add the first one.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
