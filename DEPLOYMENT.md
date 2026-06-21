# RemedyPillsPharmacy — Deployment & Local Development

This project is a full-stack TypeScript app:
- **Backend:** Express (Node)
- **Frontend:** Vite + React
- **Database:** Postgres (via Drizzle ORM)

## Local development (VS Code)

### 1) Install dependencies
```bash
npm install
```

### 2) Create a local `.env`
Create a `.env` file (do **not** commit it) based on `.env.example`.

Typical local values:
```env
NODE_ENV=development
PORT=5050
APP_BASE_URL=http://localhost:5050
SESSION_SECRET=replace_with_a_long_random_secret
DATABASE_URL=postgres://localhost:5432/remedypills
```

### 3) Run database schema
```bash
npm run db:push
```

### 4) Start the server
```bash
npm run dev
```

Open: `http://localhost:5050`

> Note: macOS can reserve port **5000** for AirPlay/AirTunes, so 5050 is recommended.

## Deploy on DigitalOcean App Platform (current production target)

Chosen for Canada-region (Toronto/TOR1) availability for both compute and
managed Postgres, required for Alberta College of Pharmacy data residency.

High level:
1. Create a **Managed PostgreSQL** database cluster on DigitalOcean, region **TOR1 (Toronto)**.
2. Create a **Spaces** bucket, also in **TOR1**, for SMS media uploads (see `SPACES_*` env vars).
3. Create an **App Platform** Web Service from this GitHub repo, region **TOR1**.
4. Set environment variables (from `.env.example`), especially:
   - `DATABASE_URL` (from the Managed Postgres connection details)
   - `SESSION_SECRET`, `ADMIN_BOOTSTRAP_PASSWORD`, `CONTACT_WEBHOOK_SECRET`
   - `SPACES_REGION`, `SPACES_BUCKET`, `SPACES_KEY`, `SPACES_SECRET`
   - `APP_BASE_URL` (the assigned App Platform URL, or custom domain)
   - OAuth keys if you enable Google sign-in
5. Build & start:
   - Build command: `npm install --include=dev && npm run build` (`--include=dev` is required: npm skips devDependencies — including `tsx`/`vite`/`esbuild` which the build needs — whenever `NODE_ENV=production` is set, which it is here)
   - Run command: `npm run deploy` (runs `scripts/deploy.sh`, which pushes the DB schema if `DATABASE_URL` is set, then starts the server)

After deployment, avoid running `npm run db:push` manually against the production DB unless you understand the impact; use the `deploy` script or CI-based migration runs for production.

## Security notes
- Never commit `.env` (secrets).
- Use strong `SESSION_SECRET`.
- Keep the repo **private** if it includes any pharmacy operational logic.
