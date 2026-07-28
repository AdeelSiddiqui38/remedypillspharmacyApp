# RemedyPillsPharmacy — Deployment & Local Development

This project is a full-stack TypeScript app:
- **Backend:** Express (Node)
- **Frontend:** Vite + React
- **Database:** Postgres (via Drizzle ORM)
- **Platform:** Railway (production) — `app.remedypills.ca`

## Local development

### 1) Install dependencies
```bash
npm install
```

### 2) Create a local `.env`
Copy `.env.example` to `.env` and fill in local values:
```env
NODE_ENV=development
PORT=3000
APP_BASE_URL=http://localhost:3000
SESSION_SECRET=replace_with_a_long_random_secret
DATABASE_URL=postgres://localhost:5432/remedypills
```

### 3) Push database schema
```bash
npm run db:push
```

### 4) Start the server
```bash
npm run dev
```

Open: `http://localhost:3000`

---

## Production — Railway

**Live URL:** `https://app.remedypills.ca` (custom domain → `remedypillspharmacyapp-production.up.railway.app`)

### Environment variables (set in Railway → Variables)
| Variable | Description |
|---|---|
| `DATABASE_URL` | Railway Postgres internal URL (auto-injected) |
| `SESSION_SECRET` | Long random string |
| `ADMIN_BOOTSTRAP_PASSWORD` | First-run admin setup password |
| `APP_BASE_URL` | `https://app.remedypills.ca` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth credentials |
| `SPACES_REGION` / `SPACES_BUCKET` / `SPACES_KEY` / `SPACES_SECRET` | DigitalOcean Spaces (media uploads) |
| `CONTACT_WEBHOOK_SECRET` | Webhook HMAC secret |

### Deploy
Push to `main` branch → Railway auto-deploys. The deploy script (`scripts/deploy.sh`) runs DB migrations then starts the server.

### Railway services
- **remedypillspharmacyApp** — web service (port 8080)
- **Postgres** — managed database with persistent volume

---

## Mobile apps

### Android (Play Store)
- Built with Capacitor (`ca.remedypills.app`)
- Production config already synced: `capacitor.config.ts` points to `https://app.remedypills.ca`
- Release AAB ready: `android/app/build/outputs/bundle/release/app-release.aab`
- Signing: `android/keystore.properties` + `android/remedypills-release.keystore`
- Store listing copy: `store-listing/listing-content.md`

### iOS (App Store — future)
- Capacitor Xcode project at `ios/`
- Requires Apple Developer Program enrolment (Organisation, D&B number ready)

---

## Security notes
- Never commit `.env` (secrets live in Railway Variables only)
- Keep `android/keystore.properties` and `android/remedypills-release.keystore` out of public repos
