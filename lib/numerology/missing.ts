/**
 * Missing Number Effects
 * Based on goal.md Section 8: Missing Numbers — Effects
 *
 * Each missing number indicates a psychological gap or weakness
 * Some missing numbers break planes (Thought, Mental, Rajyog, etc.)
 */

import type { MissingEffect } from './types';
import { getPlanetAssociation } from './planets';

/**
 * Get effects for all missing numbers
 */
export function getMissingEffects(missing: number[]): MissingEffect[] {
  return missing.map(num => getMissingEffectForNumber(num));
}

/**
 * Get effect for a specific missing number
 */
function getMissingEffectForNumber(number: number): MissingEffect {
  const planet = getPlanetAssociation(number);
  const effect = MISSING_EFFECTS[number];

  return {
    number,
    planet: planet.name,
    effect: effect.effect,
    brokenPlanes: effect.brokenPlanes || []
  };
}

/**
 * Missing number effects database from goal.md Section 8
 */
const MISSING_EFFECTS: Record<number, { effect: string; brokenPlanes?: string[] }> = {
  1: {
    effect: "Very difficult to express themselves. Child may start talking very late. Egoless, easy to mix with others, supports others, low self-esteem. May stammer at early age.",
    brokenPlanes: []
  },
  2: {
    effect: "Lack sensitivity and intuition. May not care for others' feelings. Might pass own faults on others. Does not believe their intuitions. May not admit own faults.",
    brokenPlanes: []
  },
  3: {
    effect: "Low creativity and imagination. Surrenders easily. May choose the wrong profession.",
    brokenPlanes: []
  },
  4: {
    effect: "Not disciplined, not organized, not punctual, does not value time. Three planes — Thought, Mental & Rajyog — are broken. Consistent struggle.",
    brokenPlanes: ["Thought Plane", "Mental Plane", "Golden Plane (Rajyog-1)"]
  },
  5: {
    effect: "Lacks balance in every sphere. Lacks drive and versatility to achieve goals.",
    brokenPlanes: ["Will Plane", "Emotional Plane", "Silver Plane (Rajyog-2)", "All Primary Arrows"]
  },
  6: {
    effect: "Poor bonding. Family members do not respect them. If husband & wife both missing 6 — will not be close. If 5 & 4 also missing — even worse. Will not get societal support. Make arrangements for own retirement — no one will be there to help. Can face marriage problems, disturbed relationships including with parents, siblings, wife, children.",
    brokenPlanes: ["Action Plane", "Golden Plane (Rajyog-1)"]
  },
  7: {
    effect: "Lack of spirituality, religion, occult. May not care for others' feelings. Might lack good / required / desired education.",
    brokenPlanes: []
  },
  8: {
    effect: "Miss good financial management. Spendthrift.",
    brokenPlanes: ["Thought Plane", "Practical Plane", "Silver Plane (Rajyog-2)"]
  },
  9: {
    effect: "Overlooks others' feelings. Lacks energy. Lacks humanitarian feelings.",
    brokenPlanes: ["Mental Plane", "Will Plane"]
  }
};

/**
 * Check if critical numbers are missing
 * Critical combinations that severely impact life
 */
export function checkCriticalMissing(missing: number[]): string[] {
  const warnings: string[] = [];

  // Missing 4: Breaks three planes
  if (missing.includes(4)) {
    warnings.push("Missing 4 breaks THREE critical planes: Thought, Mental & Golden Rajyog");
  }

  // Missing 5: Breaks multiple planes and all arrows
  if (missing.includes(5)) {
    warnings.push("Missing 5 is CRITICAL - breaks balance in all spheres and disables primary arrows");
  }

  // Missing 6: Family and relationship issues
  if (missing.includes(6)) {
    warnings.push("Missing 6 causes poor family bonding and relationship problems");
  }

  // Missing 5 & 6 together
  if (missing.includes(5) && missing.includes(6)) {
    warnings.push("Missing BOTH 5 & 6 is severe - lack of balance AND poor relationships");
  }

  // Missing 4, 5 & 6 together
  if (missing.includes(4) && missing.includes(5) && missing.includes(6)) {
    warnings.push("Missing 4, 5 & 6 together - make arrangements for own retirement, no one will help");
  }

  // Missing 8: Financial management issues
  if (missing.includes(8)) {
    warnings.push("Missing 8 indicates poor financial management - tendency to overspend");
  }

  return warnings;
}

/**
 * Get broken planes for the missing numbers
 * Planes can only be complete if all 3 numbers are present
 */
export function getBrokenPlanes(missing: number[]): string[] {
  const broken: string[] = [];

  // Mental Plane: 4, 9, 2
  if (missing.includes(4) || missing.includes(9) || missing.includes(2)) {
    broken.push("Mental Plane (4-9-2)");
  }

  // Emotional Plane: 3, 5, 7
  if (missing.includes(3) || missing.includes(5) || missing.includes(7)) {
    broken.push("Emotional Plane (3-5-7)");
  }

  // Practical Plane: 8, 1, 6
  if (missing.includes(8) || missing.includes(1) || missing.includes(6)) {
    broken.push("Practical Plane (8-1-6)");
  }

  // Thought Plane: 4, 3, 8
  if (missing.includes(4) || missing.includes(3) || missing.includes(8)) {
    broken.push("Thought Plane (4-3-8)");
  }

  // Will Plane (Golden Arrow): 1, 5, 9
  if (missing.includes(1) || missing.includes(5) || missing.includes(9)) {
    broken.push("Will Plane / Staff of Will (1-5-9)");
  }

  // Action Plane: 2, 7, 6
  if (missing.includes(2) || missing.includes(7) || missing.includes(6)) {
    broken.push("Action Plane (2-7-6)");
  }

  // Golden Plane (Rajyog-1): 4, 5, 6
  if (missing.includes(4) || missing.includes(5) || missing.includes(6)) {
    broken.push("Golden Plane / Arrow of Compassion (4-5-6)");
  }

  // Silver Plane (Rajyog-2): 2, 5, 8
  if (missing.includes(2) || missing.includes(5) || missing.includes(8)) {
    broken.push("Silver Plane / Arrow of Activity (2-5-8)");
  }

  return broken;
}

/**
 * Get complementary numbers that can support missing numbers
 * From goal.md Section 9: Complementary Numbers
 */
export function getComplementaryNumbers(number: number): number[] {
  const complementary: Record<number, number[]> = {
    1: [9],
    2: [5, 7],
    3: [5, 7],
    4: [8],
    5: [], // No complement - 5 is the balancer itself
    6: [5], // Partially
    7: [3], // Spiritual/healing support only (not depression)
    8: [4, 5], // 4=discipline, 5=balance
    9: [1]
  };

  return complementary[number] || [];
}

/**
 * Check if missing number can be compensated by present complementary numbers
 */
export function canBeCompensated(missingNumber: number, present: number[]): boolean {
  const complements = getComplementaryNumbers(missingNumber);

  if (complements.length === 0) {
    return false; // Cannot be compensated (e.g., missing 5)
  }

  // Check if any complementary number is present
  return complements.some(comp => present.includes(comp));
}

/**
 * Special note: Number 5 is the key
 * "If 5 is present — great support for all numbers; guides towards will, success & prosperity"
 */
export function isFivePresent(present: number[]): boolean {
  return present.includes(5);
}

/**
 * Get severity level for missing numbers
 */
export function getMissingSeverity(missing: number[]): 'low' | 'medium' | 'high' | 'critical' {
  // Critical: Missing 5 or (4, 5, 6)
  if (missing.includes(5)) {
    return 'critical';
  }

  if (missing.includes(4) && missing.includes(6)) {
    return 'critical';
  }

  // High: Missing 4, 6, or 8
  if (missing.includes(4) || missing.includes(6) || missing.includes(8)) {
    return 'high';
  }

  // Medium: Missing 2, 3, or 9
  if (missing.includes(2) || missing.includes(3) || missing.includes(9)) {
    return 'medium';
  }

  // Low: Missing 1 or 7
  return 'low';
}
