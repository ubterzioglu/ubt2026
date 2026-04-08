import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAllAppointments, hasAdminAccess, updateAppointmentStatus } from "@/lib/appointments";
import { APPOINTMENT_STATUSES } from "@/types/appointment";

interface AdminAppointmentsPageProps {
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

function buildAppointmentsUrl(
  accessKey: string,
  status?: "success" | "error",
  message?: string
): string {
  const params = new URLSearchParams();

  if (accessKey) {
    params.set("access", accessKey);
  }

  if (status) {
    params.set("status", status);
  }

  if (message) {
    params.set("message", message);
  }

  const query = params.toString();
  return query ? `/admin/appointments?${query}` : "/admin/appointments";
}

function formatSlotTime(startsAt: string, endsAt: string, timezone: string): string {
  const startFormatter = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone
  });
  const endFormatter = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone
  });

  return `${startFormatter.format(new Date(startsAt))} to ${endFormatter.format(
    new Date(endsAt)
  )}`;
}

const statusClasses = {
  pending: "bg-amber-100 text-amber-900",
  confirmed: "bg-sky-100 text-sky-900",
  completed: "bg-emerald-100 text-emerald-900",
  cancelled: "bg-rose-100 text-rose-900"
} as const;

export default async function AdminAppointmentsPage({
  searchParams
}: AdminAppointmentsPageProps) {
  const params = searchParams ? await searchParams : {};
  const accessKey = readParam(params.access);
  const hasAccess = hasAdminAccess(accessKey);
  const status = readParam(params.status) as "success" | "error" | "";
  const message = readParam(params.message);

  if (!hasAccess) {
    return (
      <main className="page-shell min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <section className="section-panel px-6 py-8 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
              Admin access
            </p>
            <h1 className="mt-3 font-body text-[clamp(2rem,5vw,2.6rem)] font-semibold tracking-[-0.03em] text-ink">
              Enter the appointment admin key
            </h1>
            <form action="/admin/appointments" className="mt-8 space-y-4">
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
                Open appointment review
              </button>
            </form>
          </section>
        </div>
      </main>
    );
  }

  async function updateStatusAction(formData: FormData) {
    "use server";

    const access = String(formData.get("access") ?? "");
    const appointmentId = String(formData.get("appointmentId") ?? "");
    const appointmentStatus = String(formData.get("status") ?? "pending");

    if (!hasAdminAccess(access)) {
      redirect(buildAppointmentsUrl("", "error", "Access denied.") as Route);
    }

    const result = await updateAppointmentStatus(
      appointmentId,
      appointmentStatus as (typeof APPOINTMENT_STATUSES)[number]
    );

    revalidatePath("/admin");
    revalidatePath("/admin/appointments");
    revalidatePath("/admin/slots");
    revalidatePath("/book-appointment");

    redirect(
      buildAppointmentsUrl(
        access,
        result.ok ? "success" : "error",
        result.ok
          ? "Appointment status updated."
          : result.errorMessage ?? "Unable to update appointment status."
      ) as Route
    );
  }

  const appointmentsResult = await getAllAppointments();

  return (
    <main className="page-shell min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="section-panel px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                Appointment review
              </p>
              <h1 className="mt-2 font-body text-[clamp(2rem,5vw,2.7rem)] font-semibold tracking-[-0.03em] text-ink">
                Manage booked appointments
              </h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={buildAppointmentsUrl(accessKey)}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line/80 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-accent/40 hover:text-accent"
              >
                Refresh
              </a>
              <a
                href={accessKey ? `/admin?access=${encodeURIComponent(accessKey)}` : "/admin"}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/92"
              >
                Back to dashboard
              </a>
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
          {appointmentsResult.appointments.length > 0 ? (
            appointmentsResult.appointments.map((appointment) => (
              <article key={appointment.id} className="section-panel px-6 py-6 sm:px-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-body text-2xl font-semibold text-ink">
                        {appointment.fullName}
                      </h2>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                          statusClasses[appointment.status]
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-ink/72 sm:grid-cols-2">
                      <p>
                        <span className="font-semibold text-ink">Email:</span> {appointment.email}
                      </p>
                      <p>
                        <span className="font-semibold text-ink">Company:</span>{" "}
                        {appointment.company ?? "Not provided"}
                      </p>
                      {appointment.slot ? (
                        <p className="sm:col-span-2">
                          <span className="font-semibold text-ink">Slot:</span>{" "}
                          {formatSlotTime(
                            appointment.slot.startsAt,
                            appointment.slot.endsAt,
                            appointment.slot.timezone
                          )}
                          {appointment.slot.location ? ` • ${appointment.slot.location}` : ""}
                        </p>
                      ) : null}
                    </div>
                    <div className="mt-4 rounded-[1.35rem] border border-line/80 bg-white/80 px-4 py-4 text-sm leading-7 text-ink/72">
                      {appointment.notes ?? "No notes provided."}
                    </div>
                  </div>

                  <form action={updateStatusAction} className="w-full max-w-xs space-y-3">
                    <input type="hidden" name="access" value={accessKey} />
                    <input type="hidden" name="appointmentId" value={appointment.id} />
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-ink">Status</span>
                      <select
                        name="status"
                        defaultValue={appointment.status}
                        className="w-full rounded-[1rem] border border-line/80 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent/55 focus:ring-2 focus:ring-accent/15"
                      >
                        {APPOINTMENT_STATUSES.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="submit"
                      className="inline-flex min-h-[46px] w-full items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent/95"
                    >
                      Save status
                    </button>
                  </form>
                </div>
              </article>
            ))
          ) : (
            <section className="section-panel px-6 py-6 text-sm text-ink/72 sm:px-8">
              No appointment requests have been submitted yet.
            </section>
          )}
        </section>
      </div>
    </main>
  );
}