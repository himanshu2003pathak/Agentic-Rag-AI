import React, { useState } from 'react';
import { TextChunk } from '../../types/rag';
import { Database, Code2, ChevronDown, ChevronRight, Hash } from 'lucide-react';

interface ChunkViewerProps {
  chunks: TextChunk[];
  embeddings: number[][];
}

export const ChunkViewer: React.FC<ChunkViewerProps> = ({ chunks, embeddings }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0);

  if (chunks.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-sub)', fontSize: '0.9rem' }}>
        No document chunks available yet. Upload a PDF in the chatbox to inspect Ingestion & Pinecone E5 vectors.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Database size={16} /> Pinecone Ingested Chunks ({chunks.length})
        </span>
        <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
          1024-D Vectors
        </span>
      </div>

      <div style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
        {chunks.map((chunk, idx) => {
          const isSelected = selectedIndex === idx;
          const vector = embeddings[idx] || [];
          const vectorPreview = vector.slice(0, 8).map((val) => val.toFixed(4)).join(', ');

          return (
            <div
              key={chunk.id}
              style={{
                background: isSelected ? 'rgba(0, 242, 254, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.08)'}`,
                borderRadius: '12px',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onClick={() => setSelectedIndex(isSelected ? null : idx)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.85rem' }}>
                  {isSelected ? <ChevronDown size={16} color="var(--accent-cyan)" /> : <ChevronRight size={16} />}
                  <span>Chunk #{idx + 1}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                    <Hash size={12} style={{ display: 'inline' }} /> {chunk.metadata.wordCount} words
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', lineClamp: isSelected ? 'none' : 2, display: '-webkit-box', WebkitLineClamp: isSelected ? 'unset' : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>
                {chunk.text}
              </div>

              {isSelected && (
                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#c48bf5', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Code2 size={14} /> Pinecone Native Vector Embedding Array (1024 dimensions):
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-code)',
                      fontSize: '0.75rem',
                      background: 'rgba(0, 0, 0, 0.4)',
                      padding: '10px',
                      borderRadius: '8px',
                      color: 'var(--accent-cyan)',
                      overflowX: 'auto',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    [{vectorPreview}, ... ({vector.length - 8} more dimensions)]
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
