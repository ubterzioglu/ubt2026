import type { FeaturedItem } from "@/types/site";

interface BookmarksListProps {
  items: FeaturedItem[];
  sourceLabel?: string;
  emptyMessage?: string;
}

export function BookmarksList({ items, emptyMessage = "No bookmarks yet." }: BookmarksListProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-[1.35rem] border border-dashed border-line/80 px-5 py-6 text-sm text-ink/68">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => {
        const inner = (
          <>
            <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
              {item.badge ? (
                <span className="shrink-0 self-start rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent sm:self-auto">
                  {item.badge}
                </span>
              ) : null}
              <span className="truncate text-sm font-semibold text-ink">{item.title}</span>
              {item.summary ? (
                <span className="hidden truncate text-sm text-ink/55 sm:block">
                  — {item.summary}
                </span>
              ) : null}
            </div>
            {item.summary ? (
              <p className="mt-1 text-sm leading-6 text-ink/55 sm:hidden">{item.summary}</p>
            ) : null}
            {item.href ? (
              <span className="shrink-0 text-accent transition-transform group-hover:translate-x-0.5">
                ↗
              </span>
            ) : null}
          </>
        );

        const sharedClass =
          "group flex flex-col rounded-[1.35rem] border border-line/60 bg-white/80 px-5 py-4 transition hover:-translate-y-0.5 hover:border-accent/40 sm:flex-row sm:items-center sm:justify-between sm:gap-4";

        if (item.href) {
          return (
            <li key={item.id}>
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer noopener"
                className={sharedClass}
              >
                {inner}
              </a>
            </li>
          );
        }

        return (
          <li key={item.id}>
            <article className={sharedClass}>{inner}</article>
          </li>
        );
      })}
    </ul>
  );
}
