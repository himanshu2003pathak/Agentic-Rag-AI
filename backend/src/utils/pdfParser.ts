import pdfParse from 'pdf-parse';

export interface TextChunk {
  id: string;
  text: string;
  metadata: {
    chunkIndex: number;
    wordCount: number;
    charCount: number;
  };
}

/**
 * Extracts raw text content from an uploaded PDF file buffer.
 */
export async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    // Clean redundant whitespace and normalize line breaks
    return data.text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  } catch (error) {
    console.error('❌ Failed to parse PDF buffer:', error);
    throw new Error('Could not extract text from the provided PDF file.');
  }
}

/**
 * Splits text into semantic chunks with specified size and overlap.
 * Designed for educational observability so students can see chunk boundaries.
 */
export function splitTextIntoChunks(
  text: string,
  chunkSize = 800,
  chunkOverlap = 150
): TextChunk[] {
  if (!text) return [];

  const chunks: TextChunk[] = [];
  const paragraphs = text.split(/\n\s*\n/);
  
  let currentChunkText = '';
  let chunkIndex = 0;

  for (const para of paragraphs) {
    const cleanedPara = para.trim();
    if (!cleanedPara) continue;

    if ((currentChunkText + '\n\n' + cleanedPara).length <= chunkSize) {
      currentChunkText = currentChunkText ? `${currentChunkText}\n\n${cleanedPara}` : cleanedPara;
    } else {
      if (currentChunkText) {
        chunks.push(createChunkObject(currentChunkText, chunkIndex++));
        // Keep overlap from end of currentChunkText
        const words = currentChunkText.split(' ');
        const overlapWordsCount = Math.floor(chunkOverlap / 6);
        const overlapText = words.slice(-overlapWordsCount).join(' ');
        currentChunkText = `${overlapText}\n\n${cleanedPara}`;
      } else {
        // Single paragraph exceeds chunkSize, split by sentences or hard length
        let remaining = cleanedPara;
        while (remaining.length > chunkSize) {
          const slice = remaining.slice(0, chunkSize);
          const lastSpace = slice.lastIndexOf(' ');
          const splitPoint = lastSpace > chunkSize * 0.5 ? lastSpace : chunkSize;
          const subChunk = remaining.slice(0, splitPoint).trim();
          if (subChunk) {
            chunks.push(createChunkObject(subChunk, chunkIndex++));
          }
          remaining = remaining.slice(Math.max(0, splitPoint - chunkOverlap)).trim();
        }
        currentChunkText = remaining;
      }
    }
  }

  if (currentChunkText.trim()) {
    chunks.push(createChunkObject(currentChunkText.trim(), chunkIndex++));
  }

  return chunks;
}

function createChunkObject(text: string, index: number): TextChunk {
  return {
    id: `chunk-${index}-${Date.now().toString(36)}`,
    text,
    metadata: {
      chunkIndex: index,
      wordCount: text.split(/\s+/).filter(Boolean).length,
      charCount: text.length,
    },
  };
}
