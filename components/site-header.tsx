"use client";

import { useState, useEffect } from "react";

import { navigationItems, siteMeta } from "@/content/site";

const desktopLabelMap: Record<(typeof navigationItems)[number]["id"], string> = {
  "my-cv": "My CV",
  "about-me": "About me",
  "key-achievements": "Key Achievements",
  "tech-stack": "Tech Stack",
  experience: "Experience",
  "corporate-projects": "Corporate Projects",
  "private-projects": "Private Projects",
  articles: "Articles",
  "my-bookmarks": "My Bookmarks",
  "useful-apps": "Useful Apps",
  contact: "Contact"
};

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <nav className="hidden min-w-0 flex-1 md:block">
          <ul className="flex items-center whitespace-nowrap text-[10px] font-semibold tracking-[0.12em] text-ink lg:text-[11px]">
            {navigationItems.map((item, index) => (
              <li key={item.id} className="flex min-w-0 items-center">
                {index > 0 && (
                  <span aria-hidden="true" className="mx-1.5 text-line lg:mx-2">|</span>
                )}
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
          className="ml-auto inline-flex items-center min-h-[44px] rounded-full border border-line/80 bg-white/70 px-4 py-2 text-sm font-semibold text-ink md:hidden active:scale-95 transition-transform"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls="site-navigation"
        >
          UBT
        </button>
      </div>

      {isOpen ? (
        <nav id="site-navigation" className="border-t border-line/70 bg-white/85 max-h-[calc(100vh-4rem)] overflow-y-auto px-4 py-3 md:hidden">
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
