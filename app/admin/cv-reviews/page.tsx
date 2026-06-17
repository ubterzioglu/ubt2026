import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminGate } from "@/app/admin/_components/admin-gate";
import { adminSignOutAction } from "@/app/admin/_actions";
import { getAllCvReviewRequests, updateCvReviewRequest } from "@/lib/cv-reviews";

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

function buildCvReviewsUrl(
  status?: "success" | "error",
  message?: string
): string {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (message) params.set("message", message);
  const query = params.toString();
  return query ? `/admin/cv-reviews?${query}` : "/admin/cv-reviews";
}

export default async function AdminCvReviewsPage({
  searchParams
}: AdminCvReviewsPageProps) {
  const params = searchParams ? await searchParams : {};
  const hasAccess = await isAdminAuthenticated();
  const status = readParam(params.status) as "success" | "error" | "";
  const message = readParam(params.message);

  if (!hasAccess) {
    return <AdminGate redirectTo="/admin/cv-reviews" submitLabel="Open CV review queue" />;
  }

  async function approveAction(formData: FormData) {
    "use server";
    if (!(await isAdminAuthenticated())) {
      redirect("/admin/cv-reviews" as Route);
    }
    const requestId = String(formData.get("requestId") ?? "");
    const result = await updateCvReviewRequest(requestId, { status: "approved" });
    revalidatePath("/admin/cv-reviews");
    revalidatePath("/");
    redirect(
      buildCvReviewsUrl(
        result.ok ? "success" : "error",
        result.ok ? "Request approved." : result.errorMessage ?? "Unable to approve."
      ) as Route
    );
  }

  async function markCvReviewedAction(formData: FormData) {
    "use server";
    if (!(await isAdminAuthenticated())) {
      redirect("/admin/cv-reviews" as Route);
    }
    const requestId = String(formData.get("requestId") ?? "");
    const result = await updateCvReviewRequest(requestId, { cvReviewed: true });
    revalidatePath("/admin/cv-reviews");
    revalidatePath("/");
    redirect(
      buildCvReviewsUrl(
        result.ok ? "success" : "error",
        result.ok ? "CV marked as reviewed." : result.errorMessage ?? "Unable to update."
      ) as Route
    );
  }

  async function markLinkedinReviewedAction(formData: FormData) {
    "use server";
    if (!(await isAdminAuthenticated())) {
      redirect("/admin/cv-reviews" as Route);
    }
    const requestId = String(formData.get("requestId") ?? "");
    const result = await updateCvReviewRequest(requestId, { linkedinReviewed: true });
    revalidatePath("/admin/cv-reviews");
    revalidatePath("/");
    redirect(
      buildCvReviewsUrl(
        result.ok ? "success" : "error",
        result.ok ? "LinkedIn marked as reviewed." : result.errorMessage ?? "Unable to update."
      ) as Route
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
            <div className="flex flex-wrap gap-3">
              <a
                href="/admin"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/92"
              >
                Back to dashboard
              </a>
              <form action={adminSignOutAction}>
                <button
                  type="submit"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line/80 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-rose-300 hover:text-rose-700"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </section>

        {message ? (
          <section
            className={`rounded-[1.5rem] border px-5 py-4 text-sm leading-6 ${
              status === "error"
                ? "border-rose-200 bg-rose-50/95 text-rose-900"
                : "border-emerald-200 bg-emerald-50/95 text-emerald-900"
            }`}
          >
            {message}
          </section>
        ) : null}

        <section className="space-y-4">
          {requestsResult.requests.length > 0 ? (
            requestsResult.requests.map((request) => (
              <article key={request.id} className="section-panel px-6 py-6 sm:px-8">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-body text-2xl font-semibold text-ink">
                        {request.fullName}
                      </h2>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                          request.status === "approved"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {request.status === "approved" ? "Approved" : "New"}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                          request.cvReviewed
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        CV {request.cvReviewed ? "Reviewed" : "Pending"}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                          request.linkedinReviewed
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        LinkedIn {request.linkedinReviewed ? "Reviewed" : "Pending"}
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

                  <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end">
                    {request.status !== "approved" && (
                      <form action={approveAction}>
                        <input type="hidden" name="requestId" value={request.id} />
                        <button
                          type="submit"
                          className="inline-flex min-h-[40px] items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                      </form>
                    )}
                    {!request.cvReviewed && (
                      <form action={markCvReviewedAction}>
                        <input type="hidden" name="requestId" value={request.id} />
                        <button
                          type="submit"
                          className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
                        >
                          CV Reviewed
                        </button>
                      </form>
                    )}
                    {!request.linkedinReviewed && (
                      <form action={markLinkedinReviewedAction}>
                        <input type="hidden" name="requestId" value={request.id} />
                        <button
                          type="submit"
                          className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
                        >
                          LinkedIn Reviewed
                        </button>
                      </form>
                    )}
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
