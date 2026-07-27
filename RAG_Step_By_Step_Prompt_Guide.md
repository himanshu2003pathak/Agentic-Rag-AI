# 🚀 Step-by-Step AI Prompt Guide: Educational RAG Agentic Website

> [!NOTE]
> This guide provides a sequential, step-by-step set of prompts designed to build the **Educational RAG Agentic Website** from scratch using AI coding assistants (like Gemini, Cursor, Windsurf, or Claude). 
> It incorporates all custom architectural requirements: **Pinecone-only embedding models and vector DB** (single API key), **integrated chatbox PDF upload**, and a **decoupled backend/frontend directory structure**.

---

## 🏛️ Architecture & Custom Requirements Overview

Before executing the prompts, ensure your development environment understands the core architectural pillars:
1. **Decoupled Folder Structure**: Separate `backend/` (Node.js/TypeScript, LangGraph, Pinecone, Express/FastAPI) and `frontend/` (Next.js 16 App Router, React 19, Vanilla CSS, Framer Motion) folders.
2. **Pinecone Embedding Model & Vector DB ONLY**: No Google GenAI embedding keys or billing required. We strictly utilize **Pinecone's Native Inference API** (`pc.inference.embed` with models like `multilingual-e5-large`) along with Pinecone Serverless Vector Database using a **single Pinecone API Key**.
3. **Integrated Chatbox PDF Ingestion**: Users drag-and-drop or upload PDF files directly inside the chat interface. The file is streamed to the backend Ingestion Agent, chunked, vectorized via Pinecone, and stored, allowing subsequent chat queries to reference the uploaded document.
4. **Human-In-The-Loop (HITL) Educational Inspection**: LangGraph pauses at key breakpoints (after Ingestion and Retrieval), allowing students to inspect raw embeddings, similarity scores, and tweak parameters ($k$, chunk size) before resuming AI generation.

---

## 📋 Stage 1: Workspace Initialization & Directory Setup

Use these prompts to initialize the separate backend and frontend projects with clean configurations.

### 🔹 Prompt 1.1: Project Directory & Backend Initialization
```markdown
Create a modular project structure with two separate root folders: `backend` and `frontend`. 

In the `backend` folder:
1. Initialize a Node.js TypeScript project (`package.json`, `tsconfig.json`) configured for ES modules.
2. Install required core dependencies: `@langchain/langgraph`, `@langchain/google-genai`, `@pinecone-database/pinecone`, `express`, `cors`, `multer` (for PDF memory storage), `pdf-parse`, and `dotenv`.
3. Install development dependencies: `typescript`, `@types/node`, `@types/express`, `@types/cors`, `@types/multer`, `ts-node-dev`.
4. Create an `.env.example` file containing:
   - `PINECONE_API_KEY` (Used for BOTH embedding generation and vector DB storage)
   - `PINECONE_INDEX_NAME="educational-rag-index"`
   - `PINECONE_EMBEDDING_MODEL="multilingual-e5-large"`
   - `GEMINI_API_KEY` (Strictly for Gemini 2.5 Flash LLM generation)
   - `PORT=5000`
5. Create standard folder directories: `src/agents`, `src/config`, `src/graph`, `src/routes`, and `src/utils`.
```

### 🔹 Prompt 1.2: Frontend Next.js 16 Initialization
```markdown
In the `frontend` folder:
1. Initialize a Next.js 16 (App Router) TypeScript project with React 19.
2. Ensure Tailwind CSS is NOT installed or disabled—we will strictly use Vanilla CSS with custom properties (`globals.css`) for a premium, custom aesthetic.
3. Install animation and icon utilities: `framer-motion`, `lucide-react`, and `axios`.
4. Set up `.env.local` with `NEXT_PUBLIC_BACKEND_URL="http://localhost:5000/api/rag"`.
5. Create clean component directories: `src/components/Chatbox`, `src/components/Inspector`, `src/components/Shared`, and `src/services`.
```

---

## 🌲 Stage 2: Pinecone Embedding & Vector DB Integration

These prompts configure the backend to use Pinecone as a unified embedding and storage engine.

### 🔹 Prompt 2.1: Pinecone Client & Inference API Setup
```markdown
In `backend/src/config/pinecone.ts`, implement a robust Pinecone configuration service:
1. Initialize the `Pinecone` client using `process.env.PINECONE_API_KEY`.
2. Create a helper function `ensureIndexExists()` that checks if `PINECONE_INDEX_NAME` exists. If not, create a serverless index with dimension `1024` (matching `multilingual-e5-large`) and metric `cosine` on AWS `us-east-1`.
3. Create an embedding generation helper function `generateEmbeddings(texts: string[], inputType: 'passage' | 'query')` that uses Pinecone's native Inference API: `pc.inference.embed({ model: process.env.PINECONE_EMBEDDING_MODEL, inputs: texts, parameters: { input_type: inputType } })`.
4. Ensure robust error handling and type safety for vector arrays returned by Pinecone.
```

### 🔹 Prompt 2.2: PDF Extraction & Chunking Utility
```markdown
In `backend/src/utils/pdfParser.ts`, build a document processing utility:
1. Implement a function `extractTextFromPdfBuffer(buffer: Buffer)` using `pdf-parse` to clean and return raw text from uploaded PDFs.
2. Implement a semantic chunking function `splitTextIntoChunks(text: string, chunkSize = 1000, chunkOverlap = 200)` that intelligently splits text by paragraphs and sentences while preserving metadata (page numbers, chunk index, word count).
```

---

## 🤖 Stage 3: LangGraph Multi-Agent RAG Orchestration

These prompts construct the educational LangGraph workflow with deterministic routing and HITL breakpoints.

### 🔹 Prompt 3.1: State Graph Schema Definition
```markdown
In `backend/src/graph/annotation.ts`, define the shared LangGraph state using `Annotation.Root`:
1. `documentId`: string (ID of the uploaded PDF)
2. `documentName`: string
3. `rawText`: string
4. `chunks`: Array<{ id: string; text: string; metadata: any }>
5. `embeddings`: Array<number[]> (stored for educational visualization)
6. `userQuery`: string
7. `retrievedContext`: Array<{ id: string; text: string; score: number }>
8. `generationPrompt`: string (the compiled prompt sent to Gemini)
9. `finalAnswer`: string
10. `stepStatus`: 'IDLE' | 'INGESTING' | 'WAITING_FOR_INSPECTION_INGESTION' | 'RETRIEVING' | 'WAITING_FOR_INSPECTION_RETRIEVAL' | 'GENERATING' | 'COMPLETED'
11. `retrievalParams`: { topK: number; similarityThreshold: number }
```

### 🔹 Prompt 3.2: Deterministic Supervisor Agent
```markdown
In `backend/src/agents/supervisor.ts`, implement the `supervisorAgent` routing function:
1. Do NOT make any LLM calls in this router to save API quotas and ensure predictable educational workflows.
2. Inspect `state.stepStatus` and state properties:
   - If `state.documentId` exists but `state.chunks` is empty -> route to `"ingestionAgent"`.
   - If `state.stepStatus === 'WAITING_FOR_INSPECTION_INGESTION'` -> route to `END` (HITL pause).
   - If `state.userQuery` exists and `state.retrievedContext` is empty -> route to `"retrievalAgent"`.
   - If `state.stepStatus === 'WAITING_FOR_INSPECTION_RETRIEVAL'` -> route to `END` (HITL pause).
   - If `state.retrievedContext` is populated and not paused -> route to `"generationAgent"`.
   - Once generation is complete -> route to `END`.
```

### 🔹 Prompt 3.3: Ingestion Agent (Pinecone Embed & Store)
```markdown
In `backend/src/agents/ingestion.ts`, implement the `ingestionAgent` node:
1. Take `state.rawText` and call `splitTextIntoChunks()`.
2. Extract text strings and pass them to our Pinecone helper: `generateEmbeddings(texts, 'passage')`.
3. Map vectors with chunk text metadata and upsert them into the Pinecone Serverless index under a namespace matching `state.documentId`.
4. Update state: store `chunks` and `embeddings`, and set `stepStatus` to `'WAITING_FOR_INSPECTION_INGESTION'`.
```

### 🔹 Prompt 3.4: Retrieval & Generation Agents
```markdown
In `backend/src/agents/retrieval.ts` and `backend/src/agents/generation.ts`:
1. **Retrieval Agent**:
   - Embed `state.userQuery` using Pinecone native embedding: `generateEmbeddings([query], 'query')`.
   - Query Pinecone vector index using the generated vector, topK from `state.retrievalParams.topK`, and namespace `state.documentId`.
   - Filter results by similarity score and format into `retrievedContext`.
   - Set `stepStatus` to `'WAITING_FOR_INSPECTION_RETRIEVAL'`.
2. **Generation Agent**:
   - Initialize `@langchain/google-genai` with model `"gemini-2.5-flash"`.
   - Construct an educational system prompt combining `state.userQuery` and formatted `state.retrievedContext`.
   - Execute exactly 1 LLM generation call to synthesize a grounded answer.
   - Update `state.finalAnswer` and set `stepStatus` to `'COMPLETED'`.
```

---

## 🔌 Stage 4: Backend API & HITL Inspection Routes

These prompts expose Express/FastAPI endpoints to communicate with the frontend chatbox and inspector.

### 🔹 Prompt 4.1: Chat & PDF Upload Endpoints
```markdown
In `backend/src/routes/chat.ts`, create Express endpoints with Multer memory storage:
1. `POST /api/rag/upload`: Accepts a PDF file via multipart/form-data. Extracts text using `pdfParser`, initializes LangGraph state with `documentName` and `rawText`, runs the graph until the first HITL breakpoint (`WAITING_FOR_INSPECTION_INGESTION`), and returns the intermediate state to the frontend.
2. `POST /api/rag/query`: Accepts `{ documentId, query, retrievalParams }`. Updates graph state with `userQuery` and executes routing until `WAITING_FOR_INSPECTION_RETRIEVAL`, returning the retrieved chunks and scores for student inspection.
```

### 🔹 Prompt 4.2: HITL Inspection & Resume Endpoints
```markdown
In `backend/src/routes/inspect.ts`, create endpoints for educational interactivity:
1. `GET /api/rag/state/:documentId`: Retrieves the current LangGraph state snapshot from memory/db.
2. `POST /api/rag/resume`: Accepts `{ documentId, updatedParams }`. Allows students to modify `topK` or edit chunk text, updates state, and resumes LangGraph execution to complete Gemini 2.5 Flash response synthesis.
```

---

## 🎨 Stage 5: Premium Frontend UI & Integrated Chatbox

These prompts build the WOW-factor frontend interface using Vanilla CSS and dynamic animations.

### 🔹 Prompt 5.1: Design System & Vanilla CSS (`globals.css`)
```markdown
In `frontend/src/app/globals.css`, build a state-of-the-art design system:
1. Define CSS custom properties for a curated dark mode palette: deep obsidian background (`#0b0f19`), sleek slate panels (`#131a2a`), vibrant electric cyan (`#00f2fe`), and neon purple (`#4facfe`) gradients.
2. Import Google Fonts: `Outfit` for headings and `Inter` for body text and code chunks.
3. Create utility classes for glassmorphism (`backdrop-filter: blur(16px)`, subtle glowing borders, subtle box-shadows).
4. Build custom scrollbars, shimmer loading animations, and responsive CSS grid layouts without any Tailwind dependencies.
```

### 🔹 Prompt 5.2: Integrated Chatbox with PDF Upload Attachment
```markdown
In `frontend/src/components/Chatbox/ChatInput.tsx` and `ChatContainer.tsx`:
1. Build an interactive chat input box that includes a prominent **"Attach PDF" / Drag-and-Drop Dropzone** directly inside or above the text input bar.
2. When a user drags a PDF over the chatbox, highlight the input area with a glowing border animation (using Framer Motion).
3. Upon file drop or selection, immediately display an uploading pill badge (`PdfBadge.tsx`) showing file name, file size, and real-time processing status ("Extracting Text..." -> "Embedding with Pinecone..." -> "Ready for Queries").
4. Render chat messages in clean, glassmorphic bubbles with markdown formatting and code highlighting.
```

### 🔹 Prompt 5.3: Educational HITL Inspector Drawer
```markdown
In `frontend/src/components/Inspector/HitlPanel.tsx`:
1. Create a slide-over glassmorphic drawer that automatically opens when the backend reports `stepStatus` as waiting for inspection.
2. **Ingestion View**: Visualize the text chunks in interactive accordions. Display a preview of the Pinecone 1024-dimensional vector embedding array (showing the first 10 floating-point numbers with a "View Full Vector" modal).
3. **Retrieval View**: Display the top-$k$ retrieved chunks with cosine similarity score bars (colored green for high similarity, yellow for medium).
4. **Interactive Controls**: Include sliders for `Top-K Results` (1 to 10) and `Similarity Threshold`. Provide a glowing **"Resume Pipeline & Generate Answer"** button that calls `/api/rag/resume` and streams the Gemini response back into the chatbox.
```

---

## 🧪 Stage 6: End-to-End Verification Prompts

Use these final prompts to test and validate the complete RAG lifecycle.

### 🔹 Prompt 6.1: Full Pipeline Verification
```markdown
Test the end-to-end integration by performing the following automated verification flow:
1. Start both backend (`npm run dev` on port 5000) and frontend (`npm run dev` on port 3000).
2. Simulate dragging a sample educational PDF (e.g., a machine learning lecture note) into the chatbox dropzone.
3. Verify that the backend calls `pc.inference.embed` using ONLY the Pinecone API key and successfully upserts vectors into the serverless index.
4. Verify that the UI opens the HITL Inspector drawer displaying chunks and vector arrays.
5. Submit a user query in the chatbox, inspect the retrieved similarity scores, click "Resume Pipeline", and confirm that Gemini 2.5 Flash renders an accurate, cited answer in the chat history.
```
