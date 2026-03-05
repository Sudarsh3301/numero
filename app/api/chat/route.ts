import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

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

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

    const systemInstruction = `You are a direct Feng Shui and Lo Shu numerology analyst. ${
      isHindi
        ? 'Answer in Hindi (Devanagari). Mystical but clear.'
        : 'Answer in English.'
    } Answer specifically using their actual numbers, directions, elements, and flying star data. Never be generic. Max 130 words.`;

    const promptParts = [
      systemInstruction,
      '',
      'Chart Context:',
      JSON.stringify(chartContext, null, 2),
      '',
    ];

    if (history && history.length > 0) {
      promptParts.push('Previous conversation:');
      history.forEach((msg: any) => {
        promptParts.push(`${msg.role === 'assistant' ? 'You' : 'User'}: ${msg.content}`);
      });
      promptParts.push('');
    }

    promptParts.push(`User question: ${question}`);

    const response = await withRetry(
      () => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        config: {
          thinkingConfig: { thinkingBudget: -1 },
          temperature:    1,
          topP:           0.95,
          safetySettings: SAFETY_SETTINGS,
        },
        contents: [{ role: 'user', parts: [{ text: promptParts.join('\n') }] }],
      }),
      'chat'
    );

    const answer      = response.text ?? '';
    const finishReason = response.candidates?.[0]?.finishReason;

    if (finishReason && finishReason !== 'STOP') {
      console.warn('Gemini chat generation incomplete:', { finishReason, answerLength: answer.length });
    }
    if (finishReason === 'SAFETY') {
      return NextResponse.json(
        { error: 'Content filtered by AI safety systems', details: { finishReason } },
        { status: 400 }
      );
    }

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: (error as Error).message },
      { status: 500 }
    );
  }
}
