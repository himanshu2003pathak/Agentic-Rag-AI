import { GraphState } from '../graph/annotation';
import { getGeminiModel } from '../config/gemini';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';

/**
 * Generation Agent Node.
 * Uses Gemini 2.5 Flash in a single generation pass to synthesize an educational,
 * grounded answer from the retrieved Pinecone vector chunks.
 */
export async function generationAgent(state: GraphState): Promise<Partial<GraphState>> {
  console.log(`💡 [Generation Agent] Synthesizing answer with Gemini 2.5 Flash for query: "${state.userQuery}"`);

  try {
    if (!state.userQuery) {
      throw new Error('No query provided for generation.');
    }

    // Format context chunks
    const contextString = state.retrievedContext
      .map((item, idx) => `[Chunk ${idx + 1} | Score: ${item.score}] ${item.text}`)
      .join('\n\n---\n\n');

    const systemPrompt = `You are an expert AI Educational Tutor specializing in RAG (Retrieval-Augmented Generation) architectures.
Your goal is to answer the student's query accurately using ONLY the retrieved context chunks provided below from their uploaded PDF document.

CRITICAL INSTRUCTIONS:
1. Ground every claim directly in the provided context chunks.
2. Cite the chunk number or score when mentioning facts (e.g., "As noted in [Chunk 1]...").
3. If the answer cannot be found in the provided chunks, explicitly state: "The retrieved document chunks do not contain sufficient information to answer this question." Do NOT hallucinate.
4. Format your answer cleanly using GitHub-style Markdown with clear headings, bullet points, and code blocks if applicable.
5. Provide a brief educational note at the end explaining how RAG used the cosine similarity score to find this information.`;

    const userPrompt = `### USER QUERY:
${state.userQuery}

### RETRIEVED PINECONE CONTEXT CHUNKS:
${contextString || 'No context chunks retrieved.'}

Please synthesize the final grounded answer:`;

    const generationPrompt = `${systemPrompt}\n\n${userPrompt}`;

    console.log('🤖 [Generation Agent] Dispatching single LLM call to Gemini 2.5 Flash...');
    const model = getGeminiModel(0.2);
    const response = await model.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt),
    ]);

    const finalAnswer =
      typeof response.content === 'string'
        ? response.content
        : JSON.stringify(response.content);

    console.log('✅ [Generation Agent] Answer synthesized successfully.');

    return {
      generationPrompt,
      finalAnswer,
      stepStatus: 'COMPLETED',
    };
  } catch (error: any) {
    console.error('❌ [Generation Agent] Error during Gemini generation:', error);
    return {
      stepStatus: 'ERROR',
      errorMessage: error.message || 'Failed during LLM generation.',
    };
  }
}
