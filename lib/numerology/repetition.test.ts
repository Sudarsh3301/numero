/**
 * Unit Tests for Number Repetition Effects
 * Based on goal.md Section 7: Number Repetition — Thumb Rules & Effects
 *
 * Thumb Rule:
 * - 1 time: Under power or OK
 * - 2 times: Strength is good / best (pair is best)
 * - 3 times: Exaggerated / aggravated
 * - 4+ times: Negative zone
 */

import { describe, it, expect } from 'vitest';
import {
  getRepetitionEffects,
  getMostRepeatedNumber,
  getSpecialRepetitionNotes,
} from './repetition';

describe('getRepetitionEffects', () => {
  it('should return effects for all present numbers', () => {
    const counts = { 1: 2, 2: 0, 3: 1, 4: 0, 5: 0, 6: 0, 7: 0, 8: 2, 9: 1 };
    const effects = getRepetitionEffects(counts);

    expect(effects.length).toBe(4); // 1, 3, 8, 9
    expect(effects.some(e => e.number === 1)).toBe(true);
    expect(effects.some(e => e.number === 8)).toBe(true);
  });

  it('should skip missing numbers (count = 0)', () => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 1 };
    const effects = getRepetitionEffects(counts);

    expect(effects.length).toBe(1);
    expect(effects[0].number).toBe(9);
  });

  it('should classify severity correctly - count 1 = ok', () => {
    const counts = { 1: 1, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    const effects = getRepetitionEffects(counts);

    expect(effects[0].severity).toBe('ok');
  });

  it('should classify severity correctly - count 2 = strength', () => {
    const counts = { 1: 2, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    const effects = getRepetitionEffects(counts);

    expect(effects[0].severity).toBe('strength');
    expect(effects[0].effect).toBe('Excellent communicator / articulate / impartial');
  });

  it('should classify severity correctly - count 3 = exaggerated', () => {
    const counts = { 1: 3, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    const effects = getRepetitionEffects(counts);

    expect(effects[0].severity).toBe('exaggerated');
    expect(effects[0].effect).toBe('Chatterbox / diplomatic / introverted depending on situation');
  });

  it('should classify severity correctly - count 4+ = negative', () => {
    const counts = { 1: 4, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    const effects = getRepetitionEffects(counts);

    expect(effects[0].severity).toBe('negative');
    expect(effects[0].effect).toBe('Expressive but misunderstood in society');
  });
});

describe('Number 1 - Communicator (goal.md Section 7)', () => {
  it('should have correct effect for 1x occurrence', () => {
    const counts = { 1: 1, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    const effects = getRepetitionEffects(counts);

    expect(effects[0].effect).toContain('good communicator but finds it hard to let inner self come out');
  });

  it('should have correct effect for 2x occurrence (best)', () => {
    const counts = { 1: 2, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    const effects = getRepetitionEffects(counts);

    expect(effects[0].effect).toContain('Excellent communicator');
  });

  it('should have correct effect for 5x occurrence', () => {
    const counts = { 1: 5, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    const effects = getRepetitionEffects(counts);

    expect(effects[0].effect).toContain('scandals/controversies');
    expect(effects[0].effect).toContain('big name & fame');
  });
});

describe('Number 2 - Intuitive (goal.md Section 7)', () => {
  it('should have correct effect for 1x occurrence', () => {
    const counts = { 1: 0, 2: 1, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    const effects = getRepetitionEffects(counts);

    expect(effects[0].effect).toContain('Sensitive & intuitive but may not use it');
  });

  it('should have correct effect for 2x occurrence', () => {
    const counts = { 1: 0, 2: 2, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    const effects = getRepetitionEffects(counts);

    expect(effects[0].effect).toContain('Highly intelligent, sensitive & intuitive');
  });

  it('should have correct effect for 3x occurrence', () => {
    const counts = { 1: 0, 2: 3, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    const effects = getRepetitionEffects(counts);

    expect(effects[0].effect).toContain('Over-sensitive');
  });

  it('should warn about depression for 4x with driver 2,4,8,9', () => {
    const counts = { 1: 0, 2: 4, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    const effects = getRepetitionEffects(counts);

    expect(effects[0].effect).toContain('depression');
    expect(effects[0].effect).toContain('driver is 2,4,8,9');
  });
});

describe('Number 7 - Disappointments (goal.md Section 7)', () => {
  it('should indicate disappointment even with 1x occurrence', () => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 1, 8: 0, 9: 0 };
    const effects = getRepetitionEffects(counts);

    expect(effects[0].effect).toContain('Disappointment');
  });

  it('should have special note for 7 with count 1', () => {
    const note = getSpecialRepetitionNotes(7, 1);
    expect(note).toContain('Disappointment even one time is OK');
    expect(note).toContain('do not increase disappointment');
  });

  it('should warn about marriage problems with 3x occurrence', () => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 3, 8: 0, 9: 0 };
    const effects = getRepetitionEffects(counts);

    expect(effects[0].effect).toContain('Marriage may be a problem');
  });

  it('should advise avoiding partnerships with 4x occurrence', () => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 4, 8: 0, 9: 0 };
    const effects = getRepetitionEffects(counts);

    expect(effects[0].effect).toContain('Partnership & business should be avoided');
  });
});

describe('Number 4 & 8 - Struggling Numbers (goal.md Section 7)', () => {
  it('should note that 4 is a struggling number even with 1x', () => {
    const note = getSpecialRepetitionNotes(4, 1);
    expect(note).toContain('Struggling number');
    expect(note).toContain('Even one time is same as a pair');
  });

  it('should note that 8 is a struggling number even with 1x', () => {
    const note = getSpecialRepetitionNotes(8, 1);
    expect(note).toContain('Struggling number');
  });

  it('should show aggressive behavior for 4 with 4x occurrence', () => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 4, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    const effects = getRepetitionEffects(counts);

    expect(effects[0].effect).toContain('Aggressive behavior');
    expect(effects[0].effect).toContain('Destructive');
  });

  it('should warn about loan defaults for 8 with 3x occurrence', () => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 3, 9: 0 };
    const effects = getRepetitionEffects(counts);

    expect(effects[0].effect).toContain('loan default');
    expect(effects[0].effect).toContain('bad money managers');
  });
});

describe('Number 9 - Humanitarian (goal.md Section 7)', () => {
  it('should be positive for 1x occurrence', () => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 1 };
    const effects = getRepetitionEffects(counts);

    expect(effects[0].effect).toBe('Intelligent and humanitarian');
  });

  it('should show ego for 2x occurrence', () => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 2 };
    const effects = getRepetitionEffects(counts);

    expect(effects[0].effect).toContain('Egoist');
  });

  it('should warn about marriage difficulty for 5x occurrence', () => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 5 };
    const effects = getRepetitionEffects(counts);

    expect(effects[0].effect).toContain('Do not marry double-9 persons');
  });
});

describe('getMostRepeatedNumber', () => {
  it('should return the number with highest count', () => {
    const counts = { 1: 2, 2: 0, 3: 1, 4: 0, 5: 0, 6: 0, 7: 0, 8: 3, 9: 1 };
    const result = getMostRepeatedNumber(counts);

    expect(result).not.toBeNull();
    expect(result?.number).toBe(8);
    expect(result?.count).toBe(3);
  });

  it('should return null if all counts are zero', () => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    const result = getMostRepeatedNumber(counts);

    expect(result).toBeNull();
  });

  it('should return first number if multiple have same max count', () => {
    const counts = { 1: 2, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 2, 9: 0 };
    const result = getMostRepeatedNumber(counts);

    expect(result?.count).toBe(2);
    expect([1, 8]).toContain(result?.number);
  });
});
