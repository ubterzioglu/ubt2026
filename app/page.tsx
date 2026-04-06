import type { ReactNode } from "react";

import { FeaturedGrid } from "@/components/featured-grid";
import { HeroSection } from "@/components/hero-section";
import { ScrollToTop } from "@/components/scroll-to-top";
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

const contactIconMap = {
  WhatsApp: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-9 w-9 fill-current">
      <path d="M19.05 4.94A9.77 9.77 0 0 0 12.08 2C6.65 2 2.2 6.42 2.2 11.87c0 1.74.46 3.44 1.33 4.95L2 22l5.34-1.4a9.82 9.82 0 0 0 4.74 1.21h.01c5.43 0 9.91-4.42 9.91-9.88a9.8 9.8 0 0 0-2.95-6.99ZM12.09 20.1h-.01a8.11 8.11 0 0 1-4.12-1.13l-.3-.18-3.17.83.85-3.09-.2-.32a8.06 8.06 0 0 1-1.25-4.33c0-4.5 3.68-8.17 8.2-8.17 2.19 0 4.25.85 5.8 2.4a8.1 8.1 0 0 1 2.41 5.79c0 4.5-3.69 8.18-8.21 8.18Zm4.49-6.11c-.25-.12-1.47-.73-1.7-.81-.23-.08-.39-.12-.55.12-.16.23-.63.81-.77.97-.14.15-.29.17-.54.06-.25-.12-1.06-.39-2.01-1.25-.74-.66-1.24-1.48-1.39-1.73-.14-.23-.01-.36.11-.48.11-.11.25-.29.37-.43.12-.14.16-.24.24-.4.08-.15.04-.29-.02-.4-.06-.12-.55-1.33-.75-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.41.06-.62.29-.22.23-.83.81-.83 1.97 0 1.16.85 2.29.96 2.45.12.15 1.68 2.56 4.08 3.59.57.25 1.02.4 1.37.51.57.18 1.09.15 1.5.09.46-.07 1.47-.6 1.67-1.18.2-.58.2-1.08.14-1.18-.05-.09-.2-.14-.44-.26Z" />
    </svg>
  ),
  LinkedIn: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-9 w-9 fill-current">
      <path d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3C4.17 3 3.3 3.9 3.3 5.01c0 1.1.87 2 1.95 2 1.08 0 1.95-.9 1.95-2A1.98 1.98 0 0 0 5.25 3ZM20.7 12.98c0-3.2-1.7-4.68-3.97-4.68-1.83 0-2.65 1.02-3.1 1.73V8.5h-3.38V20h3.38v-6.18c0-1.63.31-3.2 2.29-3.2 1.95 0 1.98 1.84 1.98 3.3V20H21v-7.02h-.3Z" />
    </svg>
  ),
  Instagram: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-9 w-9 fill-current">
      <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 1.8A3.7 3.7 0 0 0 3.8 7.5v9a3.7 3.7 0 0 0 3.7 3.7h9a3.7 3.7 0 0 0 3.7-3.7v-9a3.7 3.7 0 0 0-3.7-3.7h-9Zm9.65 1.35a1.05 1.05 0 1 1 0 2.1 1.05 1.05 0 0 1 0-2.1ZM12 6.85A5.15 5.15 0 1 1 6.85 12 5.15 5.15 0 0 1 12 6.85Zm0 1.8A3.35 3.35 0 1 0 15.35 12 3.35 3.35 0 0 0 12 8.65Z" />
    </svg>
  ),
  Email: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-9 w-9 fill-none stroke-current stroke-[1.6]" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 7l-10 6L2 7" />
    </svg>
  ),
  Phone: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-9 w-9 fill-none stroke-current stroke-[1.6]" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
} as const satisfies Record<string, ReactNode>;

type CommunicationLabel = keyof typeof contactIconMap;

function hasContactIcon(label: string): label is CommunicationLabel {
  return label in contactIconMap;
}

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
  const communicationItems = contactItems.filter((item) => hasContactIcon(item.label));

  return (
    <main className="page-shell pb-16">
      <SiteHeader />
      <HeroSection />
      <ScrollToTop />

      <section id="tools-developed-by-ubt" className="scroll-mt-28 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="section-panel overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">Built by me</p>
            <h2 className="mt-4 font-body text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">Tools Developed by UBT (me)</h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-ink/68 sm:text-base">Small, opinionated tools designed to solve practical decisions, career questions, and everyday moments with a bit of personality.</p>
            <div className="mt-8">
              <FeaturedGrid
                items={tools}
                sourceLabel={fallbackSource}
                emptyMessage="No tools are available yet."
              />
            </div>
          </div>
        </div>
      </section>

      <section id="my-cv" className="scroll-mt-28 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="section-panel overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">Recruiter-ready</p>
            <h2 className="mt-4 font-body text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">My CV</h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-ink/68 sm:text-base">This section keeps the CV in-page while the actual view and download actions stay external.</p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {cvLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-[1.6rem] border border-line/80 bg-gradient-to-br from-white to-mist/80 p-6 shadow-sm transition hover:-translate-y-1 hover:border-accent/45 hover:shadow-glow"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">PDF</p>
                  <h3 className="mt-3 font-body text-3xl font-semibold text-ink">{link.label}</h3>
                  <p className="mt-4 text-sm leading-6 text-ink/68">{link.note}</p>
                  <span className="mt-6 inline-flex rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">
                    View or download
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="about-me" className="scroll-mt-28 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="section-panel overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">Positioning</p>
            <h2 className="mt-4 font-body text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">About me</h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-ink/68 sm:text-base">The core positioning and tone are distilled from the original profile pages and rewritten into a structured, modern summary.</p>
            <div className="mt-8 grid gap-6 lg:grid-cols-[180px_minmax(0,1fr)]">
              <div className="flex aspect-square items-center justify-center rounded-[2rem] border border-line/80 bg-ink text-center text-white shadow-glow">
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-white/60">UBT</p>
                  <p className="mt-3 font-body text-4xl font-semibold">15+</p>
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
          </div>
        </div>
      </section>

      <section id="key-achievements" className="scroll-mt-28 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="section-panel overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">Highlights</p>
            <h2 className="mt-4 font-body text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">Key Achievements</h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-ink/68 sm:text-base">A condensed view of measurable impact pulled from the recruiter-oriented material.</p>
            <div className="mt-8 space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {achievementHighlights.map((item) => (
                  <article key={item.label} className="rounded-[1.5rem] border border-line/80 bg-white/82 p-5">
                    <p className="font-body text-4xl font-semibold text-ink">{item.value}</p>
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
          </div>
        </div>
      </section>

      <section id="tech-stack" className="scroll-mt-28 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="section-panel overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">Toolkit</p>
            <h2 className="mt-4 font-body text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">Tech Stack</h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-ink/68 sm:text-base">Grouped into capability areas instead of a flat checklist so the page reads like a portfolio, not a keyword dump.</p>
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {stackGroups.map((group) => (
                <article key={group.title} className="rounded-[1.5rem] border border-line/80 bg-white/82 p-5">
                  <h3 className="font-body text-2xl font-semibold text-ink">{group.title}</h3>
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
          </div>
        </div>
      </section>

      <section id="experience" className="scroll-mt-28 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="section-panel overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">Career path</p>
            <h2 className="mt-4 font-body text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">Experience</h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-ink/68 sm:text-base">A timeline-driven reading of the roles that shaped the current QA, automation, and delivery perspective.</p>
            <div className="mt-8 space-y-4">
              {experienceItems.map((item) => (
                <article key={`${item.company}-${item.role}`} className="rounded-[1.7rem] border border-line/80 bg-white/82 p-6">
                  <div className="flex flex-col gap-3 border-b border-line/70 pb-5 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">{item.company}</p>
                      <h3 className="mt-2 font-body text-3xl font-semibold text-ink">{item.role}</h3>
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
          </div>
        </div>
      </section>

      <section id="corporate-projects" className="scroll-mt-28 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="section-panel overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">Enterprise work</p>
            <h2 className="mt-4 font-body text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">Corporate Projects</h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-ink/68 sm:text-base">Representative programs that show scale, operational complexity, and domain depth.</p>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {corporateProjects.map((project) => (
                <article key={project.title} className="rounded-[1.55rem] border border-line/80 bg-white/82 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">{project.label}</p>
                  <h3 className="mt-3 font-body text-2xl font-semibold text-ink">{project.title}</h3>
                  <p className="mt-4 text-sm leading-6 text-ink/68">{project.summary}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="private-projects" className="scroll-mt-28 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="section-panel overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <h2 className="font-body text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">Private Projects</h2>
            <div className="mt-6 h-px w-full bg-gradient-to-r from-accent/60 via-accent/30 to-transparent" />
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {privateProjects.map((project) => (
                <article key={project.title} className="rounded-[1.55rem] border border-line/80 bg-white/82 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">{project.label}</p>
                  <h3 className="mt-3 font-body text-2xl font-semibold text-ink">{project.title}</h3>
                  <p className="mt-4 text-sm leading-6 text-ink/68">{project.summary}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="articles" className="scroll-mt-28 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="section-panel overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">Published thinking</p>
            <h2 className="mt-4 font-body text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">Articles</h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-ink/68 sm:text-base">Writing around software testing, technology, AI, and the broader human side of work.</p>
            <div className="mt-8">
              <FeaturedGrid
                items={articles}
                sourceLabel={fallbackSource}
                emptyMessage="No articles are available yet."
              />
            </div>
          </div>
        </div>
      </section>

      <section id="my-bookmarks" className="scroll-mt-28 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="section-panel overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">Curated references</p>
            <h2 className="mt-4 font-body text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">My Bookmarks</h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-ink/68 sm:text-base">A smaller, cleaner slice of the original bookmark universe, focused on links worth returning to.</p>
            <div className="mt-8">
              <FeaturedGrid
                items={bookmarks}
                sourceLabel={fallbackSource}
                emptyMessage="No bookmarks are available yet."
              />
            </div>
          </div>
        </div>
      </section>

      <section id="useful-apps" className="scroll-mt-28 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="section-panel overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">Utilities</p>
            <h2 className="mt-4 font-body text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">Useful Apps</h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-ink/68 sm:text-base">Lightweight helpers and utilities that improve workflow, output, or day-to-day convenience.</p>
            <div className="mt-8">
              <FeaturedGrid
                items={apps}
                sourceLabel={fallbackSource}
                emptyMessage="No useful apps are available yet."
              />
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="scroll-mt-28 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="section-panel flex min-h-[6rem] items-center justify-center overflow-hidden px-6 py-6 sm:px-8">
            <div className="flex flex-wrap items-center justify-center gap-5">
              {communicationItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("mailto:") || item.href.startsWith("tel:") ? undefined : "_blank"}
                  rel={item.href.startsWith("mailto:") || item.href.startsWith("tel:") ? undefined : "noreferrer"}
                  aria-label={item.label}
                  title={item.label}
                  className="flex h-20 w-20 items-center justify-center rounded-full border border-line/80 bg-gradient-to-br from-white via-paper to-mist/75 text-ink shadow-[0_20px_40px_rgba(20,31,39,0.12)] transition hover:-translate-y-1 hover:border-accent/45 hover:bg-white hover:text-accent hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35"
                >
                  <span className="sr-only">{item.label}</span>
                  {contactIconMap[item.label as CommunicationLabel]}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="px-4 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl border-t border-line/70 py-8 text-center text-sm text-ink/55">
          UBT 2026
        </div>
      </footer>
    </main>
  );
}

