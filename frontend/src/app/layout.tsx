import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Educational Agentic RAG Workspace | Pinecone & Gemini 2.5 Flash',
  description: 'An AI-powered educational platform designed to teach developers and students how to build and understand a RAG model from scratch with multi-agent LangGraph orchestration and Pinecone native embeddings.',
  keywords: ['RAG', 'LangGraph', 'Pinecone', 'Gemini 2.5 Flash', 'AI Education', 'Multi-Agent', 'HITL'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>{children}</body>
    </html>
  );
}
