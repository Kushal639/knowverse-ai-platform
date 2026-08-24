# KnowVerse — Advanced Feature Audit & Implementation Map

**Document Version:** 1.0.0  
**Generated Date:** August 24, 2026  
**Status:** Audit Complete · Ready for Extension Implementation

---

## 1. System Overview & Current Architecture

KnowVerse is a full-stack, enterprise-grade AI knowledge platform constructed with:
- **Frontend**: React 18, Vite 5, TypeScript 5, Tailwind CSS, Radix UI, TanStack Query v5, React Flow 11, Zustand, Recharts, Lucide Icons.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM 5, MySQL 8.0, JWT (HTTP-only cookies + Bearer auth), Bcrypt, Winston logger.
- **Python AI Service**: FastAPI / spaCy / Sentence Transformers / Structured & Hybrid NLP extraction pipelines.
- **Database**: MySQL (`localhost:3306`, DB: `knowverse`) with relational modeling for users, datasets, documents, entities, relations, triples, extraction runs, feedback, graph versions, audit logs, and AI conversations.

---

## 2. Feature-by-Feature Technical Audit Table

| # | Feature Domain | Current Implementation | Files Involved | Existing APIs | Existing Tables | What Needs To Be Extended | Implementation Strategy |
|---|----------------|------------------------|----------------|---------------|-----------------|---------------------------|-------------------------|
| **1** | **AI Knowledge Assistant (RAG)** | Rule-based + LLM (OpenAI/Gemini/Local) graph-grounding; multi-turn conversations. | `backend/src/services/ai.service.ts`, `backend/src/controllers/ai.controller.ts`, `frontend/src/pages/AIAssistant.tsx` | `POST /api/ai/chat`, `GET /api/ai/conversations`, `GET /api/ai/conversations/:id` | `ai_conversations`, `ai_messages`, `triples`, `entities`, `relations` | Precise source citations (Dataset, Document, Row, Confidence), structured fact cards, citation clicks to graph/dataset. | Enhance `ai.service.ts` to return rich source provenance citations and structured fact cards; update `AIAssistant.tsx` with interactive source links. |
| **2** | **Advanced Graph Search** | Search by entity name with basic filter. | `backend/src/services/graph.service.ts`, `frontend/src/pages/GraphExplorer.tsx`, `frontend/src/components/layout/TopNav.tsx` | `GET /api/graph`, `GET /api/graph/entities` | `entities`, `triples`, `relations`, `datasets` | Multi-criteria search (entities, relations, topics, students, skills), fuzzy matching, recent search history, highlight & zoom on entity. | Add search endpoint `GET /api/graph/search`, fuzzy matching, search history in localStorage/DB, and auto-zoom centering in `GraphExplorer.tsx`. |
| **3** | **Entity Profiles & Neighborhood Exploration** | Node inspector drawer showing basic metadata & adjacent edges. | `backend/src/services/graph.service.ts`, `frontend/src/pages/GraphExplorer.tsx` | `GET /api/graph/entities/:id`, `GET /api/graph/entities/:id/neighborhood` | `entities`, `entity_aliases`, `triples`, `documents` | Dedicated rich EntityProfile modal/drawer with 1-hop, 2-hop, 3-hop exploration slider, relationship & type filters, and source document links. | Extend `getNeighborhood` with configurable depth & filters; create `EntityProfileDrawer` and `NeighborhoodExplorer` controls. |
| **4** | **Human-in-the-Loop AI Validation & Provenance** | Auto-approve toggle + manual approve/reject endpoints. | `backend/src/services/extraction.service.ts`, `frontend/src/pages/NLPWorkspace.tsx` | `POST /api/extractions/:id/approve`, `POST /api/extractions/:id/reject` | `extraction_runs`, `extraction_results`, `triples` | Row-level inline editing of candidate triples, inspect source text/row popup, method badge (`STRUCTURED` vs `NLP`), confidence filtering. | Add triple inline edit endpoint `PUT /api/extractions/:id/results/:resultId`, modal to inspect source row/sentence, and confidence filter pills. |
| **5** | **AI Entity Resolution / Duplicate Detection** | Exact match normalization (`normalizedName`). | `backend/src/services/graph.service.ts`, `frontend/src/pages/admin/AdminGraph.tsx` | `POST /api/graph/entities/merge` | `entities`, `entity_aliases`, `triples`, `graph_changes` | Levenshtein / Token similarity detection for fuzzy duplicates (e.g. `Machine Learning` vs `ML` vs `Machine Learning (ML)`), duplicate review UI with merge preview. | Implement `detectDuplicates()` service in `graph.service.ts`, add `GET /api/graph/duplicates` and a dedicated Duplicate Resolution workbench. |
| **6** | **Knowledge Graph Analytics** | Basic stats endpoint (`totalEntities`, `totalTriples`, `topEntities`). | `backend/src/services/graph.service.ts`, `frontend/src/pages/Dashboard.tsx` | `GET /api/graph/stats` | `entities`, `relations`, `triples` | Dedicated `/analytics` page: graph density, average degree, connected components, isolated nodes, degree distribution charts, growth over time. | Create `GET /api/graph/analytics` in backend and new `Analytics.tsx` frontend page with interactive Recharts diagrams. |
| **7** | **Community Detection / Clustering** | Layered node layout based on entity types. | `frontend/src/pages/GraphExplorer.tsx` | `GET /api/graph` | `entities`, `triples` | Graph community clustering (Connected Components / Louvain heuristic), cluster isolation view, cluster breakdown list. | Add `GET /api/graph/clusters` in backend, cluster color tags, and "Isolate Cluster" button in `GraphExplorer.tsx`. |
| **8** | **Natural Language Graph Queries** | General AI assistant chat. | `backend/src/services/ai.service.ts`, `frontend/src/pages/AIAssistant.tsx` | `POST /api/ai/chat` | `triples`, `entities` | "Ask Your Knowledge Graph" direct query interface: Intent + Entity parsing -> deterministic graph query -> verified factual answer. | Add specialized NLP graph query engine with query templates and direct visual subgraph response. |
| **9** | **Student Knowledge Profiles & Skill Gap Analysis** | Entity nodes with `PERSON` type. | `backend/src/services/graph.service.ts`, `frontend/src/pages/GraphExplorer.tsx` | `GET /api/graph/entities/:id` | `entities`, `triples` | Dedicated `/students` directory & `/students/:id` profiles with auto-computed skill percentages, mastered topics, target role gap analysis & learning paths. | Build `student.service.ts`, routes `/api/students`, and frontend `Students.tsx` + `StudentDetail.tsx` pages. |
| **10** | **Recommendation Engine** | N/A | New Service | `GET /api/recommendations` | `triples`, `entities` | Graph-based recommendations: related topics, prerequisite learning paths, peer learners with explainable reasoning paths. | Implement `recommendation.service.ts` with graph path traversal and explainable evidence. |
| **11** | **Dataset Comparison** | Single dataset filter in graph. | `backend/src/services/dataset.service.ts`, `frontend/src/pages/Datasets.tsx` | `GET /api/datasets/:id` | `datasets`, `documents`, `triples` | Dataset comparison tool (`Dataset A` vs `Dataset B`): new entities, shared entities, unique relationships, knowledge diff chart. | Add `GET /api/datasets/compare?d1=...&d2=...` and frontend `DatasetComparison` component. |
| **12** | **Knowledge Health & Quality** | Basic confidence metrics in NLP workspace. | `backend/src/services/graph.service.ts` | `GET /api/graph/stats` | `triples`, `entities`, `extraction_results` | Dedicated `/knowledge-health` dashboard: Completeness, Confidence, Duplicate Rate, Coverage, Freshness scores, actionable health alerts. | Create `GET /api/analytics/knowledge-health` and frontend `KnowledgeHealth.tsx` page. |
| **13** | **Graph Versioning & Undo/Redo** | `GraphVersion` and `GraphChange` Prisma models created. | `backend/src/services/graph.service.ts`, `frontend/src/pages/admin/AdminGraph.tsx` | `GET /api/admin/graph/versions` | `graph_versions`, `graph_changes` | Version snapshot capture, version comparison diff viewer, 1-click restore/rollback of graph state. | Implement `createVersionSnapshot()` and `restoreVersion()` in `graph.service.ts` with frontend version restore modal. |
| **14** | **Graph Explanation (Multi-Entity Path Explainer)** | Single path finding (`shortestPath`). | `backend/src/services/graph.service.ts` | `GET /api/graph/shortest-path` | `triples`, `entities` | "Explain Connections" feature: User selects 2-5 entities -> AI traces connecting paths in graph and produces a structured, grounded narrative. | Add `POST /api/ai/explain-subgraph` endpoint and multi-selection mode in `GraphExplorer.tsx`. |
| **15** | **Notification Center & Activity Timeline** | TopNav notifications popover showing extraction runs. | `frontend/src/components/layout/TopNav.tsx` | `GET /api/extractions` | `extraction_runs`, `audit_logs` | Persistent `Notification` database model with real-time events (extraction complete, health alerts, merge recommendations) and activity timeline. | Add `Notification` model to Prisma, create `/api/notifications`, and full Notification Center dropdown. |
| **16** | **AI Model Evaluation Benchmark** | Extraction runs record `modelName` and metrics in metadata. | `backend/src/services/structuredExtractor.ts` | `GET /api/extractions` | `extraction_runs`, `extraction_results` | Dedicated `/admin/models` evaluation page comparing `spaCy`, `Hybrid`, `LLM`, and `Structured` against ground truth with Precision, Recall, F1. | Add `model_evaluations` table/service and `/admin/models` benchmarking view. |
| **17** | **Graph Export & Sharing** | Raw dataset download. | `frontend/src/pages/GraphExplorer.tsx` | N/A | N/A | Export to PNG, SVG, JSON (Node-Link format), CSV (Triples format), and read-only shareable graph tokens. | Add canvas export utils (html-to-image / SVG serializer) and shareable URL query generator. |

---

## 3. Migration & Extension Plan

All new features are added **additively** without modifying existing working endpoints or breaking database integrity:
1. **Schema Additions**:
   - `Notification` model for persistent notifications.
   - `ModelEvaluation` model for storing ground-truth benchmarks.
2. **Backend Services & Routes**:
   - Extend `ai.service.ts` with source citation provenance and subgraph explanation.
   - Extend `graph.service.ts` with analytics, community detection (clustering), fuzzy search, entity resolution duplicate detection, and version rollback.
   - Create `student.service.ts` and `recommendation.service.ts`.
   - Create `analytics.service.ts` for Knowledge Health & Graph Metrics.
3. **Frontend Pages & Navigation**:
   - Add routes in `App.tsx` and links in `Sidebar.tsx`:
     - `/ai-assistant` (Enhanced with Source Citations & Graph Grounding)
     - `/analytics` (Knowledge Graph Analytics & Community Detection)
     - `/knowledge-health` (Health & Quality Scorecard)
     - `/students` & `/students/:id` (Student Knowledge Profiles & Skill Gap Analysis)
     - `/recommendations` (Explainable Learning & Knowledge Recommendations)
     - `/admin/models` (AI Model Evaluation & Benchmarks)
   - Enhance `GraphExplorer.tsx` with Neighborhood Depth Explorer (1-3 hops), Entity Profile Drawer, Explain Connections, and Export (PNG/SVG/JSON/CSV).
