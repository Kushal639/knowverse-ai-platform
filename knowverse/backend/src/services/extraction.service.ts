import axios from 'axios';
import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { env } from '../config/env';
import logger from '../config/logger';
import { detectDocumentSchema, ColumnMappingConfig, DocumentSchemaInfo } from '../utils/schemaDetector';
import { extractFromStructuredData, ExtractedTripleResult, ExtractionMetrics } from './structuredExtractor';

export interface StartExtractionOptions {
  mode?: 'AUTO_DETECT' | 'STRUCTURED' | 'NATURAL_LANGUAGE' | 'HYBRID';
  columnMapping?: ColumnMappingConfig;
  model?: string;
  autoApprove?: boolean;
}

export const extractionService = {
  async getSchema(documentId: string): Promise<DocumentSchemaInfo> {
    const document = await prisma.document.findUnique({ where: { id: documentId } });
    if (!document) throw new AppError('Document not found', 404, 'NOT_FOUND');

    const meta = document.metadata as Record<string, unknown> | null;
    const filename = (meta?.originalName as string) || document.title;
    return detectDocumentSchema(document.content, filename);
  },

  async startExtraction(documentId: string, userId: string, options: StartExtractionOptions = {}) {
    const document = await prisma.document.findUnique({ where: { id: documentId } });
    if (!document) throw new AppError('Document not found', 404, 'NOT_FOUND');

    const mode = options.mode || 'AUTO_DETECT';
    const model = options.model || 'spacy-en';

    const run = await prisma.extractionRun.create({
      data: {
        documentId,
        userId,
        modelName: model,
        extractionMode: mode,
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    // Run extraction asynchronously
    extractionService._runExtraction(run.id, userId, document, mode, options.columnMapping, model, options.autoApprove !== false).catch(err => {
      logger.error(`Extraction run ${run.id} failed:`, err);
    });

    return run;
  },

  async _runExtraction(
    runId: string,
    userId: string,
    document: { id: string; content: string; title: string; metadata: unknown },
    mode: 'AUTO_DETECT' | 'STRUCTURED' | 'NATURAL_LANGUAGE' | 'HYBRID',
    customMapping?: ColumnMappingConfig,
    modelName = 'spacy-en',
    autoApprove = true
  ) {
    try {
      const meta = document.metadata as Record<string, unknown> | null;
      const filename = (meta?.originalName as string) || document.title;
      const schemaInfo = detectDocumentSchema(document.content, filename);

      let effectiveMode = mode;
      if (mode === 'AUTO_DETECT') {
        effectiveMode = schemaInfo.recommendedMode;
      }

      let candidateTriples: ExtractedTripleResult[] = [];
      let metrics: ExtractionMetrics;

      // ── Strategy A: Structured or Hybrid Extraction ───────────────
      if (
        (effectiveMode === 'STRUCTURED' || effectiveMode === 'HYBRID') &&
        (schemaInfo.documentType === 'CSV' || schemaInfo.documentType === 'TSV' || schemaInfo.documentType === 'JSON')
      ) {
        // Build column mapping: combine user override with auto-inferred mapping
        const finalMapping: ColumnMappingConfig = {};
        for (const col of schemaInfo.columns) {
          finalMapping[col.name] = (customMapping && customMapping[col.name]) || col.inferredRole;
        }

        const delimiter = schemaInfo.documentType === 'TSV' ? '\t' : ',';
        const structuredOutput = await extractFromStructuredData(
          document.content,
          finalMapping,
          effectiveMode,
          delimiter
        );

        candidateTriples = structuredOutput.triples;
        metrics = structuredOutput.metrics;
      }
      // ── Strategy B: Natural Language Extraction ─────────────────
      else {
        const textContent = document.content;
        const nlpOutput = await extractionService._runNaturalLanguagePipeline(textContent, modelName);
        candidateTriples = nlpOutput.triples;
        metrics = nlpOutput.metrics;
      }

      // Persist results in transaction
      await prisma.$transaction(async (tx) => {
        for (const r of candidateTriples) {
          await tx.extractionResult.create({
            data: {
              extractionRunId: runId,
              subject: r.subject,
              relation: r.relation,
              object: r.object,
              confidence: r.confidence,
              status: 'PENDING',
              sourceText: r.sourceText,
              extractionMethod: r.extractionMethod,
              metadata: r.metadata ? JSON.parse(JSON.stringify(r.metadata)) : undefined,
            },
          });
        }

        await tx.extractionRun.update({
          where: { id: runId },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
            extractionMode: effectiveMode,
            metadata: JSON.parse(JSON.stringify(metrics)),
          },
        });
      });

      // Automatically commit extracted candidate triples to Knowledge Graph
      if (autoApprove) {
        await extractionService.approveAll(runId, userId);
        logger.info(`Auto-approved all candidate triples for run ${runId}`);
      }

      logger.info(`Extraction run ${runId} completed with ${candidateTriples.length} triples (mode: ${effectiveMode})`);
    } catch (err) {
      logger.error(`Extraction run ${runId} error:`, err);
      await prisma.extractionRun.update({
        where: { id: runId },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          errorMessage: err instanceof Error ? err.message : 'Unknown error during extraction',
        },
      });
    }
  },

  async _runNaturalLanguagePipeline(
    text: string,
    modelName: string
  ): Promise<{ triples: ExtractedTripleResult[]; metrics: ExtractionMetrics }> {
    let rawTriples: ExtractedTripleResult[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 8);

    try {
      const response = await axios.post(
        `${env.AI_SERVICE_URL}/extract`,
        { text, model: modelName },
        { timeout: 120000 }
      );

      const aiTriples = (response.data.triples || []) as Array<{
        subject: string;
        relation: string;
        object: string;
        confidence: number;
        source_text: string;
      }>;

      rawTriples = aiTriples.map((t, idx) => ({
        subject: t.subject,
        relation: t.relation,
        object: t.object,
        confidence: t.confidence || 0.75,
        sourceText: t.source_text || `Sentence ${idx + 1}`,
        extractionMethod: 'NLP' as const,
      }));
    } catch (aiErr) {
      logger.warn('AI microservice call failed, falling back to local NLP heuristics:', aiErr);
      rawTriples = extractionService._localNlpExtract(text);
    }

    // Deduplicate
    const uniqueMap = new Map<string, ExtractedTripleResult>();
    const entitiesSet = new Set<string>();

    for (const t of rawTriples) {
      entitiesSet.add(t.subject);
      entitiesSet.add(t.object);
      const key = `${t.subject.toLowerCase().trim()}|${t.relation.toLowerCase().trim()}|${t.object.toLowerCase().trim()}`;
      const existing = uniqueMap.get(key);
      if (!existing || t.confidence > existing.confidence) {
        uniqueMap.set(key, t);
      }
    }

    const deduplicated = Array.from(uniqueMap.values());
    const duplicatesMerged = rawTriples.length - deduplicated.length;
    const avgConfidence = deduplicated.length
      ? deduplicated.reduce((acc, t) => acc + t.confidence, 0) / deduplicated.length
      : 0;

    const metrics: ExtractionMetrics = {
      totalRowsProcessed: sentences.length,
      entitiesDetectedCount: entitiesSet.size,
      subjectsDetectedCount: deduplicated.length,
      topicsDetectedCount: 0,
      departmentsDetectedCount: 0,
      relationshipsExtractedCount: deduplicated.length,
      duplicatesMergedCount: duplicatesMerged,
      structuredTriplesCount: 0,
      nlpTriplesCount: deduplicated.length,
      confidenceAverage: Math.round(avgConfidence * 100) / 100,
      entitiesListSummary: {
        students: [],
        subjects: Array.from(entitiesSet).slice(0, 15),
        topics: [],
        departments: [],
      },
    };

    if (deduplicated.length === 0) {
      metrics.zeroResultDiagnostics = {
        reason: 'No entity relationships were identified from natural language parsing.',
        suggestion: 'Ensure the text contains clear subject-verb-object assertions or try Structured / Hybrid mode for tabular datasets.',
      };
    }

    return { triples: deduplicated, metrics };
  },

  _localNlpExtract(text: string): ExtractedTripleResult[] {
    const results: ExtractedTripleResult[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);

    const patterns = [
      { regex: /^(.+?)\s+(?:is|are|was|were)\s+(?:a|an|the)?\s*(.+)$/i, relation: 'is a', conf: 0.72 },
      { regex: /^(.+?)\s+founded\s+(.+)$/i, relation: 'founded', conf: 0.88 },
      { regex: /^(.+?)\s+(?:founded|established)\s+by\s+(.+)$/i, relation: 'founded by', conf: 0.88 },
      { regex: /^(.+?)\s+(?:developed|built|created|designed)\s+(.+)$/i, relation: 'developed', conf: 0.85 },
      { regex: /^(.+?)\s+(?:acquired|purchased|bought)\s+(.+)$/i, relation: 'acquired', conf: 0.85 },
      { regex: /^(.+?)\s+(?:headquartered|located|based)\s+in\s+(.+)$/i, relation: 'headquartered in', conf: 0.90 },
      { regex: /^(.+?)\s+(?:studies|learns|mastered)\s+(.+)$/i, relation: 'studies', conf: 0.82 },
      { regex: /^(.+?)\s+(?:works\s+(?:for|at)|employed\s+by)\s+(.+)$/i, relation: 'works at', conf: 0.85 },
    ];

    for (let i = 0; i < sentences.length && i < 100; i++) {
      const sentence = sentences[i].trim();
      for (const { regex, relation, conf } of patterns) {
        const match = sentence.match(regex);
        if (match && match[1] && match[2]) {
          const subject = match[1].trim();
          const object = match[2].trim();
          if (subject.length >= 2 && object.length >= 2 && subject.split(' ').length <= 8 && object.split(' ').length <= 8) {
            results.push({
              subject,
              relation,
              object,
              confidence: conf,
              sourceText: sentence,
              extractionMethod: 'NLP',
            });
          }
        }
      }
    }

    return results;
  },

  async getExtractionRun(id: string) {
    const run = await prisma.extractionRun.findUnique({
      where: { id },
      include: {
        document: { select: { id: true, title: true, metadata: true } },
        results: { orderBy: { confidence: 'desc' } },
        user: { select: { id: true, name: true } },
      },
    });
    if (!run) throw new AppError('Extraction run not found', 404, 'NOT_FOUND');
    return run;
  },

  async listExtractionRuns(userId: string, role: string, page = 1, limit = 20) {
    const where = role !== 'ADMIN' ? { userId } : {};
    const [total, runs] = await Promise.all([
      prisma.extractionRun.count({ where }),
      prisma.extractionRun.findMany({
        where,
        include: {
          document: { select: { id: true, title: true } },
          _count: { select: { results: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return { runs, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async approveResult(resultId: string, userId: string) {
    const result = await prisma.extractionResult.findUnique({
      where: { id: resultId },
      include: { extractionRun: true },
    });
    if (!result) throw new AppError('Extraction result not found', 404, 'NOT_FOUND');
    if (result.status === 'APPROVED') return { result, message: 'Already approved' };

    const meta = result.metadata as Record<string, string> | null;
    const subjType = meta?.subjectType || inferEntityType(result.subject);
    const objType = meta?.objectType || inferEntityType(result.object);

    const subjNorm = result.subject.toLowerCase().trim();
    const objNorm = result.object.toLowerCase().trim();
    const relNorm = result.relation.toLowerCase().trim().replace(/[\s\-]+/g, '_');

    // Atomic transaction: Upsert entities & relation, commit Triple
    const [subjectEntity, objectEntity, relation] = await prisma.$transaction(async (tx) => {
      const s = await tx.entity.upsert({
        where: { normalizedName: subjNorm },
        update: {},
        create: { name: result.subject, normalizedName: subjNorm, entityType: subjType },
      });

      const o = await tx.entity.upsert({
        where: { normalizedName: objNorm },
        update: {},
        create: { name: result.object, normalizedName: objNorm, entityType: objType },
      });

      const r = await tx.relation.upsert({
        where: { normalizedName: relNorm },
        update: {},
        create: { name: result.relation.replace(/_/g, ' '), normalizedName: relNorm },
      });

      return [s, o, r];
    });

    const triple = await prisma.triple.upsert({
      where: {
        subjectEntityId_relationId_objectEntityId: {
          subjectEntityId: subjectEntity.id,
          relationId: relation.id,
          objectEntityId: objectEntity.id,
        },
      },
      update: {
        confidence: Math.max(result.confidence, 0.5),
        status: 'APPROVED',
        sourceDocumentId: result.extractionRun?.documentId,
      },
      create: {
        subjectEntityId: subjectEntity.id,
        relationId: relation.id,
        objectEntityId: objectEntity.id,
        confidence: result.confidence,
        status: 'APPROVED',
        sourceDocumentId: result.extractionRun?.documentId,
        sourceText: result.sourceText,
        extractionModel: result.extractionRun?.modelName || 'structured-hybrid',
        createdById: userId,
      },
    });

    const updatedResult = await prisma.extractionResult.update({
      where: { id: resultId },
      data: { status: 'APPROVED' },
    });

    return { result: updatedResult, triple };
  },

  async rejectResult(resultId: string) {
    const result = await prisma.extractionResult.findUnique({ where: { id: resultId } });
    if (!result) throw new AppError('Extraction result not found', 404, 'NOT_FOUND');

    return prisma.extractionResult.update({
      where: { id: resultId },
      data: { status: 'REJECTED' },
    });
  },

  async approveAll(extractionRunId: string, userId: string) {
    const pendingResults = await prisma.extractionResult.findMany({
      where: { extractionRunId, status: 'PENDING' },
    });

    let approvedCount = 0;
    for (const r of pendingResults) {
      try {
        await extractionService.approveResult(r.id, userId);
        approvedCount++;
      } catch (err) {
        logger.warn(`Failed to auto-approve result ${r.id}:`, err);
      }
    }

    return { approvedCount, total: pendingResults.length };
  },

  async rejectAll(extractionRunId: string) {
    return prisma.extractionResult.updateMany({
      where: { extractionRunId, status: 'PENDING' },
      data: { status: 'REJECTED' },
    });
  },

  async getDocumentExtractions(documentId: string) {
    return prisma.extractionRun.findMany({
      where: { documentId },
      include: {
        _count: { select: { results: true } },
        results: { where: { status: 'PENDING' }, take: 10 },
      },
      orderBy: { createdAt: 'desc' },
    });
  },
};

function inferEntityType(name: string): string {
  const lower = name.toLowerCase().trim();
  if (['computer science', 'information technology', 'electrical', 'mechanical', 'civil', 'electronics'].some(d => lower.includes(d))) {
    return 'DEPARTMENT';
  }
  if (['data structures', 'algorithms', 'database', 'operating systems', 'networking', 'machine learning', 'compiler', 'mathematics'].some(s => lower.includes(s))) {
    return 'SUBJECT';
  }
  if (['trees', 'lists', 'graphs', 'arrays', 'recursion', 'sorting', 'normalization', 'indexing', 'threads'].some(t => lower.includes(t))) {
    return 'TOPIC';
  }
  if (['a+', 'a', 'b+', 'b', 'c', 'd', 'f', 'pass', 'distinction'].includes(lower)) {
    return 'ATTRIBUTE';
  }
  if (name.split(' ').length >= 2 && /^[A-Z]/.test(name)) {
    return 'PERSON';
  }
  return 'CONCEPT';
}
