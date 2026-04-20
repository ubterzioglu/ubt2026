import type { Metadata } from "next";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";

import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Sandbox",
  description: "Standalone HTML pages for notes, handouts, and shareable resources.",
  canonical: "/sandbox",
  noIndex: true
});

interface SandboxEntry {
  href: string;
  label: string;
  relativePath: string;
  updatedAt: string;
  updatedAtOrder: number;
}

const sandboxDirectory = path.join(process.cwd(), "public", "sandbox");

function toTitleCase(value: string): string {
  return value
    .replace(/\.html$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function toPublicHref(relativePath: string): string {
  const segments = relativePath.split(path.sep).map((segment) => encodeURIComponent(segment));

  return `/sandbox/${segments.join("/")}`;
}

function formatUpdatedAt(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Berlin"
  }).format(date);
}

async function collectSandboxEntries(
  currentDirectory: string,
  relativeBase = ""
): Promise<SandboxEntry[]> {
  try {
    const directoryEntries = await readdir(currentDirectory, { withFileTypes: true });
    const sandboxEntries = await Promise.all(
      directoryEntries.map(async (directoryEntry) => {
        const nextRelativePath = relativeBase
          ? path.join(relativeBase, directoryEntry.name)
          : directoryEntry.name;
        const absolutePath = path.join(currentDirectory, directoryEntry.name);

        if (directoryEntry.isDirectory()) {
          return collectSandboxEntries(absolutePath, nextRelativePath);
        }

        if (!directoryEntry.isFile() || !directoryEntry.name.toLowerCase().endsWith(".html")) {
          return [];
        }

        const fileStats = await stat(absolutePath);

        return [
          {
            href: toPublicHref(nextRelativePath),
            label: toTitleCase(path.basename(directoryEntry.name)),
            relativePath: nextRelativePath.split(path.sep).join("/"),
            updatedAt: formatUpdatedAt(fileStats.mtime),
            updatedAtOrder: fileStats.mtimeMs
          }
        ];
      })
    );

    return sandboxEntries
      .flat()
      .sort((leftEntry, rightEntry) => rightEntry.updatedAtOrder - leftEntry.updatedAtOrder);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return [];
    }

    return [];
  }
}

export default async function SandboxPage() {
  const sandboxEntries = await collectSandboxEntries(sandboxDirectory);

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg border border-line/80 bg-white/85 p-6 shadow-panel backdrop-blur-sm sm:p-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Sandbox
            </p>
            <h1 className="mt-3 font-body text-[clamp(2rem,6vw,3.25rem)] font-semibold leading-tight text-ink">
              Standalone HTML links
            </h1>
            <p className="mt-4 text-sm leading-7 text-ink/70 sm:text-base">
              Put your self-contained HTML files into <code className="rounded bg-mist px-2 py-1 text-xs text-ink">public/sandbox</code>.
              They will be listed here automatically and stay separate from the main homepage flow.
            </p>
          </div>

          <div className="mt-8">
            {sandboxEntries.length > 0 ? (
              <div className="grid gap-4">
                {sandboxEntries.map((entry) => (
                  <a
                    key={entry.relativePath}
                    href={entry.href}
                    className="block rounded-lg border border-line/80 bg-paper/70 px-5 py-4 transition hover:border-accent/45 hover:bg-white"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <h2 className="text-base font-semibold text-ink sm:text-lg">
                          {entry.label}
                        </h2>
                        <p className="mt-1 break-all text-xs text-ink/55 sm:text-sm">
                          /sandbox/{entry.relativePath}
                        </p>
                      </div>
                      <p className="text-xs text-ink/55 sm:text-sm">
                        Updated {entry.updatedAt}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-line bg-paper/50 px-5 py-6 text-sm leading-7 text-ink/62">
                No HTML files found yet. Add files such as <code className="rounded bg-white px-2 py-1 text-xs text-ink">public/sandbox/toplanti-notlari.html</code> or
                <code className="ml-1 rounded bg-white px-2 py-1 text-xs text-ink">public/sandbox/paylasim/briefing.html</code>.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
