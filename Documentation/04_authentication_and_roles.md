# Authentication & Role System

This document explains how users log in, how their role is determined, and how the app enforces that each user only accesses their own dashboard.

---

## Overview

Authentication is handled entirely by **Supabase Auth** (email + password). The **role** is stored in two places:

1. `auth.users.raw_user_meta_data` — a JSON column Supabase provides on the auth record, e.g. `{ "role": "doctor", "full_name": "Dr. Smith" }`
2. `public.profiles.role` — the application's own `profiles` table, synced via the `handle_new_user` trigger

The role in `user_metadata` is what the middleware reads (fast, available in the JWT). The role in `profiles` is what database security policies (RLS) check.

---

## Supabase Client Files

There are three different Supabase client helpers, each for a different context:

### `lib/supabaseClient.ts` — Browser (Client Components)
```ts
import { createBrowserClient } from "@supabase/ssr";
```
Used in client-side React components. Reads auth from browser cookies.

### `lib/supabaseServer.ts` — Next.js Server Components / Route Handlers
```ts
import { createServerClient } from "@supabase/ssr";
```
Used in API routes and server components. Reads auth from request cookies.

### `lib/supabaseAdmin.ts` — Server Only (bypasses RLS)
```ts
import { createClient } from "@supabase/supabase-js";
// uses SUPABASE_SERVICE_ROLE_KEY
```
Used only in admin API routes to perform actions that regular RLS would block (e.g. creating a new user record).  
⚠️ **Never import this in a client component.** The service role key would be exposed to the browser.

---

## Auth Functions (`lib/auth.ts`)

### `signUp(email, password, fullName, phone?)`
- Calls `supabase.auth.signUp()`
- Always sets `role: "patient"` in metadata — **public signup is patient-only**
- The `handle_new_user` trigger creates the `profiles` row automatically

### `signIn(email, password)`
- Calls `supabase.auth.signInWithPassword()`
- Returns the session; the JWT cookie is set automatically by `@supabase/ssr`

### `signOut()`
- Calls `supabase.auth.signOut()`
- Clears the session cookie

### `getUserRole(): Promise<UserRole | null>`
- Reads the role from the current session's `user_metadata`
- Returns `'patient' | 'doctor' | 'staff' | 'admin' | null`

### `getRolePath(role): string`
Maps role → dashboard path:
| Role | Path |
|---|---|
| `patient` | `/dashboard/patient` |
| `doctor` | `/dashboard/doctor` |
| `staff` | `/dashboard/staff` |
| `admin` | `/dashboard/admin` |

---

## Middleware: Route Protection (`middleware.ts`)

The middleware runs on **every request** that matches `/dashboard/:path*`, `/login`, or `/register`.

### What it does (in order):

**1. Check if the user is logged in**
```ts
const { data: { user } } = await supabase.auth.getUser();
```

**2. Unauthenticated user tries to access a dashboard**
```ts
if (pathname.startsWith("/dashboard") && !user) {
    redirect → /login
}
```

**3. Authenticated user tries to access login/register**
```ts
if (user && (pathname === "/login" || pathname === "/register")) {
    redirect → /dashboard/{role}
}
```

**4. Authenticated user accesses the wrong role's dashboard**
```ts
// e.g. a doctor trying to visit /dashboard/admin
if (dashboardRole !== role) {
    redirect → /dashboard/{role}  // their actual dashboard
}
```

This means you literally **cannot** access another role's dashboard even by typing the URL directly.

---

## How Admin Creates Doctor/Staff Accounts

Public signup always creates patients. Doctors and staff cannot self-register — the admin must create them.

The flow (via `/api/admin/create-user`):

```
1. Admin fills form in /dashboard/admin/doctors or /dashboard/admin/staff
2. Form POSTs to /api/admin/create-user
3. API verifies the requester is actually an admin (checks profiles table)
4. API uses supabaseAdmin (service role) to:
   a. Call auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { role, full_name } })
   b. The trigger auto-creates the profiles row
   c. API then inserts a row in doctors OR staff table with extra info
5. The new user can immediately log in with the provided credentials
```

The `email_confirm: true` flag skips email verification — the account is ready immediately.

---

## Row Level Security (RLS) — Database Layer

Even if someone bypasses the UI, the database itself enforces permissions.

### Helper Function
```sql
CREATE FUNCTION public.get_user_role() RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```
This reads the current authenticated user's role from the profiles table. It's used in every RLS policy.

### Policy Examples

**Profiles — Everyone sees their own, staff/admin see all:**
```sql
-- Own profile
USING (id = auth.uid())

-- Staff and admin
USING (public.get_user_role() IN ('staff', 'admin'))
```

**Appointments — Patient sees their own, doctor sees assigned:**
```sql
-- Patient
USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()))

-- Doctor
USING (doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()))

-- Staff sees all, Admin manages all
```

**Departments — Anyone authenticated can view, only admin can modify:**
```sql
-- Select (all authenticated)
USING (auth.uid() IS NOT NULL)

-- Insert/Update/Delete (admin only)
USING (public.get_user_role() = 'admin')
```

### Full Policy Matrix

| Table | Patient | Doctor | Staff | Admin |
|---|---|---|---|---|
| profiles | Own only | Assigned patients | All | All |
| departments | Read | Read | Read | Full CRUD |
| doctors | Read | Own update | Read | Full CRUD |
| staff | — | — | Own update | Full CRUD |
| patients | Own | Assigned | All | Full CRUD |
| appointments | Own | Assigned | All | Full CRUD |
| prescriptions | Own | Own | Read | Full CRUD |
