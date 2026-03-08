# Workflows — End-to-End Process Flows

This document traces the complete journey of each key operation in the system, step by step, from UI interaction to database change.

---

## 1. Patient Self-Registration

```
Patient visits /register
    │
    ├─ Fills form: name, email, password, phone
    │
    ├─ Submits → lib/auth.ts signUp()
    │       └─ Calls supabase.auth.signUp({ role: "patient" })
    │
    ├─ Supabase creates row in auth.users
    │       └─ Trigger: handle_new_user() fires
    │               └─ Inserts row in public.profiles with role = 'patient'
    │
    ├─ Page redirects patient to /dashboard/patient
    │
    └─ Patient visits Profile page to complete their patients table record
            └─ POST /api/register-patient → inserts into public.patients
```

**Key point:** Self-registered users are always patients. The `role: "patient"` is hardcoded in `lib/auth.ts`.

---

## 2. Admin Creates a Doctor Account

```
Admin at /dashboard/admin/doctors
    │
    ├─ Clicks "Create Doctor Account"
    ├─ Fills the modal form (name, email, password, specialization, etc.)
    ├─ Submits → POST /api/admin/create-user
    │
    └─ API Route (/api/admin/create-user):
            │
            ├─ 1. Verify caller is authenticated (supabase.auth.getUser)
            ├─ 2. Verify caller is admin (fetch from profiles via adminClient)
            ├─ 3. adminClient.auth.admin.createUser({
            │       email, password,
            │       email_confirm: true,         ← no email verification!
            │       user_metadata: { full_name, role: "doctor" }
            │   })
            ├─ 4. Trigger fires → profiles row auto-created
            ├─ 5. adminClient inserts into public.doctors {
            │       user_id, department_id, specialization,
            │       qualification, experience_years
            │   }
            └─ 6. Returns 201 Created

    UI: toast.success → closes modal → loadData() re-fetches doctor list
```

---

## 3. Patient Books an Appointment

```
Patient at /dashboard/patient/appointments
    │
    ├─ Clicks "Book Appointment"
    ├─ Selects: department, date, time, reason
    ├─ Submits → POST /api/patient/appointments
    │
    └─ API:
            ├─ Gets logged-in patient's patients.id
            └─ Inserts into public.appointments {
                    patient_id, department_id,
                    appointment_date, appointment_time,
                    reason, status: "pending"  ← default
               }

    Result: Appointment is now "pending", visible on Staff dashboard
```

---

## 4. Staff Verifies an Appointment

```
Staff at /dashboard/staff/appointments
    │
    ├─ Sees appointment with status: "pending"
    ├─ Clicks "Verify"
    └─ PATCH /api/staff/appointments
            └─ UPDATE appointments SET status = 'verified' WHERE id = ?

    Result: Status changes to "verified", ready for doctor assignment
```

---

## 5. Staff Assigns a Doctor

```
Staff at /dashboard/staff/appointments
    │
    ├─ Sees appointment with status: "verified"
    ├─ Selects a doctor from dropdown (only available doctors shown)
    ├─ Clicks "Assign"
    └─ PATCH /api/staff/appointments
            └─ UPDATE appointments
               SET status = 'assigned', doctor_id = <selected doctor's id>
               WHERE id = ?

    Result: Appointment is now "assigned" with a specific doctor
            Doctor can now see this appointment on their dashboard
```

---

## 6. Doctor Completes an Appointment

```
Doctor at /dashboard/doctor/appointments
    │
    ├─ Sees appointment with status: "assigned"
    ├─ Reviews patient details
    ├─ Clicks "Mark Complete"
    └─ PATCH /api/doctor/appointments
            └─ UPDATE appointments SET status = 'completed' WHERE id = ?

    Optionally:
    Doctor goes to /dashboard/doctor/prescriptions
        ├─ Clicks "Write Prescription"
        ├─ Fills: diagnosis, medications (JSONB array), instructions
        └─ POST /api/doctor/prescriptions
                └─ INSERT into public.prescriptions {
                        appointment_id, patient_id, doctor_id,
                        diagnosis, medications, instructions
                   }
```

---

## 7. Patient Views Prescription

```
Patient at /dashboard/patient/prescriptions
    │
    └─ GET /api/patient/data?type=prescriptions
            └─ SELECT * FROM prescriptions
               WHERE patient_id IN (
                   SELECT id FROM patients WHERE user_id = auth.uid()
               )
               (RLS automatically restricts to their own data)

    Patient sees: Diagnosis, medication list, doctor name, date
```

---

## 8. Admin Adds a Department

```
Admin at /dashboard/admin/departments
    │
    ├─ Clicks "Add Departments"
    ├─ Sees searchable list of 30 predefined departments
    │   (already-added ones are filtered out)
    ├─ Selects one or more departments (checkbox, multi-select)
    ├─ Clicks "Add N Department(s)"
    └─ POST /api/admin/data
            └─ INSERT into public.departments (name, description)
               for each selected department

    Result: Departments immediately appear on the departments page
            and are available when booking appointments / assigning staff
```

---

## 9. Admin Toggles Doctor Availability

```
Admin at /dashboard/admin/doctors
    │
    ├─ Sees a doctor card with "Available" badge
    ├─ Clicks the badge
    └─ PATCH /api/admin/data
            └─ UPDATE doctors SET is_available = !current WHERE id = ?

    Effect: Doctor marked "Unavailable" won't appear in staff's
            doctor assignment dropdown
```

---

## 10. Login & Role-Based Redirect

```
Any user at /login
    │
    ├─ Enters email + password
    ├─ Submits → lib/auth.ts signIn()
    │       └─ supabase.auth.signInWithPassword()
    │               └─ Sets JWT cookie on browser
    │
    └─ Page reads user_metadata.role
            └─ Redirects to /dashboard/{role}

    middleware.ts intercepts all /dashboard/* requests:
        - Unauthenticated → /login
        - Wrong role path → correct /dashboard/{role}
        - Already logged in, visiting /login → /dashboard/{role}
```

---

## Full Appointment Lifecycle at a Glance

```
PATIENT → [Books]
    ↓
status: "pending"          (Staff sees it)

STAFF → [Verifies]
    ↓
status: "verified"         (Staff prepares to assign)

STAFF → [Assigns doctor]
    ↓
status: "assigned"         (Doctor sees it on their dashboard)

DOCTOR → [Completes]
    ↓
status: "completed"        (Patient sees completed in history)
    │
    └── DOCTOR → [Writes Prescription]
                    ↓
            Prescription visible to Patient
```

At any point → can be set to `cancelled`.
