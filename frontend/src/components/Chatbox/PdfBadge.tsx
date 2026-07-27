import React from 'react';
import { FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { StepStatus } from '../../types/rag';

interface PdfBadgeProps {
  documentName: string;
  stepStatus: StepStatus;
  chunkCount: number;
}

export const PdfBadge: React.FC<PdfBadgeProps> = ({ documentName, stepStatus, chunkCount }) => {
  if (!documentName) return null;

  let statusText = 'Ready for Queries';
  let icon = <CheckCircle2 size={16} color="var(--success)" />;
  let borderStyle = '1px solid rgba(16, 185, 129, 0.3)';

  if (stepStatus === 'INGESTING') {
    statusText = 'Extracting & Vectorizing...';
    icon = <Loader2 size={16} className="animate-spin" color="var(--accent-cyan)" />;
    borderStyle = '1px solid rgba(0, 242, 254, 0.4)';
  } else if (stepStatus === 'WAITING_FOR_INSPECTION_INGESTION') {
    statusText = 'Ingestion Paused (HITL Review)';
    icon = <AlertCircle size={16} color="var(--warning)" />;
    borderStyle = '1px solid rgba(245, 158, 11, 0.4)';
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 14px',
        background: 'rgba(15, 21, 35, 0.8)',
        borderRadius: '12px',
        border: borderStyle,
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        marginBottom: '12px',
      }}
    >
      <div
        style={{
          padding: '6px',
          background: 'rgba(0, 242, 254, 0.1)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <FileText size={18} color="var(--accent-cyan)" />
      </div>
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
          {documentName}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {icon}
          <span>{statusText}</span>
          {chunkCount > 0 && <span style={{ opacity: 0.7 }}>({chunkCount} chunks in Pinecone)</span>}
        </div>
      </div>
    </div>
  );
};
