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

  const aiCrawlers = [
    "Googlebot",
    "Google-Extended",
    "OAI-SearchBot",
    "GPTBot",
    "ChatGPT-User",
    "ClaudeBot",
    "Claude-Web",
    "anthropic-ai",
    "PerplexityBot",
    "Perplexity-User",
    "CCBot",
    "Applebot-Extended",
    "Bytespider",
    "Amazonbot",
    "cohere-ai",
    "Meta-ExternalAgent"
  ];

  return {
    rules: [
      {
        userAgent: "*",
        ...publicContentRules
      },
      ...aiCrawlers.map((userAgent) => ({
        userAgent,
        ...publicContentRules
      }))
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL
  };
}
