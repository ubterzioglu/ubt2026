import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { buildAdminFeedbackUrl } from "@/lib/appointment-url";
import { readSearchParam } from "@/lib/search-params";
import { readFormString } from "@/lib/form-data";
import {
  createAppointmentSlot,
  deleteAppointmentSlot,
  getAllAppointmentSlots,
  updateAppointmentSlot
} from "@/lib/appointments";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { DEFAULT_SLOT_TIMEZONE, formatSlotTime } from "@/lib/slot-time";
import { AdminGate } from "@/app/admin/_components/admin-gate";
import { AdminIcon } from "@/app/admin/_components/admin-icon";
import { AdminPageHeader } from "@/app/admin/_components/admin-page-header";
import { AdminBadge, AdminDisclosure, AdminListPanel } from "@/app/admin/_components/admin-panels";
import type { BadgeTone } from "@/app/admin/_components/admin-panels";
import { FlashBanner } from "@/app/admin/_components/flash-banner";
import {
  adminDarkButtonClass,
  adminInputClass,
  adminLabelClass,
  adminPrimaryButtonClass,
  adminSmallDangerButtonClass,
  adminTextareaClass
} from "@/app/admin/_components/form-classes";
import type { AppointmentSlot } from "@/types/appointment";
import { SlotDatePicker } from "@/components/appointment/slot-date-picker";

interface AdminSlotsPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

const SLOTS_PATH = "/admin/slots";

const ROW_GRID =
  "md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,1.2fr)_auto] md:items-center md:gap-6";

function slotState(slot: AppointmentSlot, now: Date): { label: string; tone: BadgeTone } {
  if (slot.isBooked) return { label: "Booked", tone: "info" };
  if (new Date(slot.endsAt) < now) return { label: "Past", tone: "neutral" };
  if (slot.isPublic) return { label: "Published", tone: "success" };
  return { label: "Hidden", tone: "warning" };
}

export default async function AdminSlotsPage({ searchParams }: AdminSlotsPageProps) {
  const params = searchParams ? await searchParams : {};
  const hasAccess = await isAdminAuthenticated();
  const status = readSearchParam(params.status) as "success" | "error" | "";
  const message = readSearchParam(params.message);

  if (!hasAccess) {
    return <AdminGate redirectTo="/admin/slots" submitLabel="Open slot manager" />;
  }

  async function createSlotAction(formData: FormData) {
    "use server";

    if (!(await isAdminAuthenticated())) {
      redirect("/admin/slots" as Route);
    }

    const result = await createAppointmentSlot({
      title: readFormString(formData, "title"),
      location: readFormString(formData, "location"),
      description: readFormString(formData, "description"),
      startsAt: readFormString(formData, "startsAt"),
      endsAt: readFormString(formData, "endsAt"),
      timezone: readFormString(formData, "timezone", DEFAULT_SLOT_TIMEZONE),
      isPublic: formData.get("isPublic") === "on"
    });

    revalidatePath("/admin");
    revalidatePath("/admin/slots");
    revalidatePath("/");

    redirect(
      buildAdminFeedbackUrl(
        SLOTS_PATH,
        result.ok ? "success" : "error",
        result.ok ? "Appointment slot created." : result.errorMessage ?? "Unable to create slot."
      ) as Route
    );
  }

  async function updateSlotAction(formData: FormData) {
    "use server";

    if (!(await isAdminAuthenticated())) {
      redirect("/admin/slots" as Route);
    }

    const slotId = readFormString(formData, "slotId");

    const result = await updateAppointmentSlot(slotId, {
      title: readFormString(formData, "title"),
      location: readFormString(formData, "location"),
      description: readFormString(formData, "description"),
      startsAt: readFormString(formData, "startsAt"),
      endsAt: readFormString(formData, "endsAt"),
      timezone: readFormString(formData, "timezone", DEFAULT_SLOT_TIMEZONE),
      isPublic: formData.get("isPublic") === "on"
    });

    revalidatePath("/admin");
    revalidatePath("/admin/slots");
    revalidatePath("/");

    redirect(
      buildAdminFeedbackUrl(
        SLOTS_PATH,
        result.ok ? "success" : "error",
        result.ok ? "Appointment slot updated." : result.errorMessage ?? "Unable to update slot."
      ) as Route
    );
  }

  async function deleteSlotAction(formData: FormData) {
    "use server";

    if (!(await isAdminAuthenticated())) {
      redirect("/admin/slots" as Route);
    }

    const slotId = readFormString(formData, "slotId");

    const result = await deleteAppointmentSlot(slotId);

    revalidatePath("/admin");
    revalidatePath("/admin/slots");
    revalidatePath("/");

    redirect(
      buildAdminFeedbackUrl(
        SLOTS_PATH,
        result.ok ? "success" : "error",
        result.ok ? "Appointment slot deleted." : result.errorMessage ?? "Unable to delete slot."
      ) as Route
    );
  }

  const slotsResult = await getAllAppointmentSlots();
  const now = new Date();

  return (
    <>
      <AdminPageHeader
        eyebrow="Availability"
        title="Slots"
        description="Bookable time slots shown in the homepage booking section."
        refreshHref={buildAdminFeedbackUrl(SLOTS_PATH)}
      >
        <a href="#new-slot" className={adminPrimaryButtonClass}>
          <AdminIcon name="plus" size={16} />
          New slot
        </a>
      </AdminPageHeader>

      {message ? (
        <FlashBanner tone={status === "error" ? "error" : "success"}>{message}</FlashBanner>
      ) : null}

      <AdminDisclosure
        id="new-slot"
        title="Create a slot"
        description="Publish new availability"
        defaultOpen={slotsResult.slots.length === 0}
      >
        <form action={createSlotAction} className="grid gap-4 lg:grid-cols-2">
          <label className="block">
            <span className={adminLabelClass}>Title</span>
            <input type="text" name="title" required className={adminInputClass} />
          </label>
          <label className="block">
            <span className={adminLabelClass}>Location</span>
            <input type="text" name="location" className={adminInputClass} />
          </label>
          <SlotDatePicker />
          <label className="flex items-center gap-3 rounded-lg border border-line/80 bg-white px-4 py-3 text-sm text-ink">
            <input type="checkbox" name="isPublic" defaultChecked className="h-4 w-4" />
            Publish this slot on the homepage booking section
          </label>
          <label className="block lg:col-span-2">
            <span className={adminLabelClass}>Description</span>
            <textarea name="description" rows={3} className={adminTextareaClass} />
          </label>
          <div className="lg:col-span-2">
            <button type="submit" className={adminPrimaryButtonClass}>
              Create slot
            </button>
          </div>
        </form>
      </AdminDisclosure>

      <AdminListPanel
        title="All slots"
        count={slotsResult.slots.length}
        emptyMessage="No appointment slots have been created yet."
        columns={
          <div className={ROW_GRID}>
            <span>Slot</span>
            <span>Time</span>
            <span>Status</span>
            <span className="w-14" />
          </div>
        }
      >
        {slotsResult.slots.map((slot) => {
          const state = slotState(slot, now);
          return (
            <li key={slot.id}>
              <details className="group">
                <summary
                  className={`flex cursor-pointer list-none flex-col gap-2 px-5 py-4 transition hover:bg-paper/50 [&::-webkit-details-marker]:hidden ${ROW_GRID}`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{slot.title}</p>
                    <p className="truncate text-xs text-ink/55">
                      {slot.location ?? "Remote / flexible location"}
                    </p>
                  </div>
                  <p className="text-xs text-ink/70">
                    {formatSlotTime(slot.startsAt, slot.endsAt, slot.timezone)}
                  </p>
                  <div>
                    <AdminBadge tone={state.tone}>{state.label}</AdminBadge>
                  </div>
                  <span className="flex w-14 items-center gap-1 text-xs font-semibold text-accent">
                    Edit
                    <AdminIcon
                      name="chevron"
                      size={14}
                      className="transition-transform group-open:rotate-180"
                    />
                  </span>
                </summary>

                <div className="border-t border-line/70 bg-paper/40 px-5 py-5">
                  <form action={updateSlotAction} className="grid gap-4 lg:grid-cols-2">
                    <input type="hidden" name="slotId" value={slot.id} />
                    <label className="block">
                      <span className={adminLabelClass}>Title</span>
                      <input
                        type="text"
                        name="title"
                        required
                        defaultValue={slot.title}
                        className={adminInputClass}
                      />
                    </label>
                    <label className="block">
                      <span className={adminLabelClass}>Location</span>
                      <input
                        type="text"
                        name="location"
                        defaultValue={slot.location ?? ""}
                        className={adminInputClass}
                      />
                    </label>
                    <SlotDatePicker
                      defaultStartsAt={slot.startsAt}
                      defaultEndsAt={slot.endsAt}
                      defaultTimezone={slot.timezone}
                    />
                    <label className="flex items-center gap-3 rounded-lg border border-line/80 bg-white px-4 py-3 text-sm text-ink">
                      <input
                        type="checkbox"
                        name="isPublic"
                        defaultChecked={slot.isPublic}
                        className="h-4 w-4"
                      />
                      Publish this slot
                    </label>
                    <label className="block lg:col-span-2">
                      <span className={adminLabelClass}>Description</span>
                      <textarea
                        name="description"
                        rows={3}
                        defaultValue={slot.description ?? ""}
                        className={adminTextareaClass}
                      />
                    </label>
                    <div className="lg:col-span-2">
                      <button type="submit" className={adminDarkButtonClass}>
                        Save changes
                      </button>
                    </div>
                  </form>
                  <form
                    action={deleteSlotAction}
                    className="mt-4 flex justify-end border-t border-line/70 pt-4"
                  >
                    <input type="hidden" name="slotId" value={slot.id} />
                    <button type="submit" className={adminSmallDangerButtonClass}>
                      Delete slot
                    </button>
                  </form>
                </div>
              </details>
            </li>
          );
        })}
      </AdminListPanel>
    </>
  );
}
