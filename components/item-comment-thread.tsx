import type { ItemComment } from "@/lib/item-comments";

export interface ItemCommentThreadTheme {
  wrapper?: string;
  article: string;
  author: string;
  date: string;
  deleteButton: string;
  body: string;
  textarea: string;
  submit: string;
}

export interface ItemCommentThreadProps {
  itemKey: string;
  comments: ItemComment[];
  sessionName: string;
  addCommentAction: (formData: FormData) => void | Promise<void>;
  deleteCommentAction: (formData: FormData) => void | Promise<void>;
}

interface ThemedItemCommentThreadProps extends ItemCommentThreadProps {
  theme: ItemCommentThreadTheme;
}

const DATE_FORMATTER = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Berlin"
});

function formatCreatedAt(value: string): string {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : DATE_FORMATTER.format(parsed);
}

export function ItemCommentThread({
  itemKey,
  comments,
  sessionName,
  addCommentAction,
  deleteCommentAction,
  theme
}: ThemedItemCommentThreadProps) {
  const content = (
    <>
      {comments.map((comment) => (
        <article key={comment.id} className={theme.article}>
          <header className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={theme.author}>{comment.author}</span>
            <span className={theme.date}>{formatCreatedAt(comment.createdAt)}</span>
            {comment.author === sessionName && (
              <form action={deleteCommentAction} className="ml-auto">
                <input type="hidden" name="commentId" value={comment.id} />
                <input type="hidden" name="itemKey" value={itemKey} />
                <button type="submit" className={theme.deleteButton}>
                  Sil
                </button>
              </form>
            )}
          </header>
          <p className={theme.body}>{comment.body}</p>
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
          className={theme.textarea}
        />
        <button type="submit" className={theme.submit}>
          Yorumu kaydet
        </button>
      </form>
    </>
  );

  return theme.wrapper ? <div className={theme.wrapper}>{content}</div> : content;
}
