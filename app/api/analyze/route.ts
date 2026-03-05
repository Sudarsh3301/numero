import { NextRequest, NextResponse } from 'next/server';
import { generateWithFallback } from '@/lib/groq-client';
import { extractCoupleSignals, extractSignals } from '@/lib/signal-extractor';
import type { CoupleArchetypes, CoupleSignals, SingleArchetypes } from '@/lib/signal-extractor';

const MAX_RETRIES = 3; // Increased to allow for model variation

// IMPROVED: Retry with varying conditions instead of repeating the same request
async function withRetryAndFallback<T>(
  primaryFn: () => Promise<T>,
  fallbackFn: (() => Promise<T>) | null,
  label: string
): Promise<T> {
  let lastError: unknown;

  // Attempt 1: Primary function (strict mode)
  try {
    console.log(`[${label}] Attempt 1: Primary model with strict mode`);
    return await primaryFn();
  } catch (err) {
    lastError = err;
    console.warn(`[${label}] Attempt 1 failed:`, (err as Error).message);

    // Wait before retry
    await new Promise(r => setTimeout(r, 500));
  }

  // Attempt 2: Fallback function if provided (best-effort mode)
  if (fallbackFn) {
    try {
      console.log(`[${label}] Attempt 2: Fallback model with best-effort mode`);
      return await fallbackFn();
    } catch (err) {
      lastError = err;
      console.warn(`[${label}] Attempt 2 failed:`, (err as Error).message);

      // Wait before final retry
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  // Attempt 3: Retry primary one more time
  try {
    console.log(`[${label}] Attempt 3: Final retry with primary model`);
    return await primaryFn();
  } catch (err) {
    lastError = err;
    console.error(`[${label}] All attempts failed`);
  }

  throw lastError;
}

type AnalysisMode = 'single' | 'relationship';

const archetypeDescriptorSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
  },
  required: ['name', 'description'],
  additionalProperties: false,
};

const singleArchetypeSchema = {
  type: 'object',
  properties: {
    primary: archetypeDescriptorSchema,
    secondary: archetypeDescriptorSchema,
    shadow: archetypeDescriptorSchema,
  },
  required: ['primary', 'secondary', 'shadow'],
  additionalProperties: false,
};

function isArchetypeDescriptor(value: any): boolean {
  return Boolean(
    value &&
    typeof value.name === 'string' &&
    value.name.trim() !== '' &&
    typeof value.description === 'string' &&
    value.description.trim() !== ''
  );
}

function isSingleArchetypes(value: any): value is SingleArchetypes {
  return Boolean(
    value &&
    isArchetypeDescriptor(value.primary) &&
    isArchetypeDescriptor(value.secondary) &&
    isArchetypeDescriptor(value.shadow)
  );
}

function isCoupleArchetypes(value: any): value is CoupleArchetypes {
  return Boolean(value && isSingleArchetypes(value.person1) && isSingleArchetypes(value.person2));
}

function buildArchetypeSchema(mode: AnalysisMode) {
  return mode === 'single'
    ? {
        name: 'numerology_archetypes_single',
        strict: true,
        schema: singleArchetypeSchema,
      }
    : {
        name: 'numerology_archetypes_relationship',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            person1: singleArchetypeSchema,
            person2: singleArchetypeSchema,
          },
          required: ['person1', 'person2'],
          additionalProperties: false,
        },
      };
}

function buildArchetypePrompt(mode: AnalysisMode, signals: any) {
  if (mode === 'single') {
    return [
      'You are a psychological profiler analyzing numerology signals to synthesize personality archetypes.',
      '',
      'SIGNALS:',
      JSON.stringify(signals, null, 2),
      '',
      'Task: Generate 3 personality archetypes that create a coherent psychological framework:',
      '1. PRIMARY ARCHETYPE - core identity and default behavior pattern',
      '2. SECONDARY ARCHETYPE - supporting strengths and complementary traits',
      '3. SHADOW ARCHETYPE - hidden weaknesses and blind spots',
      '',
      'Guidelines:',
      '- Use psychological language, not mystical vagueness.',
      '- Archetypes must be internally consistent.',
      '- Reference specific signals: numbers, arrows, elements, directions, and 2026 modifiers.',
      '- Keep each description to 1-2 tight sentences.',
      '- Return JSON only using the required schema.',
    ].join('\n');
  }

  return [
    'You are a psychological profiler analyzing numerology signals to synthesize personality archetypes for two people.',
    '',
    'PERSON 1 SIGNALS:',
    JSON.stringify((signals as CoupleSignals).person1, null, 2),
    '',
    'PERSON 2 SIGNALS:',
    JSON.stringify((signals as CoupleSignals).person2, null, 2),
    '',
    'COMPATIBILITY SIGNALS:',
    JSON.stringify((signals as CoupleSignals).compatibility, null, 2),
    '',
    'Task: Generate 3 archetypes for EACH person:',
    '- PRIMARY: core identity and default behavior pattern',
    '- SECONDARY: supporting strengths and complementary traits',
    '- SHADOW: hidden weaknesses and blind spots',
    '',
    'Guidelines:',
    '- Use psychological language, not mystical vagueness.',
    '- Each person\'s archetypes must be internally consistent.',
    '- Reference specific signals: numbers, arrows, elements, directions, and 2026 modifiers.',
    '- Keep each description to 1-2 tight sentences.',
    '- Return JSON only using the required schema.',
  ].join('\n');
}

function buildNarrativePrompt(
  mode: AnalysisMode,
  systemInstruction: string,
  signals: any,
  archetypes: SingleArchetypes | CoupleArchetypes
) {
  const narrativeGuidelines = mode === 'single'
    ? [
        'Provide analysis covering:',
        '1. Core Psychological Profile - use the PRIMARY archetype as the organizing identity.',
        '2. Innate Strengths - use the SECONDARY archetype, present arrows, Kua element, and plane distribution.',
        '3. Blind Spots & Weaknesses - use the SHADOW archetype, missing numbers, and absent arrows.',
        '4. 2026 Forecast - weave personal year, year modifier, directions, and feng shui alerts through the archetype lens.',
        '5. Growth Directive - one sharp behavioral instruction based on the archetype tensions.',
      ]
    : [
        'Provide analysis covering:',
        '1. Individual Essences - use each person\'s PRIMARY archetype and their dominant psychological pattern.',
        '2. Core Alignment - show how their archetypes and elements support or stabilize each other.',
        '3. Primary Friction Areas - show where shadow patterns, missing numbers, and shared unlucky directions create tension.',
        '4. 2026 Couples Forecast - use both personal years, modifiers, directions, and feng shui alerts.',
        '5. Long-Term Outlook - describe natural momentum versus maintenance burden through the archetype framework.',
        '6. Behavioral Advice - 2-3 specific actions grounded in their actual signals.',
      ];

  return [
    systemInstruction,
    '',
    'Task: Analyze this Lo Shu numerology and Feng Shui chart using the archetypes as the psychological backbone.',
    '',
    'ARCHETYPES:',
    JSON.stringify(archetypes, null, 2),
    '',
    'SUPPORTING SIGNALS:',
    JSON.stringify(signals, null, 2),
    '',
    ...narrativeGuidelines,
    '',
    'Write concise analytical descriptions for each section.',
    'Target length: 350-450 words total.',
    'Return the analysis using the required JSON fields defined by the schema.',
  ].join('\n');
}

export async function POST(request: NextRequest) {
  try {
    const clientRequest = await request.json();
    const { system = '', messages = [] } = clientRequest;

    const isHindi = system.includes('Hindi') || system.includes('Devanagari');

    const systemInstruction = `You are a direct, psychologically sharp Feng Shui and Lo Shu numerology analyst. ${
      isHindi
        ? 'Respond entirely in Hindi (Devanagari script). Mystical but clear Hindi.'
        : 'Respond in English.'
    }`;

    const requestPayload = JSON.parse(messages[0]?.content || '{}');
    const person1 = requestPayload.person1 ?? requestPayload.p1;
    const person2 = requestPayload.person2 ?? requestPayload.p2;
    const compatibility = requestPayload.compatibility ?? requestPayload.compat ?? {};

    if (!person1) {
      return NextResponse.json(
        {
          error: 'Invalid analysis request',
          message: 'Missing person chart data.',
        },
        { status: 400 }
      );
    }

    const mode: AnalysisMode = requestPayload.mode === 'couple' || person2 ? 'relationship' : 'single';
    const signals = mode === 'single'
      ? extractSignals(person1)
      : extractCoupleSignals(person1, person2, compatibility);

    // IMPROVED: Use explicit required fields instead of array to guarantee completeness
    // OPTIMIZED: Reordered to prevent position bias - forecast moved earlier
    const singleModeSchema = {
      name: 'numerology_analysis_single',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          psychological_profile: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              body: { type: 'string' },
            },
            required: ['title', 'body'],
            additionalProperties: false,
          },
          strengths: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              body: { type: 'string' },
            },
            required: ['title', 'body'],
            additionalProperties: false,
          },
          blind_spots: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              body: { type: 'string' },
            },
            required: ['title', 'body'],
            additionalProperties: false,
          },
          forecast_2026: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              body: { type: 'string' },
            },
            required: ['title', 'body'],
            additionalProperties: false,
          },
          growth_directive: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              body: { type: 'string' },
            },
            required: ['title', 'body'],
            additionalProperties: false,
          },
        },
        required: ['psychological_profile', 'strengths', 'blind_spots', 'forecast_2026', 'growth_directive'],
        additionalProperties: false,
      },
    };

    // OPTIMIZED: Reordered to prevent position bias - forecast moved earlier
    const relationshipModeSchema = {
      name: 'numerology_analysis_relationship',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          individual_essences: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              body: { type: 'string' },
            },
            required: ['title', 'body'],
            additionalProperties: false,
          },
          core_alignment: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              body: { type: 'string' },
            },
            required: ['title', 'body'],
            additionalProperties: false,
          },
          friction_areas: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              body: { type: 'string' },
            },
            required: ['title', 'body'],
            additionalProperties: false,
          },
          couples_forecast_2026: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              body: { type: 'string' },
            },
            required: ['title', 'body'],
            additionalProperties: false,
          },
          long_term_outlook: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              body: { type: 'string' },
            },
            required: ['title', 'body'],
            additionalProperties: false,
          },
          behavioral_advice: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              body: { type: 'string' },
            },
            required: ['title', 'body'],
            additionalProperties: false,
          },
        },
        required: ['individual_essences', 'core_alignment', 'friction_areas', 'couples_forecast_2026', 'long_term_outlook', 'behavioral_advice'],
        additionalProperties: false,
      },
    };

    const responseSchema = mode === 'single' ? singleModeSchema : relationshipModeSchema;

    const archetypeText = await withRetryAndFallback(
      () => generateWithFallback(
        [{ role: 'user', content: buildArchetypePrompt(mode, signals) }],
        {
          temperature: 0.3,
          maxTokens: 400,
          responseFormat: {
            type: 'json_schema',
            json_schema: buildArchetypeSchema(mode),
          },
        }
      ),
      null,
      'archetypes'
    );

    let archetypes: SingleArchetypes | CoupleArchetypes;

    try {
      const parsedArchetypes = JSON.parse(archetypeText);

      if (mode === 'single') {
        if (!isSingleArchetypes(parsedArchetypes)) {
          throw new Error('Invalid single archetype structure');
        }
        archetypes = parsedArchetypes;
      } else {
        if (!isCoupleArchetypes(parsedArchetypes)) {
          throw new Error('Invalid relationship archetype structure');
        }
        archetypes = parsedArchetypes;
      }
    } catch (parseError) {
      console.error('Archetype parsing failed:', parseError);
      console.error('Archetype response text:', archetypeText);

      return NextResponse.json(
        {
          error: 'AI response formatting error',
          message: 'The AI generated invalid archetypes. Please try again.',
          details: (parseError as Error).message,
        },
        { status: 500 }
      );
    }

    const prompt = buildNarrativePrompt(mode, systemInstruction, signals, archetypes);

    const responseText = await withRetryAndFallback(
      () => generateWithFallback(
        [{ role: 'user', content: prompt }],
        {
          temperature: 0.3, // OPTIMIZED: Lowered from 1.0 for stable strict decoding
          // No maxTokens - let the model use what it needs for strict mode
          responseFormat: {
            type: 'json_schema',
            json_schema: responseSchema,
          },
        }
      ),
      null,
      'analyze'
    );

    // Parse and validate JSON response
    let narrative;
    let responseStatus = 'complete';

    try {
      const parsedResponse = JSON.parse(responseText);

      // IMPROVED: Convert object-based response to sections array format
      // This maintains backward compatibility with the frontend
      // OPTIMIZED: Field order matches schema to prevent position bias
      const sectionFields = mode === 'single'
        ? ['psychological_profile', 'strengths', 'blind_spots', 'forecast_2026', 'growth_directive']
        : ['individual_essences', 'core_alignment', 'friction_areas', 'couples_forecast_2026', 'long_term_outlook', 'behavioral_advice'];

      const sectionTitles = mode === 'single'
        ? {
            psychological_profile: '🧠 Core Psychological Profile',
            strengths: '🔥 Innate Strengths',
            blind_spots: '⚡ Blind Spots & Weaknesses',
            forecast_2026: '📅 2026 Forecast',
            growth_directive: '🧭 Growth Directive',
          }
        : {
            individual_essences: '🧠 Individual Essences',
            core_alignment: '🔗 Core Alignment',
            friction_areas: '⚡ Primary Friction Areas',
            couples_forecast_2026: '🔮 2026 Couples Forecast',
            long_term_outlook: '📅 Long-Term Outlook',
            behavioral_advice: '🛠 Behavioral Advice',
          };

      const sections = [];
      const missingSections = [];

      for (const fieldName of sectionFields) {
        const section = parsedResponse[fieldName];
        if (section && section.title && section.body && section.title.trim() !== '' && section.body.trim() !== '') {
          sections.push({
            title: section.title,
            body: section.body,
          });
        } else {
          missingSections.push(fieldName);
        }
      }

      // IMPROVED: Graceful degradation - accept partial responses
      const minRequiredSections = 3;
      if (sections.length < minRequiredSections) {
        console.error(
          `Insufficient sections: got ${sections.length}, minimum required ${minRequiredSections}. ` +
          `Missing: ${missingSections.join(', ')}`
        );
        throw new Error(
          `Insufficient valid sections: expected at least ${minRequiredSections}, got ${sections.length}`
        );
      }

      // IMPROVED: Response Repair Layer - regenerate missing sections
      if (missingSections.length > 0 && missingSections.length <= 2) {
        responseStatus = 'repaired';
        console.log(`Attempting to repair ${missingSections.length} missing sections: ${missingSections.join(', ')}`);

        try {
          const repairPrompt = [
            systemInstruction,
            '',
            'Task: Generate ONLY the following missing analysis sections for this chart.',
            '',
            'ARCHETYPES:',
            JSON.stringify(archetypes, null, 2),
            '',
            'SUPPORTING SIGNALS:',
            JSON.stringify(signals, null, 2),
            '',
            'Existing sections (for context):',
            JSON.stringify(sections, null, 2),
            '',
            `Generate ONLY these missing sections: ${missingSections.map((f: string) => sectionTitles[f as keyof typeof sectionTitles]).join(', ')}`,
            '',
            'Return as JSON object with these exact field names:',
            '{',
            ...missingSections.map((f: string) => `  "${f}": {"title": "${sectionTitles[f as keyof typeof sectionTitles]}", "body": "..."},`),
            '}',
          ].join('\n');

          const repairSchema = {
            name: 'repair_missing_sections',
            strict: false, // Use best-effort mode for repair
            schema: {
              type: 'object',
              properties: Object.fromEntries(
                missingSections.map((fieldName: string) => [
                  fieldName,
                  {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      body: { type: 'string' },
                    },
                    required: ['title', 'body'],
                    additionalProperties: false,
                  },
                ])
              ),
              required: missingSections,
              additionalProperties: false,
            },
          };

          const repairText = await generateWithFallback(
            [{ role: 'user', content: repairPrompt }],
            {
              temperature: 0.3,
              responseFormat: {
                type: 'json_schema',
                json_schema: repairSchema,
              },
            }
          );

          const repairedSections = JSON.parse(repairText);

          // Add repaired sections in the correct order
          for (const fieldName of sectionFields) {
            if (missingSections.includes(fieldName)) {
              const section = repairedSections[fieldName];
              if (section && section.title && section.body) {
                sections.push({
                  title: section.title,
                  body: section.body,
                });
                console.log(`Successfully repaired section: ${fieldName}`);
              }
            }
          }

          console.log(`Repair complete: ${sections.length}/${sectionFields.length} sections`);
        } catch (repairError) {
          console.error('Section repair failed:', repairError);
          responseStatus = 'partial';
          // Continue with partial response
        }
      } else if (missingSections.length > 0) {
        responseStatus = 'partial';
        console.warn(
          `Partial response: ${sections.length}/${sectionFields.length} sections. ` +
          `Missing: ${missingSections.join(', ')}`
        );
      }

      narrative = { sections, status: responseStatus };

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

    return NextResponse.json({ narrative, signals, archetypes });
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
