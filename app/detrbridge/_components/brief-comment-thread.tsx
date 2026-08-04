import type { BriefComment } from "@/lib/detrbridge-brief-comments";

interface BriefCommentThreadProps {
  /** Brifing maddesinin anahtarı — yorumun bağlandığı yer. */
  itemKey: string;
  comments: BriefComment[];
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
 * Bir brifing maddesinin yorum listesi ve yeni yorum formu (detrbridge teması).
 *
 * Yorumun yazarı sunucuda oturumdan alınır — forma yazar alanı KONULMAZ,
 * yoksa herkes istediği isimle yorum bırakabilirdi. Silme düğmesi de sadece
 * yazarına gösterilir (asıl kontrol yine sunucuda).
 */
export function BriefCommentThread({
  itemKey,
  comments,
  sessionName,
  addCommentAction,
  deleteCommentAction
}: BriefCommentThreadProps) {
  return (
    <div className="space-y-2.5">
      {comments.map((comment) => (
        <article
          key={comment.id}
          className="rounded-[0.9rem] border border-white/10 bg-white/[0.04] px-3.5 py-2.5"
        >
          <header className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[12px] font-bold capitalize tracking-tight text-[#F5D77A]">
              {comment.author}
            </span>
            <span className="text-[11px] text-white/35">
              {formatCreatedAt(comment.createdAt)}
            </span>
            {comment.author === sessionName && (
              <form action={deleteCommentAction} className="ml-auto">
                <input type="hidden" name="commentId" value={comment.id} />
                <input type="hidden" name="itemKey" value={itemKey} />
                <button
                  type="submit"
                  className="rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-white/40 transition hover:bg-rose-400/10 hover:text-rose-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/40"
                >
                  Sil
                </button>
              </form>
            )}
          </header>
          <p className="whitespace-pre-wrap text-[13px] leading-6 text-white/70">
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
          className="w-full resize-y rounded-[0.9rem] border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-[13px] leading-6 text-white placeholder:text-white/25 outline-none transition focus:border-[#F5B700]/55 focus:bg-white/[0.06] focus:ring-4 focus:ring-[#F5B700]/12"
        />
        <button
          type="submit"
          className="self-start rounded-[0.8rem] bg-[#F5B700] px-4 py-2 text-[12.5px] font-bold tracking-tight text-black transition hover:bg-[#ffc933] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B700]/50"
        >
          Yorumu kaydet
        </button>
      </form>
    </div>
  );
}
