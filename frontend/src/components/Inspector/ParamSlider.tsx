import React from 'react';
import { Sliders, Percent } from 'lucide-react';

interface ParamSliderProps {
  topK: number;
  similarityThreshold: number;
  onChange: (topK: number, similarityThreshold: number) => void;
  disabled?: boolean;
}

export const ParamSlider: React.FC<ParamSliderProps> = ({
  topK,
  similarityThreshold,
  onChange,
  disabled = false,
}) => {
  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--accent-cyan)' }}>
        <Sliders size={18} />
        <span>Pinecone Retrieval Parameters (Interactive HITL)</span>
      </div>

      {/* Top K Slider */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-sub)' }}>Top-K Retrieved Chunks ($k$)</span>
          <span style={{ fontWeight: 600, color: 'var(--text-main)', fontFamily: 'var(--font-code)' }}>{topK}</span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={topK}
          disabled={disabled}
          onChange={(e) => onChange(parseInt(e.target.value, 10), similarityThreshold)}
          style={{
            width: '100%',
            accentColor: 'var(--accent-cyan)',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          <span>1 (Fewer, Focused)</span>
          <span>10 (Broad Context)</span>
        </div>
      </div>

      {/* Similarity Threshold Slider */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Percent size={14} /> Cosine Similarity Threshold
          </span>
          <span style={{ fontWeight: 600, color: 'var(--text-main)', fontFamily: 'var(--font-code)' }}>
            {(similarityThreshold * 100).toFixed(0)}%
          </span>
        </div>
        <input
          type="range"
          min={0.1}
          max={0.95}
          step={0.05}
          value={similarityThreshold}
          disabled={disabled}
          onChange={(e) => onChange(topK, parseFloat(e.target.value))}
          style={{
            width: '100%',
            accentColor: '#c48bf5',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          <span>10% (Permissive)</span>
          <span>95% (Strict Match)</span>
        </div>
      </div>
    </div>
  );
};
