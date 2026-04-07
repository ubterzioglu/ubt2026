"use client";

import type { ExperienceItem } from "@/types/site";
import { Briefcase, MapPin, CalendarDays, ChevronRight, Star, Sparkles } from "lucide-react";

interface ExperienceSectionProps {
  items: ExperienceItem[];
}

export function ExperienceSection({ items }: ExperienceSectionProps) {
  const stats = [
    { value: "18+", label: "Years of Experience" },
    { value: "30K+", label: "Users in Global Systems" },
    { value: "4", label: "Major Career Chapters" },
    { value: "DE + TR", label: "International Delivery" },
  ];

  const impactLabels = [
    ["Large-scale automation", "Cross-functional coordination", "On-site execution"],
    ["Global ownership", "Architecture design", "Process optimization"],
    ["30K+ users", "Agile transformation", "Automation coverage"],
    ["Engineering foundation", "Cross-country collaboration", "Product integration"],
  ];

  return (
    <section id="experience" className="scroll-mt-28 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="section-panel overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-line/80 bg-mist/60 px-4 py-2 text-sm text-accent">
            <Sparkles className="h-4 w-4" />
            Career Journey
          </div>

          <h2 className="font-body text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">Experience</h2>
          <div className="mt-6 h-px w-full bg-gradient-to-r from-accent/60 via-accent/30 to-transparent" />

          <p className="mt-6 max-w-3xl text-base leading-7 text-ink/70">
            A progression from engineering and product development into global test management,
            automation leadership, customer-facing execution, and quality strategy across complex
            enterprise and intralogistics environments.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => (
              <div
                key={item.label}
                className="rounded-[1.5rem] border border-line/80 bg-white/82 p-5 transition hover:-translate-y-1 hover:border-accent/45 hover:shadow-glow"
              >
                <div className="font-body text-3xl font-semibold text-ink">{item.value}</div>
                <div className="mt-2 text-sm text-ink/60">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-6">
            {items.map((item, index) => (
              <article
                key={`${item.company}-${item.period}`}
                className="relative overflow-hidden rounded-[1.7rem] border border-line/80 bg-white/82 p-6 transition hover:-translate-y-1 hover:border-accent/45 hover:shadow-glow sm:p-8"
              >
                <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accentSoft px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                      <Briefcase className="h-3.5 w-3.5" />
                      Chapter {index + 1}
                    </div>

                    <h3 className="font-body text-2xl font-semibold leading-tight text-ink sm:text-3xl">
                      {item.role}
                    </h3>

                    <div className="mt-2 text-lg font-semibold text-accent">
                      {item.company}
                    </div>
                  </div>

                  <div className="grid gap-2 text-sm text-ink/70 xl:text-right">
                    <div className="inline-flex items-center gap-2 xl:justify-end">
                      <CalendarDays className="h-4 w-4 text-accent" />
                      {item.period}
                    </div>
                    <div className="inline-flex items-center gap-2 xl:justify-end">
                      <MapPin className="h-4 w-4 text-accent" />
                      {item.location}
                    </div>
                  </div>
                </div>

                <div className="mb-6 rounded-2xl border border-line/70 bg-mist/55 p-4">
                  <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-ink/50">
                    Key Focus
                  </div>
                  <p className="text-base leading-7 text-ink/75">{item.summary}</p>
                </div>

                <div className="mb-6 flex flex-wrap gap-2">
                  {impactLabels[index]?.map((impact) => (
                    <span
                      key={impact}
                      className="rounded-full border border-accent/30 bg-accentSoft px-3 py-1 text-xs font-medium text-accent"
                    >
                      {impact}
                    </span>
                  ))}
                </div>

                <div className="mb-6">
                  <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-ink/70">
                    <Star className="h-4 w-4 text-accent" />
                    Responsibilities & Achievements
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {item.highlights.map((highlight) => (
                      <div
                        key={highlight}
                        className="flex items-start gap-3 rounded-2xl border border-line/70 bg-mist/55 p-4 transition hover:border-line hover:bg-mist/70"
                      >
                        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                        <p className="text-sm leading-6 text-ink/75">{highlight}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {index === 0 && (
                  <div className="absolute -right-2 -top-2 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                    Current
                  </div>
                )}
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-[2rem] border border-line/80 bg-gradient-to-br from-accentSoft/40 via-white/82 to-mist/60 p-8">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <h3 className="font-body text-2xl font-semibold text-ink sm:text-3xl">From Engineering to Global Quality Leadership</h3>
                <p className="mt-4 max-w-3xl leading-7 text-ink/70">
                  This career path combines hands-on engineering, large-scale enterprise systems,
                  test management, automation strategy, customer-facing execution, and leadership in
                  highly complex technical environments. The result is a profile that understands both
                  the product and the process behind quality.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {["Quality Strategy", "Automation Leadership", "Customer-Facing Delivery"].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-line/70 bg-white/82 px-4 py-3 text-sm font-medium text-ink"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
