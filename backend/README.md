# RAG Agentic Website - Backend Service

This folder contains the backend services and multi-agent AI orchestration for the Educational RAG application.

## 🏗️ Architecture Overview

The backend is organized into a modular structure designed for clarity, observability, and educational inspection:

```text
backend/
├── src/
│   ├── agents/
│   │   ├── supervisor.ts      # Deterministic traffic controller (No LLM calls)
│   │   ├── ingestion.ts       # PDF extraction, chunking, Pinecone embedding & upsert
│   │   ├── retrieval.ts       # Pinecone similarity search & context formatting
│   │   └── generation.ts      # Gemini 2.5 Flash response synthesis
│   ├── config/
│   │   ├── pinecone.ts        # Pinecone client & Inference API embedding helper
│   │   └── gemini.ts          # Google GenAI Gemini 2.5 Flash client setup
│   ├── graph/
│   │   ├── annotation.ts      # LangGraph GraphAnnotation state definition
│   │   └── workflow.ts        # StateGraph compilation & HITL breakpoints
│   ├── routes/
│   │   ├── chat.ts            # Chat query & PDF upload endpoints
│   │   └── inspect.ts         # HITL intermediate state review & parameter tweaks
│   └── utils/
│       └── pdfParser.ts       # Buffer-based PDF text extraction
├── .env.example               # Template for required API keys
├── package.json               # Backend dependencies
└── tsconfig.json              # TypeScript configuration
```

## 🔐 Key Technical Requirements

1. **Pinecone for Embeddings & Vector Storage ONLY**:
   - We strictly use **Pinecone Inference API** (`multilingual-e5-large` or Pinecone dense embedding model via `pc.inference.embed()`) using **only the Pinecone API Key**.
   - No separate Google GenAI embedding API keys or billing required for vectorization!
2. **Integrated Chatbox PDF Upload**:
   - Endpoints accept multipart/form-data or Base64 PDF attachments directly from the frontend chatbox.
   - Text is extracted, chunked, embedded via Pinecone, and stored in a serverless index with document metadata.
3. **Human-in-the-Loop (HITL) Inspection Mode**:
   - After Ingestion and Retrieval nodes, LangGraph pauses execution (`END` state mapped to inspection mode).
   - Allows students to examine raw chunk vectors, similarity scores, and adjust retrieval parameters ($k$, chunk size) before generation.

## 🚀 Getting Started

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
