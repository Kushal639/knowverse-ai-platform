import { PrismaClient, Role, TripleStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding KnowVerse database...');

  // -------------------------------------------------------
  // USERS (demo credentials — dev only, never use in prod)
  // -------------------------------------------------------
  const adminHash = await bcrypt.hash('Admin@1234', 12);
  const demoHash = await bcrypt.hash('Demo@1234', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@knowverse.dev' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@knowverse.dev',
      passwordHash: adminHash,
      role: Role.ADMIN,
    },
  });

  const demo = await prisma.user.upsert({
    where: { email: 'demo@knowverse.dev' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@knowverse.dev',
      passwordHash: demoHash,
      role: Role.USER,
    },
  });

  console.log('✅ Users created');

  // -------------------------------------------------------
  // DATASET + DOCUMENT
  // -------------------------------------------------------
  const dataset = await prisma.dataset.upsert({
    where: { id: 'seed-dataset-001' },
    update: {},
    create: {
      id: 'seed-dataset-001',
      ownerId: demo.id,
      name: 'AI & Technology Knowledge Base',
      description: 'A sample dataset about artificial intelligence, companies, and technology relationships.',
      fileType: 'text/plain',
      status: 'COMPLETED',
    },
  });

  const document = await prisma.document.upsert({
    where: { id: 'seed-doc-001' },
    update: {},
    create: {
      id: 'seed-doc-001',
      datasetId: dataset.id,
      title: 'AI Companies and Relationships',
      content: `Infosys is an Indian multinational information technology company. 
Infosys was founded by Narayana Murthy in 1981. 
Infosys provides software development services. 
Google develops artificial intelligence technologies. 
DeepMind is a subsidiary of Google. 
DeepMind created AlphaGo. 
AlphaGo defeated Lee Sedol in 2016. 
OpenAI developed ChatGPT. 
Microsoft invested in OpenAI. 
Sam Altman is the CEO of OpenAI.`,
      source: 'seed',
    },
  });

  console.log('✅ Dataset and Document created');

  // -------------------------------------------------------
  // ENTITIES
  // -------------------------------------------------------
  const entityData = [
    { id: 'ent-infosys', name: 'Infosys', normalizedName: 'infosys', entityType: 'ORG' },
    { id: 'ent-narayana', name: 'Narayana Murthy', normalizedName: 'narayana murthy', entityType: 'PERSON' },
    { id: 'ent-google', name: 'Google', normalizedName: 'google', entityType: 'ORG' },
    { id: 'ent-deepmind', name: 'DeepMind', normalizedName: 'deepmind', entityType: 'ORG' },
    { id: 'ent-alphago', name: 'AlphaGo', normalizedName: 'alphago', entityType: 'PRODUCT' },
    { id: 'ent-lee-sedol', name: 'Lee Sedol', normalizedName: 'lee sedol', entityType: 'PERSON' },
    { id: 'ent-openai', name: 'OpenAI', normalizedName: 'openai', entityType: 'ORG' },
    { id: 'ent-chatgpt', name: 'ChatGPT', normalizedName: 'chatgpt', entityType: 'PRODUCT' },
    { id: 'ent-microsoft', name: 'Microsoft', normalizedName: 'microsoft', entityType: 'ORG' },
    { id: 'ent-sam-altman', name: 'Sam Altman', normalizedName: 'sam altman', entityType: 'PERSON' },
    { id: 'ent-ai', name: 'Artificial Intelligence', normalizedName: 'artificial intelligence', entityType: 'CONCEPT' },
  ];

  for (const e of entityData) {
    await prisma.entity.upsert({
      where: { normalizedName: e.normalizedName },
      update: {},
      create: e,
    });
  }

  console.log('✅ Entities created');

  // -------------------------------------------------------
  // RELATIONS
  // -------------------------------------------------------
  const relationData = [
    { id: 'rel-founded', name: 'founded', normalizedName: 'founded' },
    { id: 'rel-is-subsidiary', name: 'is subsidiary of', normalizedName: 'is subsidiary of' },
    { id: 'rel-created', name: 'created', normalizedName: 'created' },
    { id: 'rel-defeated', name: 'defeated', normalizedName: 'defeated' },
    { id: 'rel-developed', name: 'developed', normalizedName: 'developed' },
    { id: 'rel-invested-in', name: 'invested in', normalizedName: 'invested in' },
    { id: 'rel-ceo-of', name: 'CEO of', normalizedName: 'ceo of' },
    { id: 'rel-provides', name: 'provides', normalizedName: 'provides' },
  ];

  for (const r of relationData) {
    await prisma.relation.upsert({
      where: { normalizedName: r.normalizedName },
      update: {},
      create: r,
    });
  }

  console.log('✅ Relations created');

  // -------------------------------------------------------
  // TRIPLES (Knowledge Graph)
  // -------------------------------------------------------
  const triplesData = [
    { subjectEntityId: 'ent-narayana', relationId: 'rel-founded', objectEntityId: 'ent-infosys', confidence: 0.98, status: TripleStatus.APPROVED },
    { subjectEntityId: 'ent-deepmind', relationId: 'rel-is-subsidiary', objectEntityId: 'ent-google', confidence: 0.95, status: TripleStatus.APPROVED },
    { subjectEntityId: 'ent-deepmind', relationId: 'rel-created', objectEntityId: 'ent-alphago', confidence: 0.97, status: TripleStatus.APPROVED },
    { subjectEntityId: 'ent-alphago', relationId: 'rel-defeated', objectEntityId: 'ent-lee-sedol', confidence: 0.99, status: TripleStatus.APPROVED },
    { subjectEntityId: 'ent-openai', relationId: 'rel-developed', objectEntityId: 'ent-chatgpt', confidence: 0.99, status: TripleStatus.APPROVED },
    { subjectEntityId: 'ent-microsoft', relationId: 'rel-invested-in', objectEntityId: 'ent-openai', confidence: 0.96, status: TripleStatus.APPROVED },
    { subjectEntityId: 'ent-sam-altman', relationId: 'rel-ceo-of', objectEntityId: 'ent-openai', confidence: 0.98, status: TripleStatus.APPROVED },
    { subjectEntityId: 'ent-google', relationId: 'rel-developed', objectEntityId: 'ent-ai', confidence: 0.75, status: TripleStatus.PENDING },
    { subjectEntityId: 'ent-infosys', relationId: 'rel-provides', objectEntityId: 'ent-ai', confidence: 0.70, status: TripleStatus.PENDING },
  ];

  for (const t of triplesData) {
    await prisma.triple.upsert({
      where: {
        subjectEntityId_relationId_objectEntityId: {
          subjectEntityId: t.subjectEntityId,
          relationId: t.relationId,
          objectEntityId: t.objectEntityId,
        },
      },
      update: {},
      create: {
        ...t,
        sourceDocumentId: document.id,
        sourceText: 'Seeded data',
        extractionModel: 'seed',
        createdById: admin.id,
      },
    });
  }

  console.log('✅ Triples created');

  // -------------------------------------------------------
  // FEEDBACK
  // -------------------------------------------------------
  await prisma.feedback.upsert({
    where: { id: 'seed-feedback-001' },
    update: {},
    create: {
      id: 'seed-feedback-001',
      userId: demo.id,
      rating: 5,
      comment: 'Amazing platform! The knowledge graph visualization is incredibly useful.',
      status: 'REVIEWED',
      adminResponse: 'Thank you for your kind words!',
    },
  });

  await prisma.feedback.upsert({
    where: { id: 'seed-feedback-002' },
    update: {},
    create: {
      id: 'seed-feedback-002',
      userId: demo.id,
      rating: 4,
      comment: 'Great tool for knowledge management. Would love more export options.',
      status: 'OPEN',
    },
  });

  console.log('✅ Feedback created');

  // -------------------------------------------------------
  // AUDIT LOG
  // -------------------------------------------------------
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'SEED_DATABASE',
      entityType: 'System',
      details: { message: 'Database seeded with sample data' },
    },
  });

  console.log('✅ Audit log created');
  console.log('');
  console.log('🎉 Seeding complete!');
  console.log('');
  console.log('📋 Demo Credentials (development only):');
  console.log('  Admin: admin@knowverse.dev / Admin@1234');
  console.log('  User:  demo@knowverse.dev  / Demo@1234');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
