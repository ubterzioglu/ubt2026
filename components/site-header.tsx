"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

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
  "book-appointment": "Book Appointment",
  contact: "Contact"
};

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/85 supports-[backdrop-filter]:bg-paper/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <a
          href="#top"
          className="inline-flex min-h-[44px] items-center rounded-full border border-line/70 bg-white/70 pl-1.5 pr-3 transition hover:shadow-lg hover:shadow-accent/20 md:hidden"
        >
          <Image
            src="/yeni.png"
            alt={siteMeta.name}
            width={32}
            height={32}
            className="h-8 w-8 rounded-full shadow-sm"
          />
          <span className="ml-2 text-sm font-semibold text-ink">{siteMeta.name}</span>
        </a>

        <nav className="hidden min-w-0 flex-1 md:block" aria-label="Primary">
          <ul className="flex flex-nowrap items-center gap-x-0 text-xs font-semibold tracking-[0.08em] text-ink lg:text-sm">
            {navigationItems.map((item, index) => (
              <li key={item.id} className="min-w-0 flex items-center">
                {index > 0 && (
                  <span className="mx-2 h-3 w-px bg-line/60" aria-hidden="true" />
                )}
                <a
                  href={`#${item.id}`}
                  className="inline-flex min-h-[40px] items-center rounded-full px-2.5 py-1.5 whitespace-nowrap transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35"
                >
                  {desktopLabelMap[item.id]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className={`ml-auto inline-flex min-h-[44px] items-center rounded-full border px-4 py-2 text-sm font-semibold transition-transform active:scale-95 md:hidden ${
            isOpen
              ? "border-accent bg-accent text-white shadow-lg shadow-accent/30"
              : "border-accent/40 bg-accent/90 text-white shadow-md shadow-accent/20 hover:bg-accent"
          }`}
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls="site-navigation"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? "Close" : "UBT"}
        </button>
      </div>

      {isOpen ? (
        <nav
          id="site-navigation"
          className="border-t border-line/70 bg-white/90 px-4 py-3 md:hidden"
          aria-label="Mobile"
        >
          <ul className="grid max-h-[calc(100dvh-4rem)] gap-2 overflow-y-auto pb-2">
            <li>
              <a
                href="#top"
                className="block min-h-[44px] rounded-2xl border border-line/70 bg-paper/70 px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-accent"
                onClick={() => setIsOpen(false)}
              >
                {siteMeta.name}
              </a>
            </li>
            {navigationItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="block min-h-[44px] rounded-2xl border border-line/70 bg-paper/70 px-4 py-3 text-sm font-medium text-ink/85"
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
