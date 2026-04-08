import type { AppointmentSlot } from "@/types/appointment";

interface SlotSelectorProps {
  name: string;
  slots: AppointmentSlot[];
  selectedSlotId?: string;
}

function formatSlotRange(slot: AppointmentSlot): string {
  const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: slot.timezone
  });
  const endFormatter = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: slot.timezone
  });

  return `${dateFormatter.format(new Date(slot.startsAt))} to ${endFormatter.format(
    new Date(slot.endsAt)
  )}`;
}

export function SlotSelector({ name, slots, selectedSlotId }: SlotSelectorProps) {
  if (slots.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-line/80 bg-paper/70 px-5 py-6 text-sm text-ink/72">
        No open appointment slots are available right now.
      </div>
    );
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">
        Choose a slot
      </legend>
      <div className="grid gap-3">
        {slots.map((slot, index) => {
          const isDefault = selectedSlotId ? slot.id === selectedSlotId : index === 0;

          return (
            <label key={slot.id} className="block cursor-pointer">
              <input
                type="radio"
                name={name}
                value={slot.id}
                defaultChecked={isDefault}
                required
                className="peer sr-only"
              />
              <span className="block rounded-[1.5rem] border border-line/80 bg-white/85 px-5 py-4 shadow-sm transition peer-checked:border-accent/70 peer-checked:bg-accent/5 peer-checked:shadow-[0_20px_45px_rgba(27,122,110,0.16)] hover:border-accent/35">
                <span className="block text-base font-semibold text-ink">{slot.title}</span>
                <span className="mt-1 block text-sm text-ink/74">{formatSlotRange(slot)}</span>
                <span className="mt-2 block text-sm text-ink/68">
                  {slot.location ?? "Remote / flexible location"}
                </span>
                {slot.description ? (
                  <span className="mt-3 block text-sm leading-6 text-ink/68">
                    {slot.description}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}