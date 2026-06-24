# El Shaddai — Deployment Guide

## Architecture
- **Frontend** → Vercel (React + Vite, static)
- **Backend** → Railway (Node/Express + SQLite)

---

## 1. Deploy Backend to Railway

### Steps
1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
2. Select this repo, set **Root Directory** to `express-backend`
3. Railway auto-detects Node and runs `node server.js` (or use `railway.toml`)

### Add a Persistent Volume (for SQLite)
1. In Railway project → your service → **Volumes** tab → **Add Volume**
2. Mount path: `/data`
3. Set env var: `DB_PATH=/data/elshaddai.sqlite`

### Required Environment Variables (Railway dashboard)
| Variable | Value |
|---|---|
| `JWT_SECRET` | A long random string (min 32 chars) |
| `DB_PATH` | `/data/elshaddai.sqlite` |
| `SMTP_USER` | Gmail address for sending emails |
| `SMTP_PASS` | Gmail App Password (16 chars) |
| `CONTACT_TO` | `contactus@elshaddai.in` |
| `ALLOWED_ORIGINS` | `https://elshaddai.vercel.app` |
| `PORT` | Set automatically by Railway |

### Seed the database (first deploy only)
In Railway shell or via `railway run`:
```bash
node seed.js
```

### Get your backend URL
After deploy, Railway gives you a URL like: `https://el-shaddai-backend.up.railway.app`

---

## 2. Deploy Frontend to Vercel

### Steps
1. Go to [vercel.com](https://vercel.com) → New Project → Import this repo
2. Framework: **Vite**, Root: `/` (default)
3. Build command: `npm run build`, Output: `dist`

### Required Environment Variables (Vercel dashboard)
| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://el-shaddai-backend.up.railway.app/api` |
| `VITE_GOOGLE_CLIENT_ID` | Your Google OAuth client ID |
| `VITE_GA_ID` | Your Google Analytics ID (e.g. `G-XXXXXXXX`) |
| `VITE_GEMINI_API_KEY` | Your Gemini API key |

### Add your Vercel domain to Google OAuth
In [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → your OAuth client:
- Authorised JavaScript origins: `https://elshaddai.vercel.app`
- Authorised redirect URIs: `https://elshaddai.vercel.app`

---

## 3. Local Development

```bash
# Terminal 1 — Backend
cd express-backend
cp .env.example .env   # fill in values
npm install
node seed.js           # first time only
npm run dev

# Terminal 2 — Frontend
npm install
npm run dev
# Vite proxies /api → localhost:3001 automatically
```

---

## Notes
- SQLite is fine for production at this scale (thousands of records).  
  Backups: Railway volume snapshots or `sqlite3 elshaddai.sqlite .dump > backup.sql`.
- When scaling beyond ~10k concurrent users, migrate to Railway PostgreSQL.
- `.env` and `.env.local` are git-ignored — never commit them.
