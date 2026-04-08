import "server-only";

import { createClient } from "@supabase/supabase-js";

import type {
  Appointment,
  AppointmentBookingInput,
  AppointmentMutationResult,
  AppointmentsResult,
  AppointmentSlot,
  AppointmentSlotInput,
  AppointmentSlotsResult,
  AppointmentStatus
} from "@/types/appointment";

interface AppointmentSlotRow {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string;
  timezone: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  appointments?: Array<{
    id: string;
    status: AppointmentStatus;
  }> | null;
}

interface AppointmentRow {
  id: string;
  slot_id: string;
  status: AppointmentStatus;
  full_name: string;
  email: string;
  company: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  appointment_slots: Array<{
    id: string;
    title: string;
    location: string | null;
    starts_at: string;
    ends_at: string;
    timezone: string;
  }> | null;
}

const activeStatuses = new Set<AppointmentStatus>(["pending", "confirmed"]);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeOptionalText(value: string | null | undefined): string | null {
  const normalized = value?.trim() ?? "";
  return normalized.length > 0 ? normalized : null;
}

function createEmptySlotsResult(
  source: AppointmentSlotsResult["source"]
): AppointmentSlotsResult {
  return {
    source,
    slots: []
  };
}

function createEmptyAppointmentsResult(
  source: AppointmentsResult["source"]
): AppointmentsResult {
  return {
    source,
    appointments: []
  };
}

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return {
    url,
    serviceRoleKey
  };
}

function createServiceSupabaseClient() {
  const env = getSupabaseEnv();

  if (!env) {
    return null;
  }

  return createClient(env.url, env.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

function toAppointmentSlot(row: AppointmentSlotRow): AppointmentSlot {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    location: row.location,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    timezone: row.timezone,
    isPublic: row.is_public,
    isBooked: (row.appointments ?? []).some((appointment) =>
      activeStatuses.has(appointment.status)
    ),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toAppointment(row: AppointmentRow): Appointment {
  const slot = row.appointment_slots?.[0] ?? null;

  return {
    id: row.id,
    slotId: row.slot_id,
    status: row.status,
    fullName: row.full_name,
    email: row.email,
    company: row.company,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    slot: slot
      ? {
          id: slot.id,
          title: slot.title,
          location: slot.location,
          startsAt: slot.starts_at,
          endsAt: slot.ends_at,
          timezone: slot.timezone
        }
      : null
  };
}

function validateSlotInput(
  input: AppointmentSlotInput
): AppointmentMutationResult<AppointmentSlotInput> {
  const title = input.title.trim();
  const startsAt = input.startsAt.trim();
  const endsAt = input.endsAt.trim();
  const timezone = input.timezone?.trim() || "Europe/Berlin";

  if (title.length < 3) {
    return {
      ok: false,
      errorMessage: "Slot title must be at least 3 characters long."
    };
  }

  if (!startsAt || !endsAt) {
    return {
      ok: false,
      errorMessage: "Start and end times are required."
    };
  }

  const startDate = new Date(startsAt);
  const endDate = new Date(endsAt);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return {
      ok: false,
      errorMessage: "Use full ISO 8601 timestamps for slot start and end values."
    };
  }

  if (endDate <= startDate) {
    return {
      ok: false,
      errorMessage: "The slot end time must be later than the start time."
    };
  }

  return {
    ok: true,
    data: {
      title,
      description: normalizeOptionalText(input.description),
      location: normalizeOptionalText(input.location),
      startsAt: startDate.toISOString(),
      endsAt: endDate.toISOString(),
      timezone,
      isPublic: input.isPublic ?? true
    }
  };
}

function validateBookingInput(
  input: AppointmentBookingInput
): AppointmentMutationResult<AppointmentBookingInput> {
  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();

  if (!input.slotId.trim()) {
    return {
      ok: false,
      errorMessage: "Please choose an appointment slot."
    };
  }

  if (fullName.length < 2) {
    return {
      ok: false,
      errorMessage: "Please provide your full name."
    };
  }

  if (!emailPattern.test(email)) {
    return {
      ok: false,
      errorMessage: "Please provide a valid email address."
    };
  }

  return {
    ok: true,
    data: {
      slotId: input.slotId.trim(),
      fullName,
      email,
      company: normalizeOptionalText(input.company),
      notes: normalizeOptionalText(input.notes)
    }
  };
}

export function getAdminAccessKey(): string | null {
  const accessKey = process.env.APPOINTMENT_ADMIN_ACCESS_KEY?.trim();
  return accessKey ? accessKey : null;
}

export function hasAdminAccess(candidate: string | null | undefined): boolean {
  const accessKey = getAdminAccessKey();

  if (!accessKey) {
    return true;
  }

  return candidate?.trim() === accessKey;
}

export async function getAvailableAppointmentSlots(): Promise<AppointmentSlotsResult> {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return createEmptySlotsResult("env-missing");
  }

  try {
    const { data, error } = await supabase
      .from("appointment_slots")
      .select(
        "id, title, description, location, starts_at, ends_at, timezone, is_public, created_at, updated_at, appointments(id, status)"
      )
      .eq("is_public", true)
      .gt("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true });

    if (error) {
      throw error;
    }

    const slots = ((data ?? []) as AppointmentSlotRow[])
      .map(toAppointmentSlot)
      .filter((slot) => !slot.isBooked);

    return {
      source: slots.length > 0 ? "remote" : "empty",
      slots
    };
  } catch (error) {
    return {
      source: "error",
      errorMessage:
        error instanceof Error ? error.message : "Unknown appointment slot error",
      slots: []
    };
  }
}

export async function getAllAppointmentSlots(): Promise<AppointmentSlotsResult> {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return createEmptySlotsResult("env-missing");
  }

  try {
    const { data, error } = await supabase
      .from("appointment_slots")
      .select(
        "id, title, description, location, starts_at, ends_at, timezone, is_public, created_at, updated_at, appointments(id, status)"
      )
      .order("starts_at", { ascending: true });

    if (error) {
      throw error;
    }

    const slots = ((data ?? []) as AppointmentSlotRow[]).map(toAppointmentSlot);

    return {
      source: slots.length > 0 ? "remote" : "empty",
      slots
    };
  } catch (error) {
    return {
      source: "error",
      errorMessage:
        error instanceof Error ? error.message : "Unknown appointment slot error",
      slots: []
    };
  }
}

export async function getAllAppointments(): Promise<AppointmentsResult> {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return createEmptyAppointmentsResult("env-missing");
  }

  try {
    const { data, error } = await supabase
      .from("appointments")
      .select(
        "id, slot_id, status, full_name, email, company, notes, created_at, updated_at, appointment_slots(id, title, location, starts_at, ends_at, timezone)"
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const appointments = ((data ?? []) as AppointmentRow[]).map(toAppointment);

    return {
      source: appointments.length > 0 ? "remote" : "empty",
      appointments
    };
  } catch (error) {
    return {
      source: "error",
      errorMessage:
        error instanceof Error ? error.message : "Unknown appointment error",
      appointments: []
    };
  }
}

export async function createAppointmentSlot(
  input: AppointmentSlotInput
): Promise<AppointmentMutationResult<AppointmentSlot>> {
  const validation = validateSlotInput(input);

  if (!validation.ok || !validation.data) {
    return {
      ok: false,
      errorMessage: validation.errorMessage
    };
  }

  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return {
      ok: false,
      errorMessage: "Supabase service role credentials are missing."
    };
  }

  try {
    const { data, error } = await supabase
      .from("appointment_slots")
      .insert({
        title: validation.data.title,
        description: validation.data.description,
        location: validation.data.location,
        starts_at: validation.data.startsAt,
        ends_at: validation.data.endsAt,
        timezone: validation.data.timezone,
        is_public: validation.data.isPublic
      })
      .select(
        "id, title, description, location, starts_at, ends_at, timezone, is_public, created_at, updated_at, appointments(id, status)"
      )
      .single();

    if (error) {
      throw error;
    }

    return {
      ok: true,
      data: toAppointmentSlot(data as AppointmentSlotRow)
    };
  } catch (error) {
    return {
      ok: false,
      errorMessage:
        error instanceof Error ? error.message : "Unable to create appointment slot."
    };
  }
}

export async function updateAppointmentSlot(
  slotId: string,
  input: AppointmentSlotInput
): Promise<AppointmentMutationResult<AppointmentSlot>> {
  const validation = validateSlotInput(input);

  if (!validation.ok || !validation.data) {
    return {
      ok: false,
      errorMessage: validation.errorMessage
    };
  }

  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return {
      ok: false,
      errorMessage: "Supabase service role credentials are missing."
    };
  }

  try {
    const { data, error } = await supabase
      .from("appointment_slots")
      .update({
        title: validation.data.title,
        description: validation.data.description,
        location: validation.data.location,
        starts_at: validation.data.startsAt,
        ends_at: validation.data.endsAt,
        timezone: validation.data.timezone,
        is_public: validation.data.isPublic
      })
      .eq("id", slotId)
      .select(
        "id, title, description, location, starts_at, ends_at, timezone, is_public, created_at, updated_at, appointments(id, status)"
      )
      .single();

    if (error) {
      throw error;
    }

    return {
      ok: true,
      data: toAppointmentSlot(data as AppointmentSlotRow)
    };
  } catch (error) {
    return {
      ok: false,
      errorMessage:
        error instanceof Error ? error.message : "Unable to update appointment slot."
    };
  }
}

export async function deleteAppointmentSlot(
  slotId: string
): Promise<AppointmentMutationResult<{ id: string }>> {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return {
      ok: false,
      errorMessage: "Supabase service role credentials are missing."
    };
  }

  try {
    const { error } = await supabase
      .from("appointment_slots")
      .delete()
      .eq("id", slotId);

    if (error) {
      throw error;
    }

    return {
      ok: true,
      data: {
        id: slotId
      }
    };
  } catch (error) {
    return {
      ok: false,
      errorMessage:
        error instanceof Error ? error.message : "Unable to delete appointment slot."
    };
  }
}

export async function createAppointment(
  input: AppointmentBookingInput
): Promise<AppointmentMutationResult<Appointment>> {
  const validation = validateBookingInput(input);

  if (!validation.ok || !validation.data) {
    return {
      ok: false,
      errorMessage: validation.errorMessage
    };
  }

  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return {
      ok: false,
      errorMessage: "Supabase service role credentials are missing."
    };
  }

  try {
    const { data: slotData, error: slotError } = await supabase
      .from("appointment_slots")
      .select(
        "id, title, description, location, starts_at, ends_at, timezone, is_public, created_at, updated_at, appointments(id, status)"
      )
      .eq("id", validation.data.slotId)
      .single();

    if (slotError) {
      throw slotError;
    }

    const slot = toAppointmentSlot(slotData as AppointmentSlotRow);

    if (!slot.isPublic || slot.isBooked || new Date(slot.startsAt) <= new Date()) {
      return {
        ok: false,
        errorMessage: "That slot is no longer available. Please choose another one."
      };
    }

    const { data, error } = await supabase
      .from("appointments")
      .insert({
        slot_id: validation.data.slotId,
        status: "pending",
        full_name: validation.data.fullName,
        email: validation.data.email,
        company: validation.data.company,
        notes: validation.data.notes
      })
      .select(
        "id, slot_id, status, full_name, email, company, notes, created_at, updated_at, appointment_slots(id, title, location, starts_at, ends_at, timezone)"
      )
      .single();

    if (error) {
      throw error;
    }

    return {
      ok: true,
      data: toAppointment(data as AppointmentRow)
    };
  } catch (error) {
    return {
      ok: false,
      errorMessage:
        error instanceof Error
          ? error.message
          : "Unable to submit the appointment request."
    };
  }
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus
): Promise<AppointmentMutationResult<Appointment>> {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return {
      ok: false,
      errorMessage: "Supabase service role credentials are missing."
    };
  }

  try {
    const { data, error } = await supabase
      .from("appointments")
      .update({
        status
      })
      .eq("id", appointmentId)
      .select(
        "id, slot_id, status, full_name, email, company, notes, created_at, updated_at, appointment_slots(id, title, location, starts_at, ends_at, timezone)"
      )
      .single();

    if (error) {
      throw error;
    }

    return {
      ok: true,
      data: toAppointment(data as AppointmentRow)
    };
  } catch (error) {
    return {
      ok: false,
      errorMessage:
        error instanceof Error ? error.message : "Unable to update appointment status."
    };
  }
}