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
  // Structured output models - 4-tier cascade for reliability
  STRUCTURED_PRIMARY: 'openai/gpt-oss-20b',       // Tier 1: Fast, strict mode
  STRUCTURED_TIER2: 'openai/gpt-oss-120b',        // Tier 2: Larger model, strict mode
  STRUCTURED_TIER3: 'openai/gpt-oss-120b',        // Tier 3: Same model, best-effort mode
  STRUCTURED_TIER4: 'qwen/qwen3.8-27b', // Tier 4: Different model family
  // Deprecated (kept for backward compatibility, no longer used)
  STRUCTURED_OUTPUT: 'openai/gpt-oss-20b',
  STRUCTURED_FALLBACK: 'openai/gpt-oss-120b', // Replaced broken moonshotai model
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

// Error categorization for adaptive retry strategies
export enum GroqErrorType {
  JSON_VALIDATE_FAILED = 'json_validate_failed',
  MODEL_NOT_FOUND = 'model_not_found',
  RATE_LIMIT = 'rate_limit',
  TIMEOUT = 'timeout',
  CONTEXT_LENGTH = 'context_length',
  GENERIC_API_ERROR = 'generic_api_error',
  TRUNCATED = 'truncated',
  UNKNOWN = 'unknown'
}

class TruncatedOutputError extends Error {
  constructor(model: string, completionTokens?: number) {
    super(`Output truncated by token limit on model ${model} (completion_tokens: ${completionTokens ?? 'unknown'})`);
    this.name = 'TruncatedOutputError';
  }
}

export interface CategorizedError {
  type: GroqErrorType;
  status: number;
  message: string;
  originalError: any;
}

export function categorizeGroqError(error: any): CategorizedError {
  const status = error?.status || error?.response?.status || 0;
  const message = error?.message || error?.error?.message || 'Unknown error';
  const errorCode = error?.error?.code || '';

  // Rate limit errors
  if (status === 429 || errorCode === 'rate_limit_exceeded' || isRateLimitError(error)) {
    return {
      type: GroqErrorType.RATE_LIMIT,
      status,
      message,
      originalError: error
    };
  }

  // Truncated output (token limit mid-structure)
  if (error instanceof TruncatedOutputError) {
    return { type: GroqErrorType.TRUNCATED, status: 0, message: error.message, originalError: error };
  }

  // JSON validation failures
  if (status === 400 && (
    errorCode === 'json_validate_failed' ||
    message.includes('json_validate_failed') ||
    message.includes('does not match the expected schema') ||
    message.includes('Failed to validate JSON')
  )) {
    return {
      type: GroqErrorType.JSON_VALIDATE_FAILED,
      status,
      message,
      originalError: error
    };
  }

  // Model not found
  if (status === 404 || errorCode === 'model_not_found' || message.includes('model_not_found')) {
    return {
      type: GroqErrorType.MODEL_NOT_FOUND,
      status,
      message,
      originalError: error
    };
  }

  // Timeout errors
  if (errorCode === 'timeout' || message.includes('timeout') || message.includes('timed out')) {
    return {
      type: GroqErrorType.TIMEOUT,
      status,
      message,
      originalError: error
    };
  }

  // Context length errors
  if (status === 400 && (
    errorCode === 'context_length_exceeded' ||
    message.includes('context_length_exceeded') ||
    message.includes('maximum context length')
  )) {
    return {
      type: GroqErrorType.CONTEXT_LENGTH,
      status,
      message,
      originalError: error
    };
  }

  // Generic API errors (500, 503, etc.)
  if (status >= 500) {
    return {
      type: GroqErrorType.GENERIC_API_ERROR,
      status,
      message,
      originalError: error
    };
  }

  return {
    type: GroqErrorType.UNKNOWN,
    status,
    message,
    originalError: error
  };
}

// Circuit breaker to prevent cascading failures
interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'closed' | 'open' | 'half-open';
}

const circuitBreakers = new Map<string, CircuitBreakerState>();

const CIRCUIT_BREAKER_CONFIG = {
  failureThreshold: 5,        // Open after 5 consecutive failures
  resetTimeout: 60000,        // Reset after 1 minute
  halfOpenAttempts: 1,        // Allow 1 attempt when half-open
};

function getCircuitBreaker(model: string): CircuitBreakerState {
  if (!circuitBreakers.has(model)) {
    circuitBreakers.set(model, {
      failures: 0,
      lastFailureTime: 0,
      state: 'closed',
    });
  }
  return circuitBreakers.get(model)!;
}

function checkCircuitBreaker(model: string): void {
  const breaker = getCircuitBreaker(model);
  const now = Date.now();

  // Auto-reset if timeout passed
  if (breaker.state === 'open' && now - breaker.lastFailureTime > CIRCUIT_BREAKER_CONFIG.resetTimeout) {
    console.log(`[Groq] Circuit breaker for ${model} reset to half-open`);
    breaker.state = 'half-open';
    breaker.failures = 0;
  }

  // Block if circuit is open
  if (breaker.state === 'open') {
    throw new Error(
      `Circuit breaker open for model ${model}. Too many recent failures. Try again in ${
        Math.ceil((CIRCUIT_BREAKER_CONFIG.resetTimeout - (now - breaker.lastFailureTime)) / 1000)
      } seconds.`
    );
  }
}

function recordCircuitBreakerSuccess(model: string): void {
  const breaker = getCircuitBreaker(model);
  breaker.failures = 0;
  breaker.state = 'closed';
}

function recordCircuitBreakerFailure(model: string): void {
  const breaker = getCircuitBreaker(model);
  breaker.failures++;
  breaker.lastFailureTime = Date.now();

  if (breaker.failures >= CIRCUIT_BREAKER_CONFIG.failureThreshold) {
    console.warn(`[Groq] Circuit breaker opened for ${model} after ${breaker.failures} failures`);
    breaker.state = 'open';
  }
}

// Tier configuration for structured outputs
interface FallbackTier {
  model: string;
  strict: boolean;
  temperature: number;
  description: string;
}

const STRUCTURED_OUTPUT_TIERS: FallbackTier[] = [
  {
    model: MODELS.STRUCTURED_PRIMARY,
    strict: true,
    temperature: 0.3,
    description: 'Tier 1: Fast primary (strict mode)'
  },
  {
    model: MODELS.STRUCTURED_TIER2,
    strict: true,
    temperature: 0.2,  // Lower temp for larger model
    description: 'Tier 2: Larger model (strict mode, lower temp)'
  },
  {
    model: MODELS.STRUCTURED_TIER3,
    strict: false,
    temperature: 0.3,
    description: 'Tier 3: Best-effort mode (same large model)'
  },
  {
    model: MODELS.STRUCTURED_TIER4,
    strict: false,
    temperature: 0.5,
    description: 'Tier 4: Different model family (best-effort)'
  }
];

// Helper: Attempt single generation
async function attemptGeneration(
  model: string,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  temperature: number = 1,
  maxTokens?: number,
  responseFormat?: any
): Promise<string> {
  // Check circuit breaker BEFORE attempting
  checkCircuitBreaker(model);

  const groq = getGroqClient();

  console.log(`[Groq] Generating with model: ${model}, temp: ${temperature}`);
  console.log(`[Groq] Response format: ${responseFormat?.type || 'text'}, strict: ${responseFormat?.json_schema?.strict ?? 'N/A'}`);
  console.log(`[Groq] Prompt length: ${JSON.stringify(messages).length} chars`);

  try {
    const response = await groq.chat.completions.create({
      model,
      messages,
      temperature,
      ...(maxTokens && { max_tokens: maxTokens }),
      ...(responseFormat && { response_format: responseFormat }),
    });

    if (response.choices[0]?.finish_reason === 'length') {
      throw new TruncatedOutputError(model, response.usage?.completion_tokens);
    }

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from Groq');
    }

    console.log(`[Groq] Success: ${content.length} characters generated`);

    // Log raw output preview for debugging
    console.log(`[Groq] Raw output preview: ${content.substring(0, 200)}...`);

    // Validate JSON if expected
    if (responseFormat?.type === 'json_schema' || responseFormat?.type === 'json_object') {
      try {
        JSON.parse(content);
        console.log(`[Groq] JSON validation: PASSED`);
      } catch (parseError) {
        console.error(`[Groq] JSON validation: FAILED - ${(parseError as Error).message}`);
        console.error(`[Groq] Raw content: ${content}`);
        throw new Error(`Model returned invalid JSON: ${(parseError as Error).message}`);
      }
    }

    // Record success
    recordCircuitBreakerSuccess(model);

    return content;

  } catch (error: any) {
    // Record failure
    recordCircuitBreakerFailure(model);

    const categorized = categorizeGroqError(error);
    console.error(`[Groq] Generation failed: ${categorized.type} (HTTP ${categorized.status})`);
    console.error(`[Groq] Error message: ${categorized.message}`);
    console.error(`[Groq] Model: ${model}, Temp: ${temperature}`);

    // Log error details if available
    if (error?.error) {
      console.error(`[Groq] Groq API error details:`, JSON.stringify(error.error, null, 2));
    }

    throw error;
  }
}

// Determine next action based on error type
function determineNextAction(
  error: CategorizedError,
  currentTier: number
): { wait: number | null; retry: boolean; skipToTier: number | null } {
  switch (error.type) {
    case GroqErrorType.TRUNCATED:
    case GroqErrorType.JSON_VALIDATE_FAILED:
      // Skip strict mode tiers, go to next tier (index 2+)
      return { wait: 300, retry: false, skipToTier: Math.max(2, currentTier + 1) };

    case GroqErrorType.MODEL_NOT_FOUND:
      // Skip to next tier immediately
      return { wait: null, retry: false, skipToTier: currentTier + 1 };

    case GroqErrorType.RATE_LIMIT:
      // Exponential backoff, retry same tier once, then skip
      const backoff = Math.min(2000 * Math.pow(2, currentTier), 8000);
      return { wait: backoff, retry: currentTier === 0, skipToTier: null };

    case GroqErrorType.TIMEOUT:
      // Skip to best-effort mode (faster)
      return { wait: 500, retry: false, skipToTier: 2 };

    case GroqErrorType.CONTEXT_LENGTH:
      // Can't recover, skip to different model (Tier 4, index 3)
      return { wait: null, retry: false, skipToTier: 3 };

    case GroqErrorType.GENERIC_API_ERROR:
      // Wait and retry once, then skip
      return { wait: 1000, retry: currentTier < 2, skipToTier: null };

    default:
      // Unknown error, proceed to next tier
      return { wait: 500, retry: false, skipToTier: null };
  }
}

// Build comprehensive error message
function buildComprehensiveError(errors: Array<{ tier: number; error: CategorizedError }>): Error {
  const errorSummary = errors.map(({ tier, error }) =>
    `Tier ${tier} (${STRUCTURED_OUTPUT_TIERS[tier - 1].model}): ${error.type} - ${error.message}`
  ).join('\n');

  // Check if all errors were rate limits
  if (errors.every(e => e.error.type === GroqErrorType.RATE_LIMIT)) {
    return new Error(
      'Our AI service is experiencing high demand. Please try again in a few moments. (Rate limit reached on all models)'
    );
  }

  return new Error(
    `AI service failed after attempting all fallback tiers:\n${errorSummary}`
  );
}

// Simple primary/fallback for non-structured outputs
async function simpleGenerationWithFallback(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  temperature: number = 1,
  maxTokens?: number,
  responseFormat?: any
): Promise<string> {
  try {
    return await attemptGeneration(MODELS.PRIMARY, messages, temperature, maxTokens, responseFormat);
  } catch (primaryError: any) {
    const categorized = categorizeGroqError(primaryError);
    console.warn(`[Groq] Primary failed (${categorized.type}): ${categorized.message}`);

    // Wait before fallback
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      return await attemptGeneration(MODELS.FALLBACK, messages, temperature, maxTokens, responseFormat);
    } catch (fallbackError: any) {
      const fallbackCategorized = categorizeGroqError(fallbackError);

      if (fallbackCategorized.type === GroqErrorType.RATE_LIMIT) {
        throw new Error(
          'Our AI service is experiencing high demand. Please try again in a few moments. (Rate limit reached on all models)'
        );
      }

      throw new Error(
        `AI service error: Primary (${MODELS.PRIMARY}): ${categorized.message}; Fallback (${MODELS.FALLBACK}): ${fallbackCategorized.message}`
      );
    }
  }
}

// Tier-based cascade for structured outputs
async function structuredGenerationWithTiers(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  temperature?: number,
  maxTokens?: number,
  responseFormat?: any
): Promise<string> {
  const errors: Array<{ tier: number; error: CategorizedError }> = [];
  let currentTierIndex = 0;

  while (currentTierIndex < STRUCTURED_OUTPUT_TIERS.length) {
    const tier = STRUCTURED_OUTPUT_TIERS[currentTierIndex];

    console.log(`[Groq] Attempting ${tier.description}`);

    // Build response format with tier's strict mode setting
    let tierResponseFormat = responseFormat;
    if (responseFormat?.type === 'json_schema') {
      tierResponseFormat = {
        type: 'json_schema',
        json_schema: {
          ...responseFormat.json_schema,
          strict: tier.strict,
        },
      };
    }

    // Use tier's temperature (override if not explicitly provided)
    const tierTemperature = temperature !== undefined ? temperature : tier.temperature;

    try {
      const result = await attemptGeneration(
        tier.model,
        messages,
        tierTemperature,
        maxTokens,
        tierResponseFormat
      );

      console.log(`[Groq] Success on ${tier.description}`);
      return result;

    } catch (error: any) {
      const categorized = categorizeGroqError(error);
      errors.push({ tier: currentTierIndex + 1, error: categorized });

      console.warn(`[Groq] ${tier.description} failed: ${categorized.type} - ${categorized.message}`);

      // Determine next action based on error type
      const nextAction = determineNextAction(categorized, currentTierIndex);

      if (nextAction.wait) {
        console.log(`[Groq] Waiting ${nextAction.wait}ms before retry`);
        await new Promise(resolve => setTimeout(resolve, nextAction.wait));
      }

      if (nextAction.skipToTier !== null) {
        currentTierIndex = nextAction.skipToTier;
      } else if (nextAction.retry) {
        // Retry same tier (don't increment)
        continue;
      } else {
        // Move to next tier
        currentTierIndex++;
      }
    }
  }

  // All tiers exhausted
  throw buildComprehensiveError(errors);
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
  const { temperature, maxTokens, responseFormat, model: preferredModel } = options || {};

  const isStructuredOutput = responseFormat?.type === 'json_schema' || responseFormat?.type === 'json_object';

  // If specific model requested, use it directly (single attempt)
  if (preferredModel) {
    console.log(`[Groq] Using specified model: ${preferredModel}`);
    return await attemptGeneration(preferredModel, messages, temperature, maxTokens, responseFormat);
  }

  // For non-structured outputs, use simple primary/fallback
  if (!isStructuredOutput) {
    return await simpleGenerationWithFallback(messages, temperature, maxTokens, responseFormat);
  }

  // For structured outputs, use tier-based cascade
  return await structuredGenerationWithTiers(messages, temperature, maxTokens, responseFormat);
}

export default getGroqClient;
