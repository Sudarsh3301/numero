import { describe, it, expect } from 'vitest';
import {
  categorizeGroqError,
  GroqErrorType,
  isRateLimitError,
  MODELS
} from './groq-client';
import { calculateDriver, calculateConductor } from './numerology/core';
import { getPersonalYearEffect, PERSONAL_YEAR_EFFECTS } from './numerology/personal-year';
import { getMissingEffects } from './numerology/missing';
import { getRepetitionEffects } from './numerology/repetition';

describe('Groq Client Error Handling', () => {
  describe('categorizeGroqError', () => {
    it('should detect JSON validation failures', () => {
      const error = {
        status: 400,
        error: { code: 'json_validate_failed', message: 'Schema mismatch' }
      };
      const result = categorizeGroqError(error);
      expect(result.type).toBe(GroqErrorType.JSON_VALIDATE_FAILED);
      expect(result.status).toBe(400);
    });

    it('should detect JSON validation from message', () => {
      const error = {
        status: 400,
        message: 'Failed to validate JSON - schema mismatch'
      };
      const result = categorizeGroqError(error);
      expect(result.type).toBe(GroqErrorType.JSON_VALIDATE_FAILED);
    });

    it('should detect model not found errors', () => {
      const error = {
        status: 404,
        error: { code: 'model_not_found', message: 'Model does not exist' }
      };
      const result = categorizeGroqError(error);
      expect(result.type).toBe(GroqErrorType.MODEL_NOT_FOUND);
      expect(result.status).toBe(404);
    });

    it('should detect rate limit errors', () => {
      const error = {
        status: 429,
        error: { type: 'rate_limit_exceeded', message: 'Too many requests' }
      };
      const result = categorizeGroqError(error);
      expect(result.type).toBe(GroqErrorType.RATE_LIMIT);
      expect(result.status).toBe(429);
    });

    it('should detect timeout errors', () => {
      const error = {
        status: 0,
        message: 'Request timed out after 30 seconds'
      };
      const result = categorizeGroqError(error);
      expect(result.type).toBe(GroqErrorType.TIMEOUT);
    });

    it('should detect context length errors', () => {
      const error = {
        status: 400,
        error: { code: 'context_length_exceeded' },
        message: 'Maximum context length exceeded'
      };
      const result = categorizeGroqError(error);
      expect(result.type).toBe(GroqErrorType.CONTEXT_LENGTH);
    });

    it('should detect generic API errors', () => {
      const error = {
        status: 500,
        message: 'Internal server error'
      };
      const result = categorizeGroqError(error);
      expect(result.type).toBe(GroqErrorType.GENERIC_API_ERROR);
      expect(result.status).toBe(500);
    });

    it('should handle unknown errors', () => {
      const error = {
        status: 418,
        message: "I'm a teapot"
      };
      const result = categorizeGroqError(error);
      expect(result.type).toBe(GroqErrorType.UNKNOWN);
    });

    it('should preserve original error', () => {
      const error = {
        status: 400,
        message: 'Test error',
        custom: 'data'
      };
      const result = categorizeGroqError(error);
      expect(result.originalError).toBe(error);
      expect(result.originalError.custom).toBe('data');
    });
  });

  describe('isRateLimitError', () => {
    it('should detect rate limit by status', () => {
      const error = { status: 429 };
      expect(isRateLimitError(error)).toBe(true);
    });

    it('should detect rate limit by error type', () => {
      const error = { error: { type: 'rate_limit_exceeded' } };
      expect(isRateLimitError(error)).toBe(true);
    });

    it('should detect rate limit by message', () => {
      const error = { message: 'Rate limit exceeded' };
      expect(isRateLimitError(error)).toBe(true);
    });

    it('should return false for non-rate-limit errors', () => {
      const error = { status: 400, message: 'Bad request' };
      expect(isRateLimitError(error)).toBe(false);
    });
  });

  describe('Model Constants', () => {
    it('should have valid structured output models', () => {
      expect(MODELS.STRUCTURED_PRIMARY).toBe('openai/gpt-oss-20b');
      expect(MODELS.STRUCTURED_TIER2).toBe('openai/gpt-oss-120b');
    });

    it('should not use the decommissioned Tier 4 model (404 model_not_found on Groq)', () => {
      expect(MODELS.STRUCTURED_TIER4).not.toBe('meta-llama/llama-4-scout-17b-16e-instruct');
    });

    it('should not use broken moonshotai model', () => {
      expect(MODELS.STRUCTURED_TIER2).not.toBe('moonshotai/kimi-k2-instruct-0905');
      expect(MODELS.STRUCTURED_TIER4).not.toBe('moonshotai/kimi-k2-instruct-0905');
    });

    it('should maintain backward compatible constants', () => {
      expect(MODELS.STRUCTURED_OUTPUT).toBeDefined();
      expect(MODELS.STRUCTURED_FALLBACK).toBeDefined();
    });
  });
});

describe('Numerology core — calculateDriver', () => {
  it('single digit day → driver is that digit', () => {
    // DOB 1985-03-05: day=5, already single digit
    expect(calculateDriver('1985-03-05')).toBe(5);
  });

  it('double digit day reduces to single digit', () => {
    // DOB 1990-07-18: day=18 → 1+8=9
    expect(calculateDriver('1990-07-18')).toBe(9);
  });

  it('day 29 reduces fully: 2+9=11 → 1+1=2', () => {
    // calculateDriver uses sumReduce which reduces all the way to single digit
    expect(calculateDriver('1988-04-29')).toBe(2);
  });

  it('day 22 reduces: 2+2=4', () => {
    expect(calculateDriver('2000-10-22')).toBe(4);
  });

  it('day 10 reduces to 1', () => {
    expect(calculateDriver('1975-06-10')).toBe(1);
  });

  it('day 1 → driver is 1', () => {
    expect(calculateDriver('1980-01-01')).toBe(1);
  });
});

describe('Numerology core — calculateConductor', () => {
  it('sums all DOB digits to a single digit', () => {
    // DOB 1985-03-05: 1+9+8+5+0+3+0+5=31 → 3+1=4
    expect(calculateConductor('1985-03-05')).toBe(4);
  });

  it('conductor fully reduces: 1+9+8+2+0+1+0+8=29 → 2+9=11 → 1+1=2', () => {
    // sumReduce reduces all the way to single digit
    expect(calculateConductor('1982-01-08')).toBe(2);
  });

  it('conductor 9 from date that sums to 9', () => {
    // 1980-01-08: 1+9+8+0+0+1+0+8=27 → 2+7=9
    expect(calculateConductor('1980-01-08')).toBe(9);
  });

  it('conductor 3 from a date summing to 3', () => {
    // 1993-02-06: 1+9+9+3+0+2+0+6=30 → 3+0=3
    expect(calculateConductor('1993-02-06')).toBe(3);
  });
});

describe('Personal year effect', () => {
  it('returns an object for each personal year 1–9', () => {
    for (let py = 1; py <= 9; py++) {
      const result = getPersonalYearEffect(py);
      expect(result).toBeDefined();
      expect(result.year).toBe(py);
    }
  });

  it('has non-empty effects string for each year', () => {
    for (let py = 1; py <= 9; py++) {
      const result = getPersonalYearEffect(py);
      expect(typeof result.effects).toBe('string');
      expect(result.effects.length).toBeGreaterThan(0);
    }
  });

  it('year 1 is a blessing year', () => {
    const result = getPersonalYearEffect(1);
    expect(result.isBlessingYear).toBe(true);
  });

  it('PERSONAL_YEAR_EFFECTS covers years 1–9', () => {
    for (let py = 1; py <= 9; py++) {
      expect(PERSONAL_YEAR_EFFECTS[py]).toBeDefined();
    }
  });
});

describe('Missing number detection', () => {
  it('empty missing array → no effects', () => {
    const result = getMissingEffects([]);
    expect(result).toHaveLength(0);
  });

  it('missing digit 4 → returns effect for 4', () => {
    const result = getMissingEffects([4]);
    expect(result).toHaveLength(1);
    expect(result[0].number).toBe(4);
    expect(typeof result[0].effect).toBe('string');
    expect(result[0].effect.length).toBeGreaterThan(0);
  });

  it('multiple missing digits → one entry per digit', () => {
    const result = getMissingEffects([2, 7]);
    expect(result).toHaveLength(2);
    const numbers = result.map(r => r.number);
    expect(numbers).toContain(2);
    expect(numbers).toContain(7);
  });

  it('missing digit 5 → returns effect with planet info', () => {
    const result = getMissingEffects([5]);
    expect(result[0].planet).toBeDefined();
    expect(typeof result[0].planet).toBe('string');
  });
});

describe('Repetition detection', () => {
  it('all zeros → empty effects', () => {
    const counts: Record<number, number> = { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0 };
    const result = getRepetitionEffects(counts);
    expect(result).toHaveLength(0);
  });

  it('each digit appearing once → no repetition effects (or only count-1 effects)', () => {
    const counts: Record<number, number> = { 1:1, 2:1, 3:1, 4:1, 5:1, 6:1, 7:1, 8:1, 9:1 };
    // Count-1 may be considered "under power" — result should be an array
    const result = getRepetitionEffects(counts);
    expect(Array.isArray(result)).toBe(true);
  });

  it('digit 1 repeated 3 times → returns effect for 1', () => {
    const counts: Record<number, number> = { 1:3, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0 };
    const result = getRepetitionEffects(counts);
    expect(result.length).toBeGreaterThan(0);
    const ones = result.filter(r => r.number === 1);
    expect(ones.length).toBeGreaterThan(0);
  });

  it('digit 9 repeated 4 times → negative zone effect for 9', () => {
    const counts: Record<number, number> = { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:4 };
    const result = getRepetitionEffects(counts);
    const nines = result.filter(r => r.number === 9);
    expect(nines.length).toBeGreaterThan(0);
  });
});
