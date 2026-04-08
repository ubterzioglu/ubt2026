You are a senior full-stack engineer. Build a production-ready "Book Appointment" system using Next.js (App Router), Tailwind CSS, and Supabase.

## PROJECT GOAL

Create a booking system for 15-minute and 30-minute consultation appointments. The system must include:

* Public booking page
* Admin panel (slot management + appointment management)
* Supabase database
* Email notification to admin only

No Google Calendar integration.

---

## TECH STACK

* Next.js (App Router)
* Tailwind CSS
* Supabase (PostgreSQL)
* Resend (for email sending)
* TypeScript

---

## CORE REQUIREMENTS

### 1. APPOINTMENT LOGIC

* Admin manually creates available time slots (date-based, not recurring)
* Each slot has:

  * start time
  * duration (15 or 30 minutes)
* Users can book only available slots
* Once booked, slot cannot be booked again
* One user can only have ONE active appointment at a time

---

### 2. USER BOOKING FORM

Fields:

* full_name (required)
* whatsapp_phone (required)
* topic (required)
* linkedin_url (optional)
* description (optional)

Rules:

* Normalize phone number (remove spaces, convert to international format)
* Prevent duplicate bookings using phone number (contact_key)
* User cannot book multiple active appointments

---

### 3. DATABASE SCHEMA (SUPABASE)

Create two tables:

#### appointment_slots

* id (uuid, primary key)
* start_at (timestamp with timezone, required)
* duration_minutes (integer, required: 15 or 30)
* is_active (boolean, default true)
* created_at (timestamp, default now)

#### appointments

* id (uuid, primary key)
* slot_id (uuid, foreign key to appointment_slots)
* full_name (text)
* whatsapp_phone (text)
* contact_key (text)
* topic (text)
* linkedin_url (text)
* description (text)
* status (text, default 'new')  // values: new, approved, completed, cancelled
* admin_note (text)
* created_at (timestamp)

Constraints:

* One appointment per slot
* One active appointment per contact_key (status = new or approved)

---

### 4. PUBLIC PAGE (/book-appointment)

UI:

* Display available slots (only active + not booked)
* Show:

  * date
  * time
  * duration
* User selects slot
* Then fills form
* Submit button

UX:

* Step 1: select slot
* Step 2: fill form
* Step 3: confirmation message

---

### 5. ADMIN PANEL

Route: /admin

#### A. Slot Management

* Create slot manually
* Fields:

  * date + time picker
  * duration (15 / 30)
* List all slots
* Activate / deactivate slot
* Delete slot

#### B. Appointment Management

* Table view with:

  * name
  * phone
  * topic
  * linkedin
  * description
  * slot time
  * duration
  * status
* Filters:

  * all / new / approved / completed / cancelled
* Actions:

  * change status
  * add admin note

---

### 6. EMAIL NOTIFICATION

When a booking is created:

* Send email to admin using Resend

Email content:

* Full Name
* Phone
* Topic
* LinkedIn
* Description
* Date & Time
* Duration

Do NOT send email to user.

---

### 7. BACKEND LOGIC (CRITICAL)

Before creating appointment:

* Check slot is still available
* Check no existing active appointment with same contact_key

Prevent race conditions:

* Use server-side validation (NOT only frontend)

---

### 8. SECURITY

* User cannot set status manually
* Only backend assigns status = 'new'
* Protect admin routes (simple auth or middleware)

---

### 9. FILE STRUCTURE (SUGGESTED)

/app
/book-appointment
/admin
/slots
/appointments

/components
/lib
/supabase
/utils
/validators

---

### 10. BONUS (IF TIME)

* Toast notifications
* Loading states
* Clean UI cards for slots
* Mobile responsive layout

---

## OUTPUT EXPECTATION

Generate:

1. Supabase SQL schema
2. Next.js folder structure
3. Core components (form, slot selector)
4. API / server actions
5. Email integration (Resend)
6. Example UI (Tailwind)

Write clean, production-ready code.

Avoid overengineering. Keep it simple and scalable.
