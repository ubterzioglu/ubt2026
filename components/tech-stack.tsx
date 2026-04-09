import Image from "next/image";

import type { StackGroup } from "@/types/site";

interface TechStackProps {
  stackGroups: StackGroup[];
}

function normalizeStackName(name: string) {
  return name.replace(/İ/g, "I");
}

export function TechStack({ stackGroups }: TechStackProps) {
  return (
    <>
      <h2 className="font-body text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
        Tech Stack
      </h2>
      <div className="mt-6 h-px w-full bg-gradient-to-r from-accent/60 via-accent/30 to-transparent" />
      <div className="mt-4 space-y-4">
        {stackGroups.map((group) => (
          <article
            key={group.title}
            className="rounded-[1.5rem] border border-line/80 bg-white/82 p-5 transition hover:-translate-y-1 hover:border-accent/45 hover:shadow-glow active:scale-[0.98] sm:p-6"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {group.title}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {group.items.map((item) => (
                <div
                  key={`${group.title}-${item.name}`}
                  className="group flex aspect-square flex-col rounded-[1.3rem] border border-line/70 bg-gradient-to-br from-white via-paper to-mist/75 p-3 shadow-sm transition hover:-translate-y-1 hover:border-accent/45 hover:shadow-glow sm:p-3.5"
                >
                  <div className="flex flex-1 items-center justify-center rounded-[1rem] bg-accentSoft/40">
                    {item.logo ? (
                      <Image
                        src={`/tech-logos/${item.logo}`}
                        alt=""
                        aria-hidden="true"
                        width={44}
                        height={44}
                        className="h-9 w-9 shrink-0 object-contain sm:h-11 sm:w-11"
                      />
                    ) : (
                      <span className="text-lg font-semibold tracking-[-0.04em] text-accent/70 sm:text-xl">
                        {normalizeStackName(item.name).slice(0, 2)}
                      </span>
                    )}
                  </div>
                  <span className="mt-3 min-h-[2.5rem] text-center text-[0.72rem] font-semibold leading-5 tracking-[0.08em] text-ink sm:text-xs">
                    {normalizeStackName(item.name)}
                  </span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
