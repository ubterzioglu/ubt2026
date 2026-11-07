export const DEFAULT_SLOT_TIMEZONE = "Europe/Berlin";

export function formatSlotTime(
  startsAt: string,
  endsAt: string,
  timezone: string
): string {
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
