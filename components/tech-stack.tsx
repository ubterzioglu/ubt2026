import type { StackGroup } from "@/types/site";

interface TechStackProps {
  stackGroups: StackGroup[];
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
            className="rounded-[1.5rem] border border-line/80 bg-white/82 p-5 transition hover:-translate-y-1 hover:border-accent/45 hover:shadow-glow active:scale-[0.98]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {group.title}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {group.items.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent"
                >
                  {item}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
