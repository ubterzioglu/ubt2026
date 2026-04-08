export const APPOINTMENT_STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "cancelled"
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export type AppointmentSourceState = "remote" | "env-missing" | "empty" | "error";

export interface AppointmentSlot {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startsAt: string;
  endsAt: string;
  timezone: string;
  isPublic: boolean;
  isBooked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentSlotInput {
  title: string;
  description?: string | null;
  location?: string | null;
  startsAt: string;
  endsAt: string;
  timezone?: string;
  isPublic?: boolean;
}

export interface AppointmentSlotSummary {
  id: string;
  title: string;
  location: string | null;
  startsAt: string;
  endsAt: string;
  timezone: string;
}

export interface Appointment {
  id: string;
  slotId: string;
  status: AppointmentStatus;
  fullName: string;
  email: string;
  company: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  slot: AppointmentSlotSummary | null;
}

export interface AppointmentBookingInput {
  slotId: string;
  fullName: string;
  email: string;
  company?: string | null;
  notes?: string | null;
}

export interface AppointmentSlotsResult {
  source: AppointmentSourceState;
  errorMessage?: string;
  slots: AppointmentSlot[];
}

export interface AppointmentsResult {
  source: AppointmentSourceState;
  errorMessage?: string;
  appointments: Appointment[];
}

export interface AppointmentMutationResult<T> {
  ok: boolean;
  errorMessage?: string;
  data?: T;
}