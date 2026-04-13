import type { CvReviewQueueEntry, CvReviewQueueResult } from "@/types/cv-review";

interface CvReviewQueueSectionProps {
  result: CvReviewQueueResult;
}

interface QueueCardProps {
  entry: CvReviewQueueEntry;
}

function QueueCard({ entry }: QueueCardProps) {
  const isApproved = entry.status === "approved";

  return (
    <article className="flex items-center justify-between gap-4 rounded-[1.35rem] border border-line/80 bg-paper px-5 py-4">
      <div className="min-w-0">
        <p className="font-body text-xl font-semibold text-ink">{entry.initials}</p>
        <p className="mt-0.5 text-xs text-ink/55">{entry.createdDate}</p>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        <span
          className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${
            isApproved
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {isApproved ? "Approved" : "Pending"}
        </span>
        <span
          className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${
            entry.cvReviewed
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          CV
        </span>
        <span
          className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${
            entry.linkedinReviewed
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          LinkedIn
        </span>
      </div>
    </article>
  );
}

export function CvReviewQueueSection({ result }: CvReviewQueueSectionProps) {
  if (result.source === "env-missing" || result.source === "error" || result.total === 0) {
    return null;
  }

  const approvedEntries = result.entries.filter((e) => e.status === "approved");
  const pendingEntries = result.entries.filter((e) => e.status === "new");

  return (
    <div className="mt-10 border-t border-line/60 pt-8">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 select-none">
          <div>
            <h3 className="font-body text-xl font-semibold text-ink">Queue status</h3>
            <p className="mt-1 text-sm text-ink/55">
              {result.total} total &middot; {result.pending} pending &middot; {result.approved} approved &middot; {result.cvOptimized} CV optimized &middot; {result.linkedinOptimized} LinkedIn optimized
            </p>
          </div>
          <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-line/80 bg-paper text-ink/60 transition group-open:rotate-180">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </span>
        </summary>

        <p className="mt-3 text-sm leading-6 text-ink/60">
          The overview only shows initials and process statuses. Contact details are kept private.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-5">
          <div className="flex flex-col items-center justify-center rounded-[1.35rem] border border-line/80 bg-paper px-4 py-5">
            <span className="font-body text-3xl font-semibold tracking-tight text-ink">
              {result.total}
            </span>
            <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/50">
              Total
            </span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-[1.35rem] border border-line/80 bg-paper px-4 py-5">
            <span className="font-body text-3xl font-semibold tracking-tight text-ink">
              {result.pending}
            </span>
            <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/50">
              Pending
            </span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-[1.35rem] border border-line/80 bg-paper px-4 py-5">
            <span className="font-body text-3xl font-semibold tracking-tight text-ink">
              {result.approved}
            </span>
            <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/50">
              Approved
            </span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-[1.35rem] border border-line/80 bg-paper px-4 py-5">
            <span className="font-body text-3xl font-semibold tracking-tight text-ink">
              {result.cvOptimized}
            </span>
            <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/50">
              CV Opt.
            </span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-[1.35rem] border border-line/80 bg-paper px-4 py-5">
            <span className="font-body text-3xl font-semibold tracking-tight text-ink">
              {result.linkedinOptimized}
            </span>
            <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/50">
              Li Opt.
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/50">
              Approved
            </p>
            {approvedEntries.length > 0 ? (
              <div className="space-y-3">
                {approvedEntries.map((entry) => (
                  <QueueCard key={entry.id} entry={entry} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink/45">No approved applications yet.</p>
            )}
          </div>

          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/50">
              In Queue
            </p>
            {pendingEntries.length > 0 ? (
              <div className="space-y-3">
                {pendingEntries.map((entry) => (
                  <QueueCard key={entry.id} entry={entry} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink/45">No applications waiting in queue.</p>
            )}
          </div>
        </div>
      </details>
    </div>
  );
}
