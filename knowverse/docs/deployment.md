# KnowVerse — Production Deployment Guide

## 1. Production Architecture Overview

In production, KnowVerse is deployed across three services managed by process managers or Docker containers:

- **Frontend**: Built static assets served by NGINX or static CDN (Vercel, Cloudflare Pages, AWS CloudFront).
- **Backend API**: Node.js / Express application managed by PM2 or deployed to AWS ECS / Google Cloud Run.
- **AI Microservice**: Python FastAPI app served via Uvicorn workers behind Gunicorn.
- **Database**: Managed MySQL 8 (Amazon RDS, Google Cloud SQL, PlanetScale).

---

## 2. Environment Variables Checklist

Ensure the following variables are configured in production:

| Variable | Description | Example |
|---|---|---|
| `NODE_ENV` | Runtime environment | `production` |
| `PORT` | Backend server port | `3001` |
| `DATABASE_URL` | MySQL connection string | `mysql://user:pass@db-host:3306/knowverse` |
| `JWT_SECRET` | 64+ char random secret string | *(generate with `openssl rand -hex 64`)* |
| `COOKIE_SECRET` | 64+ char random secret string | *(generate with `openssl rand -hex 64`)* |
| `FRONTEND_URL` | Public origin of the React app | `https://knowverse.yourdomain.com` |
| `AI_SERVICE_URL` | Internal URL of FastAPI service | `http://ai-service:8000` |
| `AI_PROVIDER` | LLM backend | `none`, `gemini`, or `openai` |
| `AI_API_KEY` | LLM API token | *(if AI_PROVIDER != none)* |
| `UPLOAD_DIR` | Storage path for uploads | `/var/knowverse/uploads` |
| `MAX_FILE_SIZE_MB`| Max upload size in megabytes | `25` |

---

## 3. Step-by-Step Production Build

### 3.1. Database Migration
```bash
cd backend
npx prisma migrate deploy
```

### 3.2. Backend Compilation & Start
```bash
cd backend
npm ci --only=production
npm run build
pm2 start dist/server.js --name knowverse-backend -i max
```

### 3.3. AI Microservice Setup
```bash
cd ai-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000
```

### 3.4. Frontend Build & Static Serving
```bash
cd frontend
npm ci
npm run build
# Output in frontend/dist/ — serve via Nginx
```

---

## 4. NGINX Reverse Proxy Configuration

```nginx
server {
    listen 80;
    server_name knowverse.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name knowverse.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/knowverse.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/knowverse.yourdomain.com/privkey.pem;

    # Frontend Single Page App
    location / {
        root /var/www/knowverse/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend REST API
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
