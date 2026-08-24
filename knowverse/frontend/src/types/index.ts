export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  _count?: { datasets: number; triples: number; feedback: number };
}

export interface Dataset {
  id: string;
  name: string;
  description?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  status: 'UPLOADED' | 'VALIDATING' | 'PROCESSING' | 'EXTRACTING' | 'REVIEWING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
  owner: Pick<User, 'id' | 'name' | 'email'>;
  _count: { documents: number };
}

export interface Document {
  id: string;
  datasetId: string;
  title: string;
  content: string;
  source?: string;
  createdAt: string;
  dataset?: Pick<Dataset, 'id' | 'name'>;
}

export interface EntityAlias {
  id: string;
  entityId: string;
  alias: string;
}

export interface Entity {
  id: string;
  name: string;
  normalizedName: string;
  entityType: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  aliases?: EntityAlias[];
  _count?: { subjectTriples: number; objectTriples: number };
}

export interface EntityDetail extends Entity {
  subjectTriples: Array<{
    id: string;
    relation: Relation;
    objectEntity: Pick<Entity, 'id' | 'name' | 'entityType'>;
    confidence: number;
    sourceDocument?: Pick<Document, 'id' | 'title'>;
  }>;
  objectTriples: Array<{
    id: string;
    relation: Relation;
    subjectEntity: Pick<Entity, 'id' | 'name' | 'entityType'>;
    confidence: number;
    sourceDocument?: Pick<Document, 'id' | 'title'>;
  }>;
}

export interface Relation {
  id: string;
  name: string;
  normalizedName: string;
  description?: string;
  _count?: { triples: number };
}

export interface Triple {
  id: string;
  subjectEntity: Pick<Entity, 'id' | 'name' | 'entityType'>;
  relation: Relation;
  objectEntity: Pick<Entity, 'id' | 'name' | 'entityType'>;
  confidence: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  sourceText?: string;
  extractionModel?: string;
  createdAt: string;
  updatedAt: string;
}

export type SemanticRole =
  | 'ENTITY_NAME'
  | 'ENTITY_ID'
  | 'CATEGORY'
  | 'SUBJECT'
  | 'TOPIC'
  | 'ATTRIBUTE'
  | 'RELATION_SOURCE'
  | 'RELATION'
  | 'RELATION_TARGET'
  | 'TEXT_SOURCE'
  | 'IGNORE';

export interface ColumnSchema {
  name: string;
  inferredRole: SemanticRole;
  sampleValues: string[];
  entityType?: string;
  confidence: number;
}

export interface DocumentSchemaInfo {
  documentType: 'CSV' | 'TSV' | 'JSON' | 'TEXT';
  recommendedMode: 'AUTO_DETECT' | 'STRUCTURED' | 'NATURAL_LANGUAGE' | 'HYBRID';
  totalRowsEstimate: number;
  columns: ColumnSchema[];
  previewRows: Record<string, string>[];
  hasTextColumns: boolean;
  hasSemanticColumns: boolean;
}

export interface ExtractionMetrics {
  totalRowsProcessed: number;
  entitiesDetectedCount: number;
  subjectsDetectedCount: number;
  topicsDetectedCount: number;
  departmentsDetectedCount: number;
  relationshipsExtractedCount: number;
  duplicatesMergedCount: number;
  structuredTriplesCount: number;
  nlpTriplesCount: number;
  confidenceAverage: number;
  entitiesListSummary?: {
    students: string[];
    subjects: string[];
    topics: string[];
    departments: string[];
  };
  zeroResultDiagnostics?: {
    reason: string;
    suggestion: string;
  };
}

export interface ExtractionRun {
  id: string;
  documentId: string;
  modelName: string;
  extractionMode?: string;
  metadata?: ExtractionMetrics;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  createdAt: string;
  document?: Pick<Document, 'id' | 'title'>;
  results?: ExtractionResult[];
  _count?: { results: number };
}

export interface ExtractionResult {
  id: string;
  subject: string;
  relation: string;
  object: string;
  confidence: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  sourceText?: string;
  extractionMethod?: 'STRUCTURED' | 'NLP' | 'HYBRID';
  metadata?: {
    sourceRow?: number;
    subjectType?: string;
    objectType?: string;
    attributeName?: string;
  };
}

export interface Feedback {
  id: string;
  rating: number;
  comment?: string;
  status: 'OPEN' | 'REVIEWED' | 'CLOSED';
  adminResponse?: string;
  createdAt: string;
  updatedAt: string;
  user?: Pick<User, 'id' | 'name' | 'email'>;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
  user?: Pick<User, 'id' | 'name' | 'email'>;
}

export interface AiConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  _count?: { messages: number };
  messages?: AiMessage[];
}

export interface AiMessage {
  id: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  metadata?: {
    answerType?: 'KNOWVERSE_FACT' | 'GENERAL_KNOWLEDGE' | 'INFERENCE' | 'WEBSITE_GUIDE' | 'UNKNOWN';
    confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
    confidenceScore?: number;
    graphContext?: any[];
    groundedFacts?: boolean;
    directFacts?: any[];
    sources?: any[];
    graphPaths?: any[];
    suggestedQuestions?: string[];
    actionButtons?: Array<{ label: string; route: string; variant?: string }>;
    steps?: string[];
    relatedEntities?: string[];
  };
  createdAt: string;
}

export interface GraphContextItem {
  entity: string;
  relation: string;
  connectedTo: string;
  confidence: number;
}

export interface GraphStats {
  totalEntities: number;
  totalRelations: number;
  totalTriples: number;
  approvedTriples: number;
  pendingTriples: number;
  rejectedTriples: number;
  topEntities: Array<{ id: string; name: string; entityType: string; degree: number }>;
}

export interface GraphData {
  entities: Entity[];
  triples: Triple[];
}

export interface GraphVersion {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  createdBy: Pick<User, 'id' | 'name'>;
  _count?: { changes: number };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
