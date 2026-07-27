import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey && process.env.NODE_ENV !== 'test') {
  console.warn('⚠️ GEMINI_API_KEY is missing in environment variables.');
}

/**
 * We strictly utilize Gemini 2.5 Flash for high-speed, cost-effective reasoning
 * and grounded answer synthesis in our generation agent.
 */
export const getGeminiModel = (temperature = 0.2) => {
  return new ChatGoogleGenerativeAI({
    modelName: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    apiKey: apiKey || 'dummy-gemini-key',
    temperature,
    maxOutputTokens: 2048,
  });
};
