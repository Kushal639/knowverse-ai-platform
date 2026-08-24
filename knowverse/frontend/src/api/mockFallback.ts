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
};

export const mockAdminUser: User = {
  id: 'usr-admin-001',
  name: 'Admin User',
  email: 'admin@knowverse.dev',
  role: 'ADMIN',
  isActive: true,
  createdAt: '2026-08-24T10:00:00Z',
  updatedAt: '2026-08-24T10:00:00Z',
};

export const mockEntities = [
  { id: 'ent-infosys', name: 'Infosys', normalizedName: 'infosys', entityType: 'ORG', description: 'Indian multinational IT company' },
  { id: 'ent-narayana', name: 'Narayana Murthy', normalizedName: 'narayana murthy', entityType: 'PERSON', description: 'Founder of Infosys' },
  { id: 'ent-google', name: 'Google', normalizedName: 'google', entityType: 'ORG', description: 'Global technology company' },
  { id: 'ent-deepmind', name: 'DeepMind', normalizedName: 'deepmind', entityType: 'ORG', description: 'AI research laboratory' },
  { id: 'ent-alphago', name: 'AlphaGo', normalizedName: 'alphago', entityType: 'PRODUCT', description: 'Computer program that plays Go' },
  { id: 'ent-lee-sedol', name: 'Lee Sedol', normalizedName: 'lee sedol', entityType: 'PERSON', description: '9-dan professional Go player' },
  { id: 'ent-openai', name: 'OpenAI', normalizedName: 'openai', entityType: 'ORG', description: 'AI research and deployment company' },
  { id: 'ent-chatgpt', name: 'ChatGPT', normalizedName: 'chatgpt', entityType: 'PRODUCT', description: 'Generative AI chatbot' },
  { id: 'ent-microsoft', name: 'Microsoft', normalizedName: 'microsoft', entityType: 'ORG', description: 'Global software corporation' },
  { id: 'ent-sam-altman', name: 'Sam Altman', normalizedName: 'sam altman', entityType: 'PERSON', description: 'CEO of OpenAI' },
  { id: 'ent-ai', name: 'Artificial Intelligence', normalizedName: 'artificial intelligence', entityType: 'CONCEPT', description: 'Intelligence demonstrated by machines' },
];

export const mockRelations = [
  { id: 'rel-founded', name: 'founded', normalizedName: 'founded' },
  { id: 'rel-is-subsidiary', name: 'is subsidiary of', normalizedName: 'is subsidiary of' },
  { id: 'rel-created', name: 'created', normalizedName: 'created' },
  { id: 'rel-defeated', name: 'defeated', normalizedName: 'defeated' },
  { id: 'rel-developed', name: 'developed', normalizedName: 'developed' },
  { id: 'rel-invested-in', name: 'invested in', normalizedName: 'invested in' },
  { id: 'rel-ceo-of', name: 'CEO of', normalizedName: 'ceo of' },
  { id: 'rel-provides', name: 'provides', normalizedName: 'provides' },
];

export const mockTriples = [
  { id: 'trp-1', subjectEntityId: 'ent-narayana', relationId: 'rel-founded', objectEntityId: 'ent-infosys', confidence: 0.98, status: 'APPROVED' as TripleStatus, subject: 'Narayana Murthy', relation: 'founded', object: 'Infosys' },
  { id: 'trp-2', subjectEntityId: 'ent-deepmind', relationId: 'rel-is-subsidiary', objectEntityId: 'ent-google', confidence: 0.95, status: 'APPROVED' as TripleStatus, subject: 'DeepMind', relation: 'is subsidiary of', object: 'Google' },
  { id: 'trp-3', subjectEntityId: 'ent-deepmind', relationId: 'rel-created', objectEntityId: 'ent-alphago', confidence: 0.97, status: 'APPROVED' as TripleStatus, subject: 'DeepMind', relation: 'created', object: 'AlphaGo' },
  { id: 'trp-4', subjectEntityId: 'ent-alphago', relationId: 'rel-defeated', objectEntityId: 'ent-lee-sedol', confidence: 0.99, status: 'APPROVED' as TripleStatus, subject: 'AlphaGo', relation: 'defeated', object: 'Lee Sedol' },
  { id: 'trp-5', subjectEntityId: 'ent-openai', relationId: 'rel-developed', objectEntityId: 'ent-chatgpt', confidence: 0.99, status: 'APPROVED' as TripleStatus, subject: 'OpenAI', relation: 'developed', object: 'ChatGPT' },
  { id: 'trp-6', subjectEntityId: 'ent-microsoft', relationId: 'rel-invested-in', objectEntityId: 'ent-openai', confidence: 0.96, status: 'APPROVED' as TripleStatus, subject: 'Microsoft', relation: 'invested in', object: 'OpenAI' },
  { id: 'trp-7', subjectEntityId: 'ent-sam-altman', relationId: 'rel-ceo-of', objectEntityId: 'ent-openai', confidence: 0.98, status: 'APPROVED' as TripleStatus, subject: 'Sam Altman', relation: 'CEO of', object: 'OpenAI' },
  { id: 'trp-8', subjectEntityId: 'ent-google', relationId: 'rel-developed', objectEntityId: 'ent-ai', confidence: 0.75, status: 'APPROVED' as TripleStatus, subject: 'Google', relation: 'developed', object: 'Artificial Intelligence' },
  { id: 'trp-9', subjectEntityId: 'ent-infosys', relationId: 'rel-provides', objectEntityId: 'ent-ai', confidence: 0.70, status: 'APPROVED' as TripleStatus, subject: 'Infosys', relation: 'provides', object: 'Artificial Intelligence' },
];

export const mockDatasets = [
  {
    id: 'seed-dataset-001',
    name: 'AI & Technology Knowledge Base',
    description: 'A comprehensive dataset covering Artificial Intelligence, company structures, and founder relationships.',
    fileType: 'text/plain',
    fileSize: 1024,
    status: 'COMPLETED' as DatasetStatus,
    documentCount: 1,
    createdAt: '2026-08-24T10:00:00Z',
    updatedAt: '2026-08-24T10:00:00Z',
  },
];

export const mockDocuments = [
  {
    id: 'seed-doc-001',
    datasetId: 'seed-dataset-001',
    title: 'AI Companies and Relationships',
    content: 'Infosys was founded by Narayana Murthy. DeepMind is a subsidiary of Google and created AlphaGo. OpenAI developed ChatGPT with investment from Microsoft.',
    createdAt: '2026-08-24T10:00:00Z',
  },
];

export const mockExtractions = [
  {
    id: 'ext-run-001',
    documentId: 'seed-doc-001',
    modelName: 'spaCy + Transformer NER',
    status: 'COMPLETED',
    createdAt: '2026-08-24T10:00:00Z',
    results: mockTriples.map((t, i) => ({
      id: `ext-res-${i}`,
      subject: t.subject,
      relation: t.relation,
      object: t.object,
      confidence: t.confidence,
      status: t.status,
      sourceText: `Extracted from document snippet for ${t.subject}`,
    })),
  },
];

export const mockStudents = [
  { id: 'std-1', name: 'Rohan Sharma', email: 'rohan@example.com', targetRole: 'Machine Learning Engineer', overallMastery: 84 },
  { id: 'std-2', name: 'Priya Patel', email: 'priya@example.com', targetRole: 'Data Scientist', overallMastery: 91 },
  { id: 'std-3', name: 'Ananya Verma', email: 'ananya@example.com', targetRole: 'Full Stack Engineer', overallMastery: 78 },
];

export function handleMockRoute(url: string, method: string, data?: any): any {
  const cleanUrl = url.replace(/^\/api/, '').split('?')[0];

  // Auth
  if (cleanUrl === '/auth/login' && method.toLowerCase() === 'post') {
    const isAdmin = data?.email?.toLowerCase().includes('admin');
    const user = isAdmin ? mockAdminUser : { ...mockUser, email: data?.email || 'demo@knowverse.dev' };
    return { success: true, data: { user, token: 'mock-demo-token-xyz' } };
  }

  if (cleanUrl === '/auth/register' && method.toLowerCase() === 'post') {
    const user: User = {
      id: `usr-${Date.now()}`,
      name: data?.name || 'New Explorer',
      email: data?.email || 'user@example.com',
      role: 'USER',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return { success: true, data: { user, token: 'mock-registered-token-xyz' } };
  }

  if (cleanUrl === '/auth/me') {
    return { success: true, data: mockUser };
  }

  if (cleanUrl === '/auth/logout') {
    return { success: true, message: 'Logged out' };
  }

  // Graph
  if (cleanUrl === '/graph' || cleanUrl === '') {
    return {
      success: true,
      data: {
        entities: mockEntities,
        relations: mockRelations,
        triples: mockTriples,
      },
    };
  }

  if (cleanUrl === '/graph/stats') {
    return {
      success: true,
      data: {
        totalEntities: mockEntities.length,
        totalRelations: mockRelations.length,
        totalTriples: mockTriples.length,
        approvedTriples: mockTriples.filter(t => t.status === 'APPROVED').length,
        pendingTriples: mockTriples.filter(t => t.status === 'PENDING').length,
        density: 0.18,
      },
    };
  }

  if (cleanUrl === '/graph/analytics') {
    return {
      success: true,
      data: {
        density: 0.18,
        avgDegree: 2.2,
        topHubs: [
          { name: 'OpenAI', degree: 3, entityType: 'ORG' },
          { name: 'DeepMind', degree: 2, entityType: 'ORG' },
          { name: 'Google', degree: 2, entityType: 'ORG' },
          { name: 'Infosys', degree: 2, entityType: 'ORG' },
        ],
        typeDistribution: {
          ORG: 5,
          PERSON: 3,
          PRODUCT: 2,
          CONCEPT: 1,
        },
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

  // Datasets & Documents
  if (cleanUrl === '/datasets') {
    return { success: true, data: mockDatasets };
  }

  if (cleanUrl === '/documents') {
    return { success: true, data: mockDocuments };
  }

  if (cleanUrl === '/extractions') {
    return { success: true, data: mockExtractions };
  }

  // AI Chat
  if (cleanUrl === '/ai/chat' && method.toLowerCase() === 'post') {
    const q = (data?.message || '').toLowerCase();
    let answer = "KnowVerse Knowledge Graph contains verified entities and relationships about AI organizations (Infosys, OpenAI, Google, DeepMind, Microsoft).";
    if (q.includes('infosys')) {
      answer = "**Infosys** is an Indian multinational IT company founded in 1981 by **Narayana Murthy**. It provides software development and AI services.";
    } else if (q.includes('openai') || q.includes('chatgpt')) {
      answer = "**OpenAI** is an AI research organization led by CEO **Sam Altman**. OpenAI developed **ChatGPT** and received strategic investments from **Microsoft**.";
    } else if (q.includes('deepmind') || q.includes('alphago')) {
      answer = "**DeepMind** is an AI subsidiary of **Google**. DeepMind developed **AlphaGo**, which famously defeated 9-dan champion **Lee Sedol** in 2016.";
    } else if (q.includes('hello') || q.includes('hi')) {
      answer = "Hello! I am your **KnowVerse Zero-Hallucination Grounded AI Assistant**. Ask me any question about the entities, relations, or multi-hop paths in the Knowledge Graph!";
    }

    return {
      success: true,
      data: {
        reply: answer,
        sources: mockTriples.slice(0, 3),
        confidence: 0.96,
      },
    };
  }

  // Students & Recommendations
  if (cleanUrl.startsWith('/students')) {
    return { success: true, data: mockStudents };
  }

  // Admin
  if (cleanUrl.startsWith('/admin/stats')) {
    return {
      success: true,
      data: {
        totalUsers: 24,
        activeUsers: 18,
        totalDatasets: 8,
        totalTriples: mockTriples.length,
        systemHealth: '100% Operational',
      },
    };
  }

  if (cleanUrl.startsWith('/admin/users')) {
    return {
      success: true,
      data: [mockAdminUser, mockUser, ...mockStudents.map((s, i) => ({
        id: `usr-s-${i}`,
        name: s.name,
        email: s.email,
        role: 'USER' as const,
        isActive: true,
        createdAt: '2026-08-24T10:00:00Z',
        updatedAt: '2026-08-24T10:00:00Z',
      }))],
    };
  }

  if (cleanUrl.startsWith('/admin/audit-logs')) {
    return {
      success: true,
      data: [
        { id: 'log-1', action: 'DEPLOY_VERCEL', entityType: 'System', createdAt: new Date().toISOString(), user: mockAdminUser },
        { id: 'log-2', action: 'GRAPH_TRIPLE_ADD', entityType: 'Triple', createdAt: new Date().toISOString(), user: mockUser },
      ],
    };
  }

  return { success: true, data: [] };
}
