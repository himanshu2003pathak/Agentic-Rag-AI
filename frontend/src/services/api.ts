import axios from 'axios';
import { ApiResponse, RetrievalParams } from '../types/rag';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api/rag';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  /**
   * Uploads PDF attachment from the chatbox to ingest via Pinecone.
   */
  async uploadPdf(file: File): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post<ApiResponse>(`${BASE_URL}/upload`, formData);
    return response.data;
  },

  /**
   * Submits user query for similarity retrieval.
   */
  async submitQuery(
    documentId: string,
    query: string,
    retrievalParams?: RetrievalParams
  ): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>('/query', {
      documentId,
      query,
      retrievalParams,
    });
    return response.data;
  },

  /**
   * Fetches latest LangGraph state snapshot for HITL inspection.
   */
  async getGraphState(documentId: string): Promise<ApiResponse> {
    const response = await apiClient.get<ApiResponse>(`/state/${documentId}`);
    return response.data;
  },

  /**
   * Resumes graph execution from HITL inspection breakpoint.
   */
  async resumeWorkflow(
    documentId: string,
    updatedParams?: RetrievalParams,
    action?: 'continue' | 're_retrieve'
  ): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>('/resume', {
      documentId,
      updatedParams,
      action,
    });
    return response.data;
  },
};
