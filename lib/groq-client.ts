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
  STRUCTURED_OUTPUT: 'openai/gpt-oss-20b', // Best for structured JSON output with strict mode
  STRUCTURED_FALLBACK: 'moonshotai/kimi-k2-instruct-0905', // Fallback for structured output (best-effort mode)
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
    responseFormat?:
      | { type: 'json_object' }
      | { type: 'json_schema'; json_schema: any };
    model?: string; // Allow specifying a specific model
  }
): Promise<string> {
  const {
    temperature = 1,
    maxTokens, // No default - let model use what it needs
    responseFormat,
    model: preferredModel
  } = options || {};

  // Determine if this is a structured output request
  const isStructuredOutput = responseFormat?.type === 'json_schema' || responseFormat?.type === 'json_object';

  // Use structured output model if JSON format is requested and no specific model is provided
  const primaryModel = preferredModel || (isStructuredOutput ? MODELS.STRUCTURED_OUTPUT : MODELS.PRIMARY);

  // Try primary/preferred model first
  try {
    console.log(`[Groq] Attempting model: ${primaryModel}`);
    const groq = getGroqClient();
    const response = await groq.chat.completions.create({
      model: primaryModel,
      messages,
      temperature,
      ...(maxTokens && { max_tokens: maxTokens }), // Only set if provided
      ...(responseFormat && { response_format: responseFormat }),
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from Groq');
    }

    console.log(`[Groq] Success with model: ${primaryModel}`);
    return content;
  } catch (primaryError: any) {
    console.warn(`[Groq] Model ${primaryModel} failed:`, primaryError.status || 'unknown', primaryError.message);

    // IMPROVED: Try fallback model on ANY error, not just rate limits
    // This handles: JSON validation errors, schema violations, timeouts, provider errors
    const fallbackModel = isStructuredOutput ? MODELS.STRUCTURED_FALLBACK : MODELS.FALLBACK;
    console.log(`[Groq] Primary model failed, attempting fallback: ${fallbackModel}`);

    try {
      const groq = getGroqClient();

      // For structured output fallback, use best-effort mode (strict: false)
      let fallbackResponseFormat = responseFormat;
      if (isStructuredOutput && responseFormat?.type === 'json_schema') {
        fallbackResponseFormat = {
          type: 'json_schema',
          json_schema: {
            ...responseFormat.json_schema,
            strict: false, // Best-effort mode for fallback
          },
        };
      }

      const response = await groq.chat.completions.create({
        model: fallbackModel,
        messages,
        temperature,
        ...(maxTokens && { max_tokens: maxTokens }), // Only set if provided
        ...(fallbackResponseFormat && { response_format: fallbackResponseFormat }),
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from Groq fallback');
      }

      console.log(`[Groq] Success with fallback model: ${fallbackModel}`);
      return content;
    } catch (fallbackError: any) {
      console.error(`[Groq] Fallback model also failed:`, fallbackError.status || 'unknown', fallbackError.message);

      // If fallback is also rate limited, throw user-friendly error
      if (isRateLimitError(fallbackError)) {
        throw new Error(
          'Our AI service is experiencing high demand. Please try again in a few moments. (Rate limit reached on all models)'
        );
      }

      // Other fallback errors - include both primary and fallback error info
      throw new Error(
        `AI service error: Primary (${primaryModel}): ${primaryError.message}; Fallback (${fallbackModel}): ${fallbackError.message}`
      );
    }
  }
}

export default getGroqClient;
