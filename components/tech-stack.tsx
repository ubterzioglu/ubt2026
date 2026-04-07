import type { StackGroup } from "@/types/site";

interface TechStackProps {
  stackGroups: StackGroup[];
}

export function TechStack({ stackGroups }: TechStackProps) {
  return (
    <div className="section-panel overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
      <h2 className="font-body text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">Tech Stack</h2>
      <div className="mt-6 h-px w-full bg-gradient-to-r from-accent/60 via-accent/30 to-transparent" />
      <p className="mt-4 text-base text-ink/70">Tools and technologies I work with daily</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stackGroups.map((group) => (
          <article
            key={group.title}
            className="rounded-[1.5rem] border border-line/80 bg-white/82 p-5 transition hover:-translate-y-1 hover:border-accent/45 hover:shadow-glow"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{group.title}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {group.items.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-line/70 bg-mist/60 px-3 py-1.5 text-sm text-ink/74"
                >
                  {item}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
