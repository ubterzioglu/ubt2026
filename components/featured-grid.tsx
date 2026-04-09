import Image, { type ImageLoaderProps } from "next/image";

import type { FeaturedItem } from "@/types/site";

interface FeaturedGridProps {
  items: FeaturedItem[];
  sourceLabel?: string;
  emptyMessage: string;
  cardLayout?: "default" | "square";
}

const sourceText: Record<string, string> = {
  "env-missing": "Showing local fallback because Supabase environment variables are missing.",
  empty: "No published records were returned from Supabase, so local fallback content is shown.",
  error: "A Supabase read error occurred, so local fallback content is shown."
};

const featuredImageLoader = ({ src }: ImageLoaderProps) => src;

export function FeaturedGrid({
  items,
  sourceLabel,
  emptyMessage,
  cardLayout = "default"
}: Readonly<FeaturedGridProps>) {
  const isSquare = cardLayout === "square";

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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const cardContent = (
              <>
                <div
                  className={`${isSquare ? "min-h-0 flex-1" : "aspect-video"} overflow-hidden rounded-t-[1.3rem] sm:rounded-t-[1.55rem] ${
                    item.imageUrl ? "" : "bg-gradient-to-br from-accent/15 to-sunrise/15"
                  }`}
                >
                  {item.imageUrl ? (
                    <div className="relative h-full w-full">
                      <Image
                        loader={featuredImageLoader}
                        unoptimized
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
                        className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                  ) : null}
                </div>
                <div className={`${isSquare ? "flex min-h-0 flex-1 flex-col justify-between p-4 sm:p-5" : "p-4 sm:p-5"}`}>
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="min-w-0 space-y-2.5 sm:space-y-3">
                      {item.badge ? (
                        <span className="inline-flex rounded-full bg-accentSoft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent sm:text-xs sm:tracking-[0.18em]">
                          {item.badge}
                        </span>
                      ) : null}
                      <h3 className={`font-body font-semibold leading-tight text-ink ${isSquare ? "text-[clamp(1.1rem,4vw,1.35rem)]" : "text-[clamp(1.25rem,5vw,1.5rem)]"}`}>
                        {item.title}
                      </h3>
                    </div>
                    <span className="shrink-0 text-lg text-ink/35 sm:text-xl">↗</span>
                  </div>
                  <p className={`text-sm leading-6 text-ink/70 ${isSquare ? "mt-3 line-clamp-4" : "mt-4"}`}>
                    {item.summary}
                  </p>
                </div>
              </>
            );

            const classes =
              `group overflow-hidden rounded-[1.35rem] border border-line/80 bg-white/78 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-accent/45 hover:shadow-glow sm:rounded-[1.6rem] ${isSquare ? "flex aspect-square flex-col" : ""}`;

            return item.href ? (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className={`${classes} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35`}
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
