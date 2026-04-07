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
    <section
      id="experience"
      className="relative overflow-hidden bg-ink px-6 py-24 text-white sm:px-8 lg:px-12"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10rem] top-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute right-[-8rem] top-1/3 h-80 w-80 rounded-full bg-accent-soft/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-sunrise/5 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_30%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-14 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-accent-soft backdrop-blur">
            <Sparkles className="h-4 w-4" />
            Career Journey
          </div>

          <h2 className="font-display text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            Experience
          </h2>

          <div className="mt-4 h-1 w-28 rounded-full bg-accent" />

          <p className="mt-6 text-base leading-7 text-white/70 sm:text-lg">
            A progression from engineering and product development into global test management,
            automation leadership, customer-facing execution, and quality strategy across complex
            enterprise and intralogistics environments.
          </p>
        </div>

        <div className="mb-14 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur transition duration-300 hover:border-accent/40 hover:bg-white/10"
            >
              <div className="text-3xl font-black text-white">{item.value}</div>
              <div className="mt-2 text-sm text-white/50">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="relative">
          <div className="absolute left-[18px] top-0 hidden h-full w-px bg-gradient-to-b from-accent/70 via-white/10 to-transparent md:block" />

          <div className="space-y-8">
            {items.map((item, index) => (
              <div key={`${item.company}-${item.period}`} className="relative grid gap-5 md:grid-cols-[56px_1fr]">
                <div className="relative hidden md:block">
                  <div className="sticky top-24 flex h-10 w-10 items-center justify-center rounded-full border border-accent/40 bg-ink shadow-[0_0_30px_rgba(27,122,110,0.18)]">
                    <div className="h-3 w-3 rounded-full bg-accent" />
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-accent/30 hover:bg-white/[0.08] hover:shadow-[0_20px_80px_rgba(27,122,110,0.12)] sm:p-8">
                  <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                    <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-accent/10 blur-3xl" />
                  </div>

                  <div className="relative">
                    <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent-soft">
                          <Briefcase className="h-3.5 w-3.5" />
                          Chapter {index + 1}
                        </div>

                        <h3 className="font-body text-2xl font-extrabold leading-tight text-white sm:text-3xl">
                          {item.role}
                        </h3>

                        <div className="mt-2 text-lg font-semibold text-accent-soft">
                          {item.company}
                        </div>
                      </div>

                      <div className="grid gap-2 text-sm text-white/70 xl:text-right">
                        <div className="inline-flex items-center gap-2 xl:justify-end">
                          <CalendarDays className="h-4 w-4 text-accent-soft" />
                          {item.period}
                        </div>
                        <div className="inline-flex items-center gap-2 xl:justify-end">
                          <MapPin className="h-4 w-4 text-accent-soft" />
                          {item.location}
                        </div>
                      </div>
                    </div>

                    <div className="mb-6 rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-white/50">
                        Key Focus
                      </div>
                      <p className="text-base leading-7 text-white/80">{item.summary}</p>
                    </div>

                    <div className="mb-6 flex flex-wrap gap-2">
                      {impactLabels[index]?.map((impact) => (
                        <span
                          key={impact}
                          className="rounded-full border border-sunrise/20 bg-sunrise/10 px-3 py-1 text-xs font-medium text-sunrise"
                        >
                          {impact}
                        </span>
                      ))}
                    </div>

                    <div className="mb-6">
                      <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-white/70">
                        <Star className="h-4 w-4 text-accent-soft" />
                        Responsibilities & Achievements
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        {item.highlights.map((highlight) => (
                          <div
                            key={highlight}
                            className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition duration-300 hover:border-white/15 hover:bg-white/[0.06]"
                          >
                            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-accent-soft" />
                            <p className="text-sm leading-6 text-white/80">{highlight}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {index === 0 && (
                      <div className="absolute -right-2 -top-2 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                        Current
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 rounded-[32px] border border-white/10 bg-gradient-to-br from-accent/10 via-white/5 to-sunrise/10 p-8 backdrop-blur-xl">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <h3 className="font-body text-2xl font-extrabold sm:text-3xl">From Engineering to Global Quality Leadership</h3>
              <p className="mt-4 max-w-3xl text-white/70 leading-7">
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
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-white"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
