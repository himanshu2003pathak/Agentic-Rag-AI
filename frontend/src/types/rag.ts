export interface TextChunk {
  id: string;
  text: string;
  metadata: {
    chunkIndex: number;
    wordCount: number;
    charCount: number;
  };
}

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

export interface RetrievalParams {
  topK: number;
  similarityThreshold: number;
}

export interface GraphState {
  documentId: string;
  documentName: string;
  rawText: string;
  chunks: TextChunk[];
  embeddings: number[][];
  userQuery: string;
  retrievedContext: RetrievedContextItem[];
  generationPrompt: string;
  finalAnswer: string;
  stepStatus: StepStatus;
  retrievalParams: RetrievalParams;
  errorMessage: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  state?: GraphState;
  error?: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'agent' | 'system';
  content: string;
  timestamp: string;
  retrievedChunks?: RetrievedContextItem[];
}
