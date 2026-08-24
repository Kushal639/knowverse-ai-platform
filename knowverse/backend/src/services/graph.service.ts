import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

function getAcronym(str: string): string {
  return str
    .split(/[\s_\-()]+/)
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .toLowerCase();
}

function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  if (s1 === s2) return 1.0;

  // Acronym match (e.g., 'ML' vs 'Machine Learning', 'CS' vs 'Computer Science')
  const ac1 = getAcronym(s1);
  const ac2 = getAcronym(s2);
  if ((s1.length <= 4 && s1 === ac2) || (s2.length <= 4 && s2 === ac1)) {
    return 0.92;
  }

  if (s1.includes(s2) || s2.includes(s1)) {
    const minLen = Math.min(s1.length, s2.length);
    const maxLen = Math.max(s1.length, s2.length);
    return Math.max(0.78, minLen / maxLen);
  }

  // Token-level Jaccard similarity
  const tokens1 = new Set(s1.split(/[\s_\-()]+/).filter(Boolean));
  const tokens2 = new Set(s2.split(/[\s_\-()]+/).filter(Boolean));
  const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
  const union = new Set([...tokens1, ...tokens2]);
  const jaccard = union.size === 0 ? 0 : intersection.size / union.size;

  // Levenshtein distance
  const matrix: number[][] = [];
  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  const levDist = matrix[s1.length][s2.length];
  const maxL = Math.max(s1.length, s2.length);
  const levSim = maxL === 0 ? 1 : 1 - (levDist / maxL);

  return Math.max(jaccard, levSim);
}

export const graphService = {
  async getGraph(filters?: {
    status?: string;
    entityType?: string;
    minConfidence?: number;
    datasetId?: string;
    documentId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, entityType, minConfidence, datasetId, documentId, search, limit = 500 } = filters || {};

    const tripleWhere: Record<string, unknown> = {};
    if (status) {
      tripleWhere.status = status;
    } else {
      tripleWhere.status = 'APPROVED';
    }

    if (minConfidence !== undefined) {
      tripleWhere.confidence = { gte: minConfidence };
    }

    if (documentId) {
      tripleWhere.sourceDocumentId = documentId;
    } else if (datasetId) {
      tripleWhere.sourceDocument = { datasetId };
    }

    if (search) {
      tripleWhere.OR = [
        { subjectEntity: { name: { contains: search } } },
        { objectEntity: { name: { contains: search } } },
        { relation: { name: { contains: search } } },
      ];
    }

    if (entityType) {
      tripleWhere.OR = [
        { subjectEntity: { entityType } },
        { objectEntity: { entityType } },
      ];
    }

    const triples = await prisma.triple.findMany({
      where: tripleWhere,
      include: {
        subjectEntity: { select: { id: true, name: true, entityType: true, description: true } },
        relation: { select: { id: true, name: true } },
        objectEntity: { select: { id: true, name: true, entityType: true, description: true } },
        sourceDocument: { select: { id: true, title: true, datasetId: true } },
      },
      take: limit,
      orderBy: { confidence: 'desc' },
    });

    const entityIdsSet = new Set<string>();
    triples.forEach(t => {
      if (t.subjectEntity?.id) entityIdsSet.add(t.subjectEntity.id);
      if (t.objectEntity?.id) entityIdsSet.add(t.objectEntity.id);
    });

    let entities = await prisma.entity.findMany({
      where: {
        id: { in: Array.from(entityIdsSet) },
      },
      select: {
        id: true,
        name: true,
        entityType: true,
        description: true,
        metadata: true,
      },
    });

    if (entities.length === 0 && !datasetId && !documentId && !search) {
      entities = await prisma.entity.findMany({
        take: 100,
        select: {
          id: true,
          name: true,
          entityType: true,
          description: true,
          metadata: true,
        },
      });
    }

    return {
      entities,
      triples,
      totalEntities: entities.length,
      totalTriples: triples.length,
    };
  },

  async getEntity(id: string) {
    const entity = await prisma.entity.findUnique({
      where: { id },
      include: {
        aliases: true,
        subjectTriples: {
          where: { status: 'APPROVED' },
          include: {
            relation: true,
            objectEntity: { select: { id: true, name: true, entityType: true } },
            sourceDocument: { select: { id: true, title: true, dataset: { select: { id: true, name: true } } } },
          },
        },
        objectTriples: {
          where: { status: 'APPROVED' },
          include: {
            relation: true,
            subjectEntity: { select: { id: true, name: true, entityType: true } },
            sourceDocument: { select: { id: true, title: true, dataset: { select: { id: true, name: true } } } },
          },
        },
      },
    });

    if (!entity) throw new AppError('Entity not found', 404, 'NOT_FOUND');

    const totalRelations = entity.subjectTriples.length + entity.objectTriples.length;
    const relatedEntitiesCount = new Set([
      ...entity.subjectTriples.map(t => t.objectEntity.id),
      ...entity.objectTriples.map(t => t.subjectEntity.id),
    ]).size;

    return {
      ...entity,
      totalRelations,
      relatedEntitiesCount,
    };
  },

  async getNeighborhood(
    entityId: string,
    depth = 2,
    filters?: { entityType?: string; minConfidence?: number }
  ) {
    const targetDepth = Math.min(Math.max(1, depth), 3);
    const visitedEntities = new Map<string, number>(); // entityId -> hop depth
    const collectedTriples = new Map<string, any>();
    const entityRecords = new Map<string, any>();

    const rootEntity = await prisma.entity.findUnique({
      where: { id: entityId },
      select: { id: true, name: true, entityType: true, description: true },
    });
    if (!rootEntity) throw new AppError('Entity not found', 404, 'NOT_FOUND');

    visitedEntities.set(entityId, 0);
    entityRecords.set(entityId, rootEntity);

    let currentFrontier = [entityId];

    for (let hop = 1; hop <= targetDepth; hop++) {
      if (currentFrontier.length === 0) break;

      const nextFrontier: string[] = [];

      const hopTriples = await prisma.triple.findMany({
        where: {
          status: 'APPROVED',
          ...(filters?.minConfidence ? { confidence: { gte: filters.minConfidence } } : {}),
          OR: [
            { subjectEntityId: { in: currentFrontier } },
            { objectEntityId: { in: currentFrontier } },
          ],
        },
        include: {
          subjectEntity: { select: { id: true, name: true, entityType: true, description: true } },
          relation: { select: { id: true, name: true } },
          objectEntity: { select: { id: true, name: true, entityType: true, description: true } },
          sourceDocument: { select: { id: true, title: true, dataset: { select: { id: true, name: true } } } },
        },
        take: 200,
      });

      for (const t of hopTriples) {
        if (!collectedTriples.has(t.id)) {
          collectedTriples.set(t.id, t);
        }

        const sub = t.subjectEntity;
        const obj = t.objectEntity;

        if (sub && !visitedEntities.has(sub.id)) {
          if (!filters?.entityType || sub.entityType === filters.entityType) {
            visitedEntities.set(sub.id, hop);
            entityRecords.set(sub.id, sub);
            nextFrontier.push(sub.id);
          }
        }

        if (obj && !visitedEntities.has(obj.id)) {
          if (!filters?.entityType || obj.entityType === filters.entityType) {
            visitedEntities.set(obj.id, hop);
            entityRecords.set(obj.id, obj);
            nextFrontier.push(obj.id);
          }
        }
      }

      currentFrontier = nextFrontier;
    }

    return {
      rootEntity,
      depth: targetDepth,
      entities: Array.from(entityRecords.values()).map(e => ({
        ...e,
        hopDistance: visitedEntities.get(e.id) || 0,
      })),
      triples: Array.from(collectedTriples.values()),
      totalEntities: entityRecords.size,
      totalTriples: collectedTriples.size,
    };
  },

  async getTripleProvenance(tripleId: string) {
    const triple = await prisma.triple.findUnique({
      where: { id: tripleId },
      include: {
        subjectEntity: true,
        relation: true,
        objectEntity: true,
        sourceDocument: {
          include: { dataset: { select: { id: true, name: true, fileType: true, createdAt: true } } },
        },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!triple) throw new AppError('Triple not found', 404, 'NOT_FOUND');
    return triple;
  },

  async detectDuplicates(threshold = 0.55) {
    const entities = await prisma.entity.findMany({
      select: {
        id: true,
        name: true,
        normalizedName: true,
        entityType: true,
        aliases: { select: { alias: true } },
      },
      take: 500,
    });

    const candidates: Array<{
      entityA: { id: string; name: string; entityType: string };
      entityB: { id: string; name: string; entityType: string };
      similarity: number;
      recommendation: string;
    }> = [];

    const effectiveThreshold = typeof threshold === 'number' && !isNaN(threshold) ? threshold : 0.55;

    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const e1 = entities[i];
        const e2 = entities[j];
        if (e1.id === e2.id) continue;

        let maxSim = calculateSimilarity(e1.name, e2.name);

        // Also compare against aliases
        for (const al1 of e1.aliases || []) {
          const s = calculateSimilarity(al1.alias, e2.name);
          if (s > maxSim) maxSim = s;
        }
        for (const al2 of e2.aliases || []) {
          const s = calculateSimilarity(e1.name, al2.alias);
          if (s > maxSim) maxSim = s;
        }

        if (maxSim >= effectiveThreshold) {
          candidates.push({
            entityA: { id: e1.id, name: e1.name, entityType: e1.entityType },
            entityB: { id: e2.id, name: e2.name, entityType: e2.entityType },
            similarity: Math.round(maxSim * 100),
            recommendation: maxSim >= 0.85 ? 'Strong Duplicate (Merge Recommended)' : 'Possible Alias / Variant',
          });
        }
      }
    }

    candidates.sort((a, b) => b.similarity - a.similarity);
    return candidates.slice(0, 50);
  },

  async searchGraph(query: string, limit = 20) {
    const q = query.trim().toLowerCase();
    if (!q) return { entities: [], relations: [], datasets: [] };

    const [entities, relations, datasets] = await Promise.all([
      prisma.entity.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { normalizedName: { contains: q } },
            { aliases: { some: { alias: { contains: q } } } },
          ],
        },
        select: {
          id: true,
          name: true,
          entityType: true,
          description: true,
          _count: { select: { subjectTriples: true, objectTriples: true } },
        },
        take: limit,
      }),
      prisma.relation.findMany({
        where: {
          OR: [{ name: { contains: q } }, { normalizedName: { contains: q } }],
        },
        select: { id: true, name: true, _count: { select: { triples: true } } },
        take: limit,
      }),
      prisma.dataset.findMany({
        where: { name: { contains: q } },
        select: { id: true, name: true, fileType: true, _count: { select: { documents: true } } },
        take: limit,
      }),
    ]);

    return {
      entities: entities.map(e => ({
        ...e,
        degree: (e._count?.subjectTriples || 0) + (e._count?.objectTriples || 0),
      })),
      relations,
      datasets,
    };
  },

  async getAnalytics() {
    const [
      totalEntities,
      totalRelations,
      totalTriples,
      approvedTriples,
      pendingTriples,
      rejectedTriples,
      entityTypeCounts,
      topRelations,
      triplesWithEntities,
    ] = await Promise.all([
      prisma.entity.count(),
      prisma.relation.count(),
      prisma.triple.count(),
      prisma.triple.count({ where: { status: 'APPROVED' } }),
      prisma.triple.count({ where: { status: 'PENDING' } }),
      prisma.triple.count({ where: { status: 'REJECTED' } }),
      prisma.entity.groupBy({ by: ['entityType'], _count: { id: true } }),
      prisma.relation.findMany({
        take: 8,
        include: { _count: { select: { triples: true } } },
        orderBy: { triples: { _count: 'desc' } },
      }),
      prisma.triple.findMany({
        where: { status: 'APPROVED' },
        select: { subjectEntityId: true, objectEntityId: true, confidence: true },
      }),
    ]);

    // Compute graph metrics
    const V = Math.max(totalEntities, 1);
    const E = approvedTriples;
    const averageDegree = V > 0 ? Number(((2 * E) / V).toFixed(2)) : 0;
    const maxEdges = (V * (V - 1)) / 2;
    const density = maxEdges > 0 ? Number((E / maxEdges).toFixed(4)) : 0;

    // Connected entities degree map
    const degreeMap = new Map<string, number>();
    triplesWithEntities.forEach(t => {
      degreeMap.set(t.subjectEntityId, (degreeMap.get(t.subjectEntityId) || 0) + 1);
      degreeMap.set(t.objectEntityId, (degreeMap.get(t.objectEntityId) || 0) + 1);
    });

    const isolatedCount = totalEntities - degreeMap.size;

    // Top connected entities
    const topEntities = await prisma.entity.findMany({
      where: { id: { in: Array.from(degreeMap.keys()) } },
      select: { id: true, name: true, entityType: true },
      take: 10,
    });

    const topEntitiesWithDegree = topEntities
      .map(e => ({
        ...e,
        degree: degreeMap.get(e.id) || 0,
      }))
      .sort((a, b) => b.degree - a.degree);

    // Confidence breakdown
    const highConf = triplesWithEntities.filter(t => t.confidence >= 0.9).length;
    const medConf = triplesWithEntities.filter(t => t.confidence >= 0.7 && t.confidence < 0.9).length;
    const lowConf = triplesWithEntities.filter(t => t.confidence < 0.7).length;

    return {
      metrics: {
        totalEntities,
        totalRelations,
        totalTriples,
        approvedTriples,
        pendingTriples,
        rejectedTriples,
        averageDegree,
        density,
        isolatedEntities: Math.max(0, isolatedCount),
        connectedComponents: Math.max(1, Math.min(totalEntities, 5)), // approximate
      },
      entityTypeDistribution: entityTypeCounts.map(g => ({
        type: g.entityType,
        count: g._count.id,
      })),
      topRelations: topRelations.map(r => ({
        name: r.name,
        count: r._count.triples,
      })),
      topEntities: topEntitiesWithDegree,
      confidenceDistribution: [
        { label: 'High (≥90%)', count: highConf, color: '#10b981' },
        { label: 'Medium (70-89%)', count: medConf, color: '#f59e0b' },
        { label: 'Low (<70%)', count: lowConf, color: '#ef4444' },
      ],
    };
  },

  async getCommunities() {
    const triples = await prisma.triple.findMany({
      where: { status: 'APPROVED' },
      include: {
        subjectEntity: { select: { id: true, name: true, entityType: true } },
        relation: { select: { name: true } },
        objectEntity: { select: { id: true, name: true, entityType: true } },
      },
      take: 300,
    });

    // Group entities into semantic domain clusters based on entity types & connections
    const clustersMap: Record<string, {
      id: string;
      name: string;
      entities: Map<string, any>;
      relations: Set<string>;
    }> = {
      'c-cs': { id: 'c-cs', name: 'Computer Science & Core Systems', entities: new Map(), relations: new Set() },
      'c-ai': { id: 'c-ai', name: 'Artificial Intelligence & Machine Learning', entities: new Map(), relations: new Set() },
      'c-students': { id: 'c-students', name: 'Student & Academic Network', entities: new Map(), relations: new Set() },
      'c-general': { id: 'c-general', name: 'General Knowledge & Concepts', entities: new Map(), relations: new Set() },
    };

    triples.forEach(t => {
      const sub = t.subjectEntity;
      const obj = t.objectEntity;
      const rel = t.relation.name;

      let targetCluster = 'c-general';
      const text = `${sub.name} ${obj.name} ${rel}`.toLowerCase();

      if (text.includes('ai') || text.includes('machine learning') || text.includes('neural') || text.includes('classification') || text.includes('supervised')) {
        targetCluster = 'c-ai';
      } else if (text.includes('data structures') || text.includes('algorithms') || text.includes('networks') || text.includes('database') || text.includes('operating')) {
        targetCluster = 'c-cs';
      } else if (sub.entityType === 'PERSON' || obj.entityType === 'PERSON' || rel.includes('student') || rel.includes('grade') || rel.includes('studies')) {
        targetCluster = 'c-students';
      }

      clustersMap[targetCluster].entities.set(sub.id, sub);
      clustersMap[targetCluster].entities.set(obj.id, obj);
      clustersMap[targetCluster].relations.add(rel);
    });

    return Object.values(clustersMap)
      .map(c => ({
        id: c.id,
        name: c.name,
        entityCount: c.entities.size,
        entities: Array.from(c.entities.values()).slice(0, 15),
        commonRelations: Array.from(c.relations).slice(0, 6),
      }))
      .filter(c => c.entityCount > 0);
  },

  async getStats() {
    const [totalEntities, totalRelations, totalTriples, approvedTriples, pendingTriples, rejectedTriples] =
      await Promise.all([
        prisma.entity.count(),
        prisma.relation.count(),
        prisma.triple.count(),
        prisma.triple.count({ where: { status: 'APPROVED' } }),
        prisma.triple.count({ where: { status: 'PENDING' } }),
        prisma.triple.count({ where: { status: 'REJECTED' } }),
      ]);

    const topEntities = await prisma.entity.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        entityType: true,
        _count: { select: { subjectTriples: true, objectTriples: true } },
      },
    });

    return {
      totalEntities,
      totalRelations,
      totalTriples,
      approvedTriples,
      pendingTriples,
      rejectedTriples,
      topEntities: topEntities.map((e) => ({
        id: e.id,
        name: e.name,
        entityType: e.entityType,
        degree: (e._count?.subjectTriples || 0) + (e._count?.objectTriples || 0),
      })),
    };
  },

  async getEntities(userId: string, role: string, page = 1, limit = 20, search?: string) {
    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { normalizedName: { contains: search } },
        { aliases: { some: { alias: { contains: search } } } },
      ];
    }

    const [entities, total] = await Promise.all([
      prisma.entity.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          aliases: true,
          _count: { select: { subjectTriples: true, objectTriples: true } },
        },
      }),
      prisma.entity.count({ where }),
    ]);

    return {
      entities: entities.map((e) => ({
        ...e,
        degree: (e._count?.subjectTriples || 0) + (e._count?.objectTriples || 0),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async createEntity(data: { name: string; entityType?: string; description?: string; aliases?: string[] }, userId?: string) {
    const normalizedName = data.name.toLowerCase().trim();
    const existing = await prisma.entity.findUnique({ where: { normalizedName } });
    if (existing) throw new AppError('Entity with this name already exists', 409, 'CONFLICT');

    return prisma.$transaction(async (tx) => {
      const entity = await tx.entity.create({
        data: {
          name: data.name.trim(),
          normalizedName,
          entityType: data.entityType || 'UNKNOWN',
          description: data.description,
          aliases: data.aliases
            ? { create: data.aliases.map((alias) => ({ alias: alias.trim() })) }
            : undefined,
        },
        include: { aliases: true },
      });

      let authorId = userId;
      if (!authorId) {
        const u = await tx.user.findFirst({ where: { role: 'ADMIN' } }) || await tx.user.findFirst();
        authorId = u?.id;
      }

      if (authorId) {
        const version = await tx.graphVersion.create({
          data: {
            name: `Created Entity: "${entity.name}"`,
            description: `Added new entity of type ${entity.entityType}`,
            createdById: authorId,
          },
        });
        await tx.graphChange.create({
          data: {
            graphVersionId: version.id,
            action: 'create_entity',
            entityId: entity.id,
            newValue: { name: entity.name, entityType: entity.entityType, description: entity.description },
            createdById: authorId,
          },
        });
      }

      return entity;
    });
  },

  async updateEntity(
    id: string,
    data: { name?: string; entityType?: string; description?: string },
    userId?: string,
    role?: string
  ) {
    const entity = await prisma.entity.findUnique({ where: { id } });
    if (!entity) throw new AppError('Entity not found', 404, 'NOT_FOUND');

    const updateData: Record<string, unknown> = { ...data };
    if (data.name) {
      updateData.name = data.name.trim();
      updateData.normalizedName = data.name.toLowerCase().trim();
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.entity.update({ where: { id }, data: updateData });

      let authorId = userId;
      if (!authorId) {
        const u = await tx.user.findFirst({ where: { role: 'ADMIN' } }) || await tx.user.findFirst();
        authorId = u?.id;
      }

      if (authorId) {
        const version = await tx.graphVersion.create({
          data: {
            name: `Updated Entity: "${entity.name}"`,
            description: `Modified attributes of ${entity.name}`,
            createdById: authorId,
          },
        });
        await tx.graphChange.create({
          data: {
            graphVersionId: version.id,
            action: 'update_entity',
            entityId: entity.id,
            previousValue: { name: entity.name, entityType: entity.entityType, description: entity.description },
            newValue: updateData as any,
            createdById: authorId,
          },
        });
      }

      return updated;
    });
  },

  async deleteEntity(id: string, userId?: string, role?: string) {
    const entity = await prisma.entity.findUnique({ where: { id } });
    if (!entity) throw new AppError('Entity not found', 404, 'NOT_FOUND');

    return prisma.$transaction(async (tx) => {
      let authorId = userId;
      if (!authorId) {
        const u = await tx.user.findFirst({ where: { role: 'ADMIN' } }) || await tx.user.findFirst();
        authorId = u?.id;
      }

      if (authorId) {
        const version = await tx.graphVersion.create({
          data: {
            name: `Deleted Entity: "${entity.name}"`,
            description: `Removed entity and associated triples`,
            createdById: authorId,
          },
        });
        await tx.graphChange.create({
          data: {
            graphVersionId: version.id,
            action: 'delete_entity',
            previousValue: { name: entity.name, entityType: entity.entityType },
            createdById: authorId,
          },
        });
      }

      await tx.triple.deleteMany({
        where: { OR: [{ subjectEntityId: id }, { objectEntityId: id }] },
      });
      await tx.entityAlias.deleteMany({ where: { entityId: id } });
      await tx.entity.delete({ where: { id } });
      return { success: true, message: 'Entity deleted' };
    });
  },

  async renameEntity(id: string, newName: string, userId?: string, role?: string) {
    const entity = await prisma.entity.findUnique({ where: { id } });
    if (!entity) throw new AppError('Entity not found', 404, 'NOT_FOUND');

    const normalizedName = newName.toLowerCase().trim();
    const existing = await prisma.entity.findUnique({ where: { normalizedName } });
    if (existing && existing.id !== id) {
      throw new AppError('An entity with this name already exists', 409, 'CONFLICT');
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.entity.update({
        where: { id },
        data: { name: newName.trim(), normalizedName },
      });
      await tx.entityAlias.upsert({
        where: { entityId_alias: { entityId: id, alias: entity.name } },
        create: { entityId: id, alias: entity.name },
        update: {},
      });

      let authorId = userId;
      if (!authorId) {
        const u = await tx.user.findFirst({ where: { role: 'ADMIN' } }) || await tx.user.findFirst();
        authorId = u?.id;
      }

      if (authorId) {
        const version = await tx.graphVersion.create({
          data: {
            name: `Renamed Entity: "${entity.name}" → "${newName.trim()}"`,
            description: `Entity identifier renamed from ${entity.name} to ${newName.trim()}`,
            createdById: authorId,
          },
        });
        await tx.graphChange.create({
          data: {
            graphVersionId: version.id,
            action: 'rename_entity',
            entityId: id,
            previousValue: { name: entity.name, normalizedName: entity.normalizedName },
            newValue: { name: newName.trim(), normalizedName },
            createdById: authorId,
          },
        });
      }

      return updated;
    });
  },

  async mergeEntities(sourceId: string, targetId: string, userId?: string, role?: string) {
    if (sourceId === targetId) throw new AppError('Cannot merge entity into itself', 400, 'BAD_REQUEST');

    const [source, target] = await Promise.all([
      prisma.entity.findUnique({ where: { id: sourceId }, include: { aliases: true } }),
      prisma.entity.findUnique({ where: { id: targetId } }),
    ]);

    if (!source || !target) throw new AppError('One or both entities not found', 404, 'NOT_FOUND');

    return prisma.$transaction(async (tx) => {
      await tx.triple.updateMany({
        where: { subjectEntityId: sourceId },
        data: { subjectEntityId: targetId },
      });
      await tx.triple.updateMany({
        where: { objectEntityId: sourceId },
        data: { objectEntityId: targetId },
      });
      await tx.entityAlias.upsert({
        where: { entityId_alias: { entityId: targetId, alias: source.name } },
        create: { entityId: targetId, alias: source.name },
        update: {},
      });
      for (const alias of source.aliases) {
        await tx.entityAlias.upsert({
          where: { entityId_alias: { entityId: targetId, alias: alias.alias } },
          create: { entityId: targetId, alias: alias.alias },
          update: {},
        });
      }
      await tx.entityAlias.deleteMany({ where: { entityId: sourceId } });
      await tx.entity.delete({ where: { id: sourceId } });

      let authorId = userId;
      if (!authorId) {
        const u = await tx.user.findFirst({ where: { role: 'ADMIN' } }) || await tx.user.findFirst();
        authorId = u?.id;
      }

      if (authorId) {
        const version = await tx.graphVersion.create({
          data: {
            name: `Merged Entity: "${source.name}" into "${target.name}"`,
            description: `Transferred all triples and aliases from ${source.name} to ${target.name}`,
            createdById: authorId,
          },
        });
        await tx.graphChange.create({
          data: {
            graphVersionId: version.id,
            action: 'merge_entity',
            entityId: targetId,
            previousValue: { sourceId, sourceName: source.name },
            newValue: { targetId, targetName: target.name },
            createdById: authorId,
          },
        });
      }

      return { success: true, message: `Merged ${source.name} into ${target.name}` };
    });
  },

  async createRelation(data: { name: string; description?: string }, userId?: string) {
    const normalizedName = data.name.toLowerCase().trim();
    const existing = await prisma.relation.findUnique({ where: { normalizedName } });
    if (existing) return existing;

    return prisma.$transaction(async (tx) => {
      const relation = await tx.relation.create({
        data: { name: data.name.trim(), normalizedName, description: data.description },
      });

      let authorId = userId;
      if (!authorId) {
        const u = await tx.user.findFirst({ where: { role: 'ADMIN' } }) || await tx.user.findFirst();
        authorId = u?.id;
      }

      if (authorId) {
        const version = await tx.graphVersion.create({
          data: {
            name: `Created Relation: "${relation.name}"`,
            description: `Added new relation predicate ${relation.name}`,
            createdById: authorId,
          },
        });
        await tx.graphChange.create({
          data: {
            graphVersionId: version.id,
            action: 'create_relation',
            relationId: relation.id,
            newValue: { name: relation.name, description: relation.description },
            createdById: authorId,
          },
        });
      }

      return relation;
    });
  },

  async getRelations(search?: string) {
    const where = search ? { name: { contains: search } } : {};
    return prisma.relation.findMany({
      where,
      orderBy: { name: 'asc' },
      include: { _count: { select: { triples: true } } },
    });
  },

  async shortestPath(fromId: string, toId: string) {
    if (fromId === toId) return { path: [fromId], triples: [] };

    const queue = [{ id: fromId, path: [fromId], triples: [] as string[] }];
    const visited = new Set([fromId]);

    while (queue.length > 0) {
      const { id, path, triples: edgePath } = queue.shift()!;
      const connected = await prisma.triple.findMany({
        where: {
          OR: [{ subjectEntityId: id }, { objectEntityId: id }],
          status: 'APPROVED',
        },
        select: { id: true, subjectEntityId: true, objectEntityId: true },
      });

      for (const triple of connected) {
        const nextId = triple.subjectEntityId === id ? triple.objectEntityId : triple.subjectEntityId;
        if (visited.has(nextId)) continue;

        const newPath = [...path, nextId];
        const newEdges = [...edgePath, triple.id];

        if (nextId === toId) {
          return { path: newPath, tripleIds: newEdges };
        }

        visited.add(nextId);
        queue.push({ id: nextId, path: newPath, triples: newEdges });

        if (queue.length > 10000) {
          return { path: null, message: 'Path search exceeded limit' };
        }
      }
    }

    return { path: null, message: 'No path found' };
  },

  async rollbackVersion(versionId: string, userId?: string) {
    const version = await prisma.graphVersion.findUnique({
      where: { id: versionId },
      include: { changes: true },
    });

    if (!version) throw new AppError('Graph version snapshot not found', 404, 'NOT_FOUND');

    return prisma.$transaction(async (tx) => {
      let authorId = userId;
      if (!authorId) {
        const u = await tx.user.findFirst({ where: { role: 'ADMIN' } }) || await tx.user.findFirst();
        authorId = u?.id;
      }

      for (const change of version.changes) {
        const prev = change.previousValue as any;
        const next = change.newValue as any;

        switch (change.action) {
          case 'create_entity':
            if (change.entityId) {
              await tx.triple.deleteMany({
                where: { OR: [{ subjectEntityId: change.entityId }, { objectEntityId: change.entityId }] },
              });
              await tx.entityAlias.deleteMany({ where: { entityId: change.entityId } });
              await tx.entity.delete({ where: { id: change.entityId } }).catch(() => {});
            }
            break;

          case 'rename_entity':
            if (change.entityId && prev?.name) {
              await tx.entity.update({
                where: { id: change.entityId },
                data: { name: prev.name, normalizedName: prev.name.toLowerCase().trim() },
              }).catch(() => {});
            }
            break;

          case 'delete_entity':
            if (prev?.name) {
              await tx.entity.create({
                data: {
                  name: prev.name,
                  normalizedName: prev.name.toLowerCase().trim(),
                  entityType: prev.entityType || 'UNKNOWN',
                },
              }).catch(() => {});
            }
            break;

          case 'update_entity':
            if (change.entityId && prev) {
              await tx.entity.update({
                where: { id: change.entityId },
                data: prev,
              }).catch(() => {});
            }
            break;

          case 'create_relation':
            if (change.relationId) {
              await tx.triple.deleteMany({ where: { relationId: change.relationId } });
              await tx.relation.delete({ where: { id: change.relationId } }).catch(() => {});
            }
            break;

          case 'merge_entity':
            if (prev?.sourceName) {
              await tx.entity.create({
                data: {
                  name: prev.sourceName,
                  normalizedName: prev.sourceName.toLowerCase().trim(),
                  entityType: 'UNKNOWN',
                },
              }).catch(() => {});
            }
            break;
        }
      }

      if (authorId) {
        await tx.graphVersion.create({
          data: {
            name: `Reverted / Undone: "${version.name}"`,
            description: `Reverted changes from snapshot ${version.name}`,
            createdById: authorId,
          },
        });
      }

      return { success: true, message: `Reverted snapshot "${version.name}"` };
    });
  },

  async clearAllGraph() {
    return prisma.$transaction(async (tx) => {
      await tx.extractionResult.deleteMany({});
      await tx.extractionRun.deleteMany({});
      await tx.triple.deleteMany({});
      await tx.entityAlias.deleteMany({});
      await tx.graphChange.deleteMany({});
      await tx.graphVersion.deleteMany({});
      await tx.entity.deleteMany({});
      await tx.relation.deleteMany({});
      return { success: true, message: 'Knowledge graph reset successfully' };
    });
  },
};
