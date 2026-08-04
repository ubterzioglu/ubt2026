import { UBTSA_SECTIONS } from "@/content/ubtsa-konsept";
import type { UbtsaComment } from "@/lib/ubtsa-comments";
import { UBTSA_CARD_CLASS } from "@/app/ubtsa/_components/theme";

interface KonseptNavProps {
  /** All comments, keyed by madde key — drives the per-bölüm badges. */
  commentsByItemKey: Map<string, UbtsaComment[]>;
}

/** Sticky table of contents; each entry shows that bölüm's comment count. */
export function KonseptNav({ commentsByItemKey }: KonseptNavProps) {
  return (
    <nav
      aria-label="İçindekiler"
      className={`${UBTSA_CARD_CLASS} top-4 max-h-[calc(100vh-2rem)] overflow-y-auto p-3.5 lg:sticky`}
    >
      <strong className="mb-2 block px-2 text-[11px] font-bold uppercase tracking-[0.18em] text-teal-700">
        İçindekiler
      </strong>
      <ol className="space-y-0.5">
        {UBTSA_SECTIONS.map((section) => {
          const count = section.items.reduce(
            (total, item) => total + (commentsByItemKey.get(item.key)?.length ?? 0),
            0
          );
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="flex items-center gap-2 rounded-[0.6rem] px-2 py-1.5 text-[12.5px] leading-snug text-slate-600 transition hover:bg-teal-50 hover:text-teal-800"
              >
                <span className="w-5 shrink-0 text-right text-[11px] font-bold tabular-nums text-slate-400">
                  {section.number}
                </span>
                <span className="min-w-0 flex-1">{section.navLabel}</span>
                {count > 0 && (
                  <span className="shrink-0 rounded-full bg-teal-600/12 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-teal-800">
                    {count}
                  </span>
                )}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
