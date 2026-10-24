import { getBlogPosts } from "@/lib/blog-posts";
import {
  achievementBullets,
  experienceItems,
  faqItems,
  heroSummary,
  methodologyText
} from "@/content/profile";
import { BASE_URL, SITE_LAST_UPDATED, SITE_NAME } from "@/lib/seo";

export const revalidate = 86400;

function buildLlmsFullText(blogTitles: string[]): string {
  const experience = experienceItems
    .map(
      (item) =>
        `- ${item.role} at ${item.company} (${item.period}, ${item.location}): ${item.summary}`
    )
    .join("\n");

  const achievements = achievementBullets.map((item) => `- ${item.text}`).join("\n");

  const faq = faqItems.map((item) => `### ${item.question}\n\n${item.answer}`).join("\n\n");

  const blog = blogTitles.length
    ? blogTitles.map((title) => `- ${title}`).join("\n")
    : "- No posts published yet.";

  return `# ${SITE_NAME} — Full Profile

> Complete machine-readable profile of ${SITE_NAME} (UBT), Senior Software Quality
> Assurance Engineer based in Dortmund, Germany. Last updated: ${SITE_LAST_UPDATED}.

## Summary

${heroSummary}

## Methodology

${methodologyText}

## Experience

${experience}

## Key achievements

${achievements}

## Blog posts

${blog}

Full posts at ${BASE_URL}/blog — RSS feed at ${BASE_URL}/rss.xml.

## FAQ

${faq}

## Contact

- Email: ubterzioglu@gmail.com
- Phone: +49 173 956 9429
- LinkedIn: https://www.linkedin.com/in/ubterzioglu/
- Instagram: https://www.instagram.com/ubterzioglu/
- Medium: https://medium.com/@ubterzioglu
- Location: Dortmund, North Rhine-Westphalia, Germany
`;
}

export async function GET() {
  const { items } = await getBlogPosts();
  const body = buildLlmsFullText(items.map((post) => post.title));

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400"
    }
  });
}
