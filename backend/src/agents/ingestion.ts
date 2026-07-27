import { GraphState } from '../graph/annotation';
import { splitTextIntoChunks } from '../utils/pdfParser';
import { pinecone, PINECONE_INDEX_NAME, generateEmbeddings, ensureIndexExists } from '../config/pinecone';

/**
 * Ingestion Agent Node.
 * 1. Splits document text into semantic chunks.
 * 2. Generates vector embeddings strictly via Pinecone native Inference API.
 * 3. Upserts vectors and text metadata into Pinecone Serverless DB under documentId namespace.
 */
export async function ingestionAgent(state: GraphState): Promise<Partial<GraphState>> {
  console.log(`📦 [Ingestion Agent] Starting ingestion for document: '${state.documentName}' (${state.documentId})`);

  try {
    if (!state.rawText) {
      throw new Error('No raw text provided for ingestion.');
    }

    // 1. Chunking
    console.log('✂️ [Ingestion Agent] Chunking document text...');
    const chunks = splitTextIntoChunks(state.rawText, 800, 150);
    console.log(`✅ Formed ${chunks.length} semantic chunks.`);

    // 2. Embedding via Pinecone Native API
    console.log('🧠 [Ingestion Agent] Generating embeddings using Pinecone Inference API...');
    const chunkTexts = chunks.map((c) => c.text);
    const embeddings = await generateEmbeddings(chunkTexts, 'passage');
    console.log(`✅ Generated ${embeddings.length} vector embeddings (dimension: ${embeddings[0]?.length || 0}).`);

    // 3. Storage in Pinecone
    console.log(`💾 [Ingestion Agent] Upserting vectors into Pinecone Index '${PINECONE_INDEX_NAME}' (namespace: ${state.documentId})...`);
    await ensureIndexExists();
    const index = pinecone.index(PINECONE_INDEX_NAME);
    const namespaceIndex = index.namespace(state.documentId);

    const records = chunks.map((chunk, idx) => ({
      id: chunk.id,
      values: embeddings[idx] || [],
      metadata: {
        text: chunk.text,
        documentId: state.documentId,
        documentName: state.documentName,
        chunkIndex: chunk.metadata.chunkIndex,
        wordCount: chunk.metadata.wordCount,
      },
    }));

    // Batch upsert in chunks of 50
    const batchSize = 50;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      await namespaceIndex.upsert(batch);
    }
    console.log('✅ Successfully stored vectors in Pinecone.');

    // 4. Update state & trigger HITL inspection breakpoint
    return {
      chunks,
      embeddings,
      stepStatus: 'WAITING_FOR_INSPECTION_INGESTION',
    };
  } catch (error: any) {
    console.error('❌ [Ingestion Agent] Error during ingestion:', error);
    return {
      stepStatus: 'ERROR',
      errorMessage: error.message || 'Failed during document ingestion.',
    };
  }
}
