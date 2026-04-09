import { hasAdminAccess } from "@/lib/appointments";
import { getAllCvReviewRequests } from "@/lib/cv-reviews";

interface AdminCvReviewsPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function readParam(value: string | string[] | undefined): string {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return "";
}

export default async function AdminCvReviewsPage({
  searchParams
}: AdminCvReviewsPageProps) {
  const params = searchParams ? await searchParams : {};
  const accessKey = readParam(params.access);
  const hasAccess = hasAdminAccess(accessKey);

  if (!hasAccess) {
    return (
      <main className="page-shell min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <section className="section-panel px-6 py-8 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
              Admin access
            </p>
            <h1 className="mt-3 font-body text-[clamp(2rem,5vw,2.6rem)] font-semibold tracking-[-0.03em] text-ink">
              Enter the admin key
            </h1>
            <form action="/admin/cv-reviews" className="mt-8 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-ink">Access key</span>
                <input
                  type="password"
                  name="access"
                  className="w-full rounded-[1rem] border border-line/80 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent/55 focus:ring-2 focus:ring-accent/15"
                />
              </label>
              <button
                type="submit"
                className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent/95"
              >
                Open CV review queue
              </button>
            </form>
          </section>
        </div>
      </main>
    );
  }

  const requestsResult = await getAllCvReviewRequests();

  return (
    <main className="page-shell min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="section-panel px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                CV review queue
              </p>
              <h1 className="mt-2 font-body text-[clamp(2rem,5vw,2.7rem)] font-semibold tracking-[-0.03em] text-ink">
                Submitted CV review requests
              </h1>
            </div>
            <a
              href={accessKey ? `/admin?access=${encodeURIComponent(accessKey)}` : "/admin"}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/92"
            >
              Back to dashboard
            </a>
          </div>
        </section>

        <section className="space-y-4">
          {requestsResult.requests.length > 0 ? (
            requestsResult.requests.map((request) => (
              <article key={request.id} className="section-panel px-6 py-6 sm:px-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-4xl">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-body text-2xl font-semibold text-ink">
                        {request.fullName}
                      </h2>
                      <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-ink/72">
                        {request.status}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-ink/72 sm:grid-cols-2">
                      <p>
                        <span className="font-semibold text-ink">WhatsApp:</span>{" "}
                        {request.whatsappNumber}
                      </p>
                      <p>
                        <span className="font-semibold text-ink">Created:</span>{" "}
                        {new Intl.DateTimeFormat("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "Europe/Berlin"
                        }).format(new Date(request.createdAt))}
                      </p>
                      <p className="sm:col-span-2">
                        <span className="font-semibold text-ink">LinkedIn:</span>{" "}
                        <a
                          href={request.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="break-all text-accent hover:text-accent/80"
                        >
                          {request.linkedinUrl}
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <section className="section-panel px-6 py-6 text-sm text-ink/72 sm:px-8">
              No CV review requests have been submitted yet.
            </section>
          )}
        </section>
      </div>
    </main>
  );
}
