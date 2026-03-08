# Database Design

All tables are defined in `supabase/schema.sql`. This document explains every table, its columns, and how they relate to each other.

---

## Entity Relationship Overview

```
auth.users (Supabase managed)
    │
    └──► profiles          ← one profile per auth user (role stored here)
              │
    ┌─────────┼──────────┬─────────────┐
    ▼         ▼          ▼             ▼
  doctors   staff     patients    (admin - no extra table)
    │         │          │
    │         │          └──► appointments ──► prescriptions
    │         │                    │
    └─────────┴── department_id ──►departments
```

---

## Tables

### `profiles`
Created automatically when a user registers. Linked 1-to-1 with `auth.users`.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | Same as `auth.users.id` |
| `full_name` | TEXT | User's display name |
| `role` | TEXT | `'patient'`, `'doctor'`, `'staff'`, or `'admin'` |
| `phone` | TEXT | Optional phone number |
| `avatar_url` | TEXT | Profile picture URL |
| `created_at` | TIMESTAMPTZ | Auto-set |
| `updated_at` | TIMESTAMPTZ | Auto-set |

**How it's populated:** A PostgreSQL trigger (`handle_new_user`) fires on every new `auth.users` insert and creates the matching profile row, reading `full_name`, `role`, and `phone` from the user's metadata.

---

### `departments`
Hospital departments (e.g. Cardiology, Neurology).

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | Auto-generated |
| `name` | TEXT | Unique department name |
| `description` | TEXT | Short description |
| `head_doctor_id` | UUID | Optional — not yet wired to UI |
| `created_at` | TIMESTAMPTZ | Auto-set |

**Who manages it:** Admin only.  
**Predefined list:** 30 standard hospital departments are available in the UI to select and add.

---

### `doctors`
Extra data for users with `role = 'doctor'`. One row per doctor.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | Auto-generated |
| `user_id` | UUID (FK → profiles) | Unique — one doctor per user |
| `department_id` | UUID (FK → departments) | Nullable — can be unassigned |
| `specialization` | TEXT | e.g. "Cardiology" |
| `qualification` | TEXT | e.g. "MBBS, MD" |
| `experience_years` | INTEGER | Years of experience |
| `is_available` | BOOLEAN | Whether doctor is currently taking patients |
| `created_at` | TIMESTAMPTZ | Auto-set |

---

### `staff`
Extra data for users with `role = 'staff'`. One row per staff member.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | Auto-generated |
| `user_id` | UUID (FK → profiles) | Unique — one record per user |
| `department_id` | UUID (FK → departments) | Nullable |
| `position` | TEXT | e.g. "Receptionist", "Nurse" |
| `shift` | TEXT | `'day'`, `'night'`, or `'rotating'` |
| `created_at` | TIMESTAMPTZ | Auto-set |

---

### `patients`
Extra data for users with `role = 'patient'`. One row per patient.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | Auto-generated |
| `user_id` | UUID (FK → profiles) | Unique — one record per user |
| `date_of_birth` | DATE | Optional |
| `gender` | TEXT | `'male'`, `'female'`, or `'other'` |
| `blood_group` | TEXT | e.g. "O+" |
| `address` | TEXT | Home address |
| `emergency_contact` | TEXT | Emergency contact info |
| `created_at` | TIMESTAMPTZ | Auto-set |

---

### `appointments`
The central workflow table. Connects patients, doctors, and departments.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | Auto-generated |
| `patient_id` | UUID (FK → patients) | Required |
| `doctor_id` | UUID (FK → doctors) | Nullable — assigned by staff |
| `department_id` | UUID (FK → departments) | Nullable — chosen by patient |
| `appointment_date` | DATE | Required |
| `appointment_time` | TIME | Required |
| `status` | TEXT | One of 5 values (see below) |
| `reason` | TEXT | Patient's reason for visit |
| `notes` | TEXT | Notes added by staff/doctor |
| `created_at` | TIMESTAMPTZ | Auto-set |
| `updated_at` | TIMESTAMPTZ | Auto-set |

**Status Values (the appointment pipeline):**

```
pending  →  verified  →  assigned  →  completed
                                           ↑
                                       (or cancelled at any point)
```

| Status | Set by | Meaning |
|---|---|---|
| `pending` | System (on creation) | Patient booked, awaiting review |
| `verified` | Staff | Staff confirmed it's valid |
| `assigned` | Staff | Staff assigned a specific doctor |
| `completed` | Doctor | Consultation done |
| `cancelled` | Anyone | Appointment cancelled |

---

### `prescriptions`
Created by doctors after completing an appointment.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | Auto-generated |
| `appointment_id` | UUID (FK → appointments) | Nullable |
| `patient_id` | UUID (FK → patients) | Required |
| `doctor_id` | UUID (FK → doctors) | Required |
| `diagnosis` | TEXT | Doctor's diagnosis text |
| `medications` | JSONB | Array of medication objects |
| `instructions` | TEXT | Doctor's instructions |
| `created_at` | TIMESTAMPTZ | Auto-set |

**medications JSONB example:**
```json
[
  { "name": "Paracetamol", "dose": "500mg", "frequency": "3x daily", "duration": "5 days" },
  { "name": "Amoxicillin", "dose": "250mg", "frequency": "2x daily", "duration": "7 days" }
]
```

---

## The `handle_new_user` Trigger

This is a PostgreSQL function that fires every time a new user is inserted into `auth.users`:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient'),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

This means: every user automatically gets a `profiles` row. The role defaults to `'patient'` if not specified — which is why the public signup always creates patients.

---

## Joining Data (How Queries Work)

Supabase JS uses PostgREST to fetch related data in one query:

```ts
// Example: Get all doctors with their profile and department name
const { data } = await supabase
  .from("doctors")
  .select(`
    *,
    profiles(full_name, phone),
    departments(name)
  `);
```

This is a **nested join** — equivalent to a SQL `LEFT JOIN`. The result has `doc.profiles.full_name` and `doc.departments.name` as nested objects.
