# Dashboards — Screen by Screen

Each role gets a completely separate dashboard with its own sidebar, navigation, and screens. The shared layout wraps every dashboard with a collapsible sidebar and a header.

---

## Shared Layout Components

### Sidebar (`components/Sidebar.tsx`)
A collapsible left sidebar that appears on all dashboards.

- Shows the **role name** and a color-coded avatar letter at the top (e.g. "A" for Admin, "D" for Doctor)
- Each role has a different **accent color** for active nav items
- Can be collapsed to icon-only mode by clicking the chevron at the bottom
- Active link is highlighted using the role's color

### Dashboard Layout (`components/DashboardLayout.tsx`)
Wraps each dashboard with:
- The `Sidebar` component
- A top header with the page title
- A `ThemeToggle` button for light/dark mode
- Sign-out button

---

## UI Components (`components/ui/`)

### `Card.tsx`
Stat cards displayed on every dashboard overview. Shows a label, numeric value, and an icon in a colored circle.

```tsx
<Card label="Total Patients" value={142} icon={Users} color="#0ea5e9" />
```

### `StatusBadge.tsx`
A coloured pill badge showing appointment status.

| Status | Color |
|---|---|
| `pending` | Amber / yellow |
| `verified` | Sky blue |
| `assigned` | Teal |
| `completed` | Green |
| `cancelled` | Red |

### `Modal.tsx`
A centred overlay modal with backdrop. Used for forms (create doctor, create staff, add departments, book appointment). Supports `size="lg"` for wider modals.

### `Skeleton.tsx`
Loading placeholder components shown while data is being fetched:
- `CardSkeleton` — replaces a stat card
- `TableSkeleton` — replaces a table or grid

### `Table.tsx`
A reusable table component with styled header and rows.

---

## Admin Dashboard

**Accent color:** Red/Rose gradient `from-red-500 to-rose-500`  
**Route prefix:** `/dashboard/admin`

### Admin Overview (`/dashboard/admin`)
**File:** `app/dashboard/admin/page.tsx`

Fetches `GET /api/admin/data?type=overview` and displays 5 stat cards:
- Total Patients
- Doctors
- Departments
- Appointments (all)
- Pending Approval (appointments with status `pending`)

No tables — just the high-level numbers at a glance.

---

### Manage Doctors (`/dashboard/admin/doctors`)
**File:** `app/dashboard/admin/doctors/page.tsx`

**What's on screen:**
- Grid of doctor cards, each showing:
  - Name, specialization
  - Department, qualification, experience
  - Phone
  - **Availability toggle** (clickable badge — green "Available" / red "Unavailable")
- **"Create Doctor Account" button** → opens a modal form

**Create Doctor Modal fields:**
| Field | Required |
|---|---|
| Full Name | ✅ |
| Email | ✅ |
| Password (min 6 chars) | ✅ |
| Phone | Optional |
| Department | Optional (dropdown) |
| Specialization | Optional |
| Qualification | Optional |
| Experience (years) | Optional |

On submit → `POST /api/admin/create-user` with `role: "doctor"`.

**Toggling availability** → `PATCH /api/admin/data` with `{ is_available: !current }`.

---

### Office Staff (`/dashboard/admin/staff`)
**File:** `app/dashboard/admin/staff/page.tsx`

Same layout as Doctors but for staff members. Cards show:
- Name, position, shift
- Department, phone, join date

**Create Staff Modal fields:**
| Field | Required |
|---|---|
| Full Name | ✅ |
| Email | ✅ |
| Password | ✅ |
| Phone | Optional |
| Department | Optional |
| Position | Optional |
| Shift (day/night/rotating) | Optional |

---

### Departments (`/dashboard/admin/departments`)
**File:** `app/dashboard/admin/departments/page.tsx`

**Features:**
- Lists all active departments as expandable cards
- Click a department → expands to show assigned **doctors** and **staff** with their details
- **"Add Departments" button** → modal with 30 predefined department options
  - Searchable list
  - Multi-select with checkboxes
  - "Select All" / "Deselect All" toggle
  - Already-added departments are filtered out automatically
- **Delete button** on each card (confirms before deleting; unlinks assigned doctors/staff)

---

## Doctor Dashboard

**Accent color:** Teal `#14b8a6`  
**Route prefix:** `/dashboard/doctor`

### Doctor Overview (`/dashboard/doctor`)
**File:** `app/dashboard/doctor/page.tsx`

4 stat cards:
- Total Assigned (all appointments ever)
- Today (today's appointments count)
- Prescriptions Written (total)
- Pending Review (assigned appointments not yet completed)

Below the cards: **Today's Appointments** list showing time, patient name, reason, and status badge.

---

### Doctor Patients (`/dashboard/doctor/patients`)
List of all patients who have had appointments with this doctor. Shows patient name and relevant info.

---

### Doctor Appointments (`/dashboard/doctor/appointments`)
Full list of appointments assigned to this doctor. Each row shows date, time, patient name, reason, and status. Doctor can mark appointments as `completed`.

---

### Doctor Prescriptions (`/dashboard/doctor/prescriptions`)
List of all prescriptions this doctor has written. Can write new prescriptions linked to a completed appointment.

---

## Patient Dashboard

**Accent color:** Sky blue `#0ea5e9`  
**Route prefix:** `/dashboard/patient`

### Patient Overview (`/dashboard/patient`)
**File:** `app/dashboard/patient/page.tsx`

4 stat cards:
- Total Appointments
- Upcoming (pending/verified/assigned)
- Completed
- Prescriptions received

Below: **Upcoming Appointments** list with date, time, assigned doctor (if any), department, and status badge.  
Empty state prompts "Book your first appointment!"

---

### Book Appointment (`/dashboard/patient/appointments`)
Form or list view to:
- See all appointments
- Book a new appointment (choose department, date, time, reason)

Submits to `POST /api/patient/appointments`.

---

### Patient Prescriptions (`/dashboard/patient/prescriptions`)
Shows all prescriptions issued to this patient:
- Diagnosis, medications list, instructions
- Which doctor wrote it, when

---

### Patient Profile (`/dashboard/patient/profile`)
View and edit personal details:
- Full name, phone (from profiles)
- Date of birth, gender, blood group, address, emergency contact (from patients table)

---

### Patient Departments (`/dashboard/patient/departments`)
Browse all available hospital departments to understand where to direct their appointment.

---

## Staff Dashboard

**Accent color:** Purple `#8b5cf6`  
**Route prefix:** `/dashboard/staff`

### Staff Overview (`/dashboard/staff`)
**File:** `app/dashboard/staff/page.tsx`

6 stat cards (the fullest overview of any role):
- Total (all appointments)
- Pending
- Verified
- Assigned
- Completed
- Doctors (count of all doctors)

Below: **Active Appointments** table showing the 8 most recent non-completed appointments across all departments, with patient name, doctor name, department, date/time, and status.

---

### Staff Appointments (`/dashboard/staff/appointments`)
Full appointment management:
- View ALL appointments across all departments
- **Verify** a `pending` appointment → sets status to `verified`
- **Assign** a `verified` appointment to an available doctor → sets status to `assigned` and stores `doctor_id`
- Filter by status

---

### Staff Doctors (`/dashboard/staff/doctors`)
Browse all doctors and their availability. Useful when deciding whom to assign appointments to.
