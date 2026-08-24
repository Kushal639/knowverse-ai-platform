import { parse } from 'csv-parse/sync';
import axios from 'axios';
import { env } from '../config/env';
import logger from '../config/logger';
import { SemanticRole } from '../utils/schemaDetector';

export interface ColumnMappingConfig {
  [columnName: string]: SemanticRole;
}

export interface ExtractedTripleResult {
  subject: string;
  relation: string;
  object: string;
  confidence: number;
  sourceText: string;
  extractionMethod: 'STRUCTURED' | 'NLP' | 'HYBRID';
  metadata?: {
    sourceRow?: number;
    subjectType?: string;
    objectType?: string;
    attributeName?: string;
  };
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
  entitiesListSummary: {
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

export interface StructuredExtractionOutput {
  triples: ExtractedTripleResult[];
  metrics: ExtractionMetrics;
}

export async function extractFromStructuredData(
  content: string,
  columnMapping: ColumnMappingConfig,
  mode: 'STRUCTURED' | 'HYBRID' | 'NATURAL_LANGUAGE' | 'AUTO_DETECT' = 'HYBRID',
  delimiter = ','
): Promise<StructuredExtractionOutput> {
  const triples: ExtractedTripleResult[] = [];
  const entitiesSet = new Set<string>();
  const studentsSet = new Set<string>();
  const subjectsSet = new Set<string>();
  const topicsSet = new Set<string>();
  const departmentsSet = new Set<string>();

  let rows: Record<string, string>[] = [];

  try {
    rows = parse(content.trim(), {
      delimiter: delimiter === '\t' ? '\t' : ',',
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    });
  } catch (err) {
    logger.warn('Direct CSV parse failed, attempting line-based fallback:', err);
    // Fallback: parse basic header + lines
    const lines = content.trim().split('\n').filter(l => l.trim().length > 0);
    if (lines.length > 1) {
      const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
      rows = lines.slice(1).map(line => {
        const parts = line.split(delimiter).map(p => p.trim().replace(/^["']|["']$/g, ''));
        const obj: Record<string, string> = {};
        headers.forEach((h, idx) => {
          obj[h] = parts[idx] || '';
        });
        return obj;
      });
    }
  }

  if (rows.length === 0) {
    return {
      triples: [],
      metrics: {
        totalRowsProcessed: 0,
        entitiesDetectedCount: 0,
        subjectsDetectedCount: 0,
        topicsDetectedCount: 0,
        departmentsDetectedCount: 0,
        relationshipsExtractedCount: 0,
        duplicatesMergedCount: 0,
        structuredTriplesCount: 0,
        nlpTriplesCount: 0,
        confidenceAverage: 0,
        entitiesListSummary: { students: [], subjects: [], topics: [], departments: [] },
        zeroResultDiagnostics: {
          reason: 'No rows could be parsed from the uploaded dataset.',
          suggestion: 'Ensure the file is a valid CSV or TSV with a header row.',
        },
      },
    };
  }

  let rawTriplesCount = 0;
  let structuredCount = 0;
  let nlpCount = 0;

  // Process structured rows
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    const rowNumber = rowIndex + 1;
    const sourceLabel = `CSV row ${rowNumber}`;

    // Find primary entity
    let primaryEntity = '';
    let department = '';
    let subject = '';
    let grade = '';
    let topic = '';
    let explicitSource = '';
    let explicitRelation = '';
    let explicitTarget = '';
    const textColumns: string[] = [];

    for (const [col, role] of Object.entries(columnMapping)) {
      const val = (row[col] || '').trim();
      if (!val) continue;

      switch (role) {
        case 'ENTITY_NAME':
          primaryEntity = val;
          break;
        case 'CATEGORY':
          department = val;
          break;
        case 'SUBJECT':
          subject = val;
          break;
        case 'ATTRIBUTE':
          grade = val;
          break;
        case 'TOPIC':
          topic = val;
          break;
        case 'RELATION_SOURCE':
          explicitSource = val;
          break;
        case 'RELATION':
          explicitRelation = val;
          break;
        case 'RELATION_TARGET':
          explicitTarget = val;
          break;
        case 'TEXT_SOURCE':
          textColumns.push(val);
          break;
      }
    }

    // 1. Explicit Triples: (Source) -> [Relation] -> (Target)
    if (explicitSource && explicitRelation && explicitTarget) {
      triples.push({
        subject: explicitSource,
        relation: explicitRelation,
        object: explicitTarget,
        confidence: 0.98,
        sourceText: sourceLabel,
        extractionMethod: 'STRUCTURED',
        metadata: { sourceRow: rowNumber },
      });
      entitiesSet.add(explicitSource);
      entitiesSet.add(explicitTarget);
      rawTriplesCount++;
      structuredCount++;
    }

    // 2. Structured Entity Relationships
    if (primaryEntity) {
      entitiesSet.add(primaryEntity);
      studentsSet.add(primaryEntity);

      // Primary -> Department (e.g. Aarav Sharma -> belongs_to -> Computer Science)
      if (department) {
        triples.push({
          subject: primaryEntity,
          relation: 'belongs_to',
          object: department,
          confidence: 0.98,
          sourceText: sourceLabel,
          extractionMethod: 'STRUCTURED',
          metadata: { sourceRow: rowNumber, subjectType: 'PERSON', objectType: 'DEPARTMENT' },
        });
        entitiesSet.add(department);
        departmentsSet.add(department);
        rawTriplesCount++;
        structuredCount++;
      }

      // Primary -> Subject (e.g. Aarav Sharma -> studies -> Data Structures)
      if (subject) {
        triples.push({
          subject: primaryEntity,
          relation: 'studies',
          object: subject,
          confidence: 0.98,
          sourceText: sourceLabel,
          extractionMethod: 'STRUCTURED',
          metadata: { sourceRow: rowNumber, subjectType: 'PERSON', objectType: 'SUBJECT' },
        });
        entitiesSet.add(subject);
        subjectsSet.add(subject);
        rawTriplesCount++;
        structuredCount++;
      }

      // Primary -> Grade (e.g. Aarav Sharma -> has_grade -> A)
      if (grade) {
        triples.push({
          subject: primaryEntity,
          relation: 'has_grade',
          object: grade,
          confidence: 0.95,
          sourceText: sourceLabel,
          extractionMethod: 'STRUCTURED',
          metadata: { sourceRow: rowNumber, subjectType: 'PERSON', objectType: 'ATTRIBUTE', attributeName: 'grade' },
        });
        entitiesSet.add(grade);
        rawTriplesCount++;
        structuredCount++;
      }

      // Primary -> Topic (e.g. Aarav Sharma -> studies_topic -> Linked Lists and Trees)
      if (topic) {
        triples.push({
          subject: primaryEntity,
          relation: 'studies_topic',
          object: topic,
          confidence: 0.98,
          sourceText: sourceLabel,
          extractionMethod: 'STRUCTURED',
          metadata: { sourceRow: rowNumber, subjectType: 'PERSON', objectType: 'TOPIC' },
        });
        entitiesSet.add(topic);
        topicsSet.add(topic);
        rawTriplesCount++;
        structuredCount++;
      }
    }

    // 3. Domain Entity-to-Entity Interconnections (Subject -> Topic, Subject -> Department)
    if (subject && topic) {
      triples.push({
        subject: subject,
        relation: 'has_topic',
        object: topic,
        confidence: 0.99,
        sourceText: sourceLabel,
        extractionMethod: 'STRUCTURED',
        metadata: { sourceRow: rowNumber, subjectType: 'SUBJECT', objectType: 'TOPIC' },
      });
      entitiesSet.add(subject);
      entitiesSet.add(topic);
      subjectsSet.add(subject);
      topicsSet.add(topic);
      rawTriplesCount++;
      structuredCount++;
    }

    if (subject && department) {
      triples.push({
        subject: subject,
        relation: 'offered_by',
        object: department,
        confidence: 0.95,
        sourceText: sourceLabel,
        extractionMethod: 'STRUCTURED',
        metadata: { sourceRow: rowNumber, subjectType: 'SUBJECT', objectType: 'DEPARTMENT' },
      });
      entitiesSet.add(subject);
      entitiesSet.add(department);
      departmentsSet.add(department);
      rawTriplesCount++;
      structuredCount++;
    }

    // 4. NLP Extraction on Text Columns (Hybrid Mode)
    if (mode === 'HYBRID' || mode === 'AUTO_DETECT') {
      for (const text of textColumns) {
        if (!text || text.length < 5) continue;

        const nlpTriples = extractNlpFactsFromText(text, primaryEntity, rowNumber);
        for (const nt of nlpTriples) {
          triples.push(nt);
          entitiesSet.add(nt.subject);
          entitiesSet.add(nt.object);
          rawTriplesCount++;
          nlpCount++;
        }
      }
    }
  }

  // Deduplicate triples (case-insensitive on subject, relation, object)
  const uniqueMap = new Map<string, ExtractedTripleResult>();
  for (const t of triples) {
    const key = `${t.subject.toLowerCase().trim()}|${t.relation.toLowerCase().trim()}|${t.object.toLowerCase().trim()}`;
    const existing = uniqueMap.get(key);
    if (!existing || t.confidence > existing.confidence) {
      uniqueMap.set(key, t);
    }
  }

  const deduplicatedTriples = Array.from(uniqueMap.values());
  const duplicatesMerged = rawTriplesCount - deduplicatedTriples.length;
  const avgConfidence = deduplicatedTriples.length
    ? deduplicatedTriples.reduce((acc, t) => acc + t.confidence, 0) / deduplicatedTriples.length
    : 0;

  const metrics: ExtractionMetrics = {
    totalRowsProcessed: rows.length,
    entitiesDetectedCount: entitiesSet.size,
    subjectsDetectedCount: subjectsSet.size,
    topicsDetectedCount: topicsSet.size,
    departmentsDetectedCount: departmentsSet.size,
    relationshipsExtractedCount: deduplicatedTriples.length,
    duplicatesMergedCount: duplicatesMerged,
    structuredTriplesCount: structuredCount,
    nlpTriplesCount: nlpCount,
    confidenceAverage: Math.round(avgConfidence * 100) / 100,
    entitiesListSummary: {
      students: Array.from(studentsSet).slice(0, 15),
      subjects: Array.from(subjectsSet).slice(0, 15),
      topics: Array.from(topicsSet).slice(0, 15),
      departments: Array.from(departmentsSet).slice(0, 15),
    },
  };

  if (deduplicatedTriples.length === 0) {
    metrics.zeroResultDiagnostics = {
      reason: 'No valid entity relationships could be constructed from the mapped columns.',
      suggestion: 'Verify that you mapped at least an Entity Name column along with Category, Subject, or Topic columns.',
    };
  }

  return {
    triples: deduplicatedTriples,
    metrics,
  };
}

/**
 * Enhanced NLP rule engine for natural language text descriptions (e.g. knowledge_text)
 */
export function extractNlpFactsFromText(
  text: string,
  primaryEntity: string,
  rowNumber?: number
): ExtractedTripleResult[] {
  const results: ExtractedTripleResult[] = [];
  const sourceLabel = rowNumber ? `CSV row ${rowNumber} text` : text.substring(0, 80);

  // Pattern 1: "[Entity] is strong in / proficient in / skilled in [Skill] and [Skill]"
  // Example: "Aarav is strong in algorithmic problem solving and data structures."
  const strongInMatch = text.match(/(?:^|[\.\,\;]\s*)([A-Z][a-zA-Z\s]+?)\s+(?:is|was)\s+(?:strong|proficient|skilled|expert|talented)\s+in\s+([^,\.]+)/i);
  if (strongInMatch) {
    const subjectName = (primaryEntity || strongInMatch[1]).trim();
    const skillsBlob = strongInMatch[2].trim();

    // Split on 'and', 'as well as', or commas
    const skills = skillsBlob.split(/\s*(?:and|as well as|,)\s*/i).map(s => s.trim()).filter(s => s.length > 2);
    for (const skill of skills) {
      if (skill.length <= 80) {
        results.push({
          subject: subjectName,
          relation: 'understands',
          object: skill,
          confidence: 0.88,
          sourceText: text,
          extractionMethod: 'NLP',
          metadata: { sourceRow: rowNumber, subjectType: 'PERSON', objectType: 'SKILL' },
        });
      }
    }
  }

  // Pattern 2: "[Entity] works on / researches / specializes in [Topic]"
  const specializesMatch = text.match(/(?:^|[\.\,\;]\s*)([A-Z][a-zA-Z\s]+?)\s+(?:specializes|researches|works)\s+(?:in|on)\s+([^,\.]+)/i);
  if (specializesMatch) {
    const subjectName = (primaryEntity || specializesMatch[1]).trim();
    const topic = specializesMatch[2].trim();
    if (topic.length > 2 && topic.length <= 80) {
      results.push({
        subject: subjectName,
        relation: 'specializes_in',
        object: topic,
        confidence: 0.85,
        sourceText: text,
        extractionMethod: 'NLP',
        metadata: { sourceRow: rowNumber, subjectType: 'PERSON', objectType: 'TOPIC' },
      });
    }
  }

  // Pattern 3: "[Entity] completed / built / developed [Project/Topic]"
  const developedMatch = text.match(/(?:^|[\.\,\;]\s*)([A-Z][a-zA-Z\s]+?)\s+(?:completed|built|developed|created)\s+([^,\.]+)/i);
  if (developedMatch) {
    const subjectName = (primaryEntity || developedMatch[1]).trim();
    const project = developedMatch[2].trim();
    if (project.length > 2 && project.length <= 80) {
      results.push({
        subject: subjectName,
        relation: 'developed',
        object: project,
        confidence: 0.86,
        sourceText: text,
        extractionMethod: 'NLP',
        metadata: { sourceRow: rowNumber, subjectType: 'PERSON', objectType: 'PRODUCT' },
      });
    }
  }

  // Pattern 4: "[Entity] achieved / scored [Score] in [Subject]"
  const scoreMatch = text.match(/(?:^|[\.\,\;]\s*)([A-Z][a-zA-Z\s]+?)\s+(?:scored|achieved|earned)\s+(?:a|an)?\s*([A-Za-z0-9\+\%]+)\s+in\s+([^,\.]+)/i);
  if (scoreMatch) {
    const subjectName = (primaryEntity || scoreMatch[1]).trim();
    const score = scoreMatch[2].trim();
    const sub = scoreMatch[3].trim();
    results.push({
      subject: subjectName,
      relation: 'has_grade',
      object: score,
      confidence: 0.90,
      sourceText: text,
      extractionMethod: 'NLP',
      metadata: { sourceRow: rowNumber, subjectType: 'PERSON', objectType: 'ATTRIBUTE' },
    });
    if (sub) {
      results.push({
        subject: subjectName,
        relation: 'studies',
        object: sub,
        confidence: 0.90,
        sourceText: text,
        extractionMethod: 'NLP',
        metadata: { sourceRow: rowNumber, subjectType: 'PERSON', objectType: 'SUBJECT' },
      });
    }
  }

  return results;
}
