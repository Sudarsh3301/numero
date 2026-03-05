import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from '@google/genai';

const SECTIONS_SCHEMA = {
  type: Type.OBJECT,
  required: ['sections'],
  properties: {
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ['title', 'body'],
        properties: {
          title: { type: Type.STRING },
          body:  { type: Type.STRING },
        },
      },
    },
  },
};

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT,       threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,      threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,threshold: HarmBlockThreshold.BLOCK_NONE },
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
    const { system, messages } = clientRequest;

    const isHindi = system.includes('Hindi') || system.includes('Devanagari');

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

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

    const response = await withRetry(
      () => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        config: {
          thinkingConfig:   { thinkingBudget: -1 },
          responseMimeType: 'application/json',
          responseSchema:   SECTIONS_SCHEMA,
          temperature:      1,
          topP:             0.95,
          safetySettings:   SAFETY_SETTINGS,
        },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      }),
      'analyze'
    );

    const text         = response.text ?? '';
    const finishReason = response.candidates?.[0]?.finishReason;

    if (finishReason && finishReason !== 'STOP') {
      console.warn('Gemini generation incomplete:', { finishReason, textLength: text.length });
    }
    if (finishReason === 'SAFETY') {
      return NextResponse.json(
        { error: 'Content filtered by AI safety systems', details: { finishReason } },
        { status: 400 }
      );
    }

    const narrative = JSON.parse(text);
    return NextResponse.json({ narrative });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: (error as Error).message },
      { status: 500 }
    );
  }
}
