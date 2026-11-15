import type { Metadata } from "next";

import { guides } from "@/content/guides";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Guides",
  description:
    "AI guides and cheat sheets for ChatGPT, Claude, Gemini and 150 skills for Claude Code, Kilo Code and Codex, in Turkish and English.",
  canonical: "/guides",
  ogType: "website"
});

export default function GuidesPage() {
  return (
    <main id="main-content" className="page-shell min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Guides</p>
          <h1 className="mt-3 font-body text-[clamp(2.2rem,6vw,3rem)] font-semibold tracking-[-0.03em] text-ink">
            Rehberler ve cheat sheet&apos;ler
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/70 sm:text-base">
            Yapay zekâ araçları için rehberler. Her biri Türkçe ve İngilizce PDF olarak
            açılır, istersen indirebilirsin.
          </p>
        </header>

        <div className="grid gap-4">
          {guides.map((guide) => (
            <section
              key={guide.id}
              id={guide.id}
              className="rounded-[1.35rem] border border-line/60 bg-white/80 px-6 py-6"
            >
              <h2 className="text-lg font-bold text-ink">{guide.title}</h2>
              <p className="mt-2 text-sm leading-7 text-ink/70">{guide.description}</p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {guide.files.map((file) => (
                  <li key={file.href}>
                    <a
                      href={file.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-full items-start gap-3 rounded-lg border border-line/80 bg-paper/70 px-4 py-3 transition hover:border-accent/45 hover:bg-white"
                    >
                      <span className="mt-0.5 rounded bg-accent px-2 py-0.5 text-xs font-bold text-white">
                        {file.language}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-ink">{file.title}</span>
                        <span className="mt-1 block text-xs text-ink/55">
                          PDF · {file.pages} sayfa · {file.sizeLabel}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
