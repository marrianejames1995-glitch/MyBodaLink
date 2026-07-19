# 🌐 MyBodaLink — live deployment

Your app is built and published to the **`gh-pages`** branch. Once the one
GitHub setting below is switched on, it will be live at:

## 👉 https://marrianejames1995-glitch.github.io/MyBodaLink/

---

## ✅ One-time step to go live (takes ~30 seconds)

The sandbox agent that built this isn't allowed to change GitHub Pages settings,
so you need to flip it once:

1. Open **Settings → Pages**:
   https://github.com/marrianejames1995-glitch/MyBodaLink/settings/pages
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Under **Branch**, select **`gh-pages`** and folder **`/ (root)`**.
4. Click **Save**.

The site goes live within 1–2 minutes (watch the green bar at the top of that
page). Refresh and your link above will work.

---

## 🔌 Make login & search work (add Supabase)

The site loads and looks great as soon as it's live, but Sign up / Login /
Search will show **"Supabase not configured"** until you add credentials. It's
free and takes a few minutes:

1. Create a project at https://supabase.com (free tier).
2. Open **SQL Editor** and run [`supabase/schema.sql`](./supabase/schema.sql).
3. In **Authentication → Providers → Email**, turn **"Confirm email" OFF**
   (so phone sign-ups log in instantly).
4. In **Project Settings → API**, copy your **Project URL** and **anon key**.
5. Rebuild the site with those values (see below) and re-push `gh-pages`.

### Rebuilding with Supabase wired in

Because the keys are injected at *build* time, add them to your local `.env`:

```bash
cp .env.example .env
# then edit .env:
#   VITE_SUPABASE_URL=https://xxxx.supabase.co
#   VITE_SUPABASE_ANON_KEY=eyJ...
```

Then rebuild & redeploy:

```bash
BASE_PATH=/MyBodaLink/ npm run build
cp dist/index.html dist/404.html
# push dist/ contents to the gh-pages branch (as the deploy agent did)
```

> If you add the CI workflow (`.github/workflows/deploy.yml` — it's in the
> branch but the sandbox agent isn't permitted to push workflow files, so push
> it yourself or grant the agent **Workflows** write access), you can instead
> store the two values as repo **Secrets** named
> `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, and every push to `main`
> will rebuild + redeploy automatically.

---

## 🔁 How updates are deployed

- **Manual (what just happened):** build locally → push `dist/` to the
  `gh-pages` branch.
- **Automatic (optional):** add `.github/workflows/deploy.yml` to `main`;
  it builds with `BASE_PATH=/MyBodaLink/`, adds the `404.html` SPA fallback,
  and publishes to Pages on every push.

The build uses `BASE_PATH=/MyBodaLink/` because GitHub Pages serves this repo
under that subpath (see `vite.config.ts`).
