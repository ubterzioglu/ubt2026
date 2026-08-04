import type { UbtsaSection } from "@/content/ubtsa-konsept";
import type { UbtsaComment } from "@/lib/ubtsa-comments";
import { MaddeItem } from "@/app/ubtsa/_components/madde-item";
import { UBTSA_CARD_CLASS } from "@/app/ubtsa/_components/theme";

interface KonseptSectionProps {
  section: UbtsaSection;
  /** All comments, keyed by madde key. */
  commentsByItemKey: Map<string, UbtsaComment[]>;
  sessionName: string;
  /** Madde key whose thread should render expanded (null when none). */
  openItemKey: string | null;
  addCommentAction: (formData: FormData) => void | Promise<void>;
  deleteCommentAction: (formData: FormData) => void | Promise<void>;
}

/** One numbered bölüm of the konsept with every madde it contains. */
export function KonseptSection({
  section,
  commentsByItemKey,
  sessionName,
  openItemKey,
  addCommentAction,
  deleteCommentAction
}: KonseptSectionProps) {
  const sectionCommentCount = section.items.reduce(
    (total, item) => total + (commentsByItemKey.get(item.key)?.length ?? 0),
    0
  );

  return (
    <section
      id={section.id}
      className={`${UBTSA_CARD_CLASS} scroll-mt-6 px-4 py-5 sm:px-6 sm:py-6`}
    >
      <header className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1.5 border-b border-slate-100 pb-3.5">
        <span className="inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-lg bg-teal-700 px-2 text-[12.5px] font-bold tabular-nums text-white">
          {section.number}
        </span>
        <h2 className="text-[1.15rem] font-bold leading-snug tracking-[-0.02em] text-teal-900">
          {section.title}
        </h2>
        <span className="ml-auto flex items-center gap-2 text-[11px] font-semibold text-slate-400">
          <span>{section.items.length} madde</span>
          {sectionCommentCount > 0 && (
            <span className="rounded-full border border-teal-600/25 bg-teal-600/10 px-2 py-0.5 tabular-nums text-teal-800">
              {sectionCommentCount} yorum
            </span>
          )}
        </span>
      </header>

      <ul className="space-y-0.5">
        {section.items.map((item) => (
          <MaddeItem
            key={item.key}
            item={item}
            comments={commentsByItemKey.get(item.key) ?? []}
            sessionName={sessionName}
            open={openItemKey === item.key}
            addCommentAction={addCommentAction}
            deleteCommentAction={deleteCommentAction}
          />
        ))}
      </ul>
    </section>
  );
}
