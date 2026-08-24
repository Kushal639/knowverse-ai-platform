# KnowVerse — AI-Powered Knowledge Explorer

[![Full-Stack Architecture](https://img.shields.io/badge/Architecture-React%20%7C%20Node.js%20%7C%20FastAPI%20%7C%20MySQL-blue)](docs/architecture.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-green)](https://fastapi.tiangolo.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.13-purple)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-cyan)](https://tailwindcss.com/)

**KnowVerse** is a production-grade full-stack platform designed to transform unstructured text documents into interactive, structured, and queried knowledge graphs using Natural Language Processing (NLP) and Artificial Intelligence.

---

## 🌟 Features Overview

- **Dataset & Document Management**: Upload CSV, TSV, TXT, PDF, DOCX files or paste text directly. Secure UUID-based storage with atomic document parsing.
- **NLP Information Extraction**: Dependency-parse based relation extraction + Named Entity Recognition (NER) via spaCy and regex-guided predicate patterns.
- **Human-in-the-Loop Review**: Extracted triples are surfaced in a staged review workspace with confidence scoring before being committed to the knowledge graph.
- **Interactive Knowledge Graph Explorer**: Dynamic directed graph visualization powered by React Flow with custom entity nodes, color-coded types, zoom/pan, neighborhood hops, and entity inspector.
- **Graph-Grounded AI Assistant**: Chat with an AI assistant that queries knowledge graph triples for factual context grounding, with fallback rule-based generation and OpenAI/Gemini support.
- **Enterprise Security & Administration**:
  - JWT authentication with HTTP-only cookies and bcrypt password hashing (cost 12)
  - Role-Based Access Control (RBAC) with User and Admin roles
  - Granular audit logging with IP tracking and sensitive field sanitization
  - Graph administration tools (Entity rename, merge, version history rollback)
  - User feedback system with star ratings and administrative responses

---

## 🏗️ Architecture & Monorepo Structure

```
knowverse/
├── backend/                   # Node.js + Express + TypeScript + Prisma ORM
│   ├── prisma/
│   │   ├── schema.prisma      # 14 normalized relational models
│   │   └── seed.ts            # Production seed data (Entities, Triples, Users)
│   ├── src/
│   │   ├── config/            # Env validation (Zod), Prisma singleton, Winston logger
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Auth (JWT), RBAC, Rate limiting, Audit log, Error handler
│   │   ├── routes/            # REST API endpoints (/api/*)
│   │   ├── schemas/           # Zod validation schemas
│   │   ├── services/          # Core business logic & transactions
│   │   ├── utils/             # Async handlers, Multer file upload
│   │   ├── app.ts             # Express application setup & middleware stack
│   │   └── server.ts          # Server entry point & graceful shutdown
│   ├── package.json
│   └── tsconfig.json
├── frontend/                  # React 18 + Vite + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── api/               # Typed Axios API clients
│   │   ├── components/        # Layout, ProtectedRoute, UI primitives, Toaster
│   │   ├── pages/             # 12+ Pages (Landing, Dashboard, Datasets, Graph, NLP, AI, Admin)
│   │   ├── store/             # Zustand persistent auth state
│   │   ├── types/             # TypeScript data contracts
│   │   ├── App.tsx            # React Router v6 routing tree
│   │   └── main.tsx           # React DOM root & TanStack Query provider
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── ai-service/                # Python FastAPI Microservice
│   ├── main.py                # spaCy NER + dependency parsing extraction pipeline
│   └── requirements.txt       # FastAPI, Uvicorn, spaCy, Pydantic
├── docs/                      # Technical Documentation
│   ├── architecture.md        # Architecture overview & design decisions
│   ├── api.md                 # REST API reference
│   ├── database.md            # ER diagram & Prisma schema details
│   ├── ai-pipeline.md         # NLP triple extraction workflow
│   └── deployment.md          # Production deployment guide
├── package.json               # Root monorepo scripts (concurrently)
└── .env.example               # Complete environment variable template
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js >= 18.0.0 & npm >= 9.0.0
- Python >= 3.10
- MySQL >= 8.0 (or PostgreSQL/SQLite via Prisma config)

### 1. Environment Setup

Copy `.env.example` to `backend/.env` and update the database credentials:
```bash
cp .env.example backend/.env
```

### 2. Database Migration & Seeding

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### 3. AI Service Setup

```bash
cd ../ai-service
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

### 4. Frontend Setup

```bash
cd ../frontend
npm install
```

### 5. Launch All Services

From the root `knowverse/` directory:
```bash
npm install
npm run dev
```

This concurrently starts:
- **Backend API**: `http://localhost:3001`
- **Frontend App**: `http://localhost:5173`
- **AI Microservice**: `http://localhost:8000`

---

## 🔑 Default Credentials (from Seed)

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@knowverse.dev` | `Admin@1234` |
| **Demo User** | `demo@knowverse.dev` | `Demo@1234` |

---

## 📖 Detailed Documentation

- [Architecture Design & Decisions](docs/architecture.md)
- [REST API Specification](docs/api.md)
- [Database Schema & ER Models](docs/database.md)
- [NLP Extraction & AI Pipeline](docs/ai-pipeline.md)
- [Deployment & Production Runbook](docs/deployment.md)

---

## 🛡️ Security & Reliability Features

- **No Plaintext Passwords**: Uses salted bcrypt hashing with cost factor 12.
- **No Compromised Tokens**: All credentials, keys, and tokens are read exclusively from environment variables validated at boot via Zod.
- **SQL Injection Immune**: Prepared statements and parameterized queries via Prisma ORM.
- **Rate Limited**: Global and endpoint-specific rate limiting prevents brute force and denial of service.
- **Transactional Consistency**: Multi-entity operations (merge, rename, cascade deletes) execute inside atomic database transactions.
