# Inventory Manager

A full-stack inventory management application built with Next.js 16, Neon (PostgreSQL), and Neon Auth.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Database:** Neon (Serverless PostgreSQL)
- **Authentication:** Neon Auth (Better Auth)
- **Styling:** Tailwind CSS 4, Lucide Icons
- **Charts:** Recharts
- **Email:** Nodemailer + Gmail SMTP

## Prerequisites

- Node.js 20+
- npm
- A [Neon](https://neon.tech) account with a project set up
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) (for email reports)

## Environment Variables

Copy `.env` to `.env.local` and fill in the values:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `NEON_AUTH_BASE_URL` | Yes | Neon Auth base URL (from Neon Console) |
| `NEON_AUTH_COOKIE_SECRET` | Yes | Run `openssl rand -base64 32` to generate |
| `NEXT_PUBLIC_SITE_URL` | Yes | `http://localhost:3000` for dev, production URL for deploy |
| `SMTP_EMAIL` | For reports | Gmail address for sending monthly reports |
| `SMTP_PASSWORD` | For reports | Gmail App Password (16 characters) |
| `CRON_SECRET` | For cron | Random string for cron job authorization |
| `ALLOW_SIGNUP` | No | Set to `true` to enable user registration |

## Getting Started

```bash
git clone <repo-url>
cd inventory-manager
npm install

# Run the database migration
npm run migrate

# Start the development server
npm run dev
```

The dev server runs at **https://localhost:3000** with a self-signed certificate. Your browser will show a warning — click "Advanced" → "Proceed to localhost (unsafe)" (this is a one-time step per browser).

## Setting Up Neon Auth

1. In the [Neon Console](https://console.neon.tech), select your project and branch
2. Enable **Neon Auth** on that branch (this provisions the `neon_auth` schema)
3. Copy the `NEON_AUTH_BASE_URL` from the console and add it to `.env`
4. Run the migration script to create the application tables:
   ```bash
   node scripts/migrate.mjs
   ```

## Creating the Admin Account

1. With `ALLOW_SIGNUP=true` in `.env`, start the server
2. Visit `/auth/sign-up`
3. Create your account
4. Set `ALLOW_SIGNUP=false` in `.env` and restart the server
5. Sign-ups are now disabled — only your account can log in

## Running Tests

Integration tests run against the live dev server using Vitest:

```bash
# Run once
npm test

# Watch mode
npm run test:watch

# Single test file
npx vitest run tests/api/items.test.ts
```

The test suite:
- Starts a Next.js dev server on port 3457
- Creates a test user and session
- Runs 33 tests across auth, categories, items, and stock-history endpoints
- Cleans up test data after each file

## Monthly Email Reports

The app can send monthly inventory reports via email.

**Report content:**
- Summary stats (total stock changes, items affected, net change)
- Currently out-of-stock items
- Items that went out of stock this month
- Top stock changes with reasons

**In development:**
Click the **"Send Report"** button on the dashboard to trigger a report immediately.

**In production:**
A Vercel Cron job fires automatically on the 1st of every month at midnight. The cron endpoint is protected by the `CRON_SECRET` environment variable.

Reports are sent to all user email addresses in the `neon_auth.user` table.

## Deployment to Vercel

1. Push the repository to GitHub/GitLab
2. Connect the repo in [Vercel](https://vercel.com)
3. Add all environment variables from the table above (Vercel → Project → Settings → Environment Variables)
4. Deploy
5. Visit `/auth/sign-up` once (before disabling sign-ups) to create your admin account
6. The cron schedule in `vercel.json` takes effect automatically on deploy

## Project Structure

```
app/
  (app)/              # Authenticated pages (dashboard, items, categories, stock history)
  api/                # API routes (items, categories, stock history, auth, reports)
  auth/               # Sign-in and sign-up pages
  actions/            # Server actions (send report)
components/
  items/              # Item list cards, forms, search, stock adjustment
  stock-history/      # History list, date filter, stock graph
  ui/                 # Reusable UI (image display, pagination, confirm dialog)
  layout/             # Sidebar and app layout
emails/               # React Email templates (monthly report)
lib/                  # Database client, auth helpers, validators, email, report queries
tests/                # Vitest integration tests
```
