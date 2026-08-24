import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { extractionService } from '../services/extraction.service';

export const extractionController = {
  async getSchema(req: AuthRequest, res: Response): Promise<void> {
    const schema = await extractionService.getSchema(req.params.documentId);
    res.json({ success: true, data: schema });
  },

  async startExtraction(req: AuthRequest, res: Response): Promise<void> {
    const { documentId, mode, columnMapping, model, autoApprove } = req.body;
    if (!documentId) {
      res.status(400).json({ success: false, message: 'documentId is required', errorCode: 'VALIDATION_ERROR' });
      return;
    }
    const run = await extractionService.startExtraction(documentId, req.user!.id, {
      mode,
      columnMapping,
      model,
      autoApprove: autoApprove !== false,
    });
    res.status(201).json({ success: true, message: 'Extraction started', data: run });
  },

  async getExtractionRun(req: AuthRequest, res: Response): Promise<void> {
    const run = await extractionService.getExtractionRun(req.params.id);
    res.json({ success: true, data: run });
  },

  async listExtractionRuns(req: AuthRequest, res: Response): Promise<void> {
    const { page, limit } = req.query as Record<string, string>;
    const result = await extractionService.listExtractionRuns(
      req.user!.id,
      req.user!.role,
      parseInt(page || '1'),
      parseInt(limit || '20')
    );
    res.json({ success: true, data: result });
  },

  async approveResult(req: AuthRequest, res: Response): Promise<void> {
    const result = await extractionService.approveResult(req.params.id, req.user!.id);
    res.json({ success: true, message: 'Triple approved and added to knowledge graph', data: result });
  },

  async rejectResult(req: AuthRequest, res: Response): Promise<void> {
    const result = await extractionService.rejectResult(req.params.id);
    res.json({ success: true, message: 'Result rejected', data: result });
  },

  async approveAll(req: AuthRequest, res: Response): Promise<void> {
    const result = await extractionService.approveAll(req.params.id, req.user!.id);
    res.json({ success: true, message: `Approved ${result.approvedCount} triples`, data: result });
  },

  async rejectAll(req: AuthRequest, res: Response): Promise<void> {
    const result = await extractionService.rejectAll(req.params.id);
    res.json({ success: true, message: 'All pending results rejected', data: result });
  },

  async getDocumentExtractions(req: AuthRequest, res: Response): Promise<void> {
    const runs = await extractionService.getDocumentExtractions(req.params.documentId);
    res.json({ success: true, data: runs });
  },
};
