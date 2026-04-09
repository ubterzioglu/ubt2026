import { getAllAppointments, getAllAppointmentSlots, hasAdminAccess } from "@/lib/appointments";
import { getAllCvReviewRequests } from "@/lib/cv-reviews";
import { getAllNewsUpdatesAdmin } from "@/lib/news-updates";

interface AdminPageProps {
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

function buildAdminUrl(path: string, accessKey: string): string {
  const params = new URLSearchParams();

  if (accessKey) {
    params.set("access", accessKey);
  }

  return params.size > 0 ? `${path}?${params.toString()}` : path;
}

function formatSlotTime(
  startsAt: string,
  timezone: string,
  endsAt?: string
): string {
  const startFormatter = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone
  });

  if (!endsAt) {
    return startFormatter.format(new Date(startsAt));
  }

  const endFormatter = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone
  });

  return `${startFormatter.format(new Date(startsAt))} to ${endFormatter.format(
    new Date(endsAt)
  )}`;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
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
              <p className="mt-3 text-sm leading-7 text-ink/72 sm:text-base">
                This lightweight gate protects the appointment and CV review admin pages until a
                fuller authentication flow is added.
              </p>
            <form action="/admin" className="mt-8 space-y-4">
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
                Open admin panel
              </button>
            </form>
          </section>
        </div>
      </main>
    );
  }

  const [slotsResult, appointmentsResult, cvReviewsResult, newsResult] = await Promise.all([
    getAllAppointmentSlots(),
    getAllAppointments(),
    getAllCvReviewRequests(),
    getAllNewsUpdatesAdmin()
  ]);
  const now = new Date();
  const openSlots = slotsResult.slots.filter(
    (slot) => slot.isPublic && !slot.isBooked && new Date(slot.startsAt) > now
  );
  const pendingAppointments = appointmentsResult.appointments.filter(
    (appointment) => appointment.status === "pending"
  );
  const confirmedAppointments = appointmentsResult.appointments.filter(
    (appointment) => appointment.status === "confirmed"
  );
  const recentAppointments = appointmentsResult.appointments.slice(0, 5);
  const recentCvReviews = cvReviewsResult.requests.slice(0, 5);
  const nextSlots = slotsResult.slots
    .filter((slot) => new Date(slot.startsAt) > now)
    .slice(0, 5);

  return (
    <main className="page-shell min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="section-panel px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                Request admin
              </p>
              <h1 className="mt-2 font-body text-[clamp(2rem,5vw,2.7rem)] font-semibold tracking-[-0.03em] text-ink">
                Requests dashboard
              </h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={buildAdminUrl("/admin/slots", accessKey)}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/95"
              >
                Manage slots
              </a>
              <a
                href={buildAdminUrl("/admin/appointments", accessKey)}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line/80 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-accent/40 hover:text-accent"
              >
                Review appointments
              </a>
              <a
                href={buildAdminUrl("/admin/cv-reviews", accessKey)}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line/80 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-accent/40 hover:text-accent"
              >
                CV review queue
              </a>
              <a
                href={buildAdminUrl("/admin/news", accessKey)}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line/80 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-accent/40 hover:text-accent"
              >
                Manage news
              </a>
              <a
                href={buildAdminUrl("/admin/bookmarks", accessKey)}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line/80 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-accent/40 hover:text-accent"
              >
                Manage bookmarks
              </a>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <article className="section-panel px-6 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              Open slots
            </p>
            <p className="mt-3 font-body text-4xl font-semibold text-ink">{openSlots.length}</p>
            <p className="mt-2 text-sm text-ink/68">Published future slots with no active booking.</p>
          </article>
          <article className="section-panel px-6 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              Pending review
            </p>
            <p className="mt-3 font-body text-4xl font-semibold text-ink">
              {pendingAppointments.length}
            </p>
            <p className="mt-2 text-sm text-ink/68">Requests waiting for confirmation or cancellation.</p>
          </article>
          <article className="section-panel px-6 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              Confirmed
            </p>
            <p className="mt-3 font-body text-4xl font-semibold text-ink">
              {confirmedAppointments.length}
            </p>
            <p className="mt-2 text-sm text-ink/68">Appointments currently marked as confirmed.</p>
          </article>
          <article className="section-panel px-6 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              CV reviews
            </p>
            <p className="mt-3 font-body text-4xl font-semibold text-ink">
              {cvReviewsResult.requests.length}
            </p>
            <p className="mt-2 text-sm text-ink/68">Requests waiting in the CV review queue.</p>
          </article>
          <article className="section-panel px-6 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              News items
            </p>
            <p className="mt-3 font-body text-4xl font-semibold text-ink">
              {newsResult.items.length}
            </p>
            <p className="mt-2 text-sm text-ink/68">Published and draft news &amp; update cards.</p>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="section-panel px-6 py-6 sm:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sunrise">
                  Upcoming slots
                </p>
                <h2 className="mt-2 font-body text-2xl font-semibold text-ink">Next availability</h2>
              </div>
              <a
                href={buildAdminUrl("/admin/slots", accessKey)}
                className="text-sm font-semibold text-accent hover:text-accent/80"
              >
                View all
              </a>
            </div>
            <div className="mt-6 space-y-3">
              {nextSlots.length > 0 ? (
                nextSlots.map((slot) => (
                  <article
                    key={slot.id}
                    className="rounded-[1.35rem] border border-line/80 bg-white/85 px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-semibold text-ink">{slot.title}</h3>
                        <p className="mt-1 text-sm text-ink/70">
                          {formatSlotTime(slot.startsAt, slot.timezone, slot.endsAt)}
                        </p>
                      </div>
                      <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-ink/72">
                        {slot.isBooked ? "Booked" : slot.isPublic ? "Open" : "Hidden"}
                      </span>
                    </div>
                  </article>
                ))
              ) : (
                <p className="rounded-[1.35rem] border border-dashed border-line/80 px-4 py-5 text-sm text-ink/68">
                  No future slots are available yet.
                </p>
              )}
            </div>
          </div>

          <div className="section-panel px-6 py-6 sm:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sunrise">
                  Recent requests
                </p>
                <h2 className="mt-2 font-body text-2xl font-semibold text-ink">Latest bookings</h2>
              </div>
              <a
                href={buildAdminUrl("/admin/appointments", accessKey)}
                className="text-sm font-semibold text-accent hover:text-accent/80"
              >
                View all
              </a>
            </div>
            <div className="mt-6 space-y-3">
              {recentAppointments.length > 0 ? (
                recentAppointments.map((appointment) => (
                  <article
                    key={appointment.id}
                    className="rounded-[1.35rem] border border-line/80 bg-white/85 px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-semibold text-ink">{appointment.fullName}</h3>
                        <p className="mt-1 text-sm text-ink/70">{appointment.email}</p>
                        {appointment.slot ? (
                          <p className="mt-2 text-sm text-ink/68">
                            {formatSlotTime(
                              appointment.slot.startsAt,
                              appointment.slot.timezone,
                              appointment.slot.endsAt
                            )}
                          </p>
                        ) : null}
                      </div>
                      <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-ink/72">
                        {appointment.status}
                      </span>
                    </div>
                  </article>
                ))
              ) : (
                <p className="rounded-[1.35rem] border border-dashed border-line/80 px-4 py-5 text-sm text-ink/68">
                  No appointment requests have been submitted yet.
                </p>
              )}
            </div>
          </div>

          <div className="section-panel px-6 py-6 sm:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sunrise">
                  CV queue
                </p>
                <h2 className="mt-2 font-body text-2xl font-semibold text-ink">Latest CV reviews</h2>
              </div>
              <a
                href={buildAdminUrl("/admin/cv-reviews", accessKey)}
                className="text-sm font-semibold text-accent hover:text-accent/80"
              >
                View all
              </a>
            </div>
            <div className="mt-6 space-y-3">
              {recentCvReviews.length > 0 ? (
                recentCvReviews.map((request) => (
                  <article
                    key={request.id}
                    className="rounded-[1.35rem] border border-line/80 bg-white/85 px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-semibold text-ink">{request.fullName}</h3>
                        <p className="mt-1 text-sm text-ink/70">{request.whatsappNumber}</p>
                        <p className="mt-2 line-clamp-2 break-all text-sm text-ink/68">
                          {request.linkedinUrl}
                        </p>
                      </div>
                      <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-ink/72">
                        {request.status}
                      </span>
                    </div>
                  </article>
                ))
              ) : (
                <p className="rounded-[1.35rem] border border-dashed border-line/80 px-4 py-5 text-sm text-ink/68">
                  No CV review requests have been submitted yet.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
