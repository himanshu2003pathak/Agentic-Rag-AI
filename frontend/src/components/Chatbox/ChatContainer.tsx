import React from 'react';
import { Message, GraphState } from '../../types/rag';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { PdfBadge } from './PdfBadge';

interface ChatContainerProps {
  messages: Message[];
  isLoading: boolean;
  graphState: GraphState;
  onSendMessage: (text: string) => void;
  onFileUpload: (file: File) => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  isLoading,
  graphState,
  onSendMessage,
  onFileUpload,
}) => {
  const isPaused =
    graphState.stepStatus === 'WAITING_FOR_INSPECTION_INGESTION' ||
    graphState.stepStatus === 'WAITING_FOR_INSPECTION_RETRIEVAL';

  return (
    <main
      className="glass-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 120px)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Top Banner indicating PDF status */}
      <div style={{ padding: '16px 20px 0 20px' }}>
        <PdfBadge
          documentName={graphState.documentName}
          stepStatus={graphState.stepStatus}
          chunkCount={graphState.chunks.length}
        />
      </div>

      {/* Chat Messages */}
      <MessageList messages={messages} isLoading={isLoading} />

      {/* Input Area */}
      <div style={{ padding: '16px 20px', background: 'rgba(11, 15, 25, 0.5)', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <ChatInput
          onSendMessage={onSendMessage}
          onFileUpload={onFileUpload}
          disabled={isLoading || isPaused}
          hasDocument={!!graphState.documentId && graphState.chunks.length > 0}
        />
      </div>
    </main>
  );
};
