export type AppointmentFeedbackTone = "success" | "error" | "info";

export type SearchParamsRecord = Record<string, string | string[] | undefined>;

interface BuildAppointmentSectionUrlOptions {
  params?: SearchParamsRecord;
  status?: AppointmentFeedbackTone;
  message?: string;
  slotId?: string;
}

export function readSearchParam(
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

export function readAppointmentFeedbackTone(
  value: string | string[] | undefined
): AppointmentFeedbackTone | undefined {
  const tone = readSearchParam(value);

  if (tone === "success" || tone === "error" || tone === "info") {
    return tone;
  }

  return undefined;
}

export function buildAppointmentSectionUrl({
  params,
  status,
  message,
  slotId
}: BuildAppointmentSectionUrlOptions = {}): string {
  const searchParams = new URLSearchParams();

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === "string") {
        searchParams.set(key, value);
        continue;
      }

      if (Array.isArray(value)) {
        for (const item of value) {
          searchParams.append(key, item);
        }
      }
    }
  }

  if (status) {
    searchParams.set("status", status);
  }

  if (message) {
    searchParams.set("message", message);
  }

  if (slotId) {
    searchParams.set("slot", slotId);
  }

  const query = searchParams.toString();

  return query ? `/?${query}#book-appointment` : "/#book-appointment";
}
