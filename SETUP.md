# Harch Atelier — Database Setup Guide

This guide walks you through setting up a Neon PostgreSQL database and connecting it to the Harch Atelier project on Vercel.

## Why Neon?

- **Serverless Postgres** — scales to zero, pays only for what you use
- **Free tier** — 0.5 GB storage, 1 always-available branch (enough for dev)
- **Branching** — create a DB branch per Git branch (great for testing schema changes)
- **Compatible with Prisma** — our schema is already PostgreSQL-native
- **Vercel-native** — one-click integration from Vercel dashboard

## Step 1 — Create a Neon account & project

1. Go to https://neon.tech
2. Sign up with GitHub (use your `Vitalcheffe` account)
3. Click **New Project**
4. Name it `harch-atelier`
5. Region: `AWS Frankfurt (eu-central-1)` — closest to Morocco/Europe
6. Postgres version: 16 (default)
7. Click **Create**

## Step 2 — Get your connection string

After creating the project, Neon shows you a connection string like:

```
postgresql://harch_atelier_owner:AbCdEfGh@ep-harch-atelier-12345.eu-central-1.aws.neon.tech/harch_atelier?sslmode=require
```

Copy this. You'll need it for Vercel.

## Step 3 — Set env vars on Vercel

In your Vercel project (harch-atelier):

1. Go to **Settings → Environment Variables**
2. Add these:

| Key | Value | Environments |
|-----|-------|--------------|
| `DATABASE_URL` | `postgresql://...?sslmode=require` | Production, Preview, Development |
| `DIRECT_URL` | `postgresql://...?sslmode=require` | Production, Preview, Development |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://atelier.harchcorp.com` | Production |
| `NEXTAUTH_URL` | `https://<preview-url>.vercel.app` | Preview |
| `SETUP_TOKEN` | A random string (e.g. `openssl rand -hex 16`) | Production only — remove after setup |

**Important:** `DATABASE_URL` and `DIRECT_URL` can be the same string for Neon (they use a pooled connection for both).

## Step 4 — Push the Prisma schema to Neon

After deploying with the env vars set, Vercel will run `prisma generate` automatically (it's in the build script).

But you also need to create the tables. Two options:

### Option A — From your local machine (recommended)

```bash
# Clone the repo
git clone https://github.com/HarchCorp/harch-atelier.git
cd harch-atelier

# Create a .env file with your Neon connection string
echo 'DATABASE_URL="postgresql://...?sslmode=require"' > .env
echo 'DIRECT_URL="postgresql://...?sslmode=require"' >> .env

# Install deps
bun install

# Push the schema (creates all 14 tables)
bunx prisma db push

# Verify
bunx prisma studio  # opens a GUI at localhost:5555
```

### Option B — Via Vercel build

The `package.json` build script already includes `prisma generate`. To also push the schema on first deploy, you can temporarily add `prisma db push` to the build script — but this is risky (it runs on every deploy). Better to use Option A.

## Step 5 — Create your first admin user

Once the DB is set up and the app is deployed:

```bash
# From your terminal (replace values)
curl -X POST https://atelier.harchcorp.com/api/setup \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_SETUP_TOKEN",
    "email": "amine@harchcorp.com",
    "name": "Amine Harch El Korane",
    "password": "YOUR_SECURE_PASSWORD",
    "plan": "investor"
  }'
```

Expected response:
```json
{
  "status": "created",
  "user": {
    "id": "user-...",
    "email": "amine@harchcorp.com",
    "name": "Amine Harch El Korane",
    "role": "admin",
    "plan": "investor"
  },
  "message": "Admin user created. You can now sign in at /atelier/login. Remove SETUP_TOKEN from your env to disable this route."
}
```

## Step 6 — Disable the setup route (security)

After creating your admin, **remove `SETUP_TOKEN` from Vercel env vars**. This makes `/api/setup` return 503, preventing anyone from creating another admin even if they know the URL.

The route also self-disables: if an admin already exists, it returns 409 Conflict.

## Step 7 — Sign in

Go to `https://atelier.harchcorp.com/atelier/login` and sign in with your admin credentials. You'll be redirected to `/atelier/console`.

## Verifying the setup

```bash
# Check if setup is needed (no auth required)
curl https://atelier.harchcorp.com/api/setup

# Response if DB is empty:
# { "setupRequired": true, "adminExists": false, "setupTokenConfigured": true }

# Response after admin is created:
# { "setupRequired": false, "adminExists": true, "setupTokenConfigured": true }
```

## Troubleshooting

### "Database connection error"
- Verify `DATABASE_URL` and `DIRECT_URL` are set in Vercel
- Verify the connection string ends with `?sslmode=require`
- Check Neon dashboard → the project is active (not suspended)

### "NEXTAUTH_SECRET not configured"
- Add `NEXTAUTH_SECRET` to Vercel env vars (generate with `openssl rand -base64 32`)

### "Setup already completed" (409)
- An admin already exists. If you forgot the password, you can:
  1. Connect to Neon SQL editor
  2. Run: `DELETE FROM "User" WHERE email = 'amine@harchcorp.com';`
  3. Re-run the setup curl command

### Prisma schema out of sync
```bash
bunx prisma db push --accept-data-loss  # ⚠️ only if you know what you're doing
```

## Local development

For local dev, you can use the same Neon database (Neon's free tier supports concurrent connections):

```bash
# .env (local)
DATABASE_URL="postgresql://...?sslmode=require"
DIRECT_URL="postgresql://...?sslmode=require"
NEXTAUTH_SECRET="dev-secret-change-me"
NEXTAUTH_URL="http://localhost:3000"
```

Then:
```bash
bunx prisma db push  # sync schema
bun run dev          # start dev server
```

## Cost estimate

Neon free tier:
- 0.5 GB storage (plenty for dev)
- 1 always-available branch
- 100 compute hours/month

For production (when you have real clients):
- Neon Launch plan: $19/month — 10 GB, 3 branches, more compute
- This is the only infrastructure cost (Vercel is free for hobby, $20/month for Pro)

Total monthly cost at launch: **$0-19/month** + Vercel ($0-20/month) = **$0-39/month**.
