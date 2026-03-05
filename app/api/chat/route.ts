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

function getChartSubject(chartContext: any): string {
  if (chartContext?.mode === 'couple') {
    const person1 = chartContext?.signals?.person1?.name || 'Person 1';
    const person2 = chartContext?.signals?.person2?.name || 'Person 2';
    return `${person1} and ${person2}`;
  }

  return chartContext?.signals?.name || 'user';
}

export async function POST(request: NextRequest) {
  try {
    const clientRequest = await request.json();
    const { question, chartContext, lang, history } = clientRequest;

    if (!chartContext?.signals || !chartContext?.archetypes) {
      return NextResponse.json(
        {
          error: 'Invalid chat context',
          answer: '❌ Your chart context is missing. Please recalculate your chart and try again.',
        },
        { status: 400 }
      );
    }

    const isHindi = lang === 'hi';

    const systemInstruction = `You are a direct Lo Shu numerology and Feng Shui analyst. ${
      isHindi
        ? 'Answer in Hindi (Devanagari). Mystical but clear.'
        : 'Answer in English.'
    }

The chart has already been analyzed and personality archetypes have been synthesized.

Answer follow-up questions using the archetypes as the main framework and the supporting signals as evidence.
Be specific about numbers, directions, elements, personal year themes, compatibility, and feng shui alerts.
Never invent chart data or contradict the provided archetypes.
Max 130 words.`;

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: systemInstruction,
      }
    ];

    // Only send full context on FIRST message (when history is empty)
    if (!history || history.length === 0) {
      messages.push({
        role: 'user',
        content: `ARCHETYPES:\n${JSON.stringify(chartContext.archetypes)}\n\nSUPPORTING SIGNALS:\n${JSON.stringify(chartContext.signals)}`,
      });
    } else {
      // Subsequent messages: lightweight reminder
      messages.push({
        role: 'user',
        content: `[Referring to previously provided archetypes and interpretation signals for ${getChartSubject(chartContext)}]`,
      });
    }

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
