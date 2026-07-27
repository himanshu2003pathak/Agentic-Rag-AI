import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.PINECONE_API_KEY;
if (!apiKey && process.env.NODE_ENV !== 'test') {
  console.warn('⚠️ PINECONE_API_KEY is missing in environment variables.');
}

export const pinecone = new Pinecone({
  apiKey: apiKey || 'dummy-api-key',
});

export const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'educational-rag-index';
export const PINECONE_EMBEDDING_MODEL = process.env.PINECONE_EMBEDDING_MODEL || 'multilingual-e5-large';

/**
 * Ensures that the required Serverless Pinecone Index exists.
 * If not, it creates it with 1024 dimensions (compatible with multilingual-e5-large) and cosine similarity.
 */
export async function ensureIndexExists(): Promise<void> {
  try {
    const existingIndexes = await pinecone.listIndexes();
    const indexNames = existingIndexes.indexes?.map((idx) => idx.name) || [];

    if (!indexNames.includes(PINECONE_INDEX_NAME)) {
      console.log(`⏳ Creating Pinecone serverless index '${PINECONE_INDEX_NAME}'...`);
      await pinecone.createIndex({
        name: PINECONE_INDEX_NAME,
        dimension: 1024,
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: (process.env.PINECONE_CLOUD as 'aws' | 'gcp' | 'azure') || 'aws',
            region: process.env.PINECONE_REGION || 'us-east-1',
          },
        },
      });
      console.log(`✅ Index '${PINECONE_INDEX_NAME}' created successfully.`);
    } else {
      console.log(`✅ Pinecone index '${PINECONE_INDEX_NAME}' is ready.`);
    }
  } catch (error) {
    console.error('❌ Error verifying/creating Pinecone index:', error);
    throw error;
  }
}

/**
 * Generates vector embeddings strictly using Pinecone's Native Inference API.
 * No separate GenAI embedding keys or billing required!
 */
export async function generateEmbeddings(
  texts: string[],
  inputType: 'passage' | 'query' = 'passage'
): Promise<number[][]> {
  if (!texts || texts.length === 0) return [];

  try {
    // Call Pinecone Inference API
    const response = await pinecone.inference.embed(
      PINECONE_EMBEDDING_MODEL,
      texts,
      { inputType: inputType as any }
    );

    const embeddings: number[][] = [];
    if (response && response.data) {
      for (const item of response.data) {
        if (item.values) {
          embeddings.push(item.values);
        }
      }
    }
    return embeddings;
  } catch (error) {
    console.error(`❌ Error generating Pinecone embeddings (${inputType}):`, error);
    throw error;
  }
}
