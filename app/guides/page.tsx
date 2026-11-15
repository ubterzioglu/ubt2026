import type { Metadata } from "next";
import Link from "next/link";

import { DEFAULT_GUIDE_LANGUAGE, GUIDE_LANGUAGES, guides, guidesCopy, guidesMarquee } from "@/content/guides";
import { recordGuidePageView } from "@/lib/guide-events";
import { buildMetadata } from "@/lib/seo";
import type { GuideLanguage, GuideTone } from "@/types/guides";

export const metadata: Metadata = buildMetadata({
  title: "Guides",
  description:
    "AI guides and cheat sheets for ChatGPT, Claude, Gemini and 150 skills for Claude Code, Kilo Code and Codex, in Turkish and English.",
  canonical: "/guides",
  ogType: "website"
});

interface GuidesPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

const TONE_CLASSES: Record<GuideTone, { card: string; text: string; pill: string; glow: string; button: string }> = {
  lime: {
    card: "hover:border-[#c6ff3d]/70 hover:shadow-[0_0_60px_-12px_rgba(198,255,61,0.55)]",
    text: "text-[#c6ff3d]",
    pill: "bg-[#c6ff3d] text-[#0b0b10]",
    glow: "bg-[#c6ff3d]",
    button: "hover:bg-[#c6ff3d]"
  },
  cyan: {
    card: "hover:border-[#3de1ff]/70 hover:shadow-[0_0_60px_-12px_rgba(61,225,255,0.55)]",
    text: "text-[#3de1ff]",
    pill: "bg-[#3de1ff] text-[#0b0b10]",
    glow: "bg-[#3de1ff]",
    button: "hover:bg-[#3de1ff]"
  },
  pink: {
    card: "hover:border-[#ff4fd8]/70 hover:shadow-[0_0_60px_-12px_rgba(255,79,216,0.55)]",
    text: "text-[#ff4fd8]",
    pill: "bg-[#ff4fd8] text-[#0b0b10]",
    glow: "bg-[#ff4fd8]",
    button: "hover:bg-[#ff4fd8]"
  },
  orange: {
    card: "hover:border-[#ff8a3d]/70 hover:shadow-[0_0_60px_-12px_rgba(255,138,61,0.55)]",
    text: "text-[#ff8a3d]",
    pill: "bg-[#ff8a3d] text-[#0b0b10]",
    glow: "bg-[#ff8a3d]",
    button: "hover:bg-[#ff8a3d]"
  }
};

function toLanguage(value: string | string[] | undefined): GuideLanguage {
  const raw = Array.isArray(value) ? value[0] : value;
  return GUIDE_LANGUAGES.find((language) => language === raw) ?? DEFAULT_GUIDE_LANGUAGE;
}

export default async function GuidesPage({ searchParams }: GuidesPageProps) {
  const params = searchParams ? await searchParams : {};
  const language = toLanguage(params.lang);
  const copy = guidesCopy[language];
  await recordGuidePageView(language);

  const totalPages = guides.reduce((sum, guide) => sum + guide.files[language].pages, 0);
  const stats = [
    { value: String(guides.length), label: copy.statLabels.guides },
    { value: String(guides.length), label: copy.statLabels.files },
    { value: String(totalPages), label: copy.statLabels.pages },
    { value: copy.priceValue, label: copy.statLabels.price }
  ];

  return (
    <main
      id="main-content"
      lang={language}
      className="relative min-h-screen overflow-hidden bg-[#0b0b10] font-body text-white selection:bg-[#c6ff3d] selection:text-[#0b0b10]"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#ff4fd8]/25 blur-[120px] motion-safe:animate-float" />
        <div className="absolute -right-24 top-40 h-[28rem] w-[28rem] rounded-full bg-[#3de1ff]/20 blur-[130px] motion-safe:animate-drift" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-[#c6ff3d]/15 blur-[120px] motion-safe:animate-float" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        <nav aria-label="Language" className="flex justify-center sm:justify-start">
          <div className="inline-flex gap-2 rounded-[1.4rem] border border-white/15 bg-white/[0.06] p-2 backdrop-blur">
            {GUIDE_LANGUAGES.map((option) => {
              const active = option === language;
              return (
                <Link
                  key={option}
                  href={{ pathname: "/guides", query: { lang: option } }}
                  scroll={false}
                  lang={option}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-w-[8.5rem] flex-col items-center rounded-2xl px-6 py-3 transition sm:min-w-[10rem] sm:px-8 sm:py-4 ${
                    active
                      ? "bg-[#c6ff3d] text-[#0b0b10] shadow-[0_0_40px_-8px_rgba(198,255,61,0.7)]"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="text-3xl font-extrabold uppercase leading-none tracking-tight sm:text-4xl">
                    {option}
                  </span>
                  <span
                    className={`mt-1 font-mono text-[11px] uppercase tracking-[0.18em] ${
                      active ? "text-[#0b0b10]/70" : "text-white/45"
                    }`}
                  >
                    {guidesCopy[option].languageLabel}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        <header className="mt-12 motion-safe:animate-reveal">
          <p className="inline-flex -rotate-2 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#c6ff3d] backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-[#c6ff3d] motion-safe:animate-pulse" />
            {copy.eyebrow}
          </p>
          <h1 className="mt-7 max-w-4xl text-[clamp(2.8rem,9vw,6.5rem)] font-extrabold leading-[0.92] tracking-[-0.05em]">
            {copy.titleLead}{" "}
            <span className="bg-gradient-to-r from-[#c6ff3d] via-[#3de1ff] to-[#ff4fd8] bg-clip-text text-transparent">
              {copy.titleAccent}
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/65 sm:text-lg">{copy.intro}</p>

          <dl className="mt-9 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col-reverse rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur"
              >
                <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">{stat.label}</dt>
                <dd className="text-2xl font-extrabold tracking-tight sm:text-3xl">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </header>
      </div>

      <div aria-hidden className="relative -rotate-1 border-y border-white/10 bg-[#c6ff3d] py-3 text-[#0b0b10]">
        <div className="flex w-max motion-safe:animate-marquee">
          {[0, 1].map((copyIndex) => (
            <div key={copyIndex} className="flex shrink-0">
              {guidesMarquee.map((word) => (
                <span
                  key={word}
                  className="flex items-center gap-6 px-6 text-lg font-extrabold uppercase tracking-tight sm:text-xl"
                >
                  {word}
                  <span className="text-sm">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          {guides.map((guide, index) => {
            const tone = TONE_CLASSES[guide.tone];
            const file = guide.files[language];
            return (
              <section
                key={guide.id}
                id={guide.id}
                className={`group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur transition duration-300 motion-safe:hover:-translate-y-1.5 sm:p-8 ${tone.card}`}
              >
                <div
                  aria-hidden
                  className={`absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-20 blur-3xl transition-opacity duration-300 group-hover:opacity-40 ${tone.glow}`}
                />
                <div className="relative flex items-start justify-between gap-4">
                  <span
                    className={`rounded-full px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.16em] ${tone.pill}`}
                  >
                    {guide.tag[language]}
                  </span>
                  <span
                    aria-hidden
                    className="text-6xl font-extrabold leading-none tracking-tighter text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.25)] sm:text-7xl"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <h2 className="relative mt-6 text-2xl font-extrabold leading-tight tracking-[-0.03em] sm:text-3xl">
                  {guide.title[language]}
                </h2>
                <p className="relative mb-7 mt-3 text-sm leading-6 text-white/60 sm:text-base">
                  {guide.description[language]}
                </p>

                <a
                  href={`/guides/open/${guide.id}/${language}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group/link relative mt-auto flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0b0b10]/60 px-5 py-4 transition hover:border-transparent hover:text-[#0b0b10] ${tone.button}`}
                >
                  <span className="min-w-0">
                    <span className={`block text-lg font-extrabold group-hover/link:text-[#0b0b10] ${tone.text}`}>
                      {copy.openPdf}
                    </span>
                    <span className="block font-mono text-[11px] uppercase tracking-[0.12em] text-white/45 group-hover/link:text-[#0b0b10]/60">
                      {language.toUpperCase()} · {file.pages} {copy.pagesUnit} · {file.sizeLabel}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className="text-2xl font-bold transition-transform duration-200 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
                  >
                    ↗
                  </span>
                </a>
              </section>
            );
          })}
        </div>

        <p className="mt-14 text-center font-mono text-xs uppercase tracking-[0.2em] text-white/35">{copy.footer}</p>
      </div>
    </main>
  );
}
