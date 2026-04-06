import { FeaturedGrid } from "@/components/featured-grid";
import { HeroSection } from "@/components/hero-section";
import { SectionShell } from "@/components/section-shell";
import { SiteHeader } from "@/components/site-header";
import { fallbackApps, fallbackArticles, fallbackBookmarks, fallbackTools } from "@/content/featured";
import {
  aboutParagraphs,
  achievementBullets,
  achievementHighlights,
  contactItems,
  corporateProjects,
  cvLinks,
  experienceItems,
  privateProjects,
  stackGroups
} from "@/content/profile";
import { getFeaturedCollections } from "@/lib/featured-items";
import type { FeaturedItem } from "@/types/site";

function mapFallbackItems(items: Array<{
  category: FeaturedItem["category"];
  title: string;
  summary: string;
  href: string | null;
  badge?: string;
}>): FeaturedItem[] {
  return items.map((item, index) => ({
    id: `${item.category}-${index + 1}`,
    slug: `${item.category}-${index + 1}`,
    category: item.category,
    title: item.title,
    summary: item.summary,
    href: item.href,
    badge: item.badge ?? null,
    sortOrder: index,
    isPublished: true,
    createdAt: new Date("2026-04-06").toISOString()
  }));
}

export default async function HomePage() {
  const featuredCollections = await getFeaturedCollections([
    "tools",
    "articles",
    "bookmarks",
    "apps",
    "private-projects"
  ]);

  const tools = featuredCollections.itemsByCategory.tools.length
    ? featuredCollections.itemsByCategory.tools
    : mapFallbackItems(fallbackTools);
  const articles = featuredCollections.itemsByCategory.articles.length
    ? featuredCollections.itemsByCategory.articles
    : mapFallbackItems(fallbackArticles);
  const bookmarks = featuredCollections.itemsByCategory.bookmarks.length
    ? featuredCollections.itemsByCategory.bookmarks
    : mapFallbackItems(fallbackBookmarks);
  const apps = featuredCollections.itemsByCategory.apps.length
    ? featuredCollections.itemsByCategory.apps
    : mapFallbackItems(fallbackApps);

  const fallbackSource =
    featuredCollections.source === "remote" ? undefined : featuredCollections.source;

  return (
    <main className="page-shell pb-16">
      <SiteHeader />
      <HeroSection />

      <SectionShell
        id="tools-developed-by-ubt"
        eyebrow="Built by me"
        title="Tools Developed by UBT (me)"
        description="Small, opinionated tools designed to solve practical decisions, career questions, and everyday moments with a bit of personality."
      >
        <FeaturedGrid
          items={tools}
          sourceLabel={fallbackSource}
          emptyMessage="No tools are available yet."
        />
      </SectionShell>

      <SectionShell
        id="my-cv"
        eyebrow="Recruiter-ready"
        title="My CV"
        description="This section keeps the CV in-page while the actual view and download actions stay external."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {cvLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-[1.6rem] border border-line/80 bg-gradient-to-br from-white to-mist/80 p-6 shadow-sm transition hover:-translate-y-1 hover:border-accent/45 hover:shadow-glow"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">PDF</p>
              <h3 className="mt-3 font-display text-3xl font-semibold text-ink">{link.label}</h3>
              <p className="mt-4 text-sm leading-6 text-ink/68">{link.note}</p>
              <span className="mt-6 inline-flex rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">
                View or download
              </span>
            </a>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        id="about-me"
        eyebrow="Positioning"
        title="About me"
        description="The core positioning and tone are distilled from the original profile pages and rewritten into a structured, modern summary."
      >
        <div className="grid gap-6 lg:grid-cols-[180px_minmax(0,1fr)]">
          <div className="flex aspect-square items-center justify-center rounded-[2rem] border border-line/80 bg-ink text-center text-white shadow-glow">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-white/60">UBT</p>
              <p className="mt-3 font-display text-4xl font-semibold">15+</p>
              <p className="mt-1 text-sm text-white/72">years of quality work</p>
            </div>
          </div>
          <div className="space-y-4">
            {aboutParagraphs.map((paragraph) => (
              <p key={paragraph} className="text-base leading-8 text-ink/74">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell
        id="key-achievements"
        eyebrow="Highlights"
        title="Key Achievements"
        description="A condensed view of measurable impact pulled from the recruiter-oriented material."
      >
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {achievementHighlights.map((item) => (
              <article key={item.label} className="rounded-[1.5rem] border border-line/80 bg-white/82 p-5">
                <p className="font-display text-4xl font-semibold text-ink">{item.value}</p>
                <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-accent">{item.label}</p>
                <p className="mt-3 text-sm leading-6 text-ink/66">{item.detail}</p>
              </article>
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {achievementBullets.map((bullet) => (
              <div
                key={bullet}
                className="rounded-[1.35rem] border border-line/70 bg-mist/60 px-4 py-4 text-sm leading-6 text-ink/74"
              >
                {bullet}
              </div>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell
        id="tech-stack"
        eyebrow="Toolkit"
        title="Tech Stack"
        description="Grouped into capability areas instead of a flat checklist so the page reads like a portfolio, not a keyword dump."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {stackGroups.map((group) => (
            <article key={group.title} className="rounded-[1.5rem] border border-line/80 bg-white/82 p-5">
              <h3 className="font-display text-2xl font-semibold text-ink">{group.title}</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-line/70 bg-paper/75 px-3 py-2 text-sm text-ink/74"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        id="experience"
        eyebrow="Career path"
        title="Experience"
        description="A timeline-driven reading of the roles that shaped the current QA, automation, and delivery perspective."
      >
        <div className="space-y-4">
          {experienceItems.map((item) => (
            <article key={`${item.company}-${item.role}`} className="rounded-[1.7rem] border border-line/80 bg-white/82 p-6">
              <div className="flex flex-col gap-3 border-b border-line/70 pb-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">{item.company}</p>
                  <h3 className="mt-2 font-display text-3xl font-semibold text-ink">{item.role}</h3>
                </div>
                <div className="text-sm leading-6 text-ink/62">
                  <p>{item.period}</p>
                  <p>{item.location}</p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-7 text-ink/70">{item.summary}</p>
              <ul className="mt-5 grid gap-3 md:grid-cols-2">
                {item.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="rounded-[1.2rem] border border-line/70 bg-mist/55 px-4 py-3 text-sm leading-6 text-ink/74"
                  >
                    {highlight}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        id="corporate-projects"
        eyebrow="Enterprise work"
        title="Corporate Projects"
        description="Representative programs that show scale, operational complexity, and domain depth."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {corporateProjects.map((project) => (
            <article key={project.title} className="rounded-[1.55rem] border border-line/80 bg-white/82 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">{project.label}</p>
              <h3 className="mt-3 font-display text-2xl font-semibold text-ink">{project.title}</h3>
              <p className="mt-4 text-sm leading-6 text-ink/68">{project.summary}</p>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        id="private-projects"
        eyebrow="Own initiatives"
        title="Private Projects"
        description="Independent concepts, communities, and editorial experiments that extend beyond corporate delivery work."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {privateProjects.map((project) => (
            <article key={project.title} className="rounded-[1.55rem] border border-line/80 bg-white/82 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">{project.label}</p>
              <h3 className="mt-3 font-display text-2xl font-semibold text-ink">{project.title}</h3>
              <p className="mt-4 text-sm leading-6 text-ink/68">{project.summary}</p>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        id="articles"
        eyebrow="Published thinking"
        title="Articles"
        description="Writing around software testing, technology, AI, and the broader human side of work."
      >
        <FeaturedGrid
          items={articles}
          sourceLabel={fallbackSource}
          emptyMessage="No articles are available yet."
        />
      </SectionShell>

      <SectionShell
        id="my-bookmarks"
        eyebrow="Curated references"
        title="My Bookmarks"
        description="A smaller, cleaner slice of the original bookmark universe, focused on links worth returning to."
      >
        <FeaturedGrid
          items={bookmarks}
          sourceLabel={fallbackSource}
          emptyMessage="No bookmarks are available yet."
        />
      </SectionShell>

      <SectionShell
        id="useful-apps"
        eyebrow="Utilities"
        title="Useful Apps"
        description="Lightweight helpers and utilities that improve workflow, output, or day-to-day convenience."
      >
        <FeaturedGrid
          items={apps}
          sourceLabel={fallbackSource}
          emptyMessage="No useful apps are available yet."
        />
      </SectionShell>

      <SectionShell
        id="contact"
        eyebrow="Reach out"
        title="Contact"
        description="Direct channels for a conversation, collaboration, or a quick follow-up."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {contactItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.href.startsWith("mailto:") || item.href.startsWith("tel:") ? undefined : "_blank"}
              rel={item.href.startsWith("mailto:") || item.href.startsWith("tel:") ? undefined : "noreferrer"}
              className="rounded-[1.55rem] border border-line/80 bg-gradient-to-br from-white to-mist/75 p-5 transition hover:-translate-y-1 hover:border-accent/45 hover:shadow-glow"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">{item.label}</p>
              <p className="mt-3 font-display text-2xl font-semibold text-ink">{item.value}</p>
            </a>
          ))}
        </div>
      </SectionShell>

      <footer className="px-4 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl border-t border-line/70 py-8 text-sm text-ink/55">
          {`UBT 2026 single-page portfolio. Local typed content powers the profile sections; Supabase can enrich featured cards when configured.`}
        </div>
      </footer>
    </main>
  );
}
