import { Annotation } from '@langchain/langgraph';
import { TextChunk } from '../utils/pdfParser';

export interface RetrievedContextItem {
  id: string;
  text: string;
  score: number;
}

export type StepStatus =
  | 'IDLE'
  | 'INGESTING'
  | 'WAITING_FOR_INSPECTION_INGESTION'
  | 'RETRIEVING'
  | 'WAITING_FOR_INSPECTION_RETRIEVAL'
  | 'GENERATING'
  | 'COMPLETED'
  | 'ERROR';

/**
 * Shared state schema across all educational RAG agents.
 * Tracks raw data, intermediate vectors, similarity scores, and HITL status.
 */
export const GraphAnnotation = Annotation.Root({
  documentId: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  documentName: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  rawText: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  chunks: Annotation<TextChunk[]>({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  embeddings: Annotation<number[][]>({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  userQuery: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  retrievedContext: Annotation<RetrievedContextItem[]>({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  generationPrompt: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  finalAnswer: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  stepStatus: Annotation<StepStatus>({
    reducer: (x, y) => y ?? x,
    default: () => 'IDLE',
  }),
  retrievalParams: Annotation<{ topK: number; similarityThreshold: number }>({
    reducer: (x, y) => y ?? x,
    default: () => ({ topK: 4, similarityThreshold: 0.65 }),
  }),
  errorMessage: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
});

export type GraphState = typeof GraphAnnotation.State;
