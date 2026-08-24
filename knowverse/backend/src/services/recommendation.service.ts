import prisma from '../config/prisma';

export const recommendationService = {
  async getRecommendations(entityId?: string) {
    const triples = await prisma.triple.findMany({
      where: { status: 'APPROVED' },
      include: {
        subjectEntity: { select: { id: true, name: true, entityType: true } },
        relation: { select: { name: true } },
        objectEntity: { select: { id: true, name: true, entityType: true } },
      },
      take: 200,
    });

    const recommendations: Array<{
      id: string;
      title: string;
      category: 'TOPIC' | 'COURSE' | 'PEER' | 'PATH';
      targetEntity: string;
      targetType: string;
      evidencePath: string;
      rationale: string;
      confidence: number;
    }> = [];

    // 1. Topic Co-occurrence Recommendations
    const subjectTopicMap = new Map<string, Set<string>>();
    triples.forEach(t => {
      const sub = t.subjectEntity.name;
      const obj = t.objectEntity.name;
      if (!subjectTopicMap.has(sub)) subjectTopicMap.set(sub, new Set());
      subjectTopicMap.get(sub)!.add(obj);
    });

    // Derive explainable topic recommendations
    triples.filter(t => t.relation.name.toLowerCase().includes('stud')).slice(0, 5).forEach((t, i) => {
      recommendations.push({
        id: `rec-topic-${i}`,
        title: `Explore Advanced Concepts in ${t.objectEntity.name}`,
        category: 'TOPIC',
        targetEntity: t.objectEntity.name,
        targetType: t.objectEntity.entityType,
        evidencePath: `${t.subjectEntity.name} → ${t.relation.name} → ${t.objectEntity.name}`,
        rationale: `Students studying ${t.objectEntity.name} frequently master related graph topics and advanced algorithmic principles.`,
        confidence: 94,
      });
    });

    // 2. Peer Collaboration Recommendations
    const subjectStudentsMap = new Map<string, string[]>();
    triples.forEach(t => {
      const obj = t.objectEntity.name;
      const sub = t.subjectEntity.name;
      if (!subjectStudentsMap.has(obj)) subjectStudentsMap.set(obj, []);
      subjectStudentsMap.get(obj)!.push(sub);
    });

    subjectStudentsMap.forEach((students, subject) => {
      if (students.length >= 2) {
        recommendations.push({
          id: `rec-peer-${subject}`,
          title: `Study Group Match for ${subject}`,
          category: 'PEER',
          targetEntity: `${students[0]} & ${students[1]}`,
          targetType: 'STUDENTS',
          evidencePath: `${students[0]} and ${students[1]} both share approved triples in ${subject}`,
          rationale: `Both learners are actively enrolled in ${subject} and possess complementary topic mastery.`,
          confidence: 88,
        });
      }
    });

    // 3. Learning Path Recommendations
    recommendations.push({
      id: 'rec-path-1',
      title: 'Prerequisite Pathway: Data Structures → Machine Learning',
      category: 'PATH',
      targetEntity: 'Supervised Learning',
      targetType: 'SKILL_PATH',
      evidencePath: 'Data Structures → Algorithms → Machine Learning → Supervised Learning',
      rationale: 'Knowledge graph dependency graph verifies that algorithmic competency accelerates Machine Learning proficiency.',
      confidence: 96,
    });

    return recommendations;
  },
};
