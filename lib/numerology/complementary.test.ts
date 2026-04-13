/**
 * Unit Tests for Complementary Numbers
 * Based on goal.md Section 9: Complementary Numbers
 *
 * Key concept: Only GOOD qualities are complemented, not bad ones.
 * Example: For 7, the number 3 will support spirituality but not depression.
 */

import { describe, it, expect } from 'vitest';
import {
  analyzeComplementary,
  hasUniversalSupport,
  getComplementaryNote,
  COMPLEMENTARY_NUMBERS,
} from './complementary';

describe('COMPLEMENTARY_NUMBERS mapping from goal.md', () => {
  it('should have 1 complemented by 9', () => {
    expect(COMPLEMENTARY_NUMBERS[1].complements).toEqual([9]);
  });

  it('should have 2 complemented by 5, 7', () => {
    expect(COMPLEMENTARY_NUMBERS[2].complements).toEqual([5, 7]);
  });

  it('should have 3 complemented by 5, 7', () => {
    expect(COMPLEMENTARY_NUMBERS[3].complements).toEqual([5, 7]);
    expect(COMPLEMENTARY_NUMBERS[3].note).toContain('Spiritual, healing');
  });

  it('should have 4 complemented by 8', () => {
    expect(COMPLEMENTARY_NUMBERS[4].complements).toEqual([8]);
  });

  it('should have 5 with no complements (universal support)', () => {
    expect(COMPLEMENTARY_NUMBERS[5].complements).toEqual([]);
    expect(COMPLEMENTARY_NUMBERS[5].note).toContain('Universal support');
  });

  it('should have 6 complemented by 5', () => {
    expect(COMPLEMENTARY_NUMBERS[6].complements).toEqual([5]);
  });

  it('should have 7 complemented by 3', () => {
    expect(COMPLEMENTARY_NUMBERS[7].complements).toEqual([3]);
    expect(COMPLEMENTARY_NUMBERS[7].note).toContain('Spiritual');
  });

  it('should have 8 complemented by 4, 5', () => {
    expect(COMPLEMENTARY_NUMBERS[8].complements).toEqual([4, 5]);
    expect(COMPLEMENTARY_NUMBERS[8].note).toContain('discipline');
    expect(COMPLEMENTARY_NUMBERS[8].note).toContain('balance');
  });

  it('should have 9 complemented by 1', () => {
    expect(COMPLEMENTARY_NUMBERS[9].complements).toEqual([1]);
  });
});

describe('analyzeComplementary', () => {
  it('should find full support when all complements present', () => {
    const missing = [1]; // 1 needs 9
    const present = [9, 5, 7];
    const analysis = analyzeComplementary(missing, present);

    expect(analysis[0].missing).toBe(1);
    expect(analysis[0].complementsNeeded).toEqual([9]);
    expect(analysis[0].complementsPresent).toEqual([9]);
    expect(analysis[0].isSupported).toBe(true);
    expect(analysis[0].supportLevel).toBe('full');
  });

  it('should find partial support when some complements present', () => {
    const missing = [2]; // 2 needs 5 and 7
    const present = [5, 1, 3]; // Has 5 but not 7
    const analysis = analyzeComplementary(missing, present);

    expect(analysis[0].missing).toBe(2);
    expect(analysis[0].complementsNeeded).toEqual([5, 7]);
    expect(analysis[0].complementsPresent).toEqual([5]);
    expect(analysis[0].isSupported).toBe(true);
    expect(analysis[0].supportLevel).toBe('partial');
  });

  it('should find no support when no complements present', () => {
    const missing = [4]; // 4 needs 8
    const present = [1, 2, 3, 5, 6, 7, 9]; // Has everything except 4 and 8
    const analysis = analyzeComplementary(missing, present);

    expect(analysis[0].missing).toBe(4);
    expect(analysis[0].complementsNeeded).toEqual([8]);
    expect(analysis[0].complementsPresent).toEqual([]);
    expect(analysis[0].isSupported).toBe(false);
    expect(analysis[0].supportLevel).toBe('none');
  });

  it('should analyze multiple missing numbers', () => {
    const missing = [1, 2, 3]; // Multiple missing
    const present = [9, 5, 7]; // 9 supports 1, 5+7 support 2 and 3
    const analysis = analyzeComplementary(missing, present);

    expect(analysis.length).toBe(3);

    // Check 1 is fully supported by 9
    const analysis1 = analysis.find(a => a.missing === 1);
    expect(analysis1?.supportLevel).toBe('full');

    // Check 2 is fully supported by 5 and 7
    const analysis2 = analysis.find(a => a.missing === 2);
    expect(analysis2?.supportLevel).toBe('full');

    // Check 3 is fully supported by 5 and 7
    const analysis3 = analysis.find(a => a.missing === 3);
    expect(analysis3?.supportLevel).toBe('full');
  });

  it('should handle case from goal.md - 7 supported by 3', () => {
    const missing = [7]; // 7 needs 3
    const present = [3, 1, 5];
    const analysis = analyzeComplementary(missing, present);

    expect(analysis[0].missing).toBe(7);
    expect(analysis[0].complementsNeeded).toEqual([3]);
    expect(analysis[0].complementsPresent).toEqual([3]);
    expect(analysis[0].isSupported).toBe(true);
    expect(analysis[0].supportLevel).toBe('full');
  });

  it('should note that 3 supports 7 spiritually but not depression', () => {
    // This is conceptual - the note explains the limitation
    const note = getComplementaryNote(7);
    expect(note).toContain('Spiritual');
  });
});

describe('hasUniversalSupport', () => {
  it('should return true when 5 is present', () => {
    const present = [1, 3, 5, 7];
    expect(hasUniversalSupport(present)).toBe(true);
  });

  it('should return false when 5 is missing', () => {
    const present = [1, 2, 3, 4, 6, 7, 8, 9];
    expect(hasUniversalSupport(present)).toBe(false);
  });

  it('should recognize 5 as universal support per goal.md', () => {
    const note = getComplementaryNote(5);
    expect(note).toContain('Universal support');
    expect(note).toContain('great support for all numbers');
  });
});

describe('getComplementaryNote', () => {
  it('should return note for number 5 - universal support', () => {
    const note = getComplementaryNote(5);
    expect(note).toContain('Universal support');
  });

  it('should return note for number 3 - spiritual, healing', () => {
    const note = getComplementaryNote(3);
    expect(note).toBe('Spiritual, healing');
  });

  it('should return note for number 8 - discipline and balance', () => {
    const note = getComplementaryNote(8);
    expect(note).toContain('discipline');
    expect(note).toContain('balance');
  });

  it('should return empty string or note for numbers without specific notes', () => {
    const note = getComplementaryNote(2);
    expect(typeof note).toBe('string');
  });
});

describe('Bidirectional complementary relationships from goal.md', () => {
  it('should confirm 1 and 9 complement each other', () => {
    expect(COMPLEMENTARY_NUMBERS[1].complements).toContain(9);
    expect(COMPLEMENTARY_NUMBERS[9].complements).toContain(1);
  });

  it('should confirm 4 and 8 complement each other', () => {
    expect(COMPLEMENTARY_NUMBERS[4].complements).toContain(8);
    expect(COMPLEMENTARY_NUMBERS[8].complements).toContain(4);
  });

  it('should note that 7 needs 3 but 3 needs 5 or 7', () => {
    expect(COMPLEMENTARY_NUMBERS[7].complements).toEqual([3]);
    expect(COMPLEMENTARY_NUMBERS[3].complements).toEqual([5, 7]);
  });
});

describe('Special case: Number 5 provides universal support', () => {
  it('should support all missing numbers when 5 is present', () => {
    const missing = [1, 2, 3, 4, 6, 7, 8, 9];
    const present = [5];

    // While 5 doesn't complement all numbers directly,
    // it provides universal support according to goal.md
    const hasSupport = hasUniversalSupport(present);
    expect(hasSupport).toBe(true);
  });

  it('should note 5 guides towards will, success & prosperity', () => {
    const note = getComplementaryNote(5);
    expect(note).toContain('will');
    expect(note).toContain('success');
    expect(note).toContain('prosperity');
  });
});

describe('Edge cases', () => {
  it('should handle empty missing array', () => {
    const missing: number[] = [];
    const present = [1, 2, 3];
    const analysis = analyzeComplementary(missing, present);

    expect(analysis).toEqual([]);
  });

  it('should handle empty present array', () => {
    const missing = [1, 2, 3];
    const present: number[] = [];
    const analysis = analyzeComplementary(missing, present);

    // All should have no support
    analysis.forEach(a => {
      expect(a.supportLevel).toBe('none');
      expect(a.isSupported).toBe(false);
    });
  });

  it('should handle case where number complements itself', () => {
    // Example: 5 is in its own complement list
    const missing = [5];
    const present = [1, 2];
    const analysis = analyzeComplementary(missing, present);

    // 5 has no complements according to goal.md
    expect(analysis[0].complementsNeeded).toEqual([]);
    // When no complements are needed but none are present, support level is 'none'
    expect(analysis[0].supportLevel).toBe('none');
  });
});
