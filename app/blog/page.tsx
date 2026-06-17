import type { Metadata } from "next";
import Link from "next/link";

import { buildMetadata } from "@/lib/seo";
import { getBlogPosts } from "@/lib/blog-posts";

export const metadata: Metadata = buildMetadata({
  title: "Blog",
  description:
    "Articles and notes on software quality assurance, test automation, and engineering practice by Umut Barış Terzioğlu.",
  canonical: "/blog",
  ogType: "website"
});

function formatDate(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

export default async function BlogIndexPage() {
  const { items } = await getBlogPosts();

  return (
    <main className="page-shell min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <section className="section-panel px-6 py-8 sm:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                Writing
              </p>
              <h1 className="mt-2 font-body text-[clamp(2.2rem,6vw,3.2rem)] font-semibold tracking-[-0.03em] text-ink">
                Blog
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/72 sm:text-base">
                Notes on QA strategy, test automation, and shipping quality software.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full border border-line/80 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-accent/40 hover:text-accent"
            >
              Back to home
            </Link>
          </div>
        </section>

        {items.length > 0 ? (
          <section className="grid gap-6 sm:grid-cols-2">
            {items.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="section-panel group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-glow"
              >
                {post.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.coverImageUrl}
                    alt={post.title}
                    className="h-44 w-full object-cover"
                    loading="lazy"
                  />
                ) : null}
                <div className="flex flex-1 flex-col px-6 py-5">
                  {post.publishedAt ? (
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/45">
                      {formatDate(post.publishedAt)}
                    </p>
                  ) : null}
                  <h2 className="mt-2 font-body text-xl font-semibold tracking-[-0.01em] text-ink transition group-hover:text-accent">
                    {post.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-6 text-ink/68">{post.summary}</p>
                  <span className="mt-4 text-sm font-semibold text-accent">Read more →</span>
                </div>
              </Link>
            ))}
          </section>
        ) : (
          <p className="rounded-[1.35rem] border border-dashed border-line/80 px-6 py-10 text-center text-sm text-ink/68">
            No blog posts have been published yet. Check back soon.
          </p>
        )}
      </div>
    </main>
  );
}
