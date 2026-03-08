# API Routes

All API endpoints live inside `app/api/`. They are Next.js **Route Handlers** — serverless functions that run on the server and are accessed via HTTP.

---

## Admin API Routes

### `POST /api/admin/create-user`
**File:** `app/api/admin/create-user/route.ts`

Creates a new doctor or staff user account. Only callable by an authenticated admin.

**Request body:**
```json
{
  "email": "doctor@hospital.com",
  "password": "securepass",
  "full_name": "Dr. John Smith",
  "phone": "+91 99999 00000",
  "role": "doctor",
  "extra": {
    "department_id": "uuid-of-dept",
    "specialization": "Cardiology",
    "qualification": "MBBS, MD",
    "experience_years": 5
  }
}
```
For `role: "staff"`, `extra` contains `{ position, shift, department_id }`.

**Steps the API performs:**
1. Verifies the calling user is authenticated
2. Uses `supabaseAdmin` to fetch their profile and confirm `role === 'admin'`
3. Creates the auth user with `email_confirm: true` (no email verification needed)
4. Inserts a row in `doctors` or `staff` table with the extra data

**Response codes:**
| Code | Meaning |
|---|---|
| 201 | User created successfully |
| 207 | User auth created but role-specific record failed |
| 400 | Missing fields or invalid role |
| 401 | Not authenticated |
| 403 | Not an admin |
| 500 | Internal error |

---

### `GET /api/admin/data?type=<type>`
**File:** `app/api/admin/data/route.ts`

Fetches data for the admin dashboard. The `type` query parameter determines what is returned.

| `type` | Returns |
|---|---|
| `overview` | Counts for patients, doctors, departments, and all appointments |
| `doctors` | All doctors with profile and department info |
| `staff` | All staff with profile and department info |
| `departments` | All departments |
| `dept-members` | Doctors and staff in a specific department (pass `&deptId=uuid`) |

**Example request:**
```
GET /api/admin/data?type=doctors
```

**Example response:**
```json
{
  "doctors": [
    {
      "id": "...",
      "specialization": "Cardiology",
      "is_available": true,
      "profiles": { "full_name": "Dr. Smith", "phone": "+91..." },
      "departments": { "name": "Cardiology" }
    }
  ],
  "departments": [...]
}
```

---

### `POST /api/admin/data` — Insert records
Used to add departments (and potentially other records).

**Request body:**
```json
{
  "table": "departments",
  "records": [
    { "name": "Cardiology", "description": "Heart care" },
    { "name": "Neurology", "description": "Brain disorders" }
  ]
}
```

---

### `PATCH /api/admin/data` — Update a record
Used to update a single field (e.g. toggle doctor availability).

**Request body:**
```json
{
  "table": "doctors",
  "id": "uuid-of-doctor-row",
  "updates": { "is_available": false }
}
```

---

### `DELETE /api/admin/data?table=departments&id=<uuid>`
Deletes a record. Doctors/staff assigned to the deleted department are unlinked (FK is SET NULL).

---

## Doctor API Routes

### `GET /api/doctor/data?type=<type>`

| `type` | Returns |
|---|---|
| `overview` | Stats (total, today, pending appointments, prescriptions written) + today's appointments |
| `patients` | All patients who have appointments with this doctor |
| `appointments` | All appointments assigned to this doctor |
| `prescriptions` | All prescriptions written by this doctor |

Uses the session to determine the logged-in doctor automatically.

---

## Patient API Routes

### `GET /api/patient/data?type=<type>`

| `type` | Returns |
|---|---|
| `overview` | Stats (total, upcoming, completed appointments, prescriptions count) + upcoming appointment list |

### `GET /api/patient/appointments`
Returns all appointments for the logged-in patient, with doctor and department info.

### `POST /api/patient/appointments`
Creates a new appointment.

**Request body:**
```json
{
  "department_id": "uuid",
  "appointment_date": "2026-03-15",
  "appointment_time": "10:30:00",
  "reason": "Chest pain"
}
```

### `GET /api/patient/profile`
Returns the patient's profile and patient record.

### `PATCH /api/patient/profile`
Updates profile fields.

---

## Staff API Routes

### `GET /api/staff/appointments`
Returns all appointments across all departments (staff sees everything), plus all doctors list (for assignment).

### `PATCH /api/staff/appointments`
Updates appointment status or assigns a doctor.

**Request body (verify):**
```json
{ "id": "appointment-uuid", "status": "verified" }
```

**Request body (assign doctor):**
```json
{
  "id": "appointment-uuid",
  "doctor_id": "doctor-uuid",
  "status": "assigned"
}
```

---

## Register Patient API Route

### `POST /api/register-patient`
Called after a patient signs up. Creates the `patients` table record (the auth user and profile row are already created by Supabase Auth + trigger).

**Request body:**
```json
{
  "date_of_birth": "1990-05-15",
  "gender": "male",
  "blood_group": "O+",
  "address": "123 Main St",
  "emergency_contact": "+91 98765 00000"
}
```

---

## Common Patterns

All API routes follow the same structure:

```ts
export async function GET(request: NextRequest) {
    // 1. Create server-side Supabase client (reads auth from cookies)
    const supabase = await createClient();
    
    // 2. Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    // 3. Query the database (RLS automatically filters what this user can see)
    const { data, error } = await supabase.from("table").select("*");
    
    // 4. Return JSON response
    return NextResponse.json({ data });
}
```

For admin routes that need to bypass RLS, the additional step is:
```ts
const adminClient = createAdminClient(); // uses service role key
const { data: profile } = await adminClient.from("profiles").select("role").eq("id", user.id).single();
if (profile.role !== "admin") return 403;
```
