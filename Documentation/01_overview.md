# Smart Hospital Workflow System — Project Overview

## What Is This Project?

**Smart Hospital Workflow System** is a full-stack web application that digitises and streamlines hospital operations. It provides role-based dashboards for four types of users — **Patients**, **Doctors**, **Staff**, and **Administrators** — each seeing only the data and tools relevant to their role.

Think of it as an internal hospital portal where:
- Patients book appointments and track prescriptions.
- Doctors manage their schedule and write prescriptions.
- Staff verify and assign appointments to doctors.
- Admins manage the entire system — users, departments, analytics.

---

## Key Features

| Feature | Description |
|---|---|
| 🔐 Role-based access | Four distinct dashboards, each locked to the correct user type |
| 📅 Appointment pipeline | `pending → verified → assigned → completed` lifecycle managed by different roles |
| 👨‍⚕️ Doctor management | Admin creates doctor accounts; doctors manage their own availability |
| 🏥 Department system | Admin adds departments from a predefined list with one click |
| 📋 Prescriptions | Doctors write prescriptions linked to appointments |
| 🌙 Theme System | System-wide light/dark mode with smooth transitions |
| 📱 Responsive Design | Mobile-first UI that works perfectly across all devices |
| ✨ Premium UI | Glassmorphism, animated background shaders, and high-fidelity aesthetics |
| 🔒 Row-level security | Every database query is restricted by Supabase RLS policies |

---

## Application Flow (Big Picture)

```
Landing Page (/)
    │
    ├── /register  →  Anyone can self-register as a PATIENT
    │
    └── /login     →  All roles log in here
                            │
                ┌───────────┼────────────┬───────────────┐
                ▼           ▼            ▼               ▼
        /dashboard/  /dashboard/  /dashboard/   /dashboard/
          patient      doctor       staff         admin
```

After login, **Next.js middleware** reads the user's role from their JWT and redirects them automatically to the correct dashboard. A user cannot manually navigate to another role's dashboard.

---

## Who Can Do What

### Patient
- Register for an account (self-service)
- Book appointments with a department
- View appointment status & history
- View prescriptions issued by doctors
- Update their own profile

### Doctor
- Log in (account created by admin)
- View today's appointments grouped by status
- View patient list (only their assigned patients)
- Write prescriptions for completed appointments

### Staff
- Log in (account created by admin)
- See **all** appointments across all departments
- Verify pending appointments → `pending → verified`
- Assign appointments to available doctors → `verified → assigned`
- Mark appointments as completed

### Admin
- Create doctor and staff accounts
- Add or remove hospital departments
- View system-wide analytics (total patients, doctors, departments, appointments)
- Toggle doctor availability

---

## Project Name & Branding

- **Internal name:** `hospital_management`
- **Display name:** SmartHospital / Smart Hospital Workflow System
- **Color palette:** Sky blue (`#0ea5e9`) and Teal (`#14b8a6`) — used for the landing page and gradients
- Each dashboard has its own accent color (sky, teal, purple, red)

---

## Where to Go Next

| Document | Topic |
|---|---|
| `02_tech_stack.md` | Technologies and libraries used |
| `03_database.md` | Tables, columns, and relationships |
| `04_authentication_and_roles.md` | Login, signup, JWT, middleware |
| `05_api_routes.md` | All API endpoints and what they do |
| `06_dashboards.md` | Each dashboard explained screen by screen |
| `07_workflows.md` | End-to-end process flows |
| `08_project_structure.md` | Folder and file map |
| `09_setup_guide.md` | How to clone and run the project locally |
