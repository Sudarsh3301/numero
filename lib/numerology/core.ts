/**
 * Core Indian Numerology Calculations
 * Driver, Conductor, Master Numbers, Karmic Numbers, Age
 */

import type { MasterNumberResult, KarmicNumberResult } from './types';

export function parseDateParts(dob: string): { day: number; month: number; year: number } {
  const parts = dob.split(/[-/]/).map(Number);
  if (parts[0] > 1000) {
    return { year: parts[0], month: parts[1], day: parts[2] };
  }
  return { day: parts[0], month: parts[1], year: parts[2] };
}

/**
 * Reduces a number to single digit (1-9) using numerological reduction
 * @example sumReduce(38) → 3+8 = 11 → 1+1 = 2
 */
export function sumReduce(n: number): number {
  while (n > 9) {
    n = String(n)
      .split("")
      .reduce((a, b) => a + Number(b), 0);
  }
  return n;
}

/**
 * Calculates Driver number from date of birth
 * Driver = sum of day digits (primary personality)
 * @example "18/04/1986" → 18 → 1+8 = 9
 */
export function calculateDriver(dob: string): number {
  const { day } = parseDateParts(dob);
  return sumReduce(day);
}

/**
 * Calculates Conductor number from date of birth
 * Conductor = sum of ALL DOB digits (life path)
 * @example "18/04/1986" → 1+8+0+4+1+9+8+6 = 37 → 3+7 = 10 → 1+0 = 1
 */
export function calculateConductor(dob: string): number {
  const digits = dob.replace(/[-/]/g, "").split("").map(Number);
  const sum = digits.reduce((a, b) => a + b, 0);
  return sumReduce(sum);
}

/**
 * Detects Master Number using both horizontal and vertical methods
 * Master Numbers: 11, 22, 33
 * Strength: 100% if both methods agree, 50% if only one method
 */
export function detectMasterNumber(dob: string): MasterNumberResult {
  const horizontal = calculateHorizontalMaster(dob);
  const vertical = calculateVerticalMaster(dob);

  if (horizontal && vertical && horizontal === vertical) {
    return { isMaster: true, number: horizontal, strength: 100, method: 'both' };
  }
  if (horizontal) {
    return { isMaster: true, number: horizontal, strength: 50, method: 'horizontal' };
  }
  if (vertical) {
    return { isMaster: true, number: vertical, strength: 50, method: 'vertical' };
  }
  return { isMaster: false, number: null, strength: 0, method: null };
}

/**
 * Horizontal method: add all digits of full date
 * @example 29/02/1955 → 2+9+0+2+1+9+5+5 = 33
 */
function calculateHorizontalMaster(dob: string): 11 | 22 | 33 | null {
  const digits = dob.replace(/[-/]/g, "").split("").map(Number);
  const sum = digits.reduce((a, b) => a + b, 0);

  if (sum === 11 || sum === 22 || sum === 33) {
    return sum as 11 | 22 | 33;
  }

  // Check intermediate sums (e.g., 38 = 3+8 = 11)
  if (sum > 33) {
    const reduced = sumReduce(sum);
    // Re-check if reduction path goes through master number
    let temp = sum;
    while (temp > 33) {
      const digits = String(temp).split("").map(Number);
      temp = digits.reduce((a, b) => a + b, 0);
      if (temp === 11 || temp === 22 || temp === 33) {
        return temp as 11 | 22 | 33;
      }
    }
  }

  return null;
}

/**
 * Vertical method: add each date component column by column
 * @example
 *   1  8
 *   0  4
 *   1  9  8  6
 *   ------------
 *   2  2  1  0  = 22+10 = 32 or check columnar pattern
 */
function calculateVerticalMaster(dob: string): 11 | 22 | 33 | null {
  const { day, month, year } = parseDateParts(dob);

  // Split into digits
  const dayDigits = String(day).padStart(2, '0').split('').map(Number);
  const monthDigits = String(month).padStart(2, '0').split('').map(Number);
  const yearDigits = String(year).split('').map(Number);

  // Vertical addition (column by column from right to left)
  const maxLen = Math.max(dayDigits.length, monthDigits.length, yearDigits.length);

  let columnSum = 0;
  for (let i = 0; i < maxLen; i++) {
    const d = dayDigits[dayDigits.length - 1 - i] || 0;
    const m = monthDigits[monthDigits.length - 1 - i] || 0;
    const y = yearDigits[yearDigits.length - 1 - i] || 0;
    columnSum += d + m + y;
  }

  if (columnSum === 11 || columnSum === 22 || columnSum === 33) {
    return columnSum as 11 | 22 | 33;
  }

  // Also check the raw sum before reduction
  const allDigitsSum = String(day + month + year)
    .split("")
    .map(Number)
    .reduce((a, b) => a + b, 0);

  if (allDigitsSum === 11 || allDigitsSum === 22 || allDigitsSum === 33) {
    return allDigitsSum as 11 | 22 | 33;
  }

  return null;
}

/**
 * Detects Karmic Numbers in DOB
 * Karmic Numbers: 10, 13, 14, 16, 19
 * Checks both driver and conductor
 */
export function detectKarmicNumber(dob: string): KarmicNumberResult {
  const { day, month, year } = parseDateParts(dob);
  const karmicNumbers: number[] = [];

  // Check day
  if ([10, 13, 14, 16, 19].includes(day)) {
    karmicNumbers.push(day);
  }

  // Check month
  if ([10, 13, 14, 16, 19].includes(month)) {
    karmicNumbers.push(month);
  }

  // Check conductor (sum of all digits before reduction)
  const allDigitsSum = dob
    .replace(/[-/]/g, "")
    .split("")
    .map(Number)
    .reduce((a, b) => a + b, 0);

  if ([10, 13, 14, 16, 19].includes(allDigitsSum)) {
    if (!karmicNumbers.includes(allDigitsSum)) {
      karmicNumbers.push(allDigitsSum);
    }
  }

  // Check intermediate sums in conductor calculation
  let temp = allDigitsSum;
  while (temp > 19) {
    temp = sumReduce(temp);
    if ([10, 13, 14, 16, 19].includes(temp) && !karmicNumbers.includes(temp)) {
      karmicNumbers.push(temp);
    }
  }

  const meanings = karmicNumbers.map((n) => getKarmicMeaning(n));

  return {
    hasKarmic: karmicNumbers.length > 0,
    numbers: karmicNumbers,
    meanings,
  };
}

/**
 * Returns meaning for each karmic number (from goal.md Section 11)
 */
function getKarmicMeaning(num: number): string {
  const karmicMeanings: Record<number, string> = {
    10: "Clean slate. Must do everything yourself. Self-made. Zero balance sheet - life of struggle.",
    13: "All work, no play. Associated with destruction. Due to previous birth. If good deeds done, can lead to good results.",
    14: "Abuse of freedom (most powerful). Fraud/scams/cheating/smuggling/manipulation. Can impact family members and next life.",
    16: "Abuse of the power of love. Divorce, extra-marital affairs, multiple families, domestic violence.",
    19: "Abuse of positional power. Misuse of power (ministers/CEOs/MDs) for personal benefit.",
  };

  return karmicMeanings[num] || "Unknown karmic number";
}

/**
 * Calculates current age from date of birth
 * Used to determine health governance (Driver <40, Conductor ≥40)
 */
export function calculateAge(dob: string): number {
  const { day, month, year } = parseDateParts(dob);
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}
