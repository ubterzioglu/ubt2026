import "server-only";

import type { Appointment } from "@/types/appointment";

export type EmailDeliveryState = "sent" | "skipped" | "error";

export interface EmailDeliveryResult {
  state: EmailDeliveryState;
  errorMessage?: string;
}

const createdAtFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "full",
  timeStyle: "short"
});

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatAppointmentTimestamp(timestamp: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: timezone
  }).format(new Date(timestamp));
}

export async function sendNewBookingNotification(
  appointment: Appointment
): Promise<EmailDeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.APPOINTMENT_NOTIFICATION_TO;

  if (!apiKey || !to || !appointment.slot) {
    return {
      state: "skipped"
    };
  }

  const from =
    process.env.APPOINTMENT_NOTIFICATION_FROM ??
    "UBT Appointments <onboarding@resend.dev>";
  const replyTo =
    process.env.APPOINTMENT_NOTIFICATION_REPLY_TO ?? appointment.email;
  const slotLabel = formatAppointmentTimestamp(
    appointment.slot.startsAt,
    appointment.slot.timezone
  );
  const notesText =
    appointment.notes?.trim() && appointment.notes.trim().length > 0
      ? appointment.notes.trim()
      : "No additional notes.";
  const companyText =
    appointment.company?.trim() && appointment.company.trim().length > 0
      ? appointment.company.trim()
      : "Not provided";

  const text = [
    "A new appointment request was submitted.",
    "",
    `Name: ${appointment.fullName}`,
    `Email: ${appointment.email}`,
    `Company: ${companyText}`,
    `Slot: ${slotLabel}`,
    `Location: ${appointment.slot.location ?? "Not specified"}`,
    `Status: ${appointment.status}`,
    "",
    "Notes:",
    notesText
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #141f27; line-height: 1.6;">
      <h2 style="margin-bottom: 16px;">New appointment request</h2>
      <p style="margin: 0 0 8px;"><strong>Name:</strong> ${escapeHtml(appointment.fullName)}</p>
      <p style="margin: 0 0 8px;"><strong>Email:</strong> ${escapeHtml(appointment.email)}</p>
      <p style="margin: 0 0 8px;"><strong>Company:</strong> ${escapeHtml(companyText)}</p>
      <p style="margin: 0 0 8px;"><strong>Slot:</strong> ${escapeHtml(slotLabel)}</p>
      <p style="margin: 0 0 8px;"><strong>Location:</strong> ${escapeHtml(appointment.slot.location ?? "Not specified")}</p>
      <p style="margin: 0 0 8px;"><strong>Created:</strong> ${escapeHtml(
        createdAtFormatter.format(new Date(appointment.createdAt))
      )}</p>
      <p style="margin: 16px 0 8px;"><strong>Notes</strong></p>
      <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(notesText)}</p>
    </div>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `appointment-${appointment.id}`
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `New appointment request from ${appointment.fullName}`,
        html,
        text,
        reply_to: replyTo
      }),
      cache: "no-store"
    });

    if (!response.ok) {
      const payload = (await response.text()).trim();

      return {
        state: "error",
        errorMessage:
          payload || `Resend request failed with status ${response.status}.`
      };
    }

    return {
      state: "sent"
    };
  } catch (error) {
    return {
      state: "error",
      errorMessage: error instanceof Error ? error.message : "Unknown email error"
    };
  }
}