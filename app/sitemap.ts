import type { MetadataRoute } from "next";

import { BASE_URL } from "@/lib/seo";
import { geoLocations } from "@/content/geo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0
    },
    {
      url: `${BASE_URL}/book-appointment`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7
    }
  ];

  const geoRoutes: MetadataRoute.Sitemap = geoLocations.map((loc) => ({
    url: `${BASE_URL}/geo/${loc.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8
  }));

  return [...staticRoutes, ...geoRoutes];
}
