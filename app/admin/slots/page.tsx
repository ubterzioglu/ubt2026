import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createAppointmentSlot,
  deleteAppointmentSlot,
  getAllAppointmentSlots,
  hasAdminAccess,
  updateAppointmentSlot
} from "@/lib/appointments";
import { SlotDatePicker } from "@/components/appointment/slot-date-picker";

interface AdminSlotsPageProps {
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

function buildSlotsUrl(
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
  return query ? `/admin/slots?${query}` : "/admin/slots";
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

export default async function AdminSlotsPage({ searchParams }: AdminSlotsPageProps) {
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
            <form action="/admin/slots" className="mt-8 space-y-4">
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
                Open slot manager
              </button>
            </form>
          </section>
        </div>
      </main>
    );
  }

  async function createSlotAction(formData: FormData) {
    "use server";

    const access = String(formData.get("access") ?? "");

    if (!hasAdminAccess(access)) {
      redirect(buildSlotsUrl("", "error", "Access denied.") as Route);
    }

    const result = await createAppointmentSlot({
      title: String(formData.get("title") ?? ""),
      location: String(formData.get("location") ?? ""),
      description: String(formData.get("description") ?? ""),
      startsAt: String(formData.get("startsAt") ?? ""),
      endsAt: String(formData.get("endsAt") ?? ""),
      timezone: String(formData.get("timezone") ?? "Europe/Berlin"),
      isPublic: formData.get("isPublic") === "on"
    });

    revalidatePath("/admin");
    revalidatePath("/admin/slots");
    revalidatePath("/");

    redirect(
      buildSlotsUrl(
        access,
        result.ok ? "success" : "error",
        result.ok ? "Appointment slot created." : result.errorMessage ?? "Unable to create slot."
      ) as Route
    );
  }

  async function updateSlotAction(formData: FormData) {
    "use server";

    const access = String(formData.get("access") ?? "");
    const slotId = String(formData.get("slotId") ?? "");

    if (!hasAdminAccess(access)) {
      redirect(buildSlotsUrl("", "error", "Access denied.") as Route);
    }

    const result = await updateAppointmentSlot(slotId, {
      title: String(formData.get("title") ?? ""),
      location: String(formData.get("location") ?? ""),
      description: String(formData.get("description") ?? ""),
      startsAt: String(formData.get("startsAt") ?? ""),
      endsAt: String(formData.get("endsAt") ?? ""),
      timezone: String(formData.get("timezone") ?? "Europe/Berlin"),
      isPublic: formData.get("isPublic") === "on"
    });

    revalidatePath("/admin");
    revalidatePath("/admin/slots");
    revalidatePath("/");

    redirect(
      buildSlotsUrl(
        access,
        result.ok ? "success" : "error",
        result.ok ? "Appointment slot updated." : result.errorMessage ?? "Unable to update slot."
      ) as Route
    );
  }

  async function deleteSlotAction(formData: FormData) {
    "use server";

    const access = String(formData.get("access") ?? "");
    const slotId = String(formData.get("slotId") ?? "");

    if (!hasAdminAccess(access)) {
      redirect(buildSlotsUrl("", "error", "Access denied.") as Route);
    }

    const result = await deleteAppointmentSlot(slotId);

    revalidatePath("/admin");
    revalidatePath("/admin/slots");
    revalidatePath("/");

    redirect(
      buildSlotsUrl(
        access,
        result.ok ? "success" : "error",
        result.ok ? "Appointment slot deleted." : result.errorMessage ?? "Unable to delete slot."
      ) as Route
    );
  }

  const slotsResult = await getAllAppointmentSlots();

  return (
    <main className="page-shell min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="section-panel px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                Slot manager
              </p>
              <h1 className="mt-2 font-body text-[clamp(2rem,5vw,2.7rem)] font-semibold tracking-[-0.03em] text-ink">
                Manage appointment slots
              </h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={buildSlotsUrl(accessKey)}
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

        <section className="section-panel px-6 py-7 sm:px-8 sm:py-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sunrise">
              Create a slot
            </p>
            <h2 className="mt-2 font-body text-2xl font-semibold text-ink">Publish new availability</h2>

          </div>
          <form action={createSlotAction} className="mt-8 grid gap-4 lg:grid-cols-2">
            <input type="hidden" name="access" value={accessKey} />
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink">Title</span>
              <input
                type="text"
                name="title"
                required
                className="w-full rounded-[1rem] border border-line/80 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent/55 focus:ring-2 focus:ring-accent/15"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink">Location</span>
              <input
                type="text"
                name="location"
                className="w-full rounded-[1rem] border border-line/80 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent/55 focus:ring-2 focus:ring-accent/15"
              />
            </label>
            <SlotDatePicker />
            <label className="flex items-center gap-3 rounded-[1rem] border border-line/80 bg-white px-4 py-3 text-sm text-ink shadow-sm">
              <input type="checkbox" name="isPublic" defaultChecked className="h-4 w-4" />
              Publish this slot on the homepage booking section
            </label>
            <label className="block lg:col-span-2">
              <span className="mb-2 block text-sm font-medium text-ink">Description</span>
              <textarea
                name="description"
                rows={4}
                className="w-full rounded-[1rem] border border-line/80 bg-white px-4 py-3 text-sm leading-6 text-ink shadow-sm outline-none transition focus:border-accent/55 focus:ring-2 focus:ring-accent/15"
              />
            </label>
            <div className="lg:col-span-2">
              <button
                type="submit"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent/95"
              >
                Create slot
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-4">
          {slotsResult.slots.length > 0 ? (
            slotsResult.slots.map((slot) => (
              <article key={slot.id} className="section-panel px-6 py-6 sm:px-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-2xl">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-body text-2xl font-semibold text-ink">{slot.title}</h2>
                      <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-ink/72">
                        {slot.isBooked ? "Booked" : slot.isPublic ? "Published" : "Hidden"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-ink/72">
                      {formatSlotTime(slot.startsAt, slot.endsAt, slot.timezone)}
                    </p>
                    <p className="mt-2 text-sm text-ink/68">
                      {slot.location ?? "Remote / flexible location"}
                    </p>
                    {slot.description ? (
                      <p className="mt-3 text-sm leading-7 text-ink/68">{slot.description}</p>
                    ) : null}
                  </div>

                  <form action={deleteSlotAction}>
                    <input type="hidden" name="access" value={accessKey} />
                    <input type="hidden" name="slotId" value={slot.id} />
                    <button
                      type="submit"
                      className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-800 transition hover:bg-rose-100"
                    >
                      Delete slot
                    </button>
                  </form>
                </div>

                <form action={updateSlotAction} className="mt-6 grid gap-4 lg:grid-cols-2">
                  <input type="hidden" name="access" value={accessKey} />
                  <input type="hidden" name="slotId" value={slot.id} />
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-ink">Title</span>
                    <input
                      type="text"
                      name="title"
                      required
                      defaultValue={slot.title}
                      className="w-full rounded-[1rem] border border-line/80 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent/55 focus:ring-2 focus:ring-accent/15"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-ink">Location</span>
                    <input
                      type="text"
                      name="location"
                      defaultValue={slot.location ?? ""}
                      className="w-full rounded-[1rem] border border-line/80 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent/55 focus:ring-2 focus:ring-accent/15"
                    />
                  </label>
                  <SlotDatePicker
                    defaultStartsAt={slot.startsAt}
                    defaultEndsAt={slot.endsAt}
                    defaultTimezone={slot.timezone}
                  />
                  <label className="flex items-center gap-3 rounded-[1rem] border border-line/80 bg-white px-4 py-3 text-sm text-ink shadow-sm lg:mt-8">
                    <input type="checkbox" name="isPublic" defaultChecked={slot.isPublic} className="h-4 w-4" />
                    Publish this slot
                  </label>
                  <label className="block lg:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-ink">Description</span>
                    <textarea
                      name="description"
                      rows={4}
                      defaultValue={slot.description ?? ""}
                      className="w-full rounded-[1rem] border border-line/80 bg-white px-4 py-3 text-sm leading-6 text-ink shadow-sm outline-none transition focus:border-accent/55 focus:ring-2 focus:ring-accent/15"
                    />
                  </label>
                  <div className="lg:col-span-2">
                    <button
                      type="submit"
                      className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink/92"
                    >
                      Save changes
                    </button>
                  </div>
                </form>
              </article>
            ))
          ) : (
            <section className="section-panel px-6 py-6 text-sm text-ink/72 sm:px-8">
              No appointment slots have been created yet.
            </section>
          )}
        </section>
      </div>
    </main>
  );
}
