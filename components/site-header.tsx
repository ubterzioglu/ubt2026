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
  "corporate-projects": "Projects",
  articles: "Articles",
  "cv-review": "CV Review",
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
          className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-line/70 bg-white/80 shadow-[0_16px_30px_rgba(20,31,39,0.16)] transition hover:shadow-lg hover:shadow-accent/20 md:hidden"
        >
          <Image
            src="/logoubt.png"
            alt={siteMeta.name}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover shadow-[0_10px_22px_rgba(20,31,39,0.22)]"
          />
        </a>

        <nav className="hidden min-w-0 flex-1 md:block" aria-label="Primary">
          <ul className="flex flex-nowrap items-center justify-center text-xs font-semibold tracking-[0.08em] text-ink lg:text-sm">
            {navigationItems.map((item, index) => (
              <li key={item.id} className="flex items-center">
                <a
                  href={`#${item.id}`}
                  className="inline-flex min-h-[40px] items-center rounded-full px-2 py-1.5 whitespace-nowrap transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35"
                >
                  {desktopLabelMap[item.id]}
                </a>
                {index < navigationItems.length - 1 ? (
                  <span
                    className="px-2.5 text-ink/35 lg:px-3"
                    aria-hidden="true"
                  >
                    |
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className={`ml-auto inline-flex min-h-[44px] items-center rounded-full border px-4 py-2 text-sm font-semibold transition-transform active:scale-95 md:hidden ${
            isOpen
              ? "border-rose-600 bg-rose-600 text-white shadow-lg shadow-rose-500/25"
              : "border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-500/25 hover:bg-emerald-500"
          }`}
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls="site-navigation"
          aria-label="Toggle menu"
        >
          UBT
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
