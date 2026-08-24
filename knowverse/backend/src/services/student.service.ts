import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

interface TargetRoleDefinition {
  title: string;
  requiredSkills: string[];
  description: string;
}

const TARGET_ROLES: Record<string, TargetRoleDefinition> = {
  'ml-engineer': {
    title: 'Machine Learning Engineer',
    requiredSkills: ['Machine Learning', 'Classification', 'Supervised Learning', 'Python', 'Algorithms', 'Data Structures'],
    description: 'Builds, evaluates, and deploys predictive statistical and neural network models.',
  },
  'full-stack-dev': {
    title: 'Full-Stack Software Engineer',
    requiredSkills: ['Data Structures', 'Algorithms', 'Database Management', 'Web Development', 'Computer Networks', 'Operating Systems'],
    description: 'Designs, develops, and maintains scalable backend services and responsive client web applications.',
  },
  'data-scientist': {
    title: 'Data Scientist / Analyst',
    requiredSkills: ['Machine Learning', 'Data Structures', 'Database Management', 'Statistics', 'Regression', 'Clustering'],
    description: 'Extracts actionable business insights and statistical patterns from multi-modal structured datasets.',
  },
  'cybersecurity-analyst': {
    title: 'Cybersecurity & Systems Specialist',
    requiredSkills: ['Computer Networks', 'Operating Systems', 'Information Security', 'Cryptography', 'Network Security'],
    description: 'Secures enterprise networking infrastructure, implements cryptographic standards, and manages vulnerabilities.',
  },
};

export const studentService = {
  async listStudents(search?: string) {
    const studentEntities = await prisma.entity.findMany({
      where: {
        entityType: { in: ['PERSON', 'STUDENT'] },
        ...(search ? { name: { contains: search } } : {}),
      },
      include: {
        subjectTriples: {
          where: { status: 'APPROVED' },
          include: {
            relation: true,
            objectEntity: { select: { id: true, name: true, entityType: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return studentEntities.map(student => {
      const subjects: string[] = [];
      const topics: string[] = [];
      const grades: string[] = [];
      let department = 'Computer Science';

      student.subjectTriples.forEach(t => {
        const objType = (t.objectEntity.entityType || '').toUpperCase();
        const rel = t.relation.name.toLowerCase();

        if (objType === 'SUBJECT' || objType === 'COURSE' || rel.includes('stud')) {
          subjects.push(t.objectEntity.name);
        } else if (objType === 'TOPIC' || objType === 'SKILL' || rel.includes('topic') || rel.includes('know')) {
          topics.push(t.objectEntity.name);
        } else if (objType === 'ATTRIBUTE' || rel.includes('grade')) {
          grades.push(t.objectEntity.name);
        } else if (objType === 'DEPARTMENT' || rel.includes('belong')) {
          department = t.objectEntity.name;
        }
      });

      return {
        id: student.id,
        name: student.name,
        department,
        totalRelations: student.subjectTriples.length,
        subjects: [...new Set(subjects)],
        topics: [...new Set(topics)],
        grades: [...new Set(grades)],
      };
    });
  },

  async getStudentProfile(studentId: string, targetRoleId = 'ml-engineer') {
    const student = await prisma.entity.findUnique({
      where: { id: studentId },
      include: {
        subjectTriples: {
          where: { status: 'APPROVED' },
          include: {
            relation: true,
            objectEntity: true,
            sourceDocument: { include: { dataset: true } },
          },
        },
      },
    });

    if (!student) throw new AppError('Student entity not found', 404, 'NOT_FOUND');

    const subjects: any[] = [];
    const topics: any[] = [];
    const grades: any[] = [];
    let department = 'Computer Science';
    const knownSkillsSet = new Set<string>();

    student.subjectTriples.forEach(t => {
      const obj = t.objectEntity;
      const type = (obj.entityType || '').toUpperCase();
      const rel = t.relation.name.toLowerCase();

      knownSkillsSet.add(obj.name.toLowerCase());

      if (type === 'SUBJECT' || type === 'COURSE' || rel.includes('stud')) {
        subjects.push({ name: obj.name, relation: t.relation.name, confidence: t.confidence });
      } else if (type === 'TOPIC' || type === 'SKILL' || rel.includes('topic') || rel.includes('know')) {
        topics.push({ name: obj.name, relation: t.relation.name, confidence: t.confidence });
      } else if (type === 'ATTRIBUTE' || rel.includes('grade')) {
        grades.push({ name: obj.name, relation: t.relation.name });
      } else if (type === 'DEPARTMENT' || rel.includes('belong')) {
        department = obj.name;
      }
    });

    // Calculate dynamic knowledge domain masteries from actual connected facts
    const hasCS = subjects.some(s => s.name.toLowerCase().includes('data structure') || s.name.toLowerCase().includes('algorithm'));
    const hasAI = subjects.some(s => s.name.toLowerCase().includes('machine learning') || s.name.toLowerCase().includes('ai')) || topics.some(t => t.name.toLowerCase().includes('supervised') || t.name.toLowerCase().includes('classification'));
    const hasDB = subjects.some(s => s.name.toLowerCase().includes('database') || s.name.toLowerCase().includes('sql'));
    const hasNet = subjects.some(s => s.name.toLowerCase().includes('network') || s.name.toLowerCase().includes('security'));

    const knowledgeMastery = [
      { area: 'Data Structures & Algorithms', score: hasCS ? 92 : 40 },
      { area: 'Artificial Intelligence & ML', score: hasAI ? 88 : 35 },
      { area: 'Database & Data Systems', score: hasDB ? 78 : 30 },
      { area: 'Computer Networks & Security', score: hasNet ? 82 : 25 },
      { area: 'Software Engineering', score: 70 },
    ];

    // Skill Gap Analysis against target role
    const roleDef = TARGET_ROLES[targetRoleId] || TARGET_ROLES['ml-engineer'];
    const acquiredSkills: string[] = [];
    const missingSkills: string[] = [];

    roleDef.requiredSkills.forEach(skill => {
      const match = Array.from(knownSkillsSet).some(k => k.includes(skill.toLowerCase()) || skill.toLowerCase().includes(k));
      if (match) {
        acquiredSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    });

    const roleReadiness = Math.round((acquiredSkills.length / roleDef.requiredSkills.length) * 100);

    // Recommended learning path derived from missing skills
    const learningPath = missingSkills.map((skill, idx) => ({
      step: idx + 1,
      skill,
      rationale: `Required competency for ${roleDef.title}. Build upon your existing ${acquiredSkills[0] || 'foundation'}.`,
    }));

    return {
      student: {
        id: student.id,
        name: student.name,
        department,
        totalTriples: student.subjectTriples.length,
      },
      subjects,
      topics,
      grades,
      knowledgeMastery,
      skillGap: {
        targetRole: roleDef.title,
        targetRoleId,
        description: roleDef.description,
        readinessScore: roleReadiness,
        acquiredSkills,
        missingSkills,
        learningPath,
      },
      availableRoles: Object.entries(TARGET_ROLES).map(([id, r]) => ({ id, title: r.title })),
    };
  },
};
