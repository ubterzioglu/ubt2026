import type { UbtsaComment } from "@/lib/ubtsa-comments";

interface CommentThreadProps {
  /** Madde veya soru anahtarı — yorumun bağlandığı yer. */
  itemKey: string;
  comments: UbtsaComment[];
  /** Oturumdaki isim: yeni yorumun yazarı ve kimin silebileceğini belirler. */
  sessionName: string;
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

/** ISO zaman damgasını Berlin saatine çevirir; bozuksa ham değeri döner. */
function formatCreatedAt(value: string): string {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : DATE_FORMATTER.format(parsed);
}

/**
 * Bir maddenin/sorunun yorum listesi ve yeni yorum formu.
 *
 * Yorumun yazarı sunucuda oturumdan alınır — forma yazar alanı KONULMAZ,
 * yoksa herkes istediği isimle yorum bırakabilirdi. Silme düğmesi de sadece
 * yazarına gösterilir (asıl kontrol yine sunucuda).
 */
export function CommentThread({
  itemKey,
  comments,
  sessionName,
  addCommentAction,
  deleteCommentAction
}: CommentThreadProps) {
  return (
    <>
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
                <input type="hidden" name="itemKey" value={itemKey} />
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
        <input type="hidden" name="itemKey" value={itemKey} />
        <textarea
          name="body"
          required
          rows={2}
          maxLength={4000}
          placeholder={`Yorumun... (${sessionName} olarak)`}
          className="w-full resize-y rounded-[0.8rem] border border-slate-200 bg-white px-3.5 py-2.5 text-[13.5px] leading-6 text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-teal-600/50 focus:ring-4 focus:ring-teal-600/10"
        />
        <button
          type="submit"
          className="self-start rounded-[0.7rem] bg-teal-700 px-4 py-2 text-[12.5px] font-bold tracking-tight text-white transition hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
        >
          Yorumu kaydet
        </button>
      </form>
    </>
  );
}
