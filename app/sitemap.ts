import type { MetadataRoute } from "next";

import { BASE_URL } from "@/lib/seo";
import { geoLocations } from "@/content/geo";
import { getBlogPosts } from "@/lib/blog-posts";

// Pinned to the site's last content update so lastmod stays stable across
// builds for static/geo routes instead of churning on every deploy. Blog posts
// keep their own per-post updatedAt below.
const LAST_MODIFIED = "2026-06-17";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 1.0
    },
    {
      url: `${BASE_URL}/book-appointment`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.7
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.7
    }
  ];

  const geoRoutes: MetadataRoute.Sitemap = geoLocations.map((loc) => ({
    url: `${BASE_URL}/geo/${loc.slug}`,
    lastModified: LAST_MODIFIED,
    changeFrequency: "monthly" as const,
    priority: 0.8
  }));

  const { items: blogPosts } = await getBlogPosts();
  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6
  }));

  return [...staticRoutes, ...geoRoutes, ...blogRoutes];
}
