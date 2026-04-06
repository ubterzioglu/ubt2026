"use client";

import { useState } from "react";

import { navigationItems, siteMeta } from "@/content/site";

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <a href="#top" className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-line/70 bg-white/70 text-sm font-extrabold tracking-[0.22em] text-accent">
              UBT
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-xl font-semibold text-ink">{siteMeta.name}</p>
              <p className="truncate text-xs uppercase tracking-[0.24em] text-ink/60">{siteMeta.role}</p>
            </div>
          </div>
        </a>

        <button
          type="button"
          className="inline-flex items-center rounded-full border border-line/80 bg-white/70 px-4 py-2 text-sm font-semibold text-ink md:hidden"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls="site-navigation"
        >
          Menu
        </button>

        <nav id="site-navigation" className="hidden md:block">
          <ul className="flex flex-wrap items-center justify-end gap-2">
            {navigationItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="inline-flex rounded-full border border-transparent px-3 py-2 text-sm font-medium text-ink/70 transition hover:border-line/80 hover:bg-white/65 hover:text-ink"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {isOpen ? (
        <nav className="border-t border-line/70 bg-white/85 px-4 py-3 md:hidden">
          <ul className="grid gap-2">
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
