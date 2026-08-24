# 🌐 KnowVerse — AI-Powered Knowledge Discovery Platform

[![Deploy with Vercel](https://vercel.com/button)](https://frontend-three-pi-48.vercel.app)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel%20Production-success?style=for-the-badge&logo=vercel)](https://frontend-three-pi-48.vercel.app)
[![GitHub Repo](https://img.shields.io/badge/GitHub-knowverse--ai--platform-blue?style=for-the-badge&logo=github)](https://github.com/Kushal639/knowverse-ai-platform)

> **KnowVerse** is a full-stack, enterprise-grade AI knowledge discovery platform. It transforms raw structured and unstructured data (CSV, JSON, text) into an interactive, multi-hop **Knowledge Graph** backed by **MySQL**, **Prisma**, **spaCy NLP**, and a strict **Zero-Hallucination Grounded AI Assistant**.

---

## 🚀 Live Deployment
- **Live Render Production URL**: [https://knowverse-frontend.onrender.com](https://knowverse-frontend.onrender.com)
- **Live Render Backend API**: [https://knowverse-backend-ae0x.onrender.com](https://knowverse-backend-ae0x.onrender.com)
- **Live Render AI Microservice**: [https://knowverse-ai.onrender.com](https://knowverse-ai.onrender.com)
- **GitHub Repository**: [https://github.com/Kushal639/knowverse-ai-platform](https://github.com/Kushal639/knowverse-ai-platform)

---

## 🌟 Core Features

### 1. 🌐 Interactive Knowledge Graph Canvas
- **React Flow Visual Canvas**: Smooth zoom, pan, search, and mini-map.
- **Neighborhood Depth Isolation**: Focus on 1-hop, 2-hop, or 3-hop subgraphs with real-time degree calculation.
- **Entity Inspector**: View entity attributes, normalized aliases, and direct incoming/outgoing triples.
- **Edge Provenance Drawer**: Click on any edge to inspect extraction model, dataset source, confidence score, and text snippet.
- **Subgraph Export**: Export filtered subgraphs as JSON or CSV.

### 2. 🧠 Grounded AI Assistant & 150 Q&A Knowledge Engine
- **Strict Zero-Hallucination RAG**: Answers directly from verified MySQL triples and refuses to invent missing data.
- **Multi-Hop Path Tracing**: Traces relationship paths (e.g. *How is Rohan connected to Classification?*).
- **150 Curated Q&A Intent Matching Layer**: Instant accurate answers across Greetings, Workflow, Datasets, NLP, Graph, Analytics, and Troubleshooting.
- **Actionable Navigation**: Answers include direct navigation buttons (`[Go to Datasets]`, `[Open NLP Workspace]`, `[View on Graph]`).
- **Saved Insights Library**: Bookmark important answers with one click.
- **Beginner / Expert Mode**: Toggle between plain-language summaries and in-depth algorithmic breakdowns.

### 3. 🎯 Interactive Platform Tour Guide
- Guided 8-step walkthrough covering Dashboard, Datasets, NLP Workspace, Graph Explorer, Analytics, Student Profiles, AI Assistant, and Graph Admin.

### 4. 📊 Graph Analytics & Semantic Community Clusters
- Real-time graph density metrics, top-degree hub rankings, isolated entity detection.
- Louvain/Modularity community detection (AI/ML, CS Core, Student Network) with one-click cluster isolation.

### 5. 🎓 Student Knowledge Profiles & Skill Gap Analysis
- Multi-domain mastery radar charts (0–100%).
- Target career readiness roadmaps (Machine Learning Engineer, Full-Stack, Data Scientist).
- Automated curriculum recommendations for missing prerequisite topics.

### 6. ⚙️ Graph Administration & Version Undo Rollback
- **AI Duplicate Detection Workbench**: Normalized Levenshtein, Jaccard, alias scanning, and acronym matching.
- **Transactional Entity Merging**: Redirects all triples into canonical entity.
- **Snapshot Versioning & Instant Rollback**: Atomic "Undo Change" button to revert any graph modification.

---

## 🏗️ Architecture & Tech Stack

```
                       ┌─────────────────────────────────────┐
                       │          React + Vite + TS          │
                       │   Tailwind CSS · shadcn/ui · Flow   │
                       │    (Hosted on Vercel Production)    │
                       └──────────────────┬──────────────────┘
                                          │ REST API
                       ┌──────────────────▼──────────────────┐
                       │       Node.js + Express + TS        │
                       │   JWT · RBAC · RateLimit · Audit    │
                       └──────────┬───────────────────┬──────┘
                                  │                   │
                       ┌──────────▼────────┐ ┌────────▼────────┐
                       │  MySQL 8.0 Engine │ │ Python FastAPI  │
                       │  Prisma 5.x ORM   │ │ spaCy + AI NLP  │
                       └───────────────────┘ └─────────────────┘
```

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- Node.js 18+
- MySQL 8.0+
- Python 3.10+ (for optional NLP service)

### 2. Backend Setup
```bash
cd knowverse/backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### 3. Frontend Setup
```bash
cd knowverse/frontend
npm install
npm run dev
```

---

## 📄 License
MIT License. Built for the KnowVerse Knowledge Discovery Platform.
