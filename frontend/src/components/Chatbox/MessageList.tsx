import React, { useState } from 'react';
import { Message } from '../../types/rag';
import { User, Sparkles, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  const [expandedChunks, setExpandedChunks] = useState<{ [msgId: string]: boolean }>({});

  const toggleChunks = (msgId: string) => {
    setExpandedChunks((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  if (messages.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '40px 20px',
          color: 'var(--text-sub)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'rgba(0, 242, 254, 0.1)',
            border: '1px solid rgba(0, 242, 254, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            color: 'var(--accent-cyan)',
          }}
        >
          <Sparkles size={32} />
        </div>
        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '8px' }}>
          Welcome to the Educational RAG Workspace
        </h3>
        <p style={{ maxWidth: '420px', fontSize: '0.9rem', lineHeight: '1.5' }}>
          Drag and drop your PDF document below to begin Ingestion. Once vectorized in Pinecone, ask queries to see Gemini 2.5 Flash synthesize grounded answers in real-time.
        </p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {messages.map((msg) => {
        const isUser = msg.sender === 'user';
        const isSystem = msg.sender === 'system';
        const isExpanded = !!expandedChunks[msg.id];

        if (isSystem) {
          return (
            <div
              key={msg.id}
              style={{
                alignSelf: 'center',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px dashed rgba(255, 255, 255, 0.15)',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                color: 'var(--text-sub)',
              }}
            >
              ℹ️ {msg.content}
            </div>
          );
        }

        return (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              gap: '12px',
              alignSelf: isUser ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
            }}
          >
            {!isUser && (
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'var(--accent-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#080b11',
                  flexShrink: 0,
                }}
              >
                <Sparkles size={18} />
              </div>
            )}

            <div
              className={isUser ? '' : 'glass-panel'}
              style={{
                padding: '16px',
                borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: isUser ? 'var(--accent-gradient)' : 'var(--bg-card)',
                color: isUser ? '#080b11' : 'var(--text-main)',
                fontWeight: isUser ? 500 : 400,
                boxShadow: isUser ? '0 4px 15px rgba(0, 242, 254, 0.2)' : '0 8px 24px rgba(0,0,0,0.2)',
                lineHeight: '1.6',
                fontSize: '0.95rem',
                whiteSpace: 'pre-wrap',
              }}
            >
              <div>{msg.content}</div>

              {/* Citations Toggle */}
              {!isUser && msg.retrievedChunks && msg.retrievedChunks.length > 0 && (
                <div style={{ marginTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '10px' }}>
                  <button
                    onClick={() => toggleChunks(msg.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-cyan)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: 0,
                    }}
                  >
                    <BookOpen size={14} />
                    <span>{isExpanded ? 'Hide' : 'View'} Retrieved Pinecone Citations ({msg.retrievedChunks.length})</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {isExpanded && (
                    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {msg.retrievedChunks.map((chunk, idx) => (
                        <div
                          key={chunk.id}
                          style={{
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(0, 242, 254, 0.2)',
                            borderRadius: '8px',
                            padding: '10px',
                            fontSize: '0.8rem',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                            <span>Citation [{idx + 1}]</span>
                            <span>Cosine Score: {chunk.score}</span>
                          </div>
                          <div style={{ color: 'var(--text-sub)', fontStyle: 'italic', maxHeight: '100px', overflowY: 'auto' }}>
                            "{chunk.text}"
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {isUser && (
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-main)',
                  flexShrink: 0,
                }}
              >
                <User size={18} />
              </div>
            )}
          </div>
        );
      })}

      {isLoading && (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#080b11',
            }}
          >
            <Sparkles size={18} className="animate-pulse" />
          </div>
          <div className="glass-panel shimmer" style={{ padding: '12px 20px', borderRadius: '16px', fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
            🤖 Agent working: Consulting Pinecone Vector DB & Gemini 2.5 Flash...
          </div>
        </div>
      )}
    </div>
  );
};
