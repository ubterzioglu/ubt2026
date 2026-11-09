import type { BadgeTone } from "@/app/admin/_components/admin-panels";
import type { AppointmentStatus } from "@/types/appointment";

export const APPOINTMENT_STATUS_TONE: Record<AppointmentStatus, BadgeTone> = {
  pending: "warning",
  confirmed: "info",
  completed: "success",
  cancelled: "danger"
};
