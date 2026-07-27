import React, { useState, useRef } from 'react';
import { Send, Paperclip, UploadCloud } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onFileUpload: (file: File) => void;
  disabled: boolean;
  hasDocument: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onFileUpload,
  disabled,
  hasDocument,
}) => {
  const [text, setText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSendMessage(text);
    setText('');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        onFileUpload(file);
      } else {
        alert('Please drop a valid PDF file.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onFileUpload(file);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`glass-panel ${isDragging ? 'dropzone-active' : ''}`}
      style={{
        padding: '16px',
        position: 'relative',
        transition: 'all 0.3s ease',
        border: isDragging ? '2px dashed var(--accent-cyan)' : '1px solid var(--border-glass)',
      }}
    >
      {/* Drag overlay prompt */}
      {isDragging && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(8, 11, 17, 0.9)',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            color: 'var(--accent-cyan)',
            gap: '8px',
          }}
        >
          <UploadCloud size={36} className="animate-bounce" />
          <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Drop PDF to Ingest & Vectorize</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,application/pdf"
          style={{ display: 'none' }}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Attach PDF Document"
          className="btn-secondary"
          style={{
            padding: '12px',
            borderRadius: '12px',
            background: hasDocument ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            borderColor: hasDocument ? 'var(--accent-cyan)' : 'var(--border-glass)',
            color: hasDocument ? 'var(--accent-cyan)' : 'var(--text-sub)',
          }}
        >
          <Paperclip size={20} />
        </button>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            hasDocument
              ? 'Ask a question about your uploaded PDF...'
              : 'Attach or drag & drop a PDF document first to enable RAG chat...'
          }
          disabled={disabled || !hasDocument}
          style={{
            flex: 1,
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '14px 18px',
            color: 'var(--text-main)',
            fontSize: '0.95rem',
            fontFamily: 'var(--font-body)',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--accent-cyan)')}
          onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
        />

        <button
          type="submit"
          disabled={disabled || !hasDocument || !text.trim()}
          className="btn-primary"
          style={{ padding: '12px 20px', borderRadius: '12px' }}
        >
          <span>Send</span>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};
