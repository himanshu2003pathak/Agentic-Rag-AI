import { GraphState, RetrievedContextItem } from '../graph/annotation';
import { pinecone, PINECONE_INDEX_NAME, generateEmbeddings } from '../config/pinecone';

/**
 * Retrieval Agent Node.
 * 1. Converts user query into vector using Pinecone Inference API ('query' inputType).
 * 2. Performs cosine similarity search against Pinecone index in the document's namespace.
 * 3. Returns top-k retrieved chunks and triggers Retrieval HITL breakpoint.
 */
export async function retrievalAgent(state: GraphState): Promise<Partial<GraphState>> {
  console.log(`🔍 [Retrieval Agent] Searching Pinecone for query: "${state.userQuery}" (topK: ${state.retrievalParams.topK})`);

  try {
    if (!state.userQuery) {
      throw new Error('No query provided for retrieval.');
    }
    if (!state.documentId) {
      throw new Error('No documentId associated with state for vector namespace lookup.');
    }

    // 1. Embed user query
    console.log('🧠 [Retrieval Agent] Vectorizing query with Pinecone Inference API...');
    const queryEmbeddings = await generateEmbeddings([state.userQuery], 'query');
    const queryVector = queryEmbeddings[0];

    if (!queryVector || queryVector.length === 0) {
      throw new Error('Failed to generate query vector embedding.');
    }

    // 2. Similarity Search in Pinecone
    console.log(`🎯 [Retrieval Agent] Querying Pinecone index '${PINECONE_INDEX_NAME}' namespace '${state.documentId}'...`);
    const index = pinecone.index(PINECONE_INDEX_NAME);
    const namespaceIndex = index.namespace(state.documentId);

    const searchResults = await namespaceIndex.query({
      vector: queryVector,
      topK: state.retrievalParams.topK || 4,
      includeMetadata: true,
    });

    // 3. Format retrieved context
    const retrievedContext: RetrievedContextItem[] = [];
    if (searchResults.matches && searchResults.matches.length > 0) {
      for (const match of searchResults.matches) {
        if (match.metadata && match.metadata.text) {
          // Check against similarity threshold if needed
          const score = match.score ?? 0;
          if (score >= (state.retrievalParams.similarityThreshold || 0.5)) {
            retrievedContext.push({
              id: match.id,
              text: String(match.metadata.text),
              score: Number(score.toFixed(4)),
            });
          }
        }
      }
    }

    console.log(`✅ [Retrieval Agent] Found ${retrievedContext.length} relevant chunks matching criteria.`);

    return {
      retrievedContext,
      stepStatus: 'WAITING_FOR_INSPECTION_RETRIEVAL',
    };
  } catch (error: any) {
    console.error('❌ [Retrieval Agent] Error during similarity search:', error);
    return {
      stepStatus: 'ERROR',
      errorMessage: error.message || 'Failed during vector retrieval.',
    };
  }
}
