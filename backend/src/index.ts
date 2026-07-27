import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRouter from './routes/chat';
import inspectRouter from './routes/inspect';
import { ensureIndexExists } from './config/pinecone';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/rag', chatRouter);
app.use('/api/rag', inspectRouter);

// Health Check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Educational RAG Backend Service',
    embeddings: 'Pinecone Native Inference API',
    llm: 'Gemini 2.5 Flash',
  });
});

// Start Server & Ensure Pinecone Index Exists
app.listen(PORT, async () => {
  console.log(`\n=============================================================`);
  console.log(`🚀 [Backend] Server listening on port ${PORT}`);
  console.log(`📡 [API] Endpoints mounted at http://localhost:${PORT}/api/rag`);
  console.log(`=============================================================\n`);

  if (process.env.PINECONE_API_KEY && process.env.PINECONE_API_KEY !== 'your_pinecone_api_key_here') {
    try {
      await ensureIndexExists();
    } catch (err) {
      console.warn('⚠️ Could not verify Pinecone index at startup. Please check PINECONE_API_KEY.');
    }
  } else {
    console.warn('⚠️ PINECONE_API_KEY is not configured in .env. Please add your key to enable embeddings.');
  }
});

export default app;
