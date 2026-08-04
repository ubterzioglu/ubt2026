import type { MetadataRoute } from "next";

import { BASE_URL, SEARCH_INDEX_DISALLOW_PATHS } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    return {
      rules: { userAgent: "*", disallow: "/" }
    };
  }

  const publicContentRules = {
    allow: "/",
    disallow: [...SEARCH_INDEX_DISALLOW_PATHS]
  };

  return {
    rules: [
      {
        userAgent: "*",
        ...publicContentRules
      },
      {
        userAgent: "Googlebot",
        ...publicContentRules
      },
      {
        userAgent: "OAI-SearchBot",
        ...publicContentRules
      }
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL
  };
}
