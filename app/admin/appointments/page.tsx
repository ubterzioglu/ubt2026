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
import { AdminBadge, AdminListPanel } from "@/app/admin/_components/admin-panels";
import { APPOINTMENT_STATUS_TONE } from "@/app/admin/_components/appointment-status";
import { FlashBanner } from "@/app/admin/_components/flash-banner";
import { adminSmallButtonClass } from "@/app/admin/_components/form-classes";
import { APPOINTMENT_STATUSES } from "@/types/appointment";
import type { AppointmentStatus } from "@/types/appointment";

interface AdminAppointmentsPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

const APPOINTMENTS_PATH = "/admin/appointments";

const ROW_GRID = "md:grid md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.8fr)_minmax(0,1fr)_auto] md:items-center md:gap-6";

function readStatusFilter(value: string): AppointmentStatus | null {
  return (APPOINTMENT_STATUSES as readonly string[]).includes(value)
    ? (value as AppointmentStatus)
    : null;
}

function formatCreatedAt(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function AdminAppointmentsPage({
  searchParams
}: AdminAppointmentsPageProps) {
  const params = searchParams ? await searchParams : {};
  const hasAccess = await isAdminAuthenticated();
  const status = readSearchParam(params.status) as "success" | "error" | "";
  const message = readSearchParam(params.message);
  const filter = readStatusFilter(readSearchParam(params.filter));

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
  const allAppointments = appointmentsResult.appointments;
  const visibleAppointments = filter
    ? allAppointments.filter((appointment) => appointment.status === filter)
    : allAppointments;
  const filterTabs = [
    { key: "all", label: "All", count: allAppointments.length, active: filter === null },
    ...APPOINTMENT_STATUSES.map((value) => ({
      key: value,
      label: value,
      count: allAppointments.filter((appointment) => appointment.status === value).length,
      active: filter === value
    }))
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow="Requests"
        title="Appointments"
        description="Every booking request, newest first. Change the status inline."
        refreshHref={buildAdminFeedbackUrl(APPOINTMENTS_PATH)}
      />

      {message ? (
        <FlashBanner tone={status === "error" ? "error" : "success"}>{message}</FlashBanner>
      ) : null}

      <AdminListPanel
        title={filter ? `${filter[0].toUpperCase()}${filter.slice(1)} requests` : "All requests"}
        count={visibleAppointments.length}
        emptyMessage={
          filter
            ? `No ${filter} appointment requests.`
            : "No appointment requests have been submitted yet."
        }
        toolbar={
          <nav aria-label="Filter by status" className="flex flex-wrap gap-1.5">
            {filterTabs.map((tab) => (
              <a
                key={tab.key}
                href={tab.key === "all" ? APPOINTMENTS_PATH : `${APPOINTMENTS_PATH}?filter=${tab.key}`}
                aria-current={tab.active ? "page" : undefined}
                className={`inline-flex min-h-[32px] items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold capitalize transition ${
                  tab.active ? "bg-ink text-white" : "text-ink/65 hover:bg-paper hover:text-ink"
                }`}
              >
                {tab.label}
                <span className={tab.active ? "text-white/70" : "text-ink/40"}>{tab.count}</span>
              </a>
            ))}
          </nav>
        }
        columns={
          <div className={ROW_GRID}>
            <span>Contact</span>
            <span>Slot</span>
            <span>Status</span>
            <span className="w-[13.5rem]">Update</span>
          </div>
        }
      >
        {visibleAppointments.map((appointment) => (
          <li key={appointment.id} className={`flex flex-col gap-3 px-5 py-4 transition hover:bg-paper/50 ${ROW_GRID}`}>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{appointment.fullName}</p>
              <p className="truncate text-xs text-ink/60">
                <a href={`mailto:${appointment.email}`} className="hover:text-accent">
                  {appointment.email}
                </a>
                {appointment.company ? ` · ${appointment.company}` : ""}
              </p>
              {appointment.notes ? (
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink/50" title={appointment.notes}>
                  {appointment.notes}
                </p>
              ) : null}
            </div>
            <div className="min-w-0 text-xs text-ink/60">
              {appointment.slot ? (
                <>
                  <p className="text-ink/75">
                    {formatSlotTime(
                      appointment.slot.startsAt,
                      appointment.slot.endsAt,
                      appointment.slot.timezone
                    )}
                  </p>
                  {appointment.slot.location ? (
                    <p className="truncate">{appointment.slot.location}</p>
                  ) : null}
                </>
              ) : (
                <p>No slot</p>
              )}
              <p className="mt-0.5 text-ink/40">Requested {formatCreatedAt(appointment.createdAt)}</p>
            </div>
            <div>
              <AdminBadge tone={APPOINTMENT_STATUS_TONE[appointment.status]}>
                {appointment.status}
              </AdminBadge>
            </div>
            <form action={updateStatusAction} className="flex items-center gap-2 md:w-[13.5rem]">
              <input type="hidden" name="appointmentId" value={appointment.id} />
              <label className="sr-only" htmlFor={`status-${appointment.id}`}>
                Status for {appointment.fullName}
              </label>
              <select
                id={`status-${appointment.id}`}
                name="status"
                defaultValue={appointment.status}
                className="min-h-[32px] flex-1 rounded-lg border border-line/80 bg-white px-2 text-xs font-medium capitalize text-ink outline-none focus:border-accent/55 focus:ring-2 focus:ring-accent/15"
              >
                {APPOINTMENT_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              <button type="submit" className={adminSmallButtonClass}>
                Save
              </button>
            </form>
          </li>
        ))}
      </AdminListPanel>
    </>
  );
}
