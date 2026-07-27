import express, { Request, Response } from 'express';
import multer from 'multer';
import { extractTextFromPdfBuffer } from '../utils/pdfParser';
import { runRagWorkflow, stateStore } from '../graph/workflow';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /api/rag/upload
 * Handles PDF file upload directly from the frontend chatbox dropzone.
 * Extracts text, initiates LangGraph workflow, and pauses at Ingestion HITL breakpoint.
 */
router.post('/upload', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No PDF file attached.' });
      return;
    }

    console.log(`📎 [API /upload] Received file: '${req.file.originalname}' (${req.file.size} bytes)`);

    const rawText = await extractTextFromPdfBuffer(req.file.buffer);
    const documentId = `doc-${Date.now().toString(36)}`;

    // Run workflow - supervisor routes to ingestionAgent, which pauses at WAITING_FOR_INSPECTION_INGESTION
    const state = await runRagWorkflow({
      documentId,
      documentName: req.file.originalname,
      rawText,
      chunks: [],
      embeddings: [],
      stepStatus: 'IDLE',
    });

    res.json({
      success: true,
      message: 'PDF ingested and chunked. Ready for HITL inspection.',
      state,
    });
  } catch (error: any) {
    console.error('❌ [API /upload] Error:', error);
    res.status(500).json({ error: error.message || 'Failed to process uploaded PDF.' });
  }
});

/**
 * POST /api/rag/query
 * Submits a chat query against an uploaded PDF document.
 * Runs LangGraph workflow until the Retrieval HITL breakpoint.
 */
router.post('/query', async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentId, query, retrievalParams } = req.body;

    if (!documentId || !query) {
      res.status(400).json({ error: 'documentId and query are required.' });
      return;
    }

    const existingState = stateStore.get(documentId);
    if (!existingState || existingState.chunks.length === 0) {
      res.status(404).json({ error: 'Document not found or has not been ingested yet.' });
      return;
    }

    console.log(`💬 [API /query] Query for '${documentId}': "${query}"`);

    // Run workflow - supervisor routes to retrievalAgent, which pauses at WAITING_FOR_INSPECTION_RETRIEVAL
    const state = await runRagWorkflow({
      documentId,
      userQuery: query,
      retrievedContext: [],
      finalAnswer: '',
      stepStatus: 'IDLE',
      retrievalParams: retrievalParams || existingState.retrievalParams,
    });

    res.json({
      success: true,
      message: 'Retrieval completed. Pausing for HITL similarity score inspection.',
      state,
    });
  } catch (error: any) {
    console.error('❌ [API /query] Error:', error);
    res.status(500).json({ error: error.message || 'Failed to process RAG query.' });
  }
});

export default router;
