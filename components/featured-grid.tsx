import type { FeaturedItem } from "@/types/site";

interface FeaturedGridProps {
  items: FeaturedItem[];
  sourceLabel?: string;
  emptyMessage: string;
}

const sourceText: Record<string, string> = {
  "env-missing": "Showing local fallback because Supabase environment variables are missing.",
  empty: "No published records were returned from Supabase, so local fallback content is shown.",
  error: "A Supabase read error occurred, so local fallback content is shown."
};

export function FeaturedGrid({ items, sourceLabel, emptyMessage }: FeaturedGridProps) {
  return (
    <div>
      {sourceLabel && sourceText[sourceLabel] ? (
        <div className="mb-5 rounded-2xl border border-dashed border-line/80 bg-paper/70 px-4 py-3 text-sm text-ink/65">
          {sourceText[sourceLabel]}
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="rounded-[1.5rem] border border-line/80 bg-mist/55 px-5 py-6 text-sm text-ink/65">
          {emptyMessage}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const cardContent = (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    {item.badge ? (
                      <span className="inline-flex rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                        {item.badge}
                      </span>
                    ) : null}
                    <h3 className="font-body text-2xl font-semibold leading-tight text-ink">{item.title}</h3>
                  </div>
                  <span className="text-xl text-ink/35">↗</span>
                </div>
                <p className="mt-5 text-sm leading-6 text-ink/70">{item.summary}</p>
              </>
            );

            const classes =
              "group rounded-[1.6rem] border border-line/80 bg-white/78 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-accent/45 hover:shadow-glow";

            return item.href ? (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className={classes}
              >
                {cardContent}
              </a>
            ) : (
              <article key={item.id} className={classes}>
                {cardContent}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
