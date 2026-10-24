import { XMLBuilder } from "fast-xml-parser";

import { getBlogPosts } from "@/lib/blog-posts";
import { getNewsUpdates } from "@/lib/news-updates";
import { BASE_URL, SITE_NAME } from "@/lib/seo";

export const revalidate = 3600;

interface FeedItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid: string;
}

const builder = new XMLBuilder({
  ignoreAttributes: false,
  format: true,
  suppressEmptyNode: true
});

function toRfc822(value: string | null | undefined): string {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toUTCString() : date.toUTCString();
}

export async function GET() {
  const [{ items: posts }, news] = await Promise.all([getBlogPosts(), getNewsUpdates()]);

  const feedItems: FeedItem[] = posts.map((post) => ({
    title: post.title,
    link: `${BASE_URL}/blog/${post.slug}`,
    description: post.summary,
    pubDate: toRfc822(post.publishedAt ?? post.updatedAt),
    guid: `${BASE_URL}/blog/${post.slug}`
  }));

  if (feedItems.length === 0) {
    for (const update of news.items) {
      feedItems.push({
        title: update.title,
        link: update.detailHref ? `${BASE_URL}${update.detailHref}` : BASE_URL,
        description: update.summary,
        pubDate: toRfc822(update.createdAt),
        guid: `${BASE_URL}/#news-${update.id}`
      });
    }
  }

  const xml = builder.build({
    "?xml": { "@_version": "1.0", "@_encoding": "UTF-8" },
    rss: {
      "@_version": "2.0",
      "@_xmlns:atom": "http://www.w3.org/2005/Atom",
      channel: {
        title: `${SITE_NAME} — Blog`,
        link: `${BASE_URL}/blog`,
        description:
          "Articles and updates from Umut Barış Terzioğlu — Senior Software QA Engineer in Dortmund, Germany.",
        language: "en",
        lastBuildDate: toRfc822(null),
        "atom:link": {
          "@_href": `${BASE_URL}/rss.xml`,
          "@_rel": "self",
          "@_type": "application/rss+xml"
        },
        item: feedItems
      }
    }
  });

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
