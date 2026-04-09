import { SlotSelector } from "@/components/appointment/slot-selector";
import type { AppointmentSlot } from "@/types/appointment";

interface BookingFormProps {
  action: (formData: FormData) => Promise<void>;
  slots: AppointmentSlot[];
  selectedSlotId?: string;
  feedbackTone?: "success" | "error" | "info";
  feedbackMessage?: string;
}

const toneClasses: Record<NonNullable<BookingFormProps["feedbackTone"]>, string> = {
  success: "border-emerald-200 bg-emerald-50/90 text-emerald-900",
  error: "border-rose-200 bg-rose-50/95 text-rose-900",
  info: "border-line/80 bg-paper/80 text-ink/80"
};

export function BookingForm({
  action,
  slots,
  selectedSlotId,
  feedbackTone,
  feedbackMessage
}: BookingFormProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
      <form
        action={action}
        className="rounded-[1.75rem] border border-line/70 bg-white/72 px-6 py-7 sm:px-8 sm:py-8"
      >
        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
              Request a meeting
            </p>
            <h2 className="mt-3 font-body text-[clamp(1.9rem,5vw,2.5rem)] font-semibold tracking-[-0.02em] text-ink">
              Book an appointment
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/72 sm:text-base">
              Pick an open slot, add your details, and I will review the request before
              confirming it by email.
            </p>
          </div>

          {feedbackMessage ? (
            <div
              className={`rounded-[1.35rem] border px-4 py-3 text-sm leading-6 ${
                toneClasses[feedbackTone ?? "info"]
              }`}
            >
              {feedbackMessage}
            </div>
          ) : null}

          <SlotSelector name="slotId" slots={slots} selectedSlotId={selectedSlotId} />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink">Full name</span>
              <input
                type="text"
                name="fullName"
                required
                minLength={2}
                className="w-full rounded-[1rem] border border-line/80 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent/55 focus:ring-2 focus:ring-accent/15"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink">Email</span>
              <input
                type="email"
                name="email"
                required
                className="w-full rounded-[1rem] border border-line/80 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent/55 focus:ring-2 focus:ring-accent/15"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm font-medium text-ink">Company or context</span>
              <input
                type="text"
                name="company"
                className="w-full rounded-[1rem] border border-line/80 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-accent/55 focus:ring-2 focus:ring-accent/15"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm font-medium text-ink">What would you like to cover?</span>
              <textarea
                name="notes"
                rows={5}
                className="w-full rounded-[1rem] border border-line/80 bg-white px-4 py-3 text-sm leading-6 text-ink shadow-sm outline-none transition focus:border-accent/55 focus:ring-2 focus:ring-accent/15"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={slots.length === 0}
            className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition hover:-translate-y-0.5 hover:bg-accent/95 disabled:cursor-not-allowed disabled:bg-line disabled:shadow-none"
          >
            Send appointment request
          </button>
        </div>
      </form>

      <aside className="rounded-[1.75rem] border border-line/70 bg-gradient-to-br from-white/78 via-paper/86 to-mist/78 px-6 py-7 sm:px-8 sm:py-8">
        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sunrise">
              What happens next
            </p>
            <h3 className="mt-3 font-body text-[clamp(1.6rem,4vw,2rem)] font-semibold tracking-[-0.02em] text-ink">
              Simple review-first workflow
            </h3>
          </div>
          <div className="space-y-4 text-sm leading-7 text-ink/72">
            <div className="rounded-[1.35rem] border border-line/80 bg-white/80 px-4 py-4">
              1. You choose a published slot that is still open.
            </div>
            <div className="rounded-[1.35rem] border border-line/80 bg-white/80 px-4 py-4">
              2. Your request lands in the admin review panel with your notes.
            </div>
            <div className="rounded-[1.35rem] border border-line/80 bg-white/80 px-4 py-4">
              3. I confirm, complete, or cancel the appointment after review.
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-line/80 bg-gradient-to-br from-paper via-white to-mist/90 px-5 py-5 text-sm leading-7 text-ink/72">
            If none of the slots fit, you can still reach out through the contact links on the
            homepage and we can arrange another time.
          </div>
        </div>
      </aside>
    </div>
  );
}
