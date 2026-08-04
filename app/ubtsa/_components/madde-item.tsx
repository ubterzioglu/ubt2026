import type { UbtsaItem } from "@/content/ubtsa-konsept";
import type { UbtsaComment } from "@/lib/ubtsa-comments";

interface MaddeItemProps {
  item: UbtsaItem;
  comments: UbtsaComment[];
  /** Signed-in name — author of new comments, and who may delete which. */
  sessionName: string;
  /** True when this madde's thread should render expanded. */
  open: boolean;
  addCommentAction: (formData: FormData) => void | Promise<void>;
  deleteCommentAction: (formData: FormData) => void | Promise<void>;
}

const DATE_FORMATTER = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Berlin"
});

/** Formats an ISO timestamp in Berlin time; falls back to the raw value. */
function formatCreatedAt(value: string): string {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : DATE_FORMATTER.format(parsed);
}

/**
 * One madde of the konsept plus its comment thread.
 *
 * Built on native <details>/<summary> so expanding a thread needs no client
 * JavaScript: the whole madde row is the summary, and the page re-renders it
 * expanded after a comment is posted (the server action redirects back with
 * ?open=<key>#<key>).
 */
export function MaddeItem({
  item,
  comments,
  sessionName,
  open,
  addCommentAction,
  deleteCommentAction
}: MaddeItemProps) {
  const count = comments.length;

  return (
    <li id={item.key} className="scroll-mt-24">
      <details
        open={open}
        className="group rounded-[0.85rem] transition-colors open:bg-teal-50/60 hover:bg-slate-50"
      >
        <summary className="flex cursor-pointer list-none items-start gap-3 rounded-[0.85rem] px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 [&::-webkit-details-marker]:hidden">
          <span
            aria-hidden
            className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600/70 transition group-open:bg-teal-600"
          />
          <span className="min-w-0 flex-1 text-[15px] leading-[1.75] text-slate-700">
            {item.text}
          </span>
          <span
            className={`mt-[0.15rem] inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tabular-nums transition ${
              count > 0
                ? "border-teal-600/25 bg-teal-600/10 text-teal-800"
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

        <div className="ml-[1.4rem] mr-3 mb-3 space-y-3 border-l-2 border-teal-600/15 pl-4">
          {comments.map((comment) => (
            <article
              key={comment.id}
              className="rounded-[0.8rem] border border-slate-200/80 bg-white px-3.5 py-2.5 shadow-[0_4px_14px_-10px_rgba(15,23,42,0.35)]"
            >
              <header className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-[12px] font-bold capitalize tracking-tight text-teal-800">
                  {comment.author}
                </span>
                <span className="text-[11px] text-slate-400">
                  {formatCreatedAt(comment.createdAt)}
                </span>
                {comment.author === sessionName && (
                  <form action={deleteCommentAction} className="ml-auto">
                    <input type="hidden" name="commentId" value={comment.id} />
                    <input type="hidden" name="itemKey" value={item.key} />
                    <button
                      type="submit"
                      className="rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/40"
                    >
                      Sil
                    </button>
                  </form>
                )}
              </header>
              <p className="whitespace-pre-wrap text-[13.5px] leading-6 text-slate-600">
                {comment.body}
              </p>
            </article>
          ))}

          <form action={addCommentAction} className="flex flex-col gap-2">
            <input type="hidden" name="itemKey" value={item.key} />
            <textarea
              name="body"
              required
              rows={2}
              maxLength={4000}
              placeholder={`Bu maddeye yorumun... (${sessionName} olarak)`}
              className="w-full resize-y rounded-[0.8rem] border border-slate-200 bg-white px-3.5 py-2.5 text-[13.5px] leading-6 text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-teal-600/50 focus:ring-4 focus:ring-teal-600/10"
            />
            <button
              type="submit"
              className="self-start rounded-[0.7rem] bg-teal-700 px-4 py-2 text-[12.5px] font-bold tracking-tight text-white transition hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
            >
              Yorumu kaydet
            </button>
          </form>
        </div>
      </details>
    </li>
  );
}
