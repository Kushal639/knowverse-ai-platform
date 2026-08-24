# KnowVerse — REST API Reference

Base URL: `http://localhost:3001/api`

All protected endpoints require either an HTTP-only `token` cookie or an `Authorization: Bearer <token>` header.

---

## 1. Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register a new user account |
| `POST` | `/auth/login` | Public | Authenticate user & set JWT cookie |
| `POST` | `/auth/logout` | Protected | Clear JWT cookie & invalidate session |
| `GET` | `/auth/me` | Protected | Get current authenticated user profile |

---

## 2. Datasets (`/api/datasets`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/datasets` | Protected | List user datasets (Admin sees all) |
| `POST` | `/datasets` | Protected | Create a new dataset record |
| `GET` | `/datasets/:id` | Protected | Get dataset details with documents count |
| `PUT` | `/datasets/:id` | Protected | Update dataset metadata |
| `DELETE` | `/datasets/:id` | Protected | Delete dataset and cascade associated records |
| `POST` | `/datasets/:id/upload` | Protected | Upload file (.csv, .tsv, .txt, .pdf, .docx) |

---

## 3. Documents (`/api/documents`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/documents` | Protected | List documents (optional `?datasetId=`) |
| `POST` | `/documents` | Protected | Create manual document with pasted text |
| `GET` | `/documents/:id` | Protected | Get document details and full text content |

---

## 4. NLP Extraction (`/api/extractions`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/extractions` | Protected | List extraction runs |
| `POST` | `/extractions` | Protected | Start extraction for a document |
| `GET` | `/extractions/:id` | Protected | Get run details with extracted triples |
| `POST` | `/extractions/:id/approve` | Protected | Approve triple & commit to Knowledge Graph |
| `POST` | `/extractions/:id/reject` | Protected | Reject extracted triple |
| `GET` | `/extractions/document/:documentId` | Protected | Get runs for specific document |

---

## 5. Knowledge Graph (`/api/graph`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/graph` | Protected | Query graph nodes & edges with filters |
| `GET` | `/graph/stats` | Protected | Graph summary statistics (nodes, edges, status) |
| `GET` | `/graph/entities` | Protected | Paginated entity search |
| `POST` | `/graph/entities` | Protected | Create custom entity with aliases |
| `GET` | `/graph/entities/:id` | Protected | Full entity details (triples, aliases, docs) |
| `PUT` | `/graph/entities/:id` | Protected | Update entity (creates version record) |
| `DELETE` | `/graph/entities/:id` | Admin | Delete entity and its connected triples |
| `POST` | `/graph/entities/:id/rename` | Admin | Atomic entity rename |
| `POST` | `/graph/entities/merge` | Admin | Merge two entities transactionally |
| `GET` | `/graph/entities/:id/neighborhood` | Protected | Get N-hop neighborhood subgraph |
| `GET` | `/graph/relations` | Protected | List all defined relation predicates |
| `POST` | `/graph/relations` | Protected | Create new relation predicate |
| `GET` | `/graph/shortest-path` | Protected | Find BFS shortest path between two entities |

---

## 6. AI Assistant (`/api/ai`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/ai/chat` | Protected | Send message, retrieve graph context, return grounded answer |
| `GET` | `/ai/conversations` | Protected | List user chat conversations |
| `GET` | `/ai/conversations/:id` | Protected | Get conversation history with messages |

---

## 7. Feedback (`/api/feedback`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/feedback` | Protected | List feedback (User sees own, Admin sees all) |
| `POST` | `/feedback` | Protected | Submit rating (1-5) and comment |
| `POST` | `/feedback/:id/respond` | Admin | Post administrative response to user feedback |
| `GET` | `/feedback/stats` | Admin | Aggregate rating statistics and counts |

---

## 8. Administration (`/api/admin`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/admin/stats` | Admin | Platform overview (counts, recent activity) |
| `GET` | `/admin/users` | Admin | Search & list all users |
| `GET` | `/admin/users/:id` | Admin | User detail view |
| `PATCH` | `/admin/users/:id/status` | Admin | Activate or deactivate user |
| `PATCH` | `/admin/users/:id/role` | Admin | Change user role (`USER` / `ADMIN`) |
| `GET` | `/admin/audit-logs` | Admin | Searchable audit trail logs |
| `GET` | `/admin/graph/versions` | Admin | List graph version history checkpoints |
| `GET` | `/admin/graph/versions/:id` | Admin | Get specific version changes breakdown |
