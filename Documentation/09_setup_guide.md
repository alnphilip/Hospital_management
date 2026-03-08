# Setup Guide — How to Clone and Run This Project

Follow these steps to get the project running on your local machine from scratch. No prior knowledge of Supabase or Next.js is required.

---

## Prerequisites

Install these before starting:

| Tool | Version | Download |
|---|---|---|
| Node.js | 18+ | https://nodejs.org |
| npm | comes with Node | — |
| Git | any | https://git-scm.com |

To verify your installations:
```bash
node --version   # should print v18.x.x or higher
npm --version    # should print 9.x.x or higher
git --version    # should print git version x.x.x
```

---

## Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd hospital_management
```

---

## Step 2: Install Dependencies

```bash
npm install
```

This installs everything listed in `package.json` — Next.js, Supabase SDK, Tailwind, etc.

---

## Step 3: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up (free)
2. Click **New Project**
3. Give it a name (e.g. "hospital-management"), choose a region, set a database password
4. Wait for the project to be created (takes ~30 seconds)

---

## Step 4: Set Up the Database

In your Supabase project:

1. Go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy and paste the entire contents of `supabase/schema.sql` into the editor
4. Click **Run** — this creates all the tables and the trigger
5. Click **New Query** again
6. Copy and paste the entire contents of `supabase/rls.sql` into the editor
7. Click **Run** — this enables Row Level Security and creates all policies

---

## Step 5: Get Your Supabase Keys

1. In your Supabase project, go to **Settings → API**
2. Copy the following values:
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - **anon / public** key — a long string starting with `eyJ...`
   - **service_role** key — another long string (keep this secret!)

---

## Step 6: Create the Environment File

In the root of the project, create a file called `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace the values with the ones you copied from Step 5.

> ⚠️ **Never share or commit `.env.local`**. The `.gitignore` already excludes it.

---

## Step 7: Create an Admin Account

Admin accounts cannot self-register. You must create one manually:

### Method A — Supabase Dashboard
1. Go to **Authentication → Users → Add User**
2. Enter email (e.g. `admin@hospital.com`) and a password
3. Click **Create User**
4. Copy the **User UID** shown in the user list
5. Go to **SQL Editor → New Query** and run:

```sql
-- Replace <user-uuid> with the actual UUID from step 4
UPDATE public.profiles
SET role = 'admin', full_name = 'System Administrator'
WHERE id = '<user-uuid>';

UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}', '"admin"'
)
WHERE id = '<user-uuid>';
```

---

## Step 8: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You should see the SmartHospital landing page.

---

## Step 9: First Login

1. Go to [http://localhost:3000/login](http://localhost:3000/login)
2. Log in with the admin email and password you created in Step 7
3. You'll be redirected to `/dashboard/admin`
4. From here you can:
   - **Add departments** (Departments tab)
   - **Create doctor accounts** (Doctors tab)
   - **Create staff accounts** (Staff tab)

---

## Typical First-Use Sequence

```
1. Log in as Admin
2. Add departments (e.g. Cardiology, Emergency Medicine)
3. Create doctor accounts (e.g. dr.smith@hospital.com)
4. Create staff accounts (e.g. staff.jane@hospital.com)
5. Log out

6. Register as a new patient at /register
7. Book an appointment on the patient dashboard

8. Log in as staff → verify and assign the appointment
9. Log in as doctor → complete the appointment and write a prescription
10. Log in as patient → see the prescription
```

---

## Available Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start development server (hot reload on code changes) |
| `npm run build` | Build for production |
| `npm run start` | Start production server (requires build first) |
| `npm run lint` | Run ESLint to check for code issues |

---

## Common Issues

### "Missing SUPABASE_SERVICE_ROLE_KEY" error
- Make sure `.env.local` exists in the project root
- Make sure there are no spaces around the `=` sign
- Restart the dev server after creating/editing `.env.local`

### After creating a doctor/staff, they don't appear in the list
- The admin data endpoint uses `supabaseAdmin` — if the service role key is wrong or missing, the fetch will fail silently
- Check browser DevTools → Network tab to see the API response

### Can't log in / "Invalid credentials"
- Double-check email and password
- If you created the user via SQL admin, make sure you also ran the `UPDATE raw_user_meta_data` query

### RLS policies blocking queries
- Make sure both `schema.sql` and `rls.sql` were both run in order
- The `get_user_role()` function must exist before the policies can reference it — `rls.sql` creates it at the top

### Dark mode not working
- The theme toggle stores preference in `localStorage` — it works only in the browser, not during server rendering
- A brief flash of the wrong theme on first load is normal (called FOUC — Flash of Unstyled Content)

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Public anon key (safe for browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role key (server only — keep secret!) |
