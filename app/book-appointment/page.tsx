import type { Route } from "next";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { BookingForm } from "@/components/appointment/booking-form";
import { createAppointment, getAvailableAppointmentSlots } from "@/lib/appointments";
import { sendNewBookingNotification } from "@/lib/email";

interface BookAppointmentPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function readParam(
  value: string | string[] | undefined,
  fallback = ""
): string {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return fallback;
}

function buildBookingUrl(
  status: "success" | "error" | "info",
  message: string,
  slotId?: string
): string {
  const params = new URLSearchParams();
  params.set("status", status);
  params.set("message", message);

  if (slotId) {
    params.set("slot", slotId);
  }

  return `/book-appointment?${params.toString()}`;
}

export default async function BookAppointmentPage({
  searchParams
}: BookAppointmentPageProps) {
  const params = searchParams ? await searchParams : {};
  const feedbackStatus = readParam(params.status) as "success" | "error" | "info" | "";
  const feedbackMessage = readParam(params.message);
  const selectedSlotId = readParam(params.slot);
  const slotsResult = await getAvailableAppointmentSlots();

  async function submitBookingRequest(formData: FormData) {
    "use server";

    const slotId = String(formData.get("slotId") ?? "");
    const result = await createAppointment({
      slotId,
      fullName: String(formData.get("fullName") ?? ""),
      email: String(formData.get("email") ?? ""),
      company: String(formData.get("company") ?? ""),
      notes: String(formData.get("notes") ?? "")
    });

    if (!result.ok || !result.data) {
      redirect(
        buildBookingUrl(
          "error",
          result.errorMessage ?? "Unable to submit the appointment request.",
          slotId
        ) as Route
      );
    }

    await sendNewBookingNotification(result.data);

    revalidatePath("/book-appointment");
    revalidatePath("/admin");
    revalidatePath("/admin/slots");
    revalidatePath("/admin/appointments");

    redirect(
      buildBookingUrl(
        "success",
        "Appointment request received. I will review it and follow up by email."
      ) as Route
    );
  }

  const fallbackFeedback =
    slotsResult.source === "env-missing"
      ? {
          tone: "error" as const,
          message:
            "Booking is temporarily unavailable because the Supabase service role key is not configured on the server."
        }
      : slotsResult.source === "error"
        ? {
            tone: "error" as const,
            message:
              slotsResult.errorMessage ??
              "Something went wrong while loading appointment slots."
          }
        : slotsResult.source === "empty"
          ? {
              tone: "info" as const,
              message: "There are no published appointment slots available right now."
            }
          : null;

  return (
    <main className="page-shell min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="section-panel px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                UBT scheduling
              </p>
              <h1 className="mt-2 font-body text-[clamp(2rem,5vw,2.75rem)] font-semibold tracking-[-0.03em] text-ink">
                Appointment booking
              </h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line/80 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-accent/40 hover:text-accent"
              >
                Back to homepage
              </Link>
              <a
                href="/admin"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/92"
              >
                Admin review
              </a>
            </div>
          </div>
        </div>

        <BookingForm
          action={submitBookingRequest}
          slots={slotsResult.slots}
          selectedSlotId={selectedSlotId}
          feedbackTone={feedbackStatus || fallbackFeedback?.tone}
          feedbackMessage={feedbackMessage || fallbackFeedback?.message}
        />
      </div>
    </main>
  );
}