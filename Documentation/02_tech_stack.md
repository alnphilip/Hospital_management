# Tech Stack

Everything the project is built on — explained simply.

---

## Frontend Framework — Next.js 16 (App Router)

**What is it?**  
Next.js is a React framework that adds server-side rendering, file-based routing, and API routes on top of React. This project uses the **App Router** (the modern routing system introduced in Next.js 13+).

**Why it matters here:**
- Every folder inside `app/` becomes a URL route automatically.
- Server Components run on the server (no client JS sent for those pieces).
- Client Components (marked `"use client"`) run in the browser and handle state, events, and interactivity.
- API routes (inside `app/api/`) are serverless functions — no separate backend needed.

**Version:** `next: 16.1.6`

---

## UI Language — React 19 + TypeScript

**React 19** is the underlying UI library — everything is built as components.

**TypeScript** adds static typing on top of JavaScript, so:
- Every component's props are typed.
- API response shapes are defined with `interface`.
- Errors are caught at compile time instead of at runtime.

---

## Styling — Tailwind CSS v4

**What is it?**  
Tailwind is a utility-first CSS framework. Instead of writing custom CSS classes, you apply small utility classes directly in JSX:

```tsx
// Instead of .btn { background: blue; padding: 8px; }
<button className="bg-blue-500 px-4 py-2 text-white rounded-xl">
```

**Key things used in this project:**
- `dark:` prefix for dark mode variants (`dark:bg-slate-900`)
- `hover:` prefix for hover states
- `gradient` utilities for the colour gradients
- Responsive prefixes: `sm:`, `lg:`, `xl:`

**Version:** `tailwindcss: ^4` (configured via `@tailwindcss/postcss`)

---

## Backend / Database — Supabase

Supabase is an open-source Firebase alternative that provides:

### 1. PostgreSQL Database
A full relational database. All tables are defined in `supabase/schema.sql`.

### 2. Authentication (Auth)
Supabase Auth handles:
- User sign-up and sign-in (email + password)
- JWT tokens stored as cookies
- User metadata (where the `role` field is stored)

### 3. Row Level Security (RLS)
PostgreSQL policies that run on every database query and restrict what each user can read or write based on their role.  
Defined in `supabase/rls.sql`.

### 4. Service Role Key
A secret key that bypasses RLS entirely. Used only on the server in `lib/supabaseAdmin.ts` so admins can create users without being limited by their own permissions.

**Supabase JS SDK versions:**
- `@supabase/supabase-js: ^2.95.3` — the main client
- `@supabase/ssr: ^0.8.0` — the SSR helper for Next.js (handles cookie-based auth)

---

## Icon Library — Lucide React

```tsx
import { Calendar, Users, Stethoscope } from "lucide-react";
```

Over 1,000 clean SVG icons as React components. Used throughout all dashboards and UI elements.

**Version:** `lucide-react: ^0.563.0`

---

## Toast Notifications — React Hot Toast

```tsx
import toast from "react-hot-toast";
toast.success("Doctor account created!");
toast.error("Something went wrong.");
```

Lightweight library for showing success/error notifications in the bottom of the screen.

**Version:** `react-hot-toast: ^2.6.0`

---

## Summary Table

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 16 (App Router) | Routing, SSR, API routes |
| UI | React 19 | Component-based UI |
| Language | TypeScript 5 | Type safety |
| Styling | Tailwind CSS v4 | Utility-first CSS |
| Database | Supabase (PostgreSQL) | Data storage |
| Auth | Supabase Auth | Login, JWT, sessions |
| Security | Supabase RLS | Per-row data access control |
| Icons | Lucide React | SVG icon components |
| Notifications | React Hot Toast | Toast alerts |

---

## Environment Variables

These are stored in `.env.local` (never committed to git):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...  (safe to expose to browser)
SUPABASE_SERVICE_ROLE_KEY=eyJ...       (SECRET — server only)
```

- `NEXT_PUBLIC_*` variables are accessible in the browser.
- `SUPABASE_SERVICE_ROLE_KEY` is used only in server-side API routes and MUST never be sent to the client.
