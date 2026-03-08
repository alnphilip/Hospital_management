# Project Structure

A complete map of every folder and file in the project with a short description of what each one does.

---

## Root Level

```
hospital_management/
├── app/                    # All pages, layouts, and API routes (Next.js App Router)
├── components/             # Reusable React components
├── lib/                    # Utility/helper functions and Supabase clients
├── public/                 # Static assets (images, icons)
├── supabase/               # Database schema and RLS SQL files
├── Documentation/          # This documentation folder
├── .env.local              # Environment variables (NOT committed to git)
├── .env.example            # Template for env vars (safe to commit)
├── middleware.ts           # Next.js route protection middleware
├── next.config.ts          # Next.js configuration
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── postcss.config.mjs      # PostCSS / Tailwind configuration
```

---

## `app/` — Pages & API

```
app/
├── layout.tsx              # Root layout: applies fonts, Toaster, global CSS
├── globals.css             # Global styles, CSS variables, dark mode config
├── page.tsx                # Landing page (/)
├── favicon.ico             # Browser tab icon
│
├── login/
│   └── page.tsx            # Login form page (/login)
│
├── register/
│   └── page.tsx            # Patient registration page (/register)
│
├── api/                    # All API route handlers (serverless functions)
│   ├── admin/
│   │   ├── create-user/
│   │   │   └── route.ts    # POST — admin creates doctor/staff accounts
│   │   └── data/
│   │       └── route.ts    # GET/POST/PATCH/DELETE — admin data operations
│   ├── doctor/
│   │   └── data/
│   │       └── route.ts    # GET — doctor's appointments, patients, prescriptions
│   ├── patient/
│   │   ├── appointments/
│   │   │   └── route.ts    # GET/POST — patient's appointments
│   │   ├── data/
│   │   │   └── route.ts    # GET — patient overview stats
│   │   └── profile/
│   │       └── route.ts    # GET/PATCH — patient profile data
│   ├── staff/
│   │   └── appointments/
│   │       └── route.ts    # GET/PATCH — all appointments for staff
│   └── register-patient/
│       └── route.ts        # POST — create patients table record after signup
│
└── dashboard/              # Protected dashboard pages
    ├── admin/
    │   ├── layout.tsx       # Admin layout with sidebar (red/rose color)
    │   ├── page.tsx         # Admin overview — stat cards
    │   ├── doctors/
    │   │   └── page.tsx     # Manage doctors — grid cards, create modal
    │   ├── staff/
    │   │   └── page.tsx     # Manage staff — grid cards, create modal
    │   └── departments/
    │       └── page.tsx     # Manage departments — expandable cards, add modal
    │
    ├── doctor/
    │   ├── layout.tsx       # Doctor layout with sidebar (teal color)
    │   ├── page.tsx         # Doctor overview — today's appointments
    │   ├── patients/
    │   │   └── page.tsx     # Doctor's patient list
    │   ├── appointments/
    │   │   └── page.tsx     # Full appointment list for this doctor
    │   └── prescriptions/
    │       └── page.tsx     # Write and view prescriptions
    │
    ├── patient/
    │   ├── layout.tsx       # Patient layout with sidebar (sky blue color)
    │   ├── page.tsx         # Patient overview — upcoming appointments
    │   ├── appointments/
    │   │   └── page.tsx     # Book appointment / view all appointments
    │   ├── prescriptions/
    │   │   └── page.tsx     # View prescriptions
    │   ├── departments/
    │   │   └── page.tsx     # Browse departments
    │   └── profile/
    │       └── page.tsx     # View and edit patient profile
    │
    └── staff/
        ├── layout.tsx       # Staff layout with sidebar (purple color)
        ├── page.tsx         # Staff overview — 6 stat cards, active appointments
        ├── appointments/
        │   └── page.tsx     # Full appointment management (verify, assign)
        └── doctors/
            └── page.tsx     # View all doctors (for reference when assigning)
```

---

## `components/` — Reusable UI

```
components/
├── DashboardLayout.tsx     # Wraps every dashboard: sidebar + header + content area
├── Sidebar.tsx             # Collapsible navigation sidebar (role-based links/colors)
├── ThemeToggle.tsx         # Light/dark mode toggle button
└── ui/
    ├── Card.tsx            # Stat card (label, value, icon, color)
    ├── Modal.tsx           # Overlay modal dialog with backdrop
    ├── Skeleton.tsx        # Loading placeholders (CardSkeleton, TableSkeleton)
    ├── StatusBadge.tsx     # Colored pill for appointment status
    └── Table.tsx           # Reusable table with styled header and rows
```

---

## `lib/` — Helpers & Supabase Clients

```
lib/
├── auth.ts                 # signUp, signIn, signOut, getSession, getUserRole, getRolePath
├── supabaseClient.ts       # createBrowserClient — for client components
├── supabaseServer.ts       # createServerClient — for API routes and server components
└── supabaseAdmin.ts        # createClient with service_role key — bypasses RLS (server only!)
```

---

## `supabase/` — Database SQL

```
supabase/
├── schema.sql              # CREATE TABLE statements + handle_new_user trigger
└── rls.sql                 # ALTER TABLE ENABLE ROW LEVEL SECURITY + all CREATE POLICY
```

Run `schema.sql` first, then `rls.sql` in the Supabase SQL Editor.

---

## Key Files Explained

### `middleware.ts`
The "gatekeeper". Runs before every page request to:
- Redirect unauthenticated users to `/login`
- Redirect authenticated users away from auth pages
- Prevent users from accessing other roles' dashboards

### `app/layout.tsx`
The root layout wrapping the entire app. Sets:
- HTML lang attribute
- Global font (from Google Fonts or Tailwind defaults)
- `<Toaster />` from react-hot-toast at root level (so notifications work everywhere)

### `.env.local`
Contains secrets that are never committed:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### `app/globals.css`
Global CSS including:
- Tailwind base/components/utilities imports
- Custom CSS variables for the gradient text effect
- Dark mode body background
- Animation classes (`animate-fade-in`)
