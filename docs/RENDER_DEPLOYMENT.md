# 🚀 KnowVerse — Render Production Deployment Architecture

This document provides complete instructions for deploying the existing KnowVerse project to **Render** using the 4-service cluster architecture.

---

## 🏗️ Deployment Architecture

```
                               ┌────────────────────────────────┐
                               │       Render Static Site       │
                               │        React + Vite UI         │
                               │  knowverse-frontend.onrender.com
                               └───────────────┬────────────────┘
                                               │ HTTPS (VITE_API_URL)
                               ┌───────────────▼────────────────┐
                               │       Render Web Service       │
                               │     Node.js + Express API      │
                               │  knowverse-backend.onrender.com│
                               └───────┬────────────────┬───────┘
                                       │                │ HTTP / Private
                      ┌────────────────▼───┐        ┌───▼────────────────┐
                      │ Render Private Svc │        │ Render Web Service │
                      │   MySQL 8.0 DB     │        │  Python AI / NLP   │
                      │ Persistent: /var/  │        │   FastAPI + spaCy  │
                      │      lib/mysql     │        │ knowverse-ai.on... │
                      └────────────────────┘        └────────────────────┘
```

---

## 📁 Repository Structure

```
.
├── render.yaml                  # 1-Click Render Blueprint configuration
├── Dockerfile.mysql             # Docker build for Render MySQL Private Service
├── docs/
│   └── RENDER_DEPLOYMENT.md     # Deployment guide & reference
└── knowverse/
    ├── frontend/                # React 18 + Vite + Tailwind UI
    │   ├── package.json
    │   ├── vite.config.ts
    │   └── src/
    ├── backend/                 # Node.js + Express + Prisma ORM
    │   ├── package.json
    │   ├── prisma/
    │   │   ├── schema.prisma
    │   │   └── seed.ts
    │   └── src/
    └── ai-service/              # Python 3.11 + FastAPI + spaCy NLP
        ├── requirements.txt
        └── main.py
```

---

## 🛠️ Service Specifications

### 1. MySQL Database (Private Service)
- **Type**: `pserv` (Private Service)
- **Environment**: Docker (`Dockerfile.mysql`)
- **Disk Mount**: `/var/lib/mysql` (10 GB Persistent Disk)
- **Internal Port**: `3306`

### 2. Python AI / NLP Microservice (Web Service)
- **Root Directory**: `knowverse/ai-service`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Health Check Path**: `/health`
- **Expected Health Response**: `{"status": "ok", "service": "knowverse-ai"}`

### 3. Node.js Express Backend (Web Service)
- **Root Directory**: `knowverse/backend`
- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npx prisma db push && node dist/server.js`
- **Health Check Path**: `/health`
- **Expected Health Response**: `{"status": "ok", "service": "knowverse-api"}`

### 4. React Frontend (Static Site)
- **Root Directory**: `knowverse/frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **SPA Rewrites**: `/* -> /index.html`

---

## 🚀 How to Deploy on Render

### Option A: 1-Click Render Blueprint (Recommended)
1. Push this repository to GitHub: `https://github.com/Kushal639/knowverse-ai-platform`.
2. Go to **[Render Dashboard](https://dashboard.render.com)**.
3. Click **"New +"** ➔ **"Blueprint"**.
4. Connect the repository `Kushal639/knowverse-ai-platform`.
5. Render will automatically detect `render.yaml` and provision all 4 services with private networking, persistent disk, and environment variables linked together!
6. Click **"Apply"**.
7. Once the backend is deployed, run the initial seed from the backend web service Shell:
   ```bash
   npx prisma db seed
   ```

---

## 🔑 Environment Variables Reference

### Backend (`knowverse/backend`)
```env
NODE_ENV=production
PORT=10000
DATABASE_URL=mysql://knowverse_user:<PASSWORD>@knowverse-mysql:3306/knowverse
JWT_SECRET=knowverse-super-secret-jwt-key-2026-production-token-32chars
COOKIE_SECRET=knowverse-cookie-secret-signature-key-2026-prod-32chars
FRONTEND_URL=https://knowverse-frontend.onrender.com
AI_SERVICE_URL=http://knowverse-ai:8000
```

### Frontend (`knowverse/frontend`)
```env
VITE_API_URL=https://knowverse-backend.onrender.com
```

### AI Service (`knowverse/ai-service`)
```env
PYTHON_VERSION=3.11.0
```
