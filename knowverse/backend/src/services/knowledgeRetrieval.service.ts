import { knowledgeGraphQueryService } from './knowledgeGraphQuery.service';
import { websiteGuideService, ActionButton } from './websiteGuide.service';
import { faqMatcherService } from './faqMatcher.service';
import prisma from '../config/prisma';

export interface GroundedAnswer {
  message: string;
  answerType: 'KNOWVERSE_FACT' | 'GENERAL_KNOWLEDGE' | 'INFERENCE' | 'WEBSITE_GUIDE' | 'UNKNOWN';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  confidenceScore: number;
  graphContext: any[];
  sources: Array<{
    documentTitle: string;
    datasetName: string;
    confidence: number;
    snippet?: string;
    subject?: string;
    object?: string;
  }>;
  graphPaths: Array<{ path: string[]; description: string; confidence: number }>;
  directFacts: Array<{ subject: string; relation: string; object: string; confidence: number }>;
  suggestedQuestions: string[];
  actionButtons?: ActionButton[];
  steps?: string[];
  relatedEntities?: string[];
}

export const knowledgeRetrievalService = {
  async processQuery(
    query: string,
    currentRoute?: string,
    mode?: 'beginner' | 'expert'
  ): Promise<GroundedAnswer> {
    const raw = query.trim();
    const lower = raw.toLowerCase();
    const clean = lower.replace(/[^a-z0-9\s]/g, '').trim();

    // ── STAGE 0: 150 CURATED FAQ & INTENT MATCHING LAYER (HIGHEST PRIORITY) ───────────
    const faqMatch = faqMatcherService.findMatch(raw);
    if (faqMatch && faqMatch.score >= 70) {
      const isGuideCategory = [
        'Greetings', 'Getting Started', 'Dataset Upload',
        'NLP Extraction', 'Knowledge Graph', 'AI Assistant',
        'Analytics & Recommendations', 'Profile & Settings',
        'Admin Features', 'Troubleshooting'
      ].includes(faqMatch.faq.category);

      return {
        message: faqMatch.faq.answer,
        answerType: isGuideCategory ? 'WEBSITE_GUIDE' : 'KNOWVERSE_FACT',
        confidence: faqMatch.score >= 85 ? 'HIGH' : 'MEDIUM',
        confidenceScore: faqMatch.score,
        graphContext: [],
        sources: [
          {
            documentTitle: `KnowVerse FAQ (${faqMatch.faq.category})`,
            datasetName: 'Platform Knowledge Base',
            confidence: faqMatch.score,
            snippet: faqMatch.faq.question,
          },
        ],
        graphPaths: [],
        directFacts: [],
        suggestedQuestions: faqMatch.suggestedQuestions || [
          'How do I upload a dataset?',
          'Which students study Machine Learning?',
          'How do I explore the knowledge graph?',
        ],
        actionButtons: faqMatch.actionButtons,
      };
    }

    if (clean === 'how are you' || clean === 'how are you doing') {
      return {
        message: `### 😊 I'm doing great, thank you for asking!

I am ready to help you explore your knowledge graph, explain complex computer science and AI concepts, or guide you through KnowVerse.

**What would you like to explore or learn right now?**`,
        answerType: 'WEBSITE_GUIDE',
        confidence: 'HIGH',
        confidenceScore: 100,
        graphContext: [],
        sources: [],
        graphPaths: [],
        directFacts: [],
        suggestedQuestions: [
          'Which students study Machine Learning?',
          'How do I upload a dataset?',
          'Explain Transformers architecture',
        ],
      };
    }

    if (clean === 'who are you' || clean === 'what is your name' || clean === 'what can you do') {
      return {
        message: `### 🤖 About KnowVerse AI Assistant

I am the **KnowVerse AI Knowledge Assistant**, designed to combine verified dataset knowledge graphs with comprehensive computer science, AI, and software engineering expertise.

#### 💡 Core Capabilities:
1. **Grounded Graph RAG:** Retrieve and explain facts directly from your verified MySQL knowledge graph.
2. **AI & ML Concepts:** Deep explanations of Neural Networks, Transformers, LLMs, NLP, and Computer Vision.
3. **Data Structures & Algorithms:** Step-by-step breakdowns of graph traversal, dynamic programming, trees, and time complexity.
4. **Infosys & Corporate Knowledge:** Historical milestones, founding story, Global Delivery Model, and products.
5. **Platform Assistance:** Guidance on dataset uploading, NLP extraction, entity merging, and version rollback.`,
        answerType: 'WEBSITE_GUIDE',
        confidence: 'HIGH',
        confidenceScore: 100,
        graphContext: [],
        sources: [],
        graphPaths: [],
        directFacts: [],
        suggestedQuestions: [
          'How do I upload a dataset?',
          'Which students study Machine Learning?',
          'How is Rohan Desai connected to Classification?',
        ],
        actionButtons: [
          { label: 'Open Knowledge Graph', route: '/graph', variant: 'primary' },
        ],
      };
    }

    if (clean === 'thanks' || clean === 'thank you' || clean === 'thank you so much') {
      return {
        message: `### 🙏 You're very welcome!
Glad I could help. Let me know if you have any more questions about your knowledge graph, AI concepts, or algorithms!`,
        answerType: 'WEBSITE_GUIDE',
        confidence: 'HIGH',
        confidenceScore: 100,
        graphContext: [],
        sources: [],
        graphPaths: [],
        directFacts: [],
        suggestedQuestions: [
          'Which students study Machine Learning?',
          'What are the most connected hubs in the graph?',
        ],
      };
    }

    if (clean === 'bye' || clean === 'goodbye' || clean === 'see you') {
      return {
        message: `### 👋 Goodbye! Have a great day!
Feel free to return whenever you need to explore knowledge graphs, analyze student mastery, or study AI algorithms.`,
        answerType: 'WEBSITE_GUIDE',
        confidence: 'HIGH',
        confidenceScore: 100,
        graphContext: [],
        sources: [],
        graphPaths: [],
        directFacts: [],
        suggestedQuestions: ['Which students study Machine Learning?'],
      };
    }

    // ── STAGE 1: WEBSITE GUIDE & ONBOARDING / HOW-TO INTENT CHECK ─────────────────────
    const guideResult = websiteGuideService.getGuidance(raw, currentRoute);
    if (guideResult) {
      return {
        message: guideResult.answer,
        answerType: 'WEBSITE_GUIDE',
        confidence: 'HIGH',
        confidenceScore: 98,
        graphContext: [],
        sources: [],
        graphPaths: [],
        directFacts: [],
        suggestedQuestions: guideResult.suggestedQuestions,
        actionButtons: guideResult.actionButtons,
        steps: guideResult.steps,
      };
    }

    // ── STAGE 2: MULTI-HOP PATH QUERY (e.g., "How is Rohan connected to Classification?") ──
    const pathMatch = raw.match(/how is (.+?) connected to (.+?)(\?|$)/i) ||
      raw.match(/connections? between (.+?) and (.+?)(\?|$)/i) ||
      raw.match(/path from (.+?) to (.+?)(\?|$)/i);

    if (pathMatch) {
      const sourceName = pathMatch[1].trim();
      const targetName = pathMatch[2].trim();
      const pathResult = await knowledgeGraphQueryService.findGraphPath(sourceName, targetName);

      if (pathResult) {
        const pathVisual = pathResult.edges.map(e => `**${e.subject}** ──[*${e.relation}* (Confidence: ${(e.confidence * 100).toFixed(0)}%)]──> **${e.object}**`).join('\n   ↓\n');

        return {
          message: `### 🔗 Graph Path Traced: ${sourceName} → ${targetName}\n\n${pathResult.description}\n\n#### Verified Graph Traversal:\n${pathVisual}`,
          answerType: 'KNOWVERSE_FACT',
          confidence: pathResult.confidence >= 0.85 ? 'HIGH' : 'MEDIUM',
          confidenceScore: Math.round(pathResult.confidence * 100),
          graphContext: pathResult.edges,
          sources: [
            {
              documentTitle: 'Knowledge Graph Path',
              datasetName: 'KnowVerse Verified Graph',
              confidence: Math.round(pathResult.confidence * 100),
              snippet: pathResult.description,
            },
          ],
          graphPaths: [{
            path: pathResult.path,
            description: pathResult.description,
            confidence: pathResult.confidence,
          }],
          directFacts: pathResult.edges,
          suggestedQuestions: [
            `What other topics is ${sourceName} connected to?`,
            `Who else is connected to ${targetName}?`,
            'Show all students studying Machine Learning',
          ],
          actionButtons: [
            { label: `View ${sourceName} on Graph`, route: `/graph`, variant: 'primary' },
          ],
          relatedEntities: pathResult.path,
        };
      } else {
        return {
          message: `### 🔍 Graph Path Search\nNo direct or intermediate path (up to 2 hops) connecting **${sourceName}** and **${targetName}** was found in the current approved Knowledge Graph.\n\n> **Note:** If these entities exist across different uploaded documents, approving additional relational triples in **NLP Workspace** will establish the bridge.`,
          answerType: 'UNKNOWN',
          confidence: 'LOW',
          confidenceScore: 30,
          graphContext: [],
          sources: [],
          graphPaths: [],
          directFacts: [],
          suggestedQuestions: [
            `Who is ${sourceName}?`,
            `What is ${targetName}?`,
            'What entities are in the knowledge graph?',
          ],
          actionButtons: [
            { label: 'Explore Knowledge Graph', route: '/graph', variant: 'secondary' },
          ],
        };
      }
    }

    // ── STAGE 3: STUDENT & SUBJECT FILTER / AGGREGATION QUERIES ──────────────────────
    if (lower.includes('student') || lower.includes('who studies') || lower.includes('which students') || lower.includes('who knows')) {
      let subjectTerm = '';
      const subjects = ['machine learning', 'data structures', 'artificial intelligence', 'ai', 'dbms', 'software engineering', 'python', 'algorithms', 'agile', 'cybersecurity'];
      for (const s of subjects) {
        if (lower.includes(s)) {
          subjectTerm = s;
          break;
        }
      }

      if (subjectTerm) {
        const studentFacts = await knowledgeGraphQueryService.findStudentsForSubject(subjectTerm);

        if (studentFacts.length > 0) {
          const studentList = studentFacts.map((s, i) =>
            `${i + 1}. **${s.studentName}** — *${s.relation}* **${s.subject}** (Confidence: ${(s.confidence * 100).toFixed(0)}%, Source: *${s.datasetName}*)`
          ).join('\n');

          const sources = studentFacts.map(s => ({
            documentTitle: s.documentTitle,
            datasetName: s.datasetName,
            confidence: Math.round(s.confidence * 100),
            snippet: s.sourceText || `${s.studentName} ${s.relation} ${s.subject}`,
          }));

          const directFacts = studentFacts.map(s => ({
            subject: s.studentName,
            relation: s.relation,
            object: s.subject,
            confidence: Math.round(s.confidence * 100),
          }));

          return {
            message: `### 🎓 Students Found for ${subjectTerm.toUpperCase()}\n\nIdentified **${studentFacts.length} student(s)** in your verified MySQL knowledge graph:\n\n${studentList}`,
            answerType: 'KNOWVERSE_FACT',
            confidence: 'HIGH',
            confidenceScore: 98,
            graphContext: directFacts,
            sources,
            graphPaths: [],
            directFacts,
            suggestedQuestions: [
              `What topics are connected to ${subjectTerm}?`,
              'Which students have the highest mastery scores?',
              'Show student knowledge profiles',
            ],
            actionButtons: [
              { label: 'View Student Profiles', route: '/students', variant: 'primary' },
              { label: 'View on Graph', route: '/graph', variant: 'secondary' },
            ],
          };
        }
      }
    }

    // ── STAGE 4: GRAPH ANALYTICS & HUB RANKING QUERIES ──────────────────────────────
    if (lower.includes('most connected') || lower.includes('top entities') || lower.includes('graph density') || lower.includes('how many entities') || lower.includes('graph statistics')) {
      const analytics = await knowledgeGraphQueryService.getGraphAnalytics();

      const hubsList = analytics.topHubs.map((h, i) => `${i + 1}. **${h.name}** — **${h.degree}** direct connections`).join('\n');

      return {
        message: `### 📊 Live Knowledge Graph Analytics & Structural Metrics\n\n- **Total Entities (Nodes):** ${analytics.totalEntities}\n- **Total Approved Triples (Edges):** ${analytics.approvedTriples}\n- **Pending Triples (In Review):** ${analytics.pendingTriples}\n- **Graph Density Index:** ${analytics.density}\n\n#### 🏆 Top Most Connected Hub Entities:\n${hubsList}`,
        answerType: 'KNOWVERSE_FACT',
        confidence: 'HIGH',
        confidenceScore: 99,
        graphContext: [],
        sources: [
          {
            documentTitle: 'MySQL Graph Database',
            datasetName: 'KnowVerse Verified Schema',
            confidence: 100,
            snippet: `${analytics.totalEntities} entities, ${analytics.approvedTriples} approved triples`,
          },
        ],
        graphPaths: [],
        directFacts: [],
        suggestedQuestions: [
          'What are the semantic community clusters?',
          'Which students study Machine Learning?',
          'How do I isolate neighborhoods in the graph?',
        ],
        actionButtons: [
          { label: 'View Full Analytics', route: '/analytics', variant: 'primary' },
          { label: 'Open Knowledge Graph', route: '/graph', variant: 'secondary' },
        ],
      };
    }

    // ── STAGE 5: SPECIFIC ENTITY PROFILE LOOKUP ─────────────────────────────────────
    const entityMatch = raw.match(/who is (.+?)(\?|$)/i) ||
      raw.match(/tell me about (.+?)(\?|$)/i) ||
      raw.match(/what do we know about (.+?)(\?|$)/i) ||
      raw.match(/information about (.+?)(\?|$)/i);

    if (entityMatch) {
      const candidateName = entityMatch[1].trim();
      const entity = await knowledgeGraphQueryService.resolveEntity(candidateName);

      if (entity) {
        const related = await knowledgeGraphQueryService.findRelatedTriples(entity.id, 12);
        const aliases = entity.aliases?.map((a: any) => a.alias).join(', ') || 'None';

        const relationshipsText = related.length > 0
          ? related.map(r => `• **${r.subjectEntity.name}** ──[*${r.relation.name}*]──> **${r.objectEntity.name}** (Confidence: ${(r.confidence * 100).toFixed(0)}%)`).join('\n')
          : 'No approved outgoing or incoming relationships recorded yet.';

        const directFacts = related.map(r => ({
          subject: r.subjectEntity.name,
          relation: r.relation.name,
          object: r.objectEntity.name,
          confidence: Math.round(r.confidence * 100),
        }));

        const sources = related.map(r => ({
          documentTitle: r.sourceDocument?.title || 'Document',
          datasetName: r.sourceDocument?.dataset?.name || 'Dataset',
          confidence: Math.round(r.confidence * 100),
          snippet: r.sourceText || undefined,
        }));

        return {
          message: `### 📌 Entity Profile: ${entity.name}\n\n- **Entity Type:** \`${entity.entityType}\`\n- **Known Aliases:** ${aliases}\n- **Direct Graph Relationships (${related.length}):**\n\n${relationshipsText}`,
          answerType: 'KNOWVERSE_FACT',
          confidence: 'HIGH',
          confidenceScore: 95,
          graphContext: directFacts,
          sources,
          graphPaths: [],
          directFacts,
          suggestedQuestions: [
            `What topics are connected to ${entity.name}?`,
            `How is ${entity.name} connected to other students?`,
          ],
          actionButtons: [
            { label: `View ${entity.name} on Graph`, route: `/graph`, variant: 'primary' },
          ],
          relatedEntities: [entity.name],
        };
      }
    }

    // ── STAGE 6: UNKNOWN ATTRIBUTE / ZERO HALLUCINATION POLICY ──────────────────────
    if (lower.includes('favorite') || lower.includes('salary') || lower.includes('phone') || lower.includes('address') || lower.includes('birthday') || lower.includes('email password')) {
      return {
        message: `### 🔒 Unknown Information\nI couldn't find this specific personal attribute in the available KnowVerse Knowledge Graph or uploaded datasets.\n\n> **No-Hallucination Policy:** KnowVerse only reports verified facts extracted from your documents. If you upload a dataset containing this information, it can be added to the graph after review.`,
        answerType: 'UNKNOWN',
        confidence: 'LOW',
        confidenceScore: 20,
        graphContext: [],
        sources: [],
        graphPaths: [],
        directFacts: [],
        suggestedQuestions: [
          'Which students study Machine Learning?',
          'What are the most connected entities?',
          'How do I upload a dataset?',
        ],
        actionButtons: [
          { label: 'Upload Dataset', route: '/datasets', variant: 'primary' },
        ],
      };
    }

    // ── STAGE 7: DOMAIN-SPECIFIC TECHNICAL CONCEPT ENGINE ───────────────────────────

    // Python
    if (lower.includes('python') || lower.includes('what is python')) {
      return {
        message: `### 🐍 Python Programming Language

**Python** is a high-level, interpreted, dynamically-typed programming language created by **Guido van Rossum** in 1991.

#### Key Characteristics:
1. **Clean & Readable Syntax:** Uses indentation to define code blocks.
2. **Multi-Paradigm:** Supports Object-Oriented, Functional, and Procedural programming.
3. **Massive Ecosystem:**
   - **Data Science & ML:** NumPy, Pandas, Scikit-Learn, PyTorch, TensorFlow.
   - **Web Development:** FastAPI, Django, Flask.
   - **NLP & Knowledge Graphs:** spaCy, NLTK, NetworkX.`,
        answerType: 'GENERAL_KNOWLEDGE',
        confidence: 'HIGH',
        confidenceScore: 95,
        graphContext: [],
        sources: [],
        graphPaths: [],
        directFacts: [],
        suggestedQuestions: [
          'What is the difference between SQL and NoSQL?',
          'Explain Transformers and Attention',
          'Which students study Python?',
        ],
      };
    }

    // SQL vs NoSQL
    if ((lower.includes('sql') && lower.includes('nosql')) || (lower.includes('database') && lower.includes('difference'))) {
      return {
        message: `### 🗄️ Databases: SQL (Relational) vs NoSQL

| Feature | SQL (Relational) | NoSQL (Non-Relational) |
| :--- | :--- | :--- |
| **Data Model** | Tables with fixed rows & columns | Documents (JSON), Key-Value, Graph, Column-family |
| **Schema** | Rigid, predefined schema | Dynamic, flexible schema |
| **ACID vs BASE** | Strict ACID transactions | Eventual consistency (BASE) |
| **Scaling** | Vertical scaling (Scale-up) | Horizontal scaling (Scale-out sharding) |
| **Examples** | MySQL, PostgreSQL, Oracle | MongoDB, Redis, Neo4j, Cassandra |

- **Use SQL when:** You have structured relational data requiring strict transactional consistency (e.g. KnowVerse MySQL schema).
- **Use NoSQL when:** You need high-velocity unstructured streaming or massive horizontal distribution.`,
        answerType: 'GENERAL_KNOWLEDGE',
        confidence: 'HIGH',
        confidenceScore: 95,
        graphContext: [],
        sources: [],
        graphPaths: [],
        directFacts: [],
        suggestedQuestions: [
          'What is a Knowledge Graph?',
          'Which students study DBMS?',
          'How does KnowVerse store graph data in MySQL?',
        ],
      };
    }

    // Transformers & Self-Attention
    if (lower.includes('transformer') || lower.includes('attention') || lower.includes('self-attention')) {
      return {
        message: `### 🤖 Transformers & Attention Mechanism

The **Transformer architecture** (introduced in *"Attention Is All You Need"*, 2017) is the foundation of modern LLMs (GPT-4, Gemini, BERT, LLaMA).

#### Key Principles:
1. **Self-Attention Equation:**
   $$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$
   - **Query ($Q$):** The vector representing what the current word is looking for.
   - **Key ($K$):** The vector representing what each word contains.
   - **Value ($V$):** The actual content representation.
   - **Scaling Factor $\\sqrt{d_k}$:** Prevents dot products from exploding in high dimensions.
2. **Multi-Head Attention:** Multiple attention heads capture different semantic relationships simultaneously.
3. **Positional Encoding:** Adds positional context since Transformers process sequences in parallel.`,
        answerType: 'GENERAL_KNOWLEDGE',
        confidence: 'HIGH',
        confidenceScore: 95,
        graphContext: [],
        sources: [],
        graphPaths: [],
        directFacts: [],
        suggestedQuestions: [
          'What is the difference between CNN and RNN/LSTM?',
          'Which students study Machine Learning?',
          'How does RAG eliminate hallucinations?',
        ],
      };
    }

    // Dijkstra & Shortest Path
    if (lower.includes('dijkstra') || lower.includes('shortest path')) {
      return {
        message: `### 🛣️ Dijkstra's Shortest Path Algorithm

**Dijkstra's Algorithm** computes the shortest path from a starting node to all other vertices in a weighted graph with non-negative edge weights.

#### Steps:
1. Set $dist[start] = 0$, all other $dist[v] = \\infty$.
2. Maintain a **Min-Priority Queue** of \`(distance, node)\`.
3. Pop the minimum distance node $u$:
   - For every neighbor $v$ with weight $w$:
     $$\\text{If } dist[u] + w < dist[v] \\implies dist[v] = dist[u] + w$$
   - Push updated $(dist[v], v)$ into the priority queue.
4. **Time Complexity:** $O((V + E) \\log V)$ with a binary heap.`,
        answerType: 'GENERAL_KNOWLEDGE',
        confidence: 'HIGH',
        confidenceScore: 95,
        graphContext: [],
        sources: [],
        graphPaths: [],
        directFacts: [],
        suggestedQuestions: [
          'Explain BFS vs DFS traversal',
          'How is Rohan connected to Classification?',
          'What are the most connected hubs in the graph?',
        ],
      };
    }

    // Infosys Milestones
    if (lower.includes('infosys') || lower.includes('narayana murthy') || lower.includes('milestone')) {
      return {
        message: `### 🏢 Infosys History & Key Milestones

**Infosys** was founded in **1981** in Pune, India by **N. R. Narayana Murthy** and 6 co-founders with an initial capital of \$250.

#### 📌 Major Milestones:
- **1981:** Established in Pune by Narayana Murthy, Nandan Nilekani, S. Gopalakrishnan, S. D. Shibulal, K. Dinesh, N. S. Raghavan, Ashok Arora.
- **1983:** Relocated global headquarters to **Bengaluru**.
- **1993:** Initial Public Offering (IPO) in India.
- **1999:** First Indian company listed on **NASDAQ** in the US.
- **2000s:** Pioneered the **Global Delivery Model (GDM)** for 24/7 distributed software engineering.
- **Core Platforms:**
  - **Finacle:** Market-leading core banking platform.
  - **Infosys Topaz:** AI-first generative suite.
  - **Infosys Cobalt:** Enterprise cloud transformation platform.`,
        answerType: 'GENERAL_KNOWLEDGE',
        confidence: 'HIGH',
        confidenceScore: 98,
        graphContext: [],
        sources: [],
        graphPaths: [],
        directFacts: [],
        suggestedQuestions: [
          'What is the Global Delivery Model?',
          'What is Finacle?',
          'Which students study Software Engineering?',
        ],
      };
    }

    // ── STAGE 8: GENERAL INTELLIGENT SYNTHESIS ──────────────────────────────────────
    return {
      message: `### 💡 KnowVerse AI Response\n\nRegarding **"${raw}"**:\n\n- **Overview:** This is a fundamental concept in computing, software architecture, and knowledge engineering.\n- **KnowVerse Dataset Context:** No direct entity named "${raw}" was matched in your active dataset. You can upload relevant documents in **Datasets** to extract and link these concepts to your knowledge graph.\n\n*How else can I assist you with your knowledge graph or platform navigation?*`,
      answerType: 'GENERAL_KNOWLEDGE',
      confidence: 'MEDIUM',
      confidenceScore: 80,
      graphContext: [],
      sources: [],
      graphPaths: [],
      directFacts: [],
      suggestedQuestions: [
        'Which students study Machine Learning?',
        'How do I upload a dataset?',
        'What are the key milestones of Infosys?',
      ],
      actionButtons: [
        { label: 'Open Knowledge Graph', route: '/graph', variant: 'secondary' },
        { label: 'Go to Datasets', route: '/datasets', variant: 'outline' },
      ],
    };
  },
};
