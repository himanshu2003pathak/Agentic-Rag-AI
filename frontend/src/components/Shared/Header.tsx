import React from 'react';
import { Cpu, Database, Eye, ShieldAlert, Sparkles } from 'lucide-react';
import { StepStatus } from '../../types/rag';

interface HeaderProps {
  stepStatus: StepStatus;
  isInspectorOpen: boolean;
  onToggleInspector: () => void;
  documentName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  stepStatus,
  isInspectorOpen,
  onToggleInspector,
  documentName,
}) => {
  const isPaused =
    stepStatus === 'WAITING_FOR_INSPECTION_INGESTION' ||
    stepStatus === 'WAITING_FOR_INSPECTION_RETRIEVAL';

  return (
    <header
      className="glass-panel"
      style={{
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        borderBottom: '1px solid rgba(0, 242, 254, 0.2)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#080b11',
            boxShadow: '0 0 20px rgba(0, 242, 254, 0.4)',
          }}
        >
          <Sparkles size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.4rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="gradient-text">Agentic RAG</span> Workspace
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', margin: 0 }}>
            Pinecone Native Vectors &bull; Gemini 2.5 Flash &bull; LangGraph Multi-Agent
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <span className="badge badge-cyan">
          <Database size={14} /> Pinecone DB
        </span>
        <span className="badge badge-purple">
          <Cpu size={14} /> Gemini 2.5
        </span>

        {documentName && (
          <span
            className="badge badge-green"
            style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            PDF: {documentName}
          </span>
        )}

        {isPaused && (
          <span className="badge badge-yellow shimmer" style={{ padding: '6px 12px' }}>
            <ShieldAlert size={14} /> HITL Paused
          </span>
        )}

        <button
          onClick={onToggleInspector}
          className="btn-secondary"
          style={{
            background: isInspectorOpen ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            borderColor: isInspectorOpen ? 'var(--accent-cyan)' : 'var(--border-glass)',
          }}
        >
          <Eye size={18} />
          {isInspectorOpen ? 'Close Inspector' : 'HITL Inspector'}
          {isPaused && (
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--warning)',
                boxShadow: '0 0 10px var(--warning)',
              }}
            />
          )}
        </button>
      </div>
    </header>
  );
};
