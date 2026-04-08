# Plan: Appointment Booking System

## Overview
Add a complete appointment booking workflow backed by Supabase. The feature should include slot management, public booking, admin review surfaces, email notification support, and a homepage entry point before the Contact section.

---

## 5a. Supabase Migration SQL

**Files:** `supabase/migrations/001_appointment_slots.sql`, `supabase/migrations/002_appointments.sql`

### Changes:
- Create `supabase/migrations/001_appointment_slots.sql`.
- Create `supabase/migrations/002_appointments.sql`.
- Define the database structure for:
  - appointment slots
  - booked appointments

---

## 5b. Type Definitions

**Files:** `types/appointment.ts`

### Changes:
- Create `types/appointment.ts`.
- Define types for the booking feature, including:
  - `AppointmentSlot`
  - `Appointment`

---

## 5c. Data Layer

**Files:** `lib/appointments.ts`

### Changes:
- Create `lib/appointments.ts`.
- Add slot CRUD operations.
- Add appointment CRUD operations.
- Keep the API surface aligned with the Supabase tables created in the migrations.

---

## 5d. Public Booking Page

**Files:** `app/book-appointment/page.tsx`, `components/appointment/slot-selector.tsx`, `components/appointment/booking-form.tsx`

### Changes:
- Create `app/book-appointment/page.tsx`.
- Create `components/appointment/slot-selector.tsx`.
- Create `components/appointment/booking-form.tsx`.
- Build the public flow so visitors can:
  - choose an available slot
  - submit booking details

---

## 5e. Admin Panel

**Files:** `app/admin/page.tsx`, `app/admin/slots/page.tsx`, `app/admin/appointments/page.tsx`

### Changes:
- Create `app/admin/page.tsx` for the dashboard.
- Create `app/admin/slots/page.tsx` for slot management.
- Create `app/admin/appointments/page.tsx` for appointment management.
- Support:
  - reviewing slots
  - managing appointment state
  - viewing booked appointment details

---

## 5f. Email Integration

**Files:** `lib/email.ts`

### Changes:
- Create `lib/email.ts`.
- Integrate admin notification email sending using Resend.
- Use the module for new booking notifications.

---

## 5g. Homepage Section

**Files:** `app/page.tsx`

### Changes:
- Add a new "Book Appointment" section before Contact.
- Include a short explanation and a CTA leading to `/book-appointment`.

---

## Implementation Order

1. Create the Supabase migrations.
2. Add booking-related types in `types/appointment.ts`.
3. Build `lib/appointments.ts`.
4. Create the public booking page and its components.
5. Create the admin pages.
6. Add Resend integration in `lib/email.ts`.
7. Add the homepage section before Contact.

---

## Notes

- This plan intentionally keeps subareas `5a` to `5g` in one standalone file.
- Authentication, validation detail, and rollout behavior can be refined during implementation if needed.
- Run `npm run lint` and `npm run typecheck` after implementation.
