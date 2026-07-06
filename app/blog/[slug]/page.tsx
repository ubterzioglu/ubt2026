import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { JsonLd } from "@/components/json-ld";
import { buildMetadata } from "@/lib/seo";
import { buildBlogPostingSchema, buildBreadcrumbSchema } from "@/lib/structured-data";
import { getBlogPostBySlug } from "@/lib/blog-posts";

interface Props {
  params: Promise<{ slug: string }>;
}

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return buildMetadata({ noIndex: true });
  }

  return buildMetadata({
    title: post.title,
    description: post.summary,
    canonical: `/blog/${post.slug}`,
    ogType: "article",
    ogImage: post.coverImageUrl ?? undefined
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) notFound();

  const schemas = [
    buildBreadcrumbSchema([
      { name: "Home", href: "/" },
      { name: "Blog", href: "/blog" },
      { name: post.title, href: `/blog/${post.slug}` }
    ]),
    buildBlogPostingSchema({
      title: post.title,
      description: post.summary,
      slug: post.slug,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      coverImageUrl: post.coverImageUrl
    })
  ];

  return (
    <main className="page-shell min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd id="json-ld-blog-post" schema={schemas} />
      <article className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="flex items-center gap-3 text-sm">
          <Link href="/blog" className="font-semibold text-accent hover:text-accent/80">
            ← Blog
          </Link>
        </div>

        <header className="section-panel px-6 py-8 sm:px-10">
          {post.publishedAt ? (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/45">
              {formatDate(post.publishedAt)}
            </p>
          ) : null}
          <h1 className="mt-2 font-body text-[clamp(2rem,5vw,2.9rem)] font-semibold tracking-[-0.03em] text-ink">
            {post.title}
          </h1>
          <p className="mt-3 text-base leading-7 text-ink/72">{post.summary}</p>
        </header>

        {post.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full rounded-[1.5rem] border border-line/70 object-cover"
            loading="lazy"
          />
        ) : null}

        <div className="section-panel px-6 py-8 sm:px-10">
          <div className="blog-prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
          </div>
        </div>
      </article>
    </main>
  );
}
