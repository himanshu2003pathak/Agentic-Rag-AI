import { GraphState } from '../graph/annotation';

/**
 * Deterministic Supervisor Router Agent.
 * To save API quota and ensure predictable educational paths, it does NOT use an LLM.
 * Instead, it programmatically checks state properties and HITL breakpoints to route traffic.
 */
export async function supervisorAgent(state: GraphState): Promise<Partial<GraphState>> {
  console.log(`🧭 [Supervisor Agent] Evaluating state. Current status: '${state.stepStatus}'`);

  // We don't alter state in the supervisor node itself, just log routing decisions
  return {};
}

/**
 * Conditional routing function used by LangGraph edges.
 */
export function routeFromSupervisor(state: GraphState): string {
  if (state.stepStatus === 'ERROR') {
    return '__end__';
  }

  // 1. Check if we just paused for Ingestion HITL inspection
  if (state.stepStatus === 'WAITING_FOR_INSPECTION_INGESTION') {
    console.log('⏸️ [Supervisor] Pausing at Ingestion HITL Breakpoint.');
    return '__end__';
  }

  // 2. Check if we just paused for Retrieval HITL inspection
  if (state.stepStatus === 'WAITING_FOR_INSPECTION_RETRIEVAL') {
    console.log('⏸️ [Supervisor] Pausing at Retrieval HITL Breakpoint.');
    return '__end__';
  }

  // 3. If generation completed, finish workflow
  if (state.stepStatus === 'COMPLETED') {
    console.log('🎉 [Supervisor] Pipeline completed.');
    return '__end__';
  }

  // 4. If we have a document waiting to be ingested (has rawText but no chunks/embeddings)
  if (state.documentId && state.rawText && state.chunks.length === 0) {
    console.log('➡️ [Supervisor] Routing to Ingestion Agent...');
    return 'ingestionAgent';
  }

  // 5. If we have a query waiting to be retrieved
  if (state.userQuery && state.retrievedContext.length === 0 && state.stepStatus !== 'GENERATING') {
    console.log('➡️ [Supervisor] Routing to Retrieval Agent...');
    return 'retrievalAgent';
  }

  // 6. If retrievedContext is populated or status is GENERATING, route to Generation
  if (state.userQuery && (state.retrievedContext.length > 0 || state.stepStatus === 'GENERATING')) {
    console.log('➡️ [Supervisor] Routing to Generation Agent...');
    return 'generationAgent';
  }

  console.log('⏹️ [Supervisor] No matching route found. Ending graph execution.');
  return '__end__';
}
