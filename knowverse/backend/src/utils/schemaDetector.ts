import { parse } from 'csv-parse/sync';

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

export interface ColumnMappingConfig {
  [columnName: string]: SemanticRole;
}

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

export function detectDocumentSchema(content: string, filename?: string): DocumentSchemaInfo {
  const trimmed = content.trim();

  // Check JSON format
  if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
    try {
      const parsed = JSON.parse(trimmed);
      const rows = Array.isArray(parsed) ? parsed : [parsed];
      if (rows.length > 0 && typeof rows[0] === 'object' && rows[0] !== null) {
        return analyzeStructuredRecords(rows, 'JSON');
      }
    } catch {
      // not valid JSON, proceed to CSV check
    }
  }

  // Check CSV / TSV format
  const delimiter = filename?.endsWith('.tsv') || (!filename && content.includes('\t') && !content.includes(',')) ? '\t' : ',';
  const lines = trimmed.split('\n').filter(l => l.trim().length > 0);

  if (lines.length >= 2) {
    try {
      const records = parse(trimmed, {
        delimiter,
        columns: true,
        skip_empty_lines: true,
        trim: true,
        to: 20, // parse up to first 20 records for detection
        relax_column_count: true,
      });

      if (records.length > 0 && Object.keys(records[0]).length >= 2) {
        const docType = delimiter === '\t' ? 'TSV' : 'CSV';
        return analyzeStructuredRecords(records, docType);
      }
    } catch {
      // CSV parsing failed, fallback to plain text
    }
  }

  // Default: Plain Text / Natural Language
  return {
    documentType: 'TEXT',
    recommendedMode: 'NATURAL_LANGUAGE',
    totalRowsEstimate: lines.length,
    columns: [],
    previewRows: [],
    hasTextColumns: false,
    hasSemanticColumns: false,
  };
}

function analyzeStructuredRecords(records: Record<string, string>[], documentType: 'CSV' | 'TSV' | 'JSON'): DocumentSchemaInfo {
  const columnNames = Object.keys(records[0] || {});
  const columns: ColumnSchema[] = [];
  let hasTextColumns = false;
  let hasSemanticColumns = false;

  for (const col of columnNames) {
    const samples = records.map(r => String(r[col] || '').trim()).filter(Boolean).slice(0, 5);
    const { role, entityType, confidence } = inferSemanticRole(col, samples);

    if (role === 'TEXT_SOURCE') hasTextColumns = true;
    if (role !== 'IGNORE') hasSemanticColumns = true;

    columns.push({
      name: col,
      inferredRole: role,
      sampleValues: samples,
      entityType,
      confidence,
    });
  }

  // If there are both structured entity columns and long text columns, recommend HYBRID
  const recommendedMode = hasTextColumns && hasSemanticColumns
    ? 'HYBRID'
    : hasSemanticColumns
    ? 'STRUCTURED'
    : 'NATURAL_LANGUAGE';

  return {
    documentType,
    recommendedMode,
    totalRowsEstimate: records.length,
    columns,
    previewRows: records.slice(0, 5),
    hasTextColumns,
    hasSemanticColumns,
  };
}

export function inferSemanticRole(colName: string, samples: string[]): { role: SemanticRole; entityType?: string; confidence: number } {
  const norm = colName.toLowerCase().replace(/[^a-z0-9_]/g, '_').trim();
  const avgLength = samples.length ? samples.reduce((acc, s) => acc + s.length, 0) / samples.length : 0;

  // 1. Text / NLP Source (long descriptive text)
  if (
    norm.includes('knowledge') ||
    norm.includes('text') ||
    norm.includes('description') ||
    norm.includes('summary') ||
    norm.includes('notes') ||
    norm.includes('content') ||
    norm.includes('bio') ||
    norm.includes('abstract') ||
    norm.includes('details') ||
    norm.includes('comment') ||
    avgLength > 60
  ) {
    return { role: 'TEXT_SOURCE', confidence: 0.95 };
  }

  // 2. Primary Entity Name
  if (
    norm === 'student_name' ||
    norm === 'student' ||
    norm === 'name' ||
    norm === 'person_name' ||
    norm === 'person' ||
    norm === 'user_name' ||
    norm === 'user' ||
    norm === 'author' ||
    norm === 'employee' ||
    norm === 'entity_name' ||
    norm === 'entity' ||
    norm === 'subject_name' ||
    norm === 'title'
  ) {
    const isPerson = norm.includes('student') || norm.includes('person') || norm.includes('user') || norm.includes('author') || norm.includes('employee');
    return { role: 'ENTITY_NAME', entityType: isPerson ? 'PERSON' : 'ENTITY', confidence: 0.98 };
  }

  // 3. Entity ID
  if (
    norm === 'student_id' ||
    norm === 'id' ||
    norm === 'user_id' ||
    norm === 'roll_no' ||
    norm === 'roll_number' ||
    norm === 'usn' ||
    norm === 'code'
  ) {
    return { role: 'ENTITY_ID', entityType: 'IDENTIFIER', confidence: 0.95 };
  }

  // 4. Department / Category / Organization
  if (
    norm === 'department' ||
    norm === 'dept' ||
    norm === 'branch' ||
    norm === 'faculty' ||
    norm === 'category' ||
    norm === 'domain' ||
    norm === 'org' ||
    norm === 'organization' ||
    norm === 'company' ||
    norm === 'division'
  ) {
    return { role: 'CATEGORY', entityType: 'DEPARTMENT', confidence: 0.95 };
  }

  // 5. Subject / Course / Skill
  if (
    norm === 'subject' ||
    norm === 'course' ||
    norm === 'course_name' ||
    norm === 'skill' ||
    norm === 'technology' ||
    norm === 'discipline'
  ) {
    return { role: 'SUBJECT', entityType: 'SUBJECT', confidence: 0.95 };
  }

  // 6. Topic / Concept / Module
  if (
    norm === 'topic' ||
    norm === 'subtopic' ||
    norm === 'concept' ||
    norm === 'module' ||
    norm === 'unit' ||
    norm === 'chapter' ||
    norm === 'keyword'
  ) {
    return { role: 'TOPIC', entityType: 'TOPIC', confidence: 0.95 };
  }

  // 7. Attribute / Grade / Score
  if (
    norm === 'grade' ||
    norm === 'score' ||
    norm === 'marks' ||
    norm === 'percentage' ||
    norm === 'gpa' ||
    norm === 'cgpa' ||
    norm === 'status' ||
    norm === 'level' ||
    norm === 'rating' ||
    norm === 'year' ||
    norm === 'semester'
  ) {
    return { role: 'ATTRIBUTE', confidence: 0.92 };
  }

  // 8. Explicit Triples Source / Relation / Target
  if (norm === 'source' || norm === 'head' || norm === 'from' || norm === 'subject_entity') {
    return { role: 'RELATION_SOURCE', confidence: 0.95 };
  }
  if (norm === 'relation' || norm === 'predicate' || norm === 'relationship') {
    return { role: 'RELATION', confidence: 0.95 };
  }
  if (norm === 'target' || norm === 'tail' || norm === 'to' || norm === 'object_entity') {
    return { role: 'RELATION_TARGET', confidence: 0.95 };
  }

  // Default heuristic based on string length & format
  if (avgLength < 30) {
    return { role: 'ATTRIBUTE', confidence: 0.6 };
  }

  return { role: 'IGNORE', confidence: 0.5 };
}
