import { StateGraph, START, END } from '@langchain/langgraph';
import { GraphAnnotation, GraphState } from './annotation';
import { supervisorAgent, routeFromSupervisor } from '../agents/supervisor';
import { ingestionAgent } from '../agents/ingestion';
import { retrievalAgent } from '../agents/retrieval';
import { generationAgent } from '../agents/generation';

/**
 * Compile the LangGraph Multi-Agent RAG Educational Workflow.
 * Incorporates Deterministic Router and Human-in-the-Loop (HITL) inspection breakpoints.
 */
const workflow = new StateGraph(GraphAnnotation)
  .addNode('supervisor', supervisorAgent)
  .addNode('ingestionAgent', ingestionAgent)
  .addNode('retrievalAgent', retrievalAgent)
  .addNode('generationAgent', generationAgent)
  .addEdge(START, 'supervisor')
  .addConditionalEdges('supervisor', routeFromSupervisor, {
    ingestionAgent: 'ingestionAgent',
    retrievalAgent: 'retrievalAgent',
    generationAgent: 'generationAgent',
    __end__: END,
  })
  .addEdge('ingestionAgent', 'supervisor')
  .addEdge('retrievalAgent', 'supervisor')
  .addEdge('generationAgent', 'supervisor');

export const ragGraph = workflow.compile();

/**
 * Simple in-memory session state store for educational HITL inspection and resuming.
 * In a multi-server setup, this can be swapped with Prisma SQLite or Redis.
 */
export const stateStore = new Map<string, GraphState>();

/**
 * Helper to run or resume the workflow and persist state.
 */
export async function runRagWorkflow(initialState: Partial<GraphState>): Promise<GraphState> {
  const docId = initialState.documentId || 'default-doc';
  const existingState = stateStore.get(docId) || {
    documentId: docId,
    documentName: '',
    rawText: '',
    chunks: [],
    embeddings: [],
    userQuery: '',
    retrievedContext: [],
    generationPrompt: '',
    finalAnswer: '',
    stepStatus: 'IDLE',
    retrievalParams: { topK: 4, similarityThreshold: 0.65 },
    errorMessage: '',
  };

  const mergedState = { ...existingState, ...initialState };
  console.log(`🚀 [Workflow] Executing RAG Graph for doc '${docId}' (status: ${mergedState.stepStatus})...`);

  const finalState = await ragGraph.invoke(mergedState);
  stateStore.set(docId, finalState);
  return finalState;
}
