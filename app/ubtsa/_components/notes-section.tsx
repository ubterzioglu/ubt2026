import type { UbtsaNote } from "@/content/ubtsa-konsept";
import type { UbtsaComment } from "@/lib/ubtsa-comments";
import { CommentThread } from "@/app/ubtsa/_components/comment-thread";
import { NOTE_TONES, type NoteTone } from "@/app/ubtsa/_components/theme";

interface NotesSectionProps {
  /** Anchor id — sidebar links point here. */
  id: string;
  title: string;
  /** Small uppercase chip left of the title (ör. "Karar öncesi"). */
  eyebrow: string;
  intro: string;
  /** Word used in the counter: "madde", "soru"… */
  itemNoun: string;
  items: readonly UbtsaNote[];
  tone: NoteTone;
  commentsByItemKey: Map<string, UbtsaComment[]>;
  sessionName: string;
  /** Key whose thread should render expanded (null when none). */
  openItemKey: string | null;
  addCommentAction: (formData: FormData) => void | Promise<void>;
  deleteCommentAction: (formData: FormData) => void | Promise<void>;
}

/**
 * A block of commentable notes — used by Konsept Özeti, UBT'nin Soruları and
 * UBT'nin Önerebileceği İnsan Modeli, which differ only in wording and accent
 * colour.
 *
 * These render in the main column rather than inside the sidebar: the sidebar
 * is 268px wide and a comment thread with a multi-line composer is unreadable
 * there. The sidebar carries the *list* and links here; this carries the
 * substance.
 *
 * Every section that is UBT's own analysis is tinted away from the document's
 * teal, so none of it can be mistaken for the konsept's own words.
 */
export function NotesSection({
  id,
  title,
  eyebrow,
  intro,
  itemNoun,
  items,
  tone,
  commentsByItemKey,
  sessionName,
  openItemKey,
  addCommentAction,
  deleteCommentAction
}: NotesSectionProps) {
  const palette = NOTE_TONES[tone];
  const totalComments = items.reduce(
    (total, item) => total + (commentsByItemKey.get(item.key)?.length ?? 0),
    0
  );

  return (
    <section
      id={id}
      className={`scroll-mt-6 rounded-[1.15rem] border px-4 py-5 sm:px-6 sm:py-6 ${palette.sectionBorder} ${palette.sectionBg} ${palette.sectionShadow}`}
    >
      <header className={`mb-4 border-b pb-3.5 ${palette.headerBorder}`}>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
          <span
            className={`inline-flex h-7 items-center justify-center rounded-lg px-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white ${palette.chipBg}`}
          >
            {eyebrow}
          </span>
          <h2
            className={`text-[1.15rem] font-bold leading-snug tracking-[-0.02em] ${palette.heading}`}
          >
            {title}
          </h2>
          <span
            className={`ml-auto flex items-center gap-2 text-[11px] font-semibold ${palette.meta}`}
          >
            <span>
              {items.length} {itemNoun}
            </span>
            {totalComments > 0 && (
              <span
                className={`rounded-full border px-2 py-0.5 tabular-nums ${palette.countBadge}`}
              >
                {totalComments} yorum
              </span>
            )}
          </span>
        </div>
        <p className={`mt-3 max-w-[75ch] text-[13px] leading-6 ${palette.intro}`}>
          {intro}
        </p>
      </header>

      <ol className="space-y-2">
        {items.map((item, index) => {
          const comments = commentsByItemKey.get(item.key) ?? [];
          const count = comments.length;

          return (
            <li key={item.key} id={item.key} className="scroll-mt-24">
              <details
                open={openItemKey === item.key}
                className={`group rounded-[0.9rem] border bg-white/70 transition-colors open:bg-white hover:bg-white ${palette.itemBorder}`}
              >
                <summary
                  className={`flex cursor-pointer list-none items-start gap-3 rounded-[0.9rem] px-3.5 py-3 outline-none [&::-webkit-details-marker]:hidden ${palette.focusRing}`}
                >
                  <span
                    aria-hidden
                    className={`mt-[0.1rem] inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold tabular-nums ${palette.indexBadge}`}
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold leading-[1.6] text-slate-800">
                      {item.title}
                    </span>
                    {item.detail && (
                      <span className="mt-1.5 block text-[13px] leading-6 text-slate-500">
                        {item.detail}
                      </span>
                    )}
                  </span>
                  <span
                    className={`mt-[0.15rem] inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tabular-nums transition ${
                      count > 0
                        ? palette.countBadge
                        : "border-slate-200 bg-white text-slate-400 opacity-0 group-hover:opacity-100 group-open:opacity-100 group-focus-within:opacity-100"
                    }`}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    {count > 0 ? count : "Yorum"}
                    <span className="sr-only">
                      {count > 0 ? `${count} yorum var` : "yorum ekle"}
                    </span>
                  </span>
                </summary>

                <div
                  className={`ml-[2.1rem] mr-3.5 mb-3.5 space-y-3 border-l-2 pl-4 ${palette.threadBorder}`}
                >
                  <CommentThread
                    itemKey={item.key}
                    comments={comments}
                    sessionName={sessionName}
                    addCommentAction={addCommentAction}
                    deleteCommentAction={deleteCommentAction}
                  />
                </div>
              </details>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
