import prisma from '../config/prisma';

export interface GraphPathResult {
  path: string[];
  nodes: Array<{ id: string; name: string; type: string }>;
  edges: Array<{ subject: string; relation: string; object: string; confidence: number }>;
  confidence: number;
  description: string;
}

export const knowledgeGraphQueryService = {
  /**
   * Resolve an entity name or alias to the canonical entity in MySQL
   */
  async resolveEntity(query: string) {
    const q = query.trim().toLowerCase();
    if (!q) return null;

    // 1. Exact match on normalizedName
    let entity = await prisma.entity.findUnique({
      where: { normalizedName: q },
      include: { aliases: true },
    });
    if (entity) return entity;

    // 2. Exact match on alias
    const aliasRecord = await prisma.entityAlias.findFirst({
      where: { alias: { equals: query.trim() } },
      include: { entity: { include: { aliases: true } } },
    });
    if (aliasRecord?.entity) return aliasRecord.entity;

    // 3. Substring match
    entity = await prisma.entity.findFirst({
      where: {
        OR: [
          { normalizedName: { contains: q } },
          { name: { contains: query.trim() } },
          { aliases: { some: { alias: { contains: query.trim() } } } },
        ],
      },
      include: { aliases: true },
    });

    return entity;
  },

  /**
   * Find all directly related entities and triples (1-hop)
   */
  async findRelatedTriples(entityId: string, limit = 20) {
    return prisma.triple.findMany({
      where: {
        status: 'APPROVED',
        OR: [{ subjectEntityId: entityId }, { objectEntityId: entityId }],
      },
      include: {
        subjectEntity: true,
        relation: true,
        objectEntity: true,
        sourceDocument: { include: { dataset: true } },
      },
      take: limit,
      orderBy: { confidence: 'desc' },
    });
  },

  /**
   * Multi-hop path tracing between source and target entities (up to 3 hops)
   */
  async findGraphPath(sourceName: string, targetName: string): Promise<GraphPathResult | null> {
    const [source, target] = await Promise.all([
      this.resolveEntity(sourceName),
      this.resolveEntity(targetName),
    ]);

    if (!source || !target) return null;
    if (source.id === target.id) {
      return {
        path: [source.name],
        nodes: [{ id: source.id, name: source.name, type: source.entityType }],
        edges: [],
        confidence: 1.0,
        description: `Source and target refer to the same entity (${source.name}).`,
      };
    }

    // 1-Hop direct connection check
    const direct1Hop = await prisma.triple.findFirst({
      where: {
        status: 'APPROVED',
        OR: [
          { subjectEntityId: source.id, objectEntityId: target.id },
          { subjectEntityId: target.id, objectEntityId: source.id },
        ],
      },
      include: { subjectEntity: true, relation: true, objectEntity: true },
    });

    if (direct1Hop) {
      return {
        path: [direct1Hop.subjectEntity.name, direct1Hop.objectEntity.name],
        nodes: [
          { id: direct1Hop.subjectEntity.id, name: direct1Hop.subjectEntity.name, type: direct1Hop.subjectEntity.entityType },
          { id: direct1Hop.objectEntity.id, name: direct1Hop.objectEntity.name, type: direct1Hop.objectEntity.entityType },
        ],
        edges: [{
          subject: direct1Hop.subjectEntity.name,
          relation: direct1Hop.relation.name,
          object: direct1Hop.objectEntity.name,
          confidence: direct1Hop.confidence,
        }],
        confidence: direct1Hop.confidence,
        description: `${direct1Hop.subjectEntity.name} is directly connected to ${direct1Hop.objectEntity.name} via [${direct1Hop.relation.name}].`,
      };
    }

    // 2-Hop intermediate connection check (BFS)
    const sourceTriples = await prisma.triple.findMany({
      where: {
        status: 'APPROVED',
        OR: [{ subjectEntityId: source.id }, { objectEntityId: source.id }],
      },
      include: { subjectEntity: true, relation: true, objectEntity: true },
      take: 50,
    });

    for (const t1 of sourceTriples) {
      const intermediateId = t1.subjectEntityId === source.id ? t1.objectEntityId : t1.subjectEntityId;
      const intermediateName = t1.subjectEntityId === source.id ? t1.objectEntity.name : t1.subjectEntity.name;
      const intermediateType = t1.subjectEntityId === source.id ? t1.objectEntity.entityType : t1.subjectEntity.entityType;

      const targetConnect = await prisma.triple.findFirst({
        where: {
          status: 'APPROVED',
          OR: [
            { subjectEntityId: intermediateId, objectEntityId: target.id },
            { subjectEntityId: target.id, objectEntityId: intermediateId },
          ],
        },
        include: { subjectEntity: true, relation: true, objectEntity: true },
      });

      if (targetConnect) {
        const avgConfidence = (t1.confidence + targetConnect.confidence) / 2;
        return {
          path: [source.name, intermediateName, target.name],
          nodes: [
            { id: source.id, name: source.name, type: source.entityType },
            { id: intermediateId, name: intermediateName, type: intermediateType },
            { id: target.id, name: target.name, type: target.entityType },
          ],
          edges: [
            { subject: t1.subjectEntity.name, relation: t1.relation.name, object: t1.objectEntity.name, confidence: t1.confidence },
            { subject: targetConnect.subjectEntity.name, relation: targetConnect.relation.name, object: targetConnect.objectEntity.name, confidence: targetConnect.confidence },
          ],
          confidence: Math.round(avgConfidence * 100) / 100,
          description: `${source.name} is connected to ${target.name} through ${intermediateName}.`,
        };
      }
    }

    return null;
  },

  /**
   * Filter and aggregate students by topic/subject
   */
  async findStudentsForSubject(subjectOrTopic: string) {
    const entity = await this.resolveEntity(subjectOrTopic);
    if (!entity) return [];

    const triples = await prisma.triple.findMany({
      where: {
        status: 'APPROVED',
        OR: [
          { objectEntityId: entity.id },
          { subjectEntityId: entity.id },
        ],
        relation: {
          name: { in: ['studies', 'knows', 'enrolled_in', 'interested_in', 'mastered', 'has_grade', 'studies_topic'] },
        },
      },
      include: {
        subjectEntity: true,
        relation: true,
        objectEntity: true,
        sourceDocument: { include: { dataset: true } },
      },
    });

    return triples.map(t => {
      const isSubjectTarget = t.objectEntityId === entity.id;
      const student = isSubjectTarget ? t.subjectEntity : t.objectEntity;
      return {
        studentName: student.name,
        studentId: student.id,
        relation: t.relation.name,
        subject: entity.name,
        confidence: t.confidence,
        datasetName: t.sourceDocument?.dataset?.name || 'Dataset',
        documentTitle: t.sourceDocument?.title || 'Document',
        sourceText: t.sourceText,
      };
    });
  },

  /**
   * Compute actual graph analytics (density, total nodes, edges, hub rankings)
   */
  async getGraphAnalytics() {
    const [entitiesCount, relationsCount, approvedTriples, pendingTriples] = await Promise.all([
      prisma.entity.count(),
      prisma.relation.count(),
      prisma.triple.count({ where: { status: 'APPROVED' } }),
      prisma.triple.count({ where: { status: 'PENDING' } }),
    ]);

    const maxEdges = entitiesCount > 1 ? entitiesCount * (entitiesCount - 1) : 1;
    const density = (approvedTriples / maxEdges).toFixed(4);

    const triples = await prisma.triple.findMany({
      where: { status: 'APPROVED' },
      select: { subjectEntity: { select: { name: true } }, objectEntity: { select: { name: true } } },
    });

    const counts: Record<string, number> = {};
    triples.forEach(t => {
      counts[t.subjectEntity.name] = (counts[t.subjectEntity.name] || 0) + 1;
      counts[t.objectEntity.name] = (counts[t.objectEntity.name] || 0) + 1;
    });

    const topHubs = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, degree]) => ({ name, degree }));

    return {
      totalEntities: entitiesCount,
      totalRelations: relationsCount,
      approvedTriples,
      pendingTriples,
      density: parseFloat(density),
      topHubs,
    };
  },
};
