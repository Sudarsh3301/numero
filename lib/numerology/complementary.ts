/**
 * Complementary Numbers
 *
 * Analyzes which present numbers in the Lo Shu grid can support
 * and complement missing numbers.
 *
 * Source: goal.md Section 9 - Complementary Numbers
 *
 * Key concept: Only GOOD qualities are complemented, not bad ones.
 * Example: For 7, the number 3 will support spirituality but not depression.
 */

export interface ComplementaryRelation {
  number: number;
  complements: number[];
  note: string;
}

/**
 * Complementary number relationships
 * Each number lists which other numbers can provide complementary support
 */
export const COMPLEMENTARY_NUMBERS: Record<number, ComplementaryRelation> = {
  1: {
    number: 1,
    complements: [9],
    note: "Qualities of 1 present in 9 will complement"
  },
  2: {
    number: 2,
    complements: [5, 7],
    note: ""
  },
  3: {
    number: 3,
    complements: [5, 7],
    note: "Spiritual, healing"
  },
  4: {
    number: 4,
    complements: [8],
    note: "Discipline"
  },
  5: {
    number: 5,
    complements: [],
    note: "Universal support - if 5 is present, great support for all numbers; guides towards will, success & prosperity"
  },
  6: {
    number: 6,
    complements: [5],
    note: "Balance / materialistic support"
  },
  7: {
    number: 7,
    complements: [3],
    note: "Spiritual, healing support"
  },
  8: {
    number: 8,
    complements: [4, 5],
    note: "4 = discipline; 5 = balance"
  },
  9: {
    number: 9,
    complements: [1],
    note: ""
  }
};

export type SupportLevel = 'full' | 'partial' | 'none';

export interface ComplementaryAnalysis {
  missing: number;
  complementsNeeded: number[];
  complementsPresent: number[];
  isSupported: boolean;
  supportLevel: SupportLevel;
}

/**
 * Analyzes which missing numbers have complementary support from present numbers
 *
 * @param missing - Array of missing numbers in the Lo Shu grid
 * @param present - Array of present numbers in the Lo Shu grid
 * @returns Array of analyses showing support level for each missing number
 */
export function analyzeComplementary(
  missing: number[],
  present: number[]
): ComplementaryAnalysis[] {
  return missing.map(missingNum => {
    const relation = COMPLEMENTARY_NUMBERS[missingNum];
    const complementsPresent = relation.complements.filter(c => present.includes(c));

    const supportLevel: SupportLevel =
      complementsPresent.length === 0 ? 'none' :
      complementsPresent.length === relation.complements.length ? 'full' :
      'partial';

    return {
      missing: missingNum,
      complementsNeeded: relation.complements,
      complementsPresent,
      isSupported: complementsPresent.length > 0,
      supportLevel
    };
  });
}

/**
 * Check if number 5 is present (provides universal support)
 * @param present - Array of present numbers
 * @returns true if 5 is present
 */
export function hasUniversalSupport(present: number[]): boolean {
  return present.includes(5);
}

/**
 * Get the note for a specific number's complementary relationship
 * @param number - Number 1-9
 * @returns Note explaining the complementary relationship
 */
export function getComplementaryNote(number: number): string {
  return COMPLEMENTARY_NUMBERS[number]?.note || "";
}
