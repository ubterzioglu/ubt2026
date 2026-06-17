import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminGate } from "@/app/admin/_components/admin-gate";
import { adminSignOutAction } from "@/app/admin/_actions";
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

function readParam(value: string | string[] | undefined): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? "";
  return "";
}

const inputClass =
  "w-full rounded-[1rem] border border-line/80 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent/55 focus:ring-2 focus:ring-accent/15";

export default async function AdminBlogPage({ searchParams }: AdminBlogPageProps) {
  const params = searchParams ? await searchParams : {};
  const hasAccess = await isAdminAuthenticated();

  if (!hasAccess) {
    return <AdminGate redirectTo="/admin/blog" submitLabel="Open blog manager" />;
  }

  const blogResult = await getAllBlogPostsAdmin();
  const createdParam = readParam(params.created);
  const updatedParam = readParam(params.updated);
  const editId = readParam(params.edit);
  const editing = editId ? await getBlogPostByIdAdmin(editId) : null;

  async function createAction(formData: FormData) {
    "use server";
    if (!(await isAdminAuthenticated())) {
      redirect("/admin/blog" as Parameters<typeof redirect>[0]);
    }
    const title = (formData.get("title") as string | null) ?? "";
    const slug = (formData.get("slug") as string | null) ?? "";
    const summary = (formData.get("summary") as string | null) ?? "";
    const content = (formData.get("content") as string | null) ?? "";
    const coverImageUrl = (formData.get("coverImageUrl") as string | null) ?? "";
    const isPublished = formData.get("isPublished") === "on";

    await createBlogPost({
      title,
      slug: slug.trim() || undefined,
      summary,
      content,
      coverImageUrl: coverImageUrl.trim() || null,
      isPublished
    });

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    redirect("/admin/blog?created=1" as Parameters<typeof redirect>[0]);
  }

  async function updateAction(formData: FormData) {
    "use server";
    if (!(await isAdminAuthenticated())) {
      redirect("/admin/blog" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    if (!id) {
      redirect("/admin/blog" as Parameters<typeof redirect>[0]);
    }
    const title = (formData.get("title") as string | null) ?? "";
    const slug = (formData.get("slug") as string | null) ?? "";
    const summary = (formData.get("summary") as string | null) ?? "";
    const content = (formData.get("content") as string | null) ?? "";
    const coverImageUrl = (formData.get("coverImageUrl") as string | null) ?? "";
    const isPublished = formData.get("isPublished") === "on";

    await updateBlogPost(id, {
      title,
      slug: slug.trim() || undefined,
      summary,
      content,
      coverImageUrl: coverImageUrl.trim() || null,
      isPublished
    });

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    redirect("/admin/blog?updated=1" as Parameters<typeof redirect>[0]);
  }

  async function togglePublishAction(formData: FormData) {
    "use server";
    if (!(await isAdminAuthenticated())) {
      redirect("/admin/blog" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    const current = formData.get("isPublished") === "true";
    if (id) {
      await updateBlogPost(id, { isPublished: !current });
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
    const id = (formData.get("id") as string | null) ?? "";
    if (id) {
      await deleteBlogPost(id);
    }
    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    redirect("/admin/blog" as Parameters<typeof redirect>[0]);
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
                Blog
              </h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="/admin"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/92"
              >
                Back to dashboard
              </a>
              <form action={adminSignOutAction}>
                <button
                  type="submit"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line/80 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-rose-300 hover:text-rose-700"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </section>

        {createdParam === "1" && (
          <div className="rounded-[1.35rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800">
            Blog post created successfully.
          </div>
        )}
        {updatedParam === "1" && (
          <div className="rounded-[1.35rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800">
            Blog post updated successfully.
          </div>
        )}

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
                  className={inputClass}
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
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">Cover image URL</span>
                <input
                  type="text"
                  name="coverImageUrl"
                  defaultValue={editing?.coverImageUrl ?? ""}
                  placeholder="https://..."
                  className={inputClass}
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
                  className={inputClass}
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
                  className={`${inputClass} font-mono`}
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
                        /{item.slug}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm leading-6 text-ink/68">{item.summary}</p>
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
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                    <a
                      href={`/admin/blog?edit=${item.id}`}
                      className="inline-flex min-h-[38px] items-center justify-center rounded-full border border-line/80 bg-white px-4 py-2 text-xs font-semibold text-ink transition hover:border-accent/40 hover:text-accent"
                    >
                      Edit
                    </a>
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
              No blog posts yet. Use the form above to add the first one.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
