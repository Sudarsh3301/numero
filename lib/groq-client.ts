import Groq from 'groq-sdk';

let groqInstance: Groq | null = null;

function getGroqClient(): Groq {
  if (!groqInstance) {
    groqInstance = new Groq({
      apiKey: process.env.GROQ_API_KEY || '',
    });
  }
  return groqInstance;
}

export const MODELS = {
  PRIMARY: 'llama-3.1-8b-instant',
  FALLBACK: 'llama-3.3-70b-versatile',
} as const;

export interface GroqError {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

export function isRateLimitError(error: any): boolean {
  return (
    error?.status === 429 ||
    error?.error?.type === 'rate_limit_exceeded' ||
    error?.message?.includes('rate limit') ||
    error?.message?.includes('Rate limit')
  );
}

export async function generateWithFallback(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options?: {
    temperature?: number;
    maxTokens?: number;
    responseFormat?: { type: 'json_object' } | { type: 'json_schema'; json_schema: any };
  }
): Promise<string> {
  const { temperature = 1, maxTokens = 2048, responseFormat } = options || {};

  // Try primary model first
  try {
    console.log(`[Groq] Attempting primary model: ${MODELS.PRIMARY}`);
    const groq = getGroqClient();
    const response = await groq.chat.completions.create({
      model: MODELS.PRIMARY,
      messages,
      temperature,
      max_tokens: maxTokens,
      ...(responseFormat && { response_format: responseFormat }),
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from Groq');
    }

    console.log(`[Groq] Success with primary model`);
    return content;
  } catch (primaryError: any) {
    console.warn(`[Groq] Primary model failed:`, primaryError.message);

    // If rate limited, try fallback model
    if (isRateLimitError(primaryError)) {
      console.log(`[Groq] Rate limited on primary, trying fallback: ${MODELS.FALLBACK}`);

      try {
        const groq = getGroqClient();
        const response = await groq.chat.completions.create({
          model: MODELS.FALLBACK,
          messages,
          temperature,
          max_tokens: maxTokens,
          ...(responseFormat && { response_format: responseFormat }),
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error('Empty response from Groq fallback');
        }

        console.log(`[Groq] Success with fallback model`);
        return content;
      } catch (fallbackError: any) {
        console.error(`[Groq] Fallback model also failed:`, fallbackError.message);

        // If fallback is also rate limited, throw user-friendly error
        if (isRateLimitError(fallbackError)) {
          throw new Error(
            'Our AI service is experiencing high demand. Please try again in a few moments. (Rate limit reached on all models)'
          );
        }

        // Other fallback errors
        throw new Error(
          `AI service temporarily unavailable: ${fallbackError.message}`
        );
      }
    }

    // Non-rate-limit errors from primary
    throw new Error(
      `AI service error: ${primaryError.message || 'Unknown error'}`
    );
  }
}

export default getGroqClient;
