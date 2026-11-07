import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { buildAdminFeedbackUrl } from "@/lib/appointment-url";
import { readSearchParam } from "@/lib/search-params";
import { readFormString } from "@/lib/form-data";
import { getAllAppointments, updateAppointmentStatus } from "@/lib/appointments";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { formatSlotTime } from "@/lib/slot-time";
import { AdminGate } from "@/app/admin/_components/admin-gate";
import { AdminPageHeader } from "@/app/admin/_components/admin-page-header";
import { FlashBanner } from "@/app/admin/_components/flash-banner";
import { adminInputClass } from "@/app/admin/_components/form-classes";
import { APPOINTMENT_STATUSES } from "@/types/appointment";

interface AdminAppointmentsPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

const APPOINTMENTS_PATH = "/admin/appointments";

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
  const hasAccess = await isAdminAuthenticated();
  const status = readSearchParam(params.status) as "success" | "error" | "";
  const message = readSearchParam(params.message);

  if (!hasAccess) {
    return <AdminGate redirectTo="/admin/appointments" submitLabel="Open appointment review" />;
  }

  async function updateStatusAction(formData: FormData) {
    "use server";

    if (!(await isAdminAuthenticated())) {
      redirect("/admin/appointments" as Route);
    }

    const appointmentId = readFormString(formData, "appointmentId");
    const appointmentStatus = readFormString(formData, "status");

    const result = await updateAppointmentStatus(appointmentId, appointmentStatus);

    revalidatePath("/admin");
    revalidatePath("/admin/appointments");
    revalidatePath("/admin/slots");
    revalidatePath("/");

    redirect(
      buildAdminFeedbackUrl(
        APPOINTMENTS_PATH,
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
        <AdminPageHeader eyebrow="Appointment review" title="Manage booked appointments" refreshHref={buildAdminFeedbackUrl(APPOINTMENTS_PATH)} />

        {message ? (
          <FlashBanner tone={status === "error" ? "error" : "success"} variant="panel">
            {message}
          </FlashBanner>
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
                    <input type="hidden" name="appointmentId" value={appointment.id} />
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-ink">Status</span>
                      <select
                        name="status"
                        defaultValue={appointment.status}
                        className={adminInputClass}
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
