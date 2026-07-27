import React, { useState } from 'react';
import { GraphState, RetrievalParams } from '../../types/rag';
import { ChunkViewer } from './ChunkViewer';
import { ParamSlider } from './ParamSlider';
import { Eye, Play, RotateCcw, ShieldCheck, Sparkles, Target } from 'lucide-react';

interface HitlPanelProps {
  graphState: GraphState;
  onResumeWorkflow: (updatedParams?: RetrievalParams, action?: 'continue' | 're_retrieve') => void;
  isLoading: boolean;
}

export const HitlPanel: React.FC<HitlPanelProps> = ({
  graphState,
  onResumeWorkflow,
  isLoading,
}) => {
  const [params, setParams] = useState<RetrievalParams>(
    graphState.retrievalParams || { topK: 4, similarityThreshold: 0.65 }
  );

  const isIngestionPaused = graphState.stepStatus === 'WAITING_FOR_INSPECTION_INGESTION';
  const isRetrievalPaused = graphState.stepStatus === 'WAITING_FOR_INSPECTION_RETRIEVAL';
  const isPaused = isIngestionPaused || isRetrievalPaused;

  const handleParamsChange = (topK: number, similarityThreshold: number) => {
    setParams({ topK, similarityThreshold });
  };

  return (
    <aside
      className="glass-panel"
      style={{
        height: 'calc(100vh - 120px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderLeft: '1px solid rgba(0, 242, 254, 0.3)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '18px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: isPaused ? 'rgba(245, 158, 11, 0.1)' : 'rgba(0, 242, 254, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Eye size={22} color={isPaused ? 'var(--warning)' : 'var(--accent-cyan)'} />
          <div>
            <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>
              {isPaused ? 'HITL Inspection Breakpoint' : 'RAG Observability Panel'}
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-sub)', margin: 0 }}>
              {isIngestionPaused && 'LangGraph Paused at Ingestion Node'}
              {isRetrievalPaused && 'LangGraph Paused at Retrieval Node'}
              {!isPaused && 'Real-time state & vector inspection'}
            </p>
          </div>
        </div>
        {isPaused && (
          <span className="badge badge-yellow" style={{ fontSize: '0.65rem' }}>
            PAUSED
          </span>
        )}
      </div>

      {/* Body Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Ingestion Inspection Mode */}
        {isIngestionPaused && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '14px',
                borderRadius: '12px',
                fontSize: '0.85rem',
                lineHeight: '1.5',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--success)', marginBottom: '4px' }}>
                <ShieldCheck size={16} /> Ingestion & Vectorization Complete!
              </div>
              Your document was split into <b>{graphState.chunks.length} semantic chunks</b>. Each chunk has been embedded via Pinecone Native E5 (1024-D) and upserted into the vector index. You can inspect the chunks and vector arrays below.
            </div>

            <button
              onClick={() => onResumeWorkflow(undefined, 'continue')}
              disabled={isLoading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
            >
              <Play size={18} />
              <span>Acknowledge & Ready for Queries</span>
            </button>
          </div>
        )}

        {/* Retrieval Inspection Mode */}
        {isRetrievalPaused && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                padding: '14px',
                borderRadius: '12px',
                fontSize: '0.85rem',
                lineHeight: '1.5',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--warning)', marginBottom: '4px' }}>
                <Target size={16} /> Cosine Similarity Search Complete!
              </div>
              Pinecone retrieved <b>{graphState.retrievedContext.length} chunks</b> matching your query. Review similarity scores or adjust retrieval parameters below before sending context to Gemini 2.5 Flash.
            </div>

            {/* Retrieved Chunks Display */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#c48bf5' }}>
                Retrieved Chunks & Cosine Scores:
              </span>
              {graphState.retrievedContext.map((item, idx) => {
                const scorePercent = Math.min(100, Math.max(0, item.score * 100));
                const scoreColor = item.score >= 0.75 ? 'var(--success)' : item.score >= 0.6 ? 'var(--accent-cyan)' : 'var(--warning)';

                return (
                  <div
                    key={item.id}
                    style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      padding: '12px',
                      fontSize: '0.8rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Rank #{idx + 1}</span>
                      <span style={{ fontFamily: 'var(--font-code)', fontWeight: 600, color: scoreColor }}>
                        Score: {item.score}
                      </span>
                    </div>

                    {/* Animated Score Bar */}
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
                      <div
                        style={{
                          width: `${scorePercent}%`,
                          height: '100%',
                          background: scoreColor,
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </div>

                    <div style={{ color: 'var(--text-sub)', fontStyle: 'italic', maxHeight: '80px', overflowY: 'auto', lineHeight: '1.4' }}>
                      "{item.text}"
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Interactive Param Sliders */}
            <ParamSlider
              topK={params.topK}
              similarityThreshold={params.similarityThreshold}
              onChange={handleParamsChange}
              disabled={isLoading}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => onResumeWorkflow(params, 're_retrieve')}
                disabled={isLoading}
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center', padding: '12px', fontSize: '0.8rem' }}
              >
                <RotateCcw size={16} />
                <span>Re-run Retrieval</span>
              </button>

              <button
                onClick={() => onResumeWorkflow(params, 'continue')}
                disabled={isLoading}
                className="btn-primary"
                style={{ flex: 1.5, justifyContent: 'center', padding: '12px', fontSize: '0.85rem' }}
              >
                <Sparkles size={16} />
                <span>Synthesize Answer (Gemini 2.5)</span>
              </button>
            </div>
          </div>
        )}

        {/* Default View when Not Paused */}
        {!isPaused && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ParamSlider
              topK={params.topK}
              similarityThreshold={params.similarityThreshold}
              onChange={handleParamsChange}
              disabled={isLoading}
            />

            <ChunkViewer chunks={graphState.chunks} embeddings={graphState.embeddings} />
          </div>
        )}

        {/* Always display chunks at the bottom if in inspection mode */}
        {isPaused && (
          <div style={{ marginTop: '10px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <ChunkViewer chunks={graphState.chunks} embeddings={graphState.embeddings} />
          </div>
        )}
      </div>
    </aside>
  );
};
