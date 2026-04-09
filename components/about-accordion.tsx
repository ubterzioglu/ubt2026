"use client";

import { useState } from "react";

import type { AboutSection } from "@/types/site";

interface AboutAccordionProps {
  sections: AboutSection[];
}

export function AboutAccordion({ sections }: AboutAccordionProps) {
  const [openSection, setOpenSection] = useState<string>(sections[0]?.title ?? "");

  return (
    <div className="space-y-4">
      {sections.map((section) => {
        const isOpen = openSection === section.title;

        return (
          <article
            key={section.title}
            className="overflow-hidden rounded-[1.55rem] border border-line/80 bg-gradient-to-br from-white via-paper/95 to-mist/70 shadow-sm"
          >
            <button
              type="button"
              onClick={() =>
                setOpenSection((current) =>
                  current === section.title ? "" : section.title
                )
              }
              className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-white/45 sm:px-6"
              aria-expanded={isOpen}
            >
              <span className="block font-body text-[clamp(1.2rem,3vw,1.45rem)] font-semibold text-ink">
                {section.title}
              </span>
              <span
                className={`flex h-10 w-10 flex-none items-center justify-center rounded-full border border-line/80 bg-white/85 text-ink transition ${
                  isOpen ? "rotate-45 border-accent/25 text-accent" : ""
                }`}
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 fill-none stroke-current stroke-[1.8]"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
              </span>
            </button>

            {isOpen ? (
              <div className="border-t border-line/70 px-5 py-5 sm:px-6 sm:py-6">
                <ul className="space-y-3 text-sm text-ink/74 sm:text-base">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 leading-7 sm:leading-8">
                      <span className="mt-3 h-1.5 w-1.5 flex-none rounded-full bg-accent/75" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
