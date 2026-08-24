import { User } from '@/types';

type TripleStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
type DatasetStatus = 'UPLOADED' | 'VALIDATING' | 'PROCESSING' | 'EXTRACTING' | 'REVIEWING' | 'COMPLETED' | 'FAILED';

export const mockUser: User = {
  id: 'usr-demo-001',
  name: 'Demo User',
  email: 'demo@knowverse.dev',
  role: 'USER',
  isActive: true,
  createdAt: '2026-08-24T10:00:00Z',
  updatedAt: '2026-08-24T10:00:00Z',
  _count: { datasets: 1, triples: 9, feedback: 1 },
};

export const mockAdminUser: User = {
  id: 'usr-admin-001',
  name: 'Admin User',
  email: 'admin@knowverse.dev',
  role: 'ADMIN',
  isActive: true,
  createdAt: '2026-08-24T10:00:00Z',
  updatedAt: '2026-08-24T10:00:00Z',
  _count: { datasets: 3, triples: 9, feedback: 2 },
};

export const initialEntities = [
  { id: 'ent-infosys', name: 'Infosys', normalizedName: 'infosys', entityType: 'ORG', description: 'Indian multinational IT and consulting company founded in 1981', degree: 2 },
  { id: 'ent-narayana', name: 'Narayana Murthy', normalizedName: 'narayana murthy', entityType: 'PERSON', description: 'Co-founder of Infosys', degree: 1 },
  { id: 'ent-google', name: 'Google', normalizedName: 'google', entityType: 'ORG', description: 'Multinational technology conglomerate', degree: 2 },
  { id: 'ent-deepmind', name: 'DeepMind', normalizedName: 'deepmind', entityType: 'ORG', description: 'AI research laboratory owned by Alphabet', degree: 2 },
  { id: 'ent-alphago', name: 'AlphaGo', normalizedName: 'alphago', entityType: 'PRODUCT', description: 'Computer program that plays Go created by DeepMind', degree: 2 },
  { id: 'ent-lee-sedol', name: 'Lee Sedol', normalizedName: 'lee sedol', entityType: 'PERSON', description: '9-dan professional Go player', degree: 1 },
  { id: 'ent-openai', name: 'OpenAI', normalizedName: 'openai', entityType: 'ORG', description: 'AI research laboratory & creator of GPT models', degree: 3 },
  { id: 'ent-chatgpt', name: 'ChatGPT', normalizedName: 'chatgpt', entityType: 'PRODUCT', description: 'Large language model conversational agent', degree: 1 },
  { id: 'ent-microsoft', name: 'Microsoft', normalizedName: 'microsoft', entityType: 'ORG', description: 'Global technology company and OpenAI investor', degree: 1 },
  { id: 'ent-sam-altman', name: 'Sam Altman', normalizedName: 'sam altman', entityType: 'PERSON', description: 'CEO and co-founder of OpenAI', degree: 1 },
  { id: 'ent-ai', name: 'Artificial Intelligence', normalizedName: 'artificial intelligence', entityType: 'CONCEPT', description: 'Simulation of human intelligence in machines', degree: 2 },
];

export const initialRelations = [
  { id: 'rel-founded', name: 'founded', normalizedName: 'founded', count: 1 },
  { id: 'rel-is-subsidiary', name: 'is subsidiary of', normalizedName: 'is subsidiary of', count: 1 },
  { id: 'rel-created', name: 'created', normalizedName: 'created', count: 1 },
  { id: 'rel-defeated', name: 'defeated', normalizedName: 'defeated', count: 1 },
  { id: 'rel-developed', name: 'developed', normalizedName: 'developed', count: 2 },
  { id: 'rel-invested-in', name: 'invested in', normalizedName: 'invested in', count: 1 },
  { id: 'rel-ceo-of', name: 'CEO of', normalizedName: 'ceo of', count: 1 },
  { id: 'rel-provides', name: 'provides', normalizedName: 'provides', count: 1 },
];

export const initialTriples = [
  { id: 'trp-1', subjectEntityId: 'ent-narayana', relationId: 'rel-founded', objectEntityId: 'ent-infosys', confidence: 0.98, status: 'APPROVED' as TripleStatus, subject: 'Narayana Murthy', relation: 'founded', object: 'Infosys', sourceText: 'Infosys was founded by Narayana Murthy in 1981.' },
  { id: 'trp-2', subjectEntityId: 'ent-deepmind', relationId: 'rel-is-subsidiary', objectEntityId: 'ent-google', confidence: 0.95, status: 'APPROVED' as TripleStatus, subject: 'DeepMind', relation: 'is subsidiary of', object: 'Google', sourceText: 'DeepMind is a subsidiary of Google.' },
  { id: 'trp-3', subjectEntityId: 'ent-deepmind', relationId: 'rel-created', objectEntityId: 'ent-alphago', confidence: 0.97, status: 'APPROVED' as TripleStatus, subject: 'DeepMind', relation: 'created', object: 'AlphaGo', sourceText: 'DeepMind created AlphaGo in 2015.' },
  { id: 'trp-4', subjectEntityId: 'ent-alphago', relationId: 'rel-defeated', objectEntityId: 'ent-lee-sedol', confidence: 0.99, status: 'APPROVED' as TripleStatus, subject: 'AlphaGo', relation: 'defeated', object: 'Lee Sedol', sourceText: 'AlphaGo defeated world champion Lee Sedol in 2016.' },
  { id: 'trp-5', subjectEntityId: 'ent-openai', relationId: 'rel-developed', objectEntityId: 'ent-chatgpt', confidence: 0.99, status: 'APPROVED' as TripleStatus, subject: 'OpenAI', relation: 'developed', object: 'ChatGPT', sourceText: 'OpenAI developed ChatGPT based on GPT-3.5 and GPT-4.' },
  { id: 'trp-6', subjectEntityId: 'ent-microsoft', relationId: 'rel-invested-in', objectEntityId: 'ent-openai', confidence: 0.96, status: 'APPROVED' as TripleStatus, subject: 'Microsoft', relation: 'invested in', object: 'OpenAI', sourceText: 'Microsoft made a multi-billion dollar investment in OpenAI.' },
  { id: 'trp-7', subjectEntityId: 'ent-sam-altman', relationId: 'rel-ceo-of', objectEntityId: 'ent-openai', confidence: 0.98, status: 'APPROVED' as TripleStatus, subject: 'Sam Altman', relation: 'CEO of', object: 'OpenAI', sourceText: 'Sam Altman serves as CEO of OpenAI.' },
  { id: 'trp-8', subjectEntityId: 'ent-google', relationId: 'rel-developed', objectEntityId: 'ent-ai', confidence: 0.75, status: 'APPROVED' as TripleStatus, subject: 'Google', relation: 'developed', object: 'Artificial Intelligence', sourceText: 'Google develops state of the art artificial intelligence.' },
  { id: 'trp-9', subjectEntityId: 'ent-infosys', relationId: 'rel-provides', objectEntityId: 'ent-ai', confidence: 0.70, status: 'APPROVED' as TripleStatus, subject: 'Infosys', relation: 'provides', object: 'Artificial Intelligence', sourceText: 'Infosys provides enterprise artificial intelligence solutions.' },
];

export const initialDatasets = [
  {
    id: 'seed-dataset-001',
    name: 'AI & Technology Knowledge Base',
    description: 'A comprehensive dataset covering Artificial Intelligence, company structures, and founder relationships.',
    fileType: 'text/plain',
    fileSize: 1024,
    status: 'COMPLETED' as DatasetStatus,
    createdAt: '2026-08-24T10:00:00Z',
    updatedAt: '2026-08-24T10:00:00Z',
    owner: { id: 'usr-demo-001', name: 'Demo User', email: 'demo@knowverse.dev' },
    _count: { documents: 1 },
  },
];

export const initialDocuments = [
  {
    id: 'seed-doc-001',
    datasetId: 'seed-dataset-001',
    title: 'AI Companies and Relationships',
    content: `Infosys is an Indian multinational information technology company founded by Narayana Murthy in 1981. DeepMind is a subsidiary of Google and created AlphaGo, which defeated Lee Sedol. OpenAI developed ChatGPT with investment from Microsoft. Sam Altman is CEO of OpenAI.`,
    source: 'Seed Document',
    createdAt: '2026-08-24T10:00:00Z',
    dataset: { id: 'seed-dataset-001', name: 'AI & Technology Knowledge Base' },
  },
];

export const initialStudents = [
  {
    id: 'std-1',
    name: 'Rohan Sharma',
    email: 'rohan@example.com',
    department: 'Computer Science',
    year: '4th Year',
    targetRole: 'Machine Learning Engineer',
    overallMastery: 84,
  },
  {
    id: 'std-2',
    name: 'Priya Patel',
    email: 'priya@example.com',
    department: 'Data Science & AI',
    year: '3rd Year',
    targetRole: 'Data Scientist',
    overallMastery: 91,
  },
  {
    id: 'std-3',
    name: 'Ananya Verma',
    email: 'ananya@example.com',
    department: 'Information Technology',
    year: '4th Year',
    targetRole: 'Full Stack Engineer',
    overallMastery: 78,
  },
];

// In-memory dynamic store
let stateDatasets = [...initialDatasets];
let stateDocuments = [...initialDocuments];
let stateEntities = [...initialEntities];
let stateRelations = [...initialRelations];
let stateTriples = [...initialTriples];
let stateInsights: any[] = [];

export function handleMockRoute(url: string, method: string, data?: any): any {
  const cleanUrl = url.replace(/^\/api/, '').split('?')[0];

  // ── Auth ─────────────────────────────────────────────────────────────
  if (cleanUrl === '/auth/login' && method === 'post') {
    const isAdmin = data?.email?.toLowerCase().includes('admin');
    const user = isAdmin ? mockAdminUser : { ...mockUser, email: data?.email || 'demo@knowverse.dev' };
    return { success: true, data: { user, token: 'mock-jwt-token-active' } };
  }

  if (cleanUrl === '/auth/register' && method === 'post') {
    const user: User = {
      id: `usr-${Date.now()}`,
      name: data?.name || 'Explorer',
      email: data?.email || 'user@example.com',
      role: 'USER',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: { datasets: 0, triples: 0, feedback: 0 },
    };
    return { success: true, data: { user, token: 'mock-registered-token-active' } };
  }

  if (cleanUrl === '/auth/me') {
    return { success: true, data: mockUser };
  }

  if (cleanUrl === '/auth/logout') {
    return { success: true, message: 'Logged out' };
  }

  // ── Datasets ─────────────────────────────────────────────────────────
  if (cleanUrl === '/datasets' && method === 'get') {
    return {
      success: true,
      data: {
        datasets: stateDatasets,
        total: stateDatasets.length,
        page: 1,
        limit: 20,
      },
    };
  }

  if (cleanUrl === '/datasets' && method === 'post') {
    const newDs = {
      id: `dataset-${Date.now()}`,
      name: data?.name || 'New Dataset',
      description: data?.description || 'Uploaded dataset source',
      fileType: 'text/csv',
      fileSize: 2048,
      status: 'COMPLETED' as DatasetStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      owner: { id: 'usr-demo-001', name: 'Demo User', email: 'demo@knowverse.dev' },
      _count: { documents: 1 },
    };
    stateDatasets = [newDs, ...stateDatasets];

    const newDoc = {
      id: `doc-${Date.now()}`,
      datasetId: newDs.id,
      title: `${newDs.name} Document`,
      content: `Knowledge content for ${newDs.name}. Includes automatically parsed entities and relational triples.`,
      source: 'Uploaded file',
      createdAt: new Date().toISOString(),
      dataset: { id: newDs.id, name: newDs.name },
    };
    stateDocuments = [newDoc, ...stateDocuments];

    return { success: true, data: newDs };
  }

  // Upload file to dataset
  if (cleanUrl.match(/^\/datasets\/[^/]+\/upload$/) && method === 'post') {
    const parts = cleanUrl.split('/');
    const dsId = parts[2];
    const ds = stateDatasets.find(d => d.id === dsId);
    if (ds) {
      ds.status = 'COMPLETED';
      ds._count.documents += 1;
      const newDoc = {
        id: `doc-up-${Date.now()}`,
        datasetId: ds.id,
        title: `Uploaded Document (${new Date().toLocaleTimeString()})`,
        content: `Uploaded content for dataset ${ds.name}. Ready for automated NLP extraction.`,
        source: 'User Upload',
        createdAt: new Date().toISOString(),
        dataset: { id: ds.id, name: ds.name },
      };
      stateDocuments = [newDoc, ...stateDocuments];
    }
    return { success: true, data: { datasetId: dsId, status: 'COMPLETED' } };
  }

  if (cleanUrl.startsWith('/datasets/') && method === 'get') {
    const id = cleanUrl.split('/')[2];
    const ds = stateDatasets.find(d => d.id === id) || stateDatasets[0];
    return { success: true, data: ds };
  }

  if (cleanUrl.startsWith('/datasets/') && method === 'delete') {
    const id = cleanUrl.split('/')[2];
    stateDatasets = stateDatasets.filter(d => d.id !== id);
    return { success: true, message: 'Dataset deleted' };
  }

  // ── Documents ────────────────────────────────────────────────────────
  if (cleanUrl === '/documents' && method === 'get') {
    return {
      success: true,
      data: {
        documents: stateDocuments,
        total: stateDocuments.length,
      },
    };
  }

  if (cleanUrl.startsWith('/documents/') && method === 'get') {
    const id = cleanUrl.split('/')[2];
    const doc = stateDocuments.find(d => d.id === id) || stateDocuments[0];
    return { success: true, data: doc };
  }

  // ── NLP Extractions ──────────────────────────────────────────────────
  if (cleanUrl.startsWith('/extractions/document/') && cleanUrl.endsWith('/schema')) {
    return {
      success: true,
      data: {
        isStructured: true,
        columns: ['Student', 'Course', 'Topic', 'MasteryScore', 'Institution'],
        totalRows: 45,
        previewRows: [
          { Student: 'Rohan Sharma', Course: 'Deep Learning', Topic: 'Transformers', MasteryScore: '92%', Institution: 'Infosys Training' },
          { Student: 'Priya Patel', Course: 'NLP', Topic: 'NER & Dependency Parsing', MasteryScore: '95%', Institution: 'KnowVerse Lab' },
        ],
      },
    };
  }

  if (cleanUrl === '/extractions' && method === 'get') {
    return {
      success: true,
      data: {
        runs: [
          {
            id: 'ext-run-001',
            documentId: stateDocuments[0]?.id || 'seed-doc-001',
            modelName: 'spaCy + Transformer Pipeline',
            status: 'COMPLETED',
            createdAt: '2026-08-24T10:00:00Z',
            results: stateTriples.map((t, i) => ({
              id: `ext-res-${i}`,
              subject: t.subject,
              relation: t.relation,
              object: t.object,
              confidence: t.confidence,
              status: t.status,
              sourceText: t.sourceText || `Extracted relationship for ${t.subject}`,
            })),
          },
        ],
        total: 1,
      },
    };
  }

  if (cleanUrl === '/extractions' && method === 'post') {
    return {
      success: true,
      data: {
        id: `ext-run-${Date.now()}`,
        status: 'COMPLETED',
        results: stateTriples,
      },
    };
  }

  if (cleanUrl.match(/^\/extractions\/[^/]+\/approve$/)) {
    return { success: true, message: 'Triple approved into Knowledge Graph' };
  }

  if (cleanUrl.match(/^\/extractions\/[^/]+\/reject$/)) {
    return { success: true, message: 'Triple rejected' };
  }

  if (cleanUrl.match(/^\/extractions\/[^/]+\/approve-all$/)) {
    return { success: true, message: 'All triples approved' };
  }

  if (cleanUrl.match(/^\/extractions\/[^/]+\/reject-all$/)) {
    return { success: true, message: 'All triples rejected' };
  }

  // ── Graph ────────────────────────────────────────────────────────────
  if (cleanUrl === '/graph' && method === 'get') {
    return {
      success: true,
      data: {
        entities: stateEntities,
        relations: stateRelations,
        triples: stateTriples,
      },
    };
  }

  if (cleanUrl === '/graph/stats') {
    return {
      success: true,
      data: {
        totalEntities: stateEntities.length,
        totalRelations: stateRelations.length,
        totalTriples: stateTriples.length,
        approvedTriples: stateTriples.filter(t => t.status === 'APPROVED').length,
        pendingTriples: stateTriples.filter(t => t.status === 'PENDING').length,
        density: 0.18,
        topEntities: stateEntities.map(e => ({ id: e.id, name: e.name, entityType: e.entityType, degree: e.degree || 2 })),
      },
    };
  }

  if (cleanUrl === '/graph/analytics') {
    return {
      success: true,
      data: {
        metrics: {
          totalEntities: stateEntities.length,
          totalTriples: stateTriples.length,
          density: 0.18,
          isolatedCount: 0,
        },
        entityTypeDistribution: [
          { type: 'ORG', count: 5 },
          { type: 'PERSON', count: 3 },
          { type: 'PRODUCT', count: 2 },
          { type: 'CONCEPT', count: 1 },
        ],
        topRelations: [
          { name: 'developed', count: 2 },
          { name: 'founded', count: 1 },
          { name: 'is subsidiary of', count: 1 },
          { name: 'created', count: 1 },
          { name: 'defeated', count: 1 },
        ],
        topEntities: [
          { name: 'OpenAI', degree: 3, entityType: 'ORG' },
          { name: 'DeepMind', degree: 2, entityType: 'ORG' },
          { name: 'Google', degree: 2, entityType: 'ORG' },
          { name: 'Infosys', degree: 2, entityType: 'ORG' },
        ],
        confidenceDistribution: [
          { range: '0.90-1.00', count: 6 },
          { range: '0.70-0.89', count: 3 },
        ],
      },
    };
  }

  if (cleanUrl === '/graph/clusters') {
    return {
      success: true,
      data: [
        { id: 'c1', name: 'AI & Research Lab', entities: ['OpenAI', 'ChatGPT', 'Sam Altman', 'Microsoft'], color: '#3b82f6' },
        { id: 'c2', name: 'DeepMind & Game AI', entities: ['DeepMind', 'Google', 'AlphaGo', 'Lee Sedol'], color: '#10b981' },
        { id: 'c3', name: 'Enterprise IT', entities: ['Infosys', 'Narayana Murthy', 'Artificial Intelligence'], color: '#8b5cf6' },
      ],
    };
  }

  if (cleanUrl.startsWith('/graph/entities/') && cleanUrl.endsWith('/neighborhood')) {
    return {
      success: true,
      data: {
        entities: stateEntities.slice(0, 5),
        relations: stateRelations.slice(0, 4),
        triples: stateTriples.slice(0, 4),
      },
    };
  }

  if (cleanUrl.startsWith('/graph/entities/') && method === 'get') {
    const id = cleanUrl.split('/')[3];
    const entity = stateEntities.find(e => e.id === id) || stateEntities[0];
    return {
      success: true,
      data: {
        ...entity,
        subjectTriples: stateTriples.filter(t => t.subjectEntityId === entity.id).map(t => ({
          id: t.id,
          relation: { id: t.relationId, name: t.relation },
          objectEntity: { id: t.objectEntityId, name: t.object, entityType: 'ORG' },
          confidence: t.confidence,
        })),
        objectTriples: stateTriples.filter(t => t.objectEntityId === entity.id).map(t => ({
          id: t.id,
          relation: { id: t.relationId, name: t.relation },
          subjectEntity: { id: t.subjectEntityId, name: t.subject, entityType: 'PERSON' },
          confidence: t.confidence,
        })),
      },
    };
  }

  if (cleanUrl.match(/^\/graph\/triples\/[^/]+\/provenance$/)) {
    return {
      success: true,
      data: {
        extractionModel: 'spaCy + Transformer NER',
        confidence: 0.98,
        sourceDocumentTitle: 'AI Companies and Relationships',
        sourceText: 'Infosys was founded by Narayana Murthy in 1981.',
      },
    };
  }

  if (cleanUrl === '/graph/relations') {
    return { success: true, data: stateRelations };
  }

  if (cleanUrl === '/graph/duplicates') {
    return { success: true, data: [] };
  }

  if (cleanUrl === '/graph/search') {
    return { success: true, data: stateEntities };
  }

  // ── AI Assistant ─────────────────────────────────────────────────────
  if (cleanUrl === '/ai/chat' && method === 'post') {
    const q = (data?.message || '').toLowerCase();
    let answer = "KnowVerse Knowledge Graph contains verified entities and relationships about AI organizations (Infosys, OpenAI, Google, DeepMind, Microsoft).";

    if (q.includes('infosys') || q.includes('narayana')) {
      answer = "**Infosys** is a leading global information technology enterprise founded by **Narayana Murthy** in 1981.\n\n- **Entity Type**: `ORG`\n- **Key Triples**: `(Narayana Murthy, founded, Infosys)`, `(Infosys, provides, Artificial Intelligence)`\n- **Confidence**: 98% (Verified from dataset).";
    } else if (q.includes('openai') || q.includes('chatgpt') || q.includes('altman')) {
      answer = "**OpenAI** is an AI research and deployment company led by CEO **Sam Altman**.\n\n- **Products**: Developed **ChatGPT**.\n- **Partnerships**: Strategic investment from **Microsoft**.\n- **Multi-Hop Path**: `Sam Altman` → `[CEO of]` → `OpenAI` → `[developed]` → `ChatGPT`.";
    } else if (q.includes('deepmind') || q.includes('alphago') || q.includes('google') || q.includes('lee sedol')) {
      answer = "**DeepMind** is an AI subsidiary of **Google**.\n\n- Created **AlphaGo**, which famously defeated 9-dan champion **Lee Sedol** in 2016.\n- **Connected Graph Path**: `Google` ← `[subsidiary]` ← `DeepMind` → `[created]` → `AlphaGo` → `[defeated]` → `Lee Sedol`.";
    } else if (q.includes('dataset') || q.includes('upload')) {
      answer = "To upload a dataset:\n1. Click **Datasets** in the sidebar navigation.\n2. Click **+ New Dataset** and enter a name.\n3. Upload your CSV, TXT, or JSON file.\n4. Click **Extract** to launch automated NLP entity & relationship extraction!";
    } else if (q.includes('hello') || q.includes('hi')) {
      answer = "Hello! I am your **KnowVerse Zero-Hallucination Grounded AI Assistant**.\n\nI answer questions strictly grounded in your verified Knowledge Graph triples (Infosys, OpenAI, Google, DeepMind, Microsoft). How can I assist your discovery today?";
    }

    return {
      success: true,
      data: {
        reply: answer,
        sources: stateTriples.slice(0, 3),
        confidence: 0.98,
        conversationId: data?.conversationId || `conv-${Date.now()}`,
      },
    };
  }

  if (cleanUrl === '/ai/conversations') {
    return { success: true, data: [] };
  }

  if (cleanUrl === '/ai/insights' && method === 'get') {
    return { success: true, data: stateInsights };
  }

  if (cleanUrl === '/ai/insights' && method === 'post') {
    const insight = { id: `ins-${Date.now()}`, ...data, createdAt: new Date().toISOString() };
    stateInsights.push(insight);
    return { success: true, data: insight };
  }

  // ── Students & Career Readiness ──────────────────────────────────────
  if (cleanUrl === '/students' && method === 'get') {
    return { success: true, data: initialStudents };
  }

  if (cleanUrl.startsWith('/students/')) {
    const id = cleanUrl.split('/')[2];
    const std = initialStudents.find(s => s.id === id) || initialStudents[0];
    return {
      success: true,
      data: {
        student: std,
        knowledgeMastery: [
          { domain: 'Machine Learning', score: 88, fullMark: 100 },
          { domain: 'Deep Learning', score: 82, fullMark: 100 },
          { domain: 'NLP & Knowledge Graphs', score: 94, fullMark: 100 },
          { domain: 'Data Structures & Algo', score: 85, fullMark: 100 },
          { domain: 'System Design', score: 76, fullMark: 100 },
        ],
        skillGap: {
          readyPercentage: 86,
          missingPrerequisites: ['Distributed Training', 'TensorRT Optimization'],
          masteredTopics: ['Transformers', 'Graph Neural Networks', 'PyTorch', 'Vector Databases'],
        },
        availableRoles: [
          { id: 'ml-engineer', title: 'Machine Learning Engineer' },
          { id: 'data-scientist', title: 'Data Scientist' },
          { id: 'fullstack', title: 'Full Stack Engineer' },
        ],
      },
    };
  }

  // ── Feedback ─────────────────────────────────────────────────────────
  if (cleanUrl === '/feedback' && method === 'get') {
    return {
      success: true,
      data: {
        feedback: [
          { id: 'fb-1', rating: 5, comment: 'Awesome knowledge graph explorer! Very intuitive.', status: 'REVIEWED', createdAt: '2026-08-24T10:00:00Z', adminResponse: 'Thank you!' },
          { id: 'fb-2', rating: 4, comment: 'AI Assistant path tracing is very accurate.', status: 'OPEN', createdAt: '2026-08-24T12:00:00Z' },
        ],
        total: 2,
      },
    };
  }

  if (cleanUrl === '/feedback' && method === 'post') {
    return { success: true, message: 'Feedback submitted' };
  }

  if (cleanUrl === '/feedback/stats') {
    return { success: true, data: { total: 2, avgRating: 4.5 } };
  }

  // ── Admin ────────────────────────────────────────────────────────────
  if (cleanUrl.startsWith('/admin/stats')) {
    return {
      success: true,
      data: {
        users: 24,
        activeUsers: 18,
        datasets: stateDatasets.length,
        entities: stateEntities.length,
        pendingTriples: 0,
        openFeedback: 2,
        recentActivity: [
          { id: 'act-1', action: 'VERCEL_CLOUD_DEPLOY', user: { name: 'Admin User' }, createdAt: new Date().toISOString() },
          { id: 'act-2', action: 'TRIPLE_EXTRACTION_SUCCESS', user: { name: 'Demo User' }, createdAt: new Date().toISOString() },
          { id: 'act-3', action: 'USER_REGISTERED', user: { name: 'Rohan Sharma' }, createdAt: new Date().toISOString() },
        ],
      },
    };
  }

  if (cleanUrl.startsWith('/admin/users')) {
    return {
      success: true,
      data: {
        users: [
          mockAdminUser,
          mockUser,
          ...initialStudents.map((s, i) => ({
            id: `usr-s-${i}`,
            name: s.name,
            email: s.email,
            role: 'USER' as const,
            isActive: true,
            createdAt: '2026-08-24T10:00:00Z',
            updatedAt: '2026-08-24T10:00:00Z',
          })),
        ],
        total: 5,
      },
    };
  }

  if (cleanUrl.startsWith('/admin/audit-logs')) {
    return {
      success: true,
      data: {
        logs: [
          { id: 'log-1', action: 'CLOUD_DEPLOY_READY', entityType: 'System', createdAt: new Date().toISOString(), user: mockAdminUser },
          { id: 'log-2', action: 'KNOWLEDGE_TRIPLE_SYNC', entityType: 'Triple', createdAt: new Date().toISOString(), user: mockUser },
          { id: 'log-3', action: 'DATASET_AUTO_INDEX', entityType: 'Dataset', createdAt: new Date().toISOString(), user: mockUser },
        ],
        total: 3,
      },
    };
  }

  if (cleanUrl.startsWith('/admin/graph/versions')) {
    return { success: true, data: [] };
  }

  return { success: true, data: [] };
}
