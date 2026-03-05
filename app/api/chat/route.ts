import { NextRequest, NextResponse } from 'next/server';
import { generateWithFallback } from '@/lib/groq-client';

const MAX_RETRIES = 2;

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES) {
        const delay = 500 * attempt; // 500ms, then 1000ms
        console.warn(`${label} attempt ${attempt} failed — retrying in ${delay}ms`, err);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

export async function POST(request: NextRequest) {
  try {
    const clientRequest = await request.json();
    const { question, chartContext, lang, history } = clientRequest;

    const isHindi = lang === 'hi';

    const systemInstruction = `You are a direct Feng Shui and Lo Shu numerology analyst. ${
      isHindi
        ? 'Answer in Hindi (Devanagari). Mystical but clear.'
        : 'Answer in English.'
    } Answer specifically using their actual numbers, directions, elements, and flying star data. Never be generic. Max 130 words.`;

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: systemInstruction,
      },
      {
        role: 'user',
        content: `Chart Context:\n${JSON.stringify(chartContext, null, 2)}`,
      },
    ];

    // Add conversation history
    if (history && history.length > 0) {
      history.forEach((msg: any) => {
        messages.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content,
        });
      });
    }

    // Add current question
    messages.push({
      role: 'user',
      content: question,
    });

    const answer = await withRetry(
      () => generateWithFallback(messages, {
        temperature: 1,
        maxTokens: 512,
      }),
      'chat'
    );

    if (!answer || answer.trim() === '') {
      throw new Error('Empty response from AI');
    }

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Chat error:', error);

    const errorMessage = (error as Error).message;

    // User-friendly error messages
    if (errorMessage.includes('Rate limit') || errorMessage.includes('high demand')) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: errorMessage,
          answer: '⏳ Our AI is currently experiencing high demand. Please wait a moment and ask your question again.',
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: errorMessage,
        answer: '❌ Something went wrong. Please try asking your question again.',
      },
      { status: 500 }
    );
  }
}
