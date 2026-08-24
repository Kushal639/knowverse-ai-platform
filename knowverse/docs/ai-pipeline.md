# KnowVerse — NLP Pipeline & Information Extraction

## 1. Information Extraction Pipeline Overview

The KnowVerse NLP subsystem extracts structured subject-relation-object triples `(S, P, O)` from unstructured document text.

```
Document Text
     │
     ▼
[ 1. Preprocessing & Normalization ]
     │ (whitespace cleanup, sentence boundary segmentation)
     ▼
[ 2. spaCy Tokenization & POS Tagging ]
     │
     ├───────────────────────────────┬───────────────────────────────┐
     ▼                               ▼                               ▼
[ 3. Dependency Parsing ]     [ 4. Named Entity Rec. ]      [ 5. Pattern Matcher ]
  Root Verb + NSubj + DObj/PObj   NER Entity Pairs (PERSON,       Regex Predicate
  Subtree expansion               ORG, GPE, PRODUCT)              Templates
     │                               │                               │
     └───────────────────────────────┴───────────────────────────────┘
     │
     ▼
[ 6. Triple Deduplication & Confidence Scoring ]
     │
     ▼
[ 7. Staged in extraction_results (Status: PENDING) ]
     │
     ▼
[ 8. Human-in-the-Loop Review (NLP Workspace) ]
     ├───────────────────────────────┐
     ▼                               ▼
 (Approved)                      (Rejected)
     │                               │
[ 9. Atomic DB Upsert ]          [ Marked Rejected ]
  - Upsert Subject Entity
  - Upsert Object Entity
  - Upsert Relation
  - Commit Triple (status: APPROVED)
```

---

## 2. Extraction Strategies

### 2.1. Syntactic Dependency Parsing
- Finds the `ROOT` verb of each clause.
- Traverses the left syntactic subtree to extract nominal subjects (`nsubj`, `nsubjpass`).
- Traverses the right subtree for objects (`dobj`, `pobj`, `attr`, `acomp`).
- Filters out punctuation and determiners while retaining modifiers to build complete noun phrases.

### 2.2. Cross-Entity Verb Pairing
- Identifies all recognized Named Entities in a sentence using spaCy's statistical NER model (`en_core_web_sm`).
- For any entity pair `(EntityA, EntityB)`, extracts connecting verbs (`pos_ == "VERB"`) to infer relational predicates.

### 2.3. Regex Predicate Patterns
- High-precision regex rules target domain-specific relationship assertions such as:
  - *Founder / Leadership*: `X founded Y`, `X is CEO of Y`, `X leads Y`
  - *Mergers & Acquisitions*: `X acquired Y`, `X bought Y`
  - *Corporate Hierarchy*: `X is subsidiary of Y`
  - *Technology Development*: `X developed Y`, `X invented Y`

---

## 3. Grounded AI Assistant (Graph-RAG)

When a user submits a query to the AI Assistant:
1. **Keyword Extraction**: The assistant filters stopwords and isolates potential entity and relation tokens.
2. **Knowledge Graph Subgraph Retrieval**: The backend executes parameterized SQL queries across approved triples in MySQL to retrieve matching relational facts.
3. **Context Grounding**:
   - **When LLM is enabled (Gemini / OpenAI)**: The system feeds the retrieved graph triples as verified context into the prompt, instructing the model to answer strictly using the provided facts with entity citations.
   - **Rule-Based Fallback (No external API needed)**: When no API key is provided, KnowVerse synthesizes structured factual bullet points and connection summaries directly from the queried knowledge graph facts.
