import type { ReactNode } from "react";

interface PublishableRowProps {
  id: string;
  title: string;
  summary: string;
  isPublished: boolean;
  badges: ReactNode;
  details: ReactNode;
  leadingActions?: ReactNode;
  togglePublishAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
}

export function PublishableRow({
  id,
  title,
  summary,
  isPublished,
  badges,
  details,
  leadingActions,
  togglePublishAction,
  deleteAction
}: Readonly<PublishableRowProps>) {
  return (
    <article
      className={`section-panel px-6 py-5 sm:px-8 ${
        isPublished ? "" : "opacity-60"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-body text-lg font-semibold text-ink">{title}</h3>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                isPublished
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {isPublished ? "Published" : "Draft"}
            </span>
            {badges}
          </div>
          <p className="mt-1.5 text-sm leading-6 text-ink/68">{summary}</p>
          {details}
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
          {leadingActions}
          <form action={togglePublishAction}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="isPublished" value={String(isPublished)} />
            <button
              type="submit"
              className={`inline-flex min-h-[38px] items-center justify-center rounded-full px-4 py-2 text-xs font-semibold transition ${
                isPublished
                  ? "border border-line/80 bg-white text-ink hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800"
                  : "border border-line/80 bg-white text-ink hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
              }`}
            >
              {isPublished ? "Unpublish" : "Publish"}
            </button>
          </form>
          <form action={deleteAction}>
            <input type="hidden" name="id" value={id} />
            <button
              type="submit"
              className="inline-flex min-h-[38px] items-center justify-center rounded-full border border-line/80 bg-white px-4 py-2 text-xs font-semibold text-ink transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              Delete
            </button>
          </form>
        </div>
      </div>
    </article>
  );
}
