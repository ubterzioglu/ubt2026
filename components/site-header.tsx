"use client";

import { useState } from "react";

import { navigationItems, siteMeta } from "@/content/site";

const desktopLabelMap: Record<(typeof navigationItems)[number]["id"], string> = {
  "tools-developed-by-ubt": "Tools",
  "my-cv": "CV",
  "about-me": "About",
  "key-achievements": "Wins",
  "tech-stack": "Stack",
  experience: "Experience",
  "corporate-projects": "Corporate",
  "private-projects": "Projects",
  articles: "Articles",
  "my-bookmarks": "Bookmarks",
  "useful-apps": "Apps",
  contact: "Contact"
};

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <nav className="hidden min-w-0 flex-1 md:block">
          <ul className="flex items-center whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/70 lg:text-xs">
            <li className="min-w-0">
              <a
                href="#top"
                className="inline-flex items-center rounded-full px-1 py-1 text-accent transition hover:text-ink"
                aria-label={`${siteMeta.name} home`}
              >
                {siteMeta.name}
              </a>
            </li>
            {navigationItems.map((item) => (
              <li key={item.id} className="flex min-w-0 items-center">
                <span aria-hidden="true" className="mx-2 text-line lg:mx-3">
                  /
                </span>
                <a
                  href={`#${item.id}`}
                  className="inline-flex items-center rounded-full px-1 py-1 transition hover:text-ink"
                >
                  {desktopLabelMap[item.id]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className="inline-flex items-center rounded-full border border-line/80 bg-white/70 px-4 py-2 text-sm font-semibold text-ink md:hidden"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls="site-navigation"
        >
          {siteMeta.name} / Menu
        </button>
      </div>

      {isOpen ? (
        <nav id="site-navigation" className="border-t border-line/70 bg-white/85 px-4 py-3 md:hidden">
          <ul className="grid gap-2">
            <li>
              <a
                href="#top"
                className="block rounded-2xl border border-line/70 bg-paper/70 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-accent"
                onClick={() => setIsOpen(false)}
              >
                {siteMeta.name}
              </a>
            </li>
            {navigationItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="block rounded-2xl border border-line/70 bg-paper/70 px-4 py-3 text-sm font-medium text-ink/80"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
