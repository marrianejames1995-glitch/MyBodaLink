# 🔌 Supabase Setup — Step by Step

This guide wires up the **login, sign-up, search and history** features of
MyBodaLink. Until this is done, those screens show
"Connect Supabase to continue".

> ⏱️ **~10 minutes.** Everything here is on the free Supabase tier — no card
> needed, no SMS provider needed (auth is phone + password under the hood).

---

## Step 1 — Create a Supabase project

1. Go to **https://supabase.com** and click **Start your project** (sign in with
   GitHub or email).
2. On the dashboard, click **New project**.
3. Fill in:
   - **Name:** `MyBodaLink` (anything you like)
   - **Database Password:** click *Generate* and **copy/save it somewhere safe**
     (you won't need it day-to-day, but keep it).
   - **Region:** pick the closest to Kenya — **Frankfurt (eu-central-1)** or
     **London (eu-west-2)** are good choices. (Supabase has no Africa region yet.)
   - **Pricing plan:** Free.
4. Click **Create new project** and wait ~2 min while it provisions.
   You'll land on a dashboard with a left-hand sidebar.

---

## Step 2 — Run the database schema

This creates your tables, security rules, the photo storage bucket, and the
account-deletion function. It's already written for you in your repo at
[`supabase/schema.sql`](./supabase/schema.sql).

1. In the Supabase sidebar, click **SQL Editor** (the `>_` icon).
2. Click **+ New query**.
3. Open the file `supabase/schema.sql` from your project (you can also view it
   on GitHub: `supabase/schema.sql`). **Select all of it → copy → paste** into
   the Supabase SQL editor.
4. Click the green **Run** button (or press `Ctrl/Cmd + Enter`).
5. You should see **`Success. No rows returned`** at the bottom.

✅ *That created:* the `profiles` table, the `connection_history` table, all the
Row-Level Security policies, the `profile_photos` storage bucket, and the
`delete_own_account()` function.

---

## Step 3 — Turn OFF email confirmation (important)

MyBodaLink logs users in *instantly* after sign-up using phone + password. This
only works if Supabase doesn't require email confirmation.

1. In the sidebar, click **Authentication** (the shield icon).
2. Click **Providers** → click **Email**.
3. Turn **OFF** the toggle: **`Confirm email`**.
4. Click **Save**.

✅ *Now users sign up and are logged straight in.*

---

## Step 4 — Copy your two credentials

You need two values to connect the app to your database:

1. In the sidebar, click **Project Settings** (the ⚙️ gear icon, bottom-left).
2. Click **API** in the sub-menu.
3. Copy these two values — keep the page open, you'll need them next:

   | Label in Supabase             | What it is                          |
   | ----------------------------- | ----------------------------------- |
   | **Project URL**               | looks like `https://abcdxyz.supabase.co` |
   | **Project API keys → `anon` `public`** | a long string starting with `eyJ...` |

> 🔐 **Safety note:** the **anon key** is safe to share/put in front-end code —
> it's protected by the Row-Level Security rules you just set up. **Never share
> the `service_role` key** — that one bypasses all security.

---

## Step 5 — Connect the app

You have two options.

### Option A — I redeploy for you (recommended)

Send me the two values:
- `VITE_SUPABASE_URL` = …your Project URL…
- `VITE_SUPABASE_ANON_KEY` = …your anon key…

I'll rebuild and redeploy the live site in one go, and login/search go live.

### Option B — You wire it up + redeploy yourself

Add them as **repo Secrets** (so they don't sit in plain text in your code):

1. GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**.
2. Add secret **Name:** `VITE_SUPABASE_URL`, **Value:** your Project URL. Save.
3. Add secret **Name:** `VITE_SUPABASE_ANON_KEY`, **Value:** your anon key. Save.
4. Tell me to redeploy (or push the `.github/workflows/deploy.yml` commit and it
   auto-rebuilds on every push).

---

## ✅ Verify it works

Once connected, on your live site:
1. Click **"I need a ride"** → fill in name, phone (e.g. `0712 345 678`),
   password → create account.
2. You should land on the client home page.
3. Go to **Supabase → Table Editor → `profiles`** — you'll see your new row. 🎉

If anything shows "Supabase not configured" after Step 5, the env vars didn't
get into the build — tell me and I'll debug.
