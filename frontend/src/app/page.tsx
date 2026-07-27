'use client';

import React, { useState } from 'react';
import { GraphState, Message, RetrievalParams } from '../types/rag';
import { Header } from '../components/Shared/Header';
import { ChatContainer } from '../components/Chatbox/ChatContainer';
import { HitlPanel } from '../components/Inspector/HitlPanel';
import { apiService } from '../services/api';

const initialGraphState: GraphState = {
  documentId: '',
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

export default function EducationalRagWorkspace() {
  const [graphState, setGraphState] = useState<GraphState>(initialGraphState);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-system-msg',
      sender: 'system',
      content: 'Welcome to the Agentic RAG Workspace. Please attach or drag & drop a PDF document into the chatbox below to start the Ingestion Agent.',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  const addMessage = (sender: 'user' | 'agent' | 'system', content: string, retrievedChunks?: any[]) => {
    const newMsg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sender,
      content,
      timestamp: new Date().toLocaleTimeString(),
      retrievedChunks,
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  /**
   * Handle PDF file drop/upload inside Chatbox.
   */
  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    addMessage('system', `📎 Uploading '${file.name}' (${Math.round(file.size / 1024)} KB)... Extracting text & generating Pinecone E5 vectors...`);

    try {
      const response = await apiService.uploadPdf(file);
      if (response.success && response.state) {
        setGraphState(response.state);
        addMessage('system', `✅ Ingestion Complete! Split into ${response.state.chunks.length} chunks and upserted to Pinecone Serverless DB.`);
        addMessage('system', `⏸️ LangGraph Paused at Ingestion HITL Breakpoint. Review chunks & vector dimensions in the Inspector panel before proceeding.`);
        setIsInspectorOpen(true);
      } else {
        addMessage('system', `❌ Upload Failed: ${response.error || 'Unknown error occurred.'}`);
      }
    } catch (error: any) {
      console.error('Upload Error:', error);
      addMessage('system', `❌ Error during upload: ${error.message || 'Check if backend server is running on port 5000.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle user query submission in Chatbox.
   */
  const handleSendMessage = async (text: string) => {
    if (!graphState.documentId) {
      alert('Please upload a PDF document first.');
      return;
    }

    addMessage('user', text);
    setIsLoading(true);

    try {
      const response = await apiService.submitQuery(
        graphState.documentId,
        text,
        graphState.retrievalParams
      );

      if (response.success && response.state) {
        setGraphState(response.state);
        addMessage('system', `🎯 Similarity Search Complete! Pinecone found ${response.state.retrievedContext.length} relevant chunks matching your parameters.`);
        addMessage('system', `⏸️ LangGraph Paused at Retrieval HITL Breakpoint. Inspect cosine scores in the Inspector panel or adjust topK before generating Gemini 2.5 answer.`);
        setIsInspectorOpen(true);
      } else {
        addMessage('system', `❌ Query Failed: ${response.error || 'Unknown error occurred.'}`);
      }
    } catch (error: any) {
      console.error('Query Error:', error);
      addMessage('system', `❌ Error during query: ${error.message || 'Check backend connection.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle resuming workflow from HITL breakpoints (or re-running retrieval).
   */
  const handleResumeWorkflow = async (
    updatedParams?: RetrievalParams,
    action?: 'continue' | 're_retrieve'
  ) => {
    if (!graphState.documentId) return;

    setIsLoading(true);
    try {
      const response = await apiService.resumeWorkflow(
        graphState.documentId,
        updatedParams || graphState.retrievalParams,
        action
      );

      if (response.success && response.state) {
        setGraphState(response.state);

        if (response.state.stepStatus === 'IDLE' && action !== 're_retrieve') {
          addMessage('system', '▶️ Ingestion acknowledged. Ready for student queries!');
          setIsInspectorOpen(false);
        } else if (action === 're_retrieve') {
          addMessage('system', `🔄 Re-retrieved chunks with new topK (${updatedParams?.topK}) and threshold (${Math.round((updatedParams?.similarityThreshold || 0) * 100)}%). Review updated scores below.`);
        } else if (response.state.stepStatus === 'COMPLETED' || response.state.finalAnswer) {
          addMessage(
            'agent',
            response.state.finalAnswer,
            response.state.retrievedContext
          );
          setIsInspectorOpen(false);
        }
      } else {
        addMessage('system', `❌ Resume Failed: ${response.error || 'Unknown error occurred.'}`);
      }
    } catch (error: any) {
      console.error('Resume Error:', error);
      addMessage('system', `❌ Error resuming workflow: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`app-container ${isInspectorOpen ? 'inspector-open' : ''}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
        <Header
          stepStatus={graphState.stepStatus}
          isInspectorOpen={isInspectorOpen}
          onToggleInspector={() => setIsInspectorOpen(!isInspectorOpen)}
          documentName={graphState.documentName}
        />

        <ChatContainer
          messages={messages}
          isLoading={isLoading}
          graphState={graphState}
          onSendMessage={handleSendMessage}
          onFileUpload={handleFileUpload}
        />
      </div>

      {isInspectorOpen && (
        <HitlPanel
          graphState={graphState}
          onResumeWorkflow={handleResumeWorkflow}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
