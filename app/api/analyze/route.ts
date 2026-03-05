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
    const { system, messages } = clientRequest;

    const isHindi = system.includes('Hindi') || system.includes('Devanagari');

    const systemInstruction = `You are a direct, psychologically sharp Feng Shui and Lo Shu numerology analyst. ${
      isHindi
        ? 'Respond entirely in Hindi (Devanagari script). Mystical but clear Hindi.'
        : 'Respond in English.'
    }`;

    const personData = JSON.parse(messages[0].content);
    const mode = personData.person2 ? 'relationship' : 'single';

    const analysisFormat = mode === 'single'
      ? `Analysis Format:
1. 🧠 Core Psychological Profile - personality from planes and number archetypes
2. ⚡ Blind Spots & Weaknesses - missing numbers as psychological gaps
3. 🔥 Innate Strengths - present arrows, Kua element, trigram energy
4. 🧭 Growth Directive - one sharp behavioral instruction
5. 📅 2026 Forecast - personal year theme, elemental modifier, Ba Zhai directions, flying star alerts`
      : `Analysis Format:
1. 🧠 Individual Essences - psychological type per person
2. 🔗 Core Alignment - elemental dynamic, shared lucky directions
3. ⚡ Primary Friction Areas - control dynamics, number gaps
4. 📅 Long-Term Outlook - natural momentum or constant work
5. 🛠 Behavioral Advice - 2-3 specific actions
6. 🔮 2026 Couples Forecast - both personal years, elemental modifiers`;

    const prompt = [
      systemInstruction,
      '',
      'Task: Analyze this Lo Shu numerology and Feng Shui chart.',
      '',
      'Person Data:',
      JSON.stringify(personData, null, 2),
      '',
      analysisFormat,
      '',
      'Rules: Use names. Honesty over comfort. 300-360 words total.',
    ].join('\n');

    // Define JSON Schema for structured output
    const responseSchema = {
      name: 'numerology_analysis',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          sections: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description: 'Section title with emoji (e.g., "🧠 Core Psychological Profile")',
                },
                body: {
                  type: 'string',
                  description: 'Analysis text for this section',
                },
              },
              required: ['title', 'body'],
              additionalProperties: false,
            },
            description: mode === 'single'
              ? 'Exactly 5 sections for single person analysis'
              : 'Exactly 6 sections for relationship analysis',
            minItems: mode === 'single' ? 5 : 6,
            maxItems: mode === 'single' ? 5 : 6,
          },
        },
        required: ['sections'],
        additionalProperties: false,
      },
    };

    const responseText = await withRetry(
      () => generateWithFallback(
        [{ role: 'user', content: prompt }],
        {
          temperature: 1,
          maxTokens: 2048,
          responseFormat: {
            type: 'json_schema',
            json_schema: responseSchema,
          },
        }
      ),
      'analyze'
    );

    // Parse JSON response (structure is guaranteed by JSON Schema)
    let narrative;
    try {
      narrative = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      console.error('Response text:', responseText);

      return NextResponse.json(
        {
          error: 'AI response formatting error',
          message: 'The AI generated an invalid response. Please try again.',
          details: (parseError as Error).message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ narrative });
  } catch (error) {
    console.error('Analysis error:', error);

    const errorMessage = (error as Error).message;

    // User-friendly error messages
    if (errorMessage.includes('Rate limit') || errorMessage.includes('high demand')) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: errorMessage,
          userMessage: 'Our AI service is experiencing high demand. Please wait a moment and try again.',
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: errorMessage,
        userMessage: 'Something went wrong while analyzing your chart. Please try again.',
      },
      { status: 500 }
    );
  }
}
