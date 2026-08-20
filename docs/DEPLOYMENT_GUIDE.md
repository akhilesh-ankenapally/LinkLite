# LinkLite — Production Deployment Guide

This guide walks you through deploying the **LinkLite Express Backend** to Railway and connecting it to a managed **Neon Serverless PostgreSQL Database**.

---

## 1. Database Setup: Neon PostgreSQL

Neon provides instant serverless PostgreSQL with connection pooling.

### Step 1: Create Neon Project
1. Log in to [Neon Console](https://console.neon.tech).
2. Click **Create Project**, name it `linklite-db`, and select your preferred region (e.g. `US East / us-east-2`).
3. Neon will display your **Connection Details**:
   ```
   postgresql://linklite_owner:********@ep-cool-fog-123456.us-east-2.aws.neon.tech/linklite?sslmode=require
   ```
4. Copy the connection string.

---

## 2. Backend Deployment: Railway

### Step 1: Initialize Railway Project
1. Go to [Railway Dashboard](https://railway.app).
2. Click **New Project** → **Deploy from GitHub Repo** → select your `LinkLite` repository (or use Railway CLI).
3. Set the **Root Directory** to `/server`.

### Step 2: Configure Environment Variables
In the Railway Service Settings, add the following variables:

| Variable Name | Example Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Production environment mode |
| `PORT` | `3000` | Server listening port |
| `BASE_URL` | `https://api.linklite.app` (or Railway provided domain) | Base short URL domain |
| `DATABASE_URL` | `postgresql://user:pass@host/linklite?sslmode=require` | Neon connection string |
| `CORS_ORIGINS` | `*` | Allowed extension/web origins |
| `RATE_LIMIT_WINDOW_MS` | `900000` | 15 minute rate limit window |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Maximum requests per window |

### Step 3: Deployment & Migration
- Railway automatically detects the included `Dockerfile` and `railway.json`.
- The container build runs `npx prisma generate` and `npm run build`.
- On startup, the container automatically applies migrations via `npx prisma migrate deploy` and boots `dist/index.js`.
- Verify the deployment health by opening `https://<your-railway-domain>/api/health`.

Expected output:
```json
{
  "status": "healthy",
  "service": "linklite-backend",
  "database": "connected",
  "latencyMs": 12,
  "uptime": 142.5
}
```

---

## 3. Configuring the Chrome Extension for Production

1. Open `extension/src/popup/services/storage.ts` or click the **Settings Icon** in the extension popup.
2. Update the API Base URL to your production Railway domain:
   ```
   https://<your-railway-domain>
   ```
3. Click **Test Endpoint** to verify live connection, then click **Save**.
