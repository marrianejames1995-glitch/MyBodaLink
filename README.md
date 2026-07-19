# MyBodaLink

**Connect clients with trusted boda riders and taxi drivers across Kenya.**
Search by county, town and area, then call or text a rider/driver instantly —
no app download friction for the rider, no middlemen.

A fast, installable (PWA) mobile-first web app built with React + Vite +
TypeScript + Tailwind, powered by Supabase (auth, database, storage).

---

## ✨ Features

- **Three account types** — Client, Boda Rider, Taxi Driver.
- **Phone-first auth** — sign up and log in with your Kenyan phone number + a
  password. No SMS provider required (see *How auth works* below).
- **Location search** — find riders/taxis by county, town and area, or by
  name / number plate.
- **One-tap connect** — `tel:` / `sms:` deep links open the dialer or messenger;
  every connection is saved to **History** automatically (de-duplicated per hour).
- **Profiles** — riders & drivers list their vehicle, registration and operating
  area; everyone can add a profile photo.
- **Emergency directory** — quick-dial national Kenyan police, ambulance, fire
  and helpline numbers.
- **Dark mode**, safe-area aware (notch) UI, and a fully offline-capable shell
  via the service worker.

---

## 🧱 Tech stack

| Layer       | Choice                                             |
| ----------- | -------------------------------------------------- |
| Framework   | React 18 + TypeScript                              |
| Build tool  | Vite 5                                             |
| Styling     | Tailwind CSS (class-based dark mode)               |
| Routing     | react-router-dom v6                                |
| Icons       | lucide-react                                       |
| Backend     | Supabase (Postgres, Auth, Storage)                 |
| PWA         | vite-plugin-pwa (Workbox, auto-update service worker) |

---

## 🚀 Getting started

### 1. Prerequisites

- **Node.js 18+** and npm
- A free [Supabase](https://supabase.com) project

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your Supabase project credentials (found in
**Supabase Dashboard → Project Settings → API**):

```bash
cp .env.example .env
```

```dotenv
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> If these are missing, the app still renders and shows a friendly
> "Supabase not configured" screen instead of crashing.

### 4. Set up the database

Open the Supabase **SQL Editor** and run [`supabase/schema.sql`](./supabase/schema.sql).
It creates the `profiles` and `connection_history` tables, enables Row-Level
Security with the right policies, creates the `profile_photos` storage bucket,
and defines the `delete_own_account()` RPC.

Then, in **Authentication → Providers → Email**, turn **"Confirm email" OFF**
so that phone-based sign-up logs the user in immediately.

### 5. Run it

```bash
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check + production build to /dist
npm run preview  # preview the production build locally
```

---

## 🔐 How auth works

To avoid paying for an SMS/OTP provider, MyBodaLink uses Supabase's built-in
**email + password** auth, but derives a stable internal email from each user's
phone number (see [`src/lib/phone.ts`](./src/lib/phone.ts)):

```
0712 345 678  →  +254712345678  →  254712345678@mybodalink.app
```

Users only ever see and type their phone number; the email is an internal
detail. To switch to real email or true phone OTP later, change the helpers in
`src/lib/phone.ts` and the `signIn`/`signUp` calls in
[`src/contexts/AuthContext.tsx`](./src/contexts/AuthContext.tsx).

---

## 📁 Project structure

```
src/
├── components/        # Reusable UI: AppLayout, BottomNav, ProviderCard, ui/*
├── contexts/          # AuthContext, ThemeContext, ToastContext
├── lib/               # supabase client, API layer, phone utils, types, constants
├── pages/
│   ├── auth/          # Login, Register, ForgotPassword, ResetPassword
│   ├── home/          # Home (routes to ClientHome or ProviderHome by role)
│   ├── Search.tsx     # Provider search by location / name / plate
│   ├── History.tsx    # Connection history (clients)
│   ├── Emergency.tsx  # Kenyan emergency contact directory
│   ├── Profile.tsx, EditProfile.tsx, ChangePassword.tsx
│   ├── Settings.tsx, About.tsx, ContactSupport.tsx
│   └── Landing.tsx
├── App.tsx            # Routes (public + protected under /app)
└── main.tsx
supabase/schema.sql    # Database schema, RLS, storage policies, RPC
```

The `@/` alias resolves to `src/` (configured in both `tsconfig.json` and
`vite.config.ts`).

---

## 📱 Installing as an app (PWA)

The production build emits a service worker and web manifest. Once deployed:

- **Android (Chrome)** — open the site → menu → *Install app*.
- **iOS (Safari)** — open the site → Share → *Add to Home Screen*.

Icons live in `public/` (regenerate with `scripts/gen_icons.py` if needed).

---

## 🛡️ Security model

- All tables use **Row-Level Security**. Users can read all profiles (needed for
  search) but only insert/update/delete **their own** profile and history rows.
- Account deletion runs through a `SECURITY DEFINER` RPC (`delete_own_account`)
  so a user can remove their own `auth.users` row, which cascades to their data.
- See [`supabase/schema.sql`](./supabase/schema.sql) for the full policy set.

---

## 📄 License

Private project. © MyBodaLink.
