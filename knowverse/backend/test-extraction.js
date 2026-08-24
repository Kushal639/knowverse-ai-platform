const { PrismaClient } = require('@prisma/client');
const { extractionService } = require('./dist/services/extraction.service');
const p = new PrismaClient();

async function test() {
  const user = await p.user.findFirst();
  const schema = await extractionService.getSchema('doc-cse-students-test-001');
  console.log('=== 1. SCHEMA DETECTION ===');
  console.log('Doc Type:', schema.documentType);
  console.log('Recommended Mode:', schema.recommendedMode);
  console.log('Columns detected:');
  schema.columns.forEach(c => console.log(`  - ${c.name} -> ${c.inferredRole} (confidence: ${c.confidence})`));

  console.log('\n=== 2. STARTING EXTRACTION ===');
  const run = await extractionService.startExtraction('doc-cse-students-test-001', user.id, { mode: 'HYBRID' });
  console.log('Run started with ID:', run.id);

  // Wait 2 seconds for async processing
  await new Promise(r => setTimeout(r, 2000));

  const completedRun = await extractionService.getExtractionRun(run.id);
  console.log('\n=== 3. EXTRACTION RESULT ===');
  console.log('Status:', completedRun.status);
  console.log('Total Triples Generated:', completedRun.results.length);
  console.log('Real Metrics:', JSON.stringify(completedRun.metadata, null, 2));

  console.log('\n=== 4. SAMPLE GENERATED TRIPLES ===');
  completedRun.results.forEach((r, idx) => {
    if (idx < 15) {
      console.log(`  #${idx + 1} [${r.extractionMethod}] ${r.subject} --(${r.relation})--> ${r.object} (${(r.confidence * 100).toFixed(0)}%) [${r.sourceText}]`);
    }
  });

  console.log('\n=== 5. TESTING BULK APPROVE ===');
  const approveRes = await extractionService.approveAll(run.id, user.id);
  console.log(`Approved: ${approveRes.approvedCount} of ${approveRes.total} triples`);

  const approvedTriplesCount = await p.triple.count({ where: { status: 'APPROVED' } });
  console.log('Total Approved Triples in MySQL Knowledge Graph:', approvedTriplesCount);

  const totalEntities = await p.entity.count();
  console.log('Total Entities in MySQL Knowledge Graph:', totalEntities);
}

test().finally(() => p.$disconnect());
