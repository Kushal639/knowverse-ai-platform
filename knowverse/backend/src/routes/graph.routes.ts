import { Router } from 'express';
import { graphController } from '../controllers/graph.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { entitySchema, relationSchema, renameEntitySchema, mergeEntitySchema } from '../schemas';
import { auditLog } from '../middleware/auditLog';
import asyncHandler from '../utils/asyncHandler';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(graphController.getGraph));
router.get('/stats', asyncHandler(graphController.getStats));
router.get('/analytics', asyncHandler(graphController.getAnalytics));
router.get('/clusters', asyncHandler(graphController.getCommunities));
router.get('/duplicates', asyncHandler(graphController.detectDuplicates));
router.get('/search', asyncHandler(graphController.searchGraph));

router.get('/entities', asyncHandler(graphController.getEntities));
router.post('/entities', validate(entitySchema), auditLog('CREATE_ENTITY', 'Entity'), asyncHandler(graphController.createEntity));
router.get('/entities/merge', requireAdmin, asyncHandler(graphController.mergeEntities));
router.post('/entities/merge', requireAdmin, validate(mergeEntitySchema), auditLog('MERGE_ENTITY', 'Entity'), asyncHandler(graphController.mergeEntities));
router.get('/entities/:id', asyncHandler(graphController.getEntity));
router.put('/entities/:id', validate(entitySchema), auditLog('UPDATE_ENTITY', 'Entity'), asyncHandler(graphController.updateEntity));
router.delete('/entities/:id', requireAdmin, auditLog('DELETE_ENTITY', 'Entity'), asyncHandler(graphController.deleteEntity));
router.post('/entities/:id/rename', requireAdmin, validate(renameEntitySchema), auditLog('RENAME_ENTITY', 'Entity'), asyncHandler(graphController.renameEntity));
router.get('/entities/:id/neighborhood', asyncHandler(graphController.getNeighborhood));

router.get('/triples/:id/provenance', asyncHandler(graphController.getTripleProvenance));

router.get('/relations', asyncHandler(graphController.getRelations));
router.post('/relations', validate(relationSchema), asyncHandler(graphController.createRelation));
router.get('/shortest-path', asyncHandler(graphController.shortestPath));
router.post('/versions/:id/rollback', requireAdmin, auditLog('ROLLBACK_GRAPH_VERSION', 'GraphVersion'), asyncHandler(graphController.rollbackVersion));
router.post('/clear', auditLog('CLEAR_GRAPH', 'Graph'), asyncHandler(graphController.clearGraph));

export default router;
