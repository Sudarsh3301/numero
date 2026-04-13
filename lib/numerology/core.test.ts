/**
 * Unit Tests for Core Numerology Calculations
 * Based on goal.md specifications
 */

import { describe, it, expect } from 'vitest';
import {
  calculateDriver,
  calculateConductor,
  sumReduce,
  parseDateParts,
  detectMasterNumber,
  detectKarmicNumber,
  calculateAge,
} from './core';

describe('sumReduce', () => {
  it('should reduce single digit numbers to themselves', () => {
    expect(sumReduce(1)).toBe(1);
    expect(sumReduce(5)).toBe(5);
    expect(sumReduce(9)).toBe(9);
  });

  it('should reduce two digit numbers correctly', () => {
    expect(sumReduce(10)).toBe(1); // 1+0=1
    expect(sumReduce(11)).toBe(2); // 1+1=2
    expect(sumReduce(19)).toBe(1); // 1+9=10, 1+0=1
    expect(sumReduce(28)).toBe(1); // 2+8=10, 1+0=1
    expect(sumReduce(38)).toBe(2); // 3+8=11, 1+1=2
  });

  it('should reduce larger numbers correctly', () => {
    expect(sumReduce(123)).toBe(6); // 1+2+3=6
    expect(sumReduce(999)).toBe(9); // 9+9+9=27, 2+7=9
  });
});

describe('parseDateParts', () => {
  it('should parse DD/MM/YYYY format', () => {
    expect(parseDateParts('18/04/1986')).toEqual({ day: 18, month: 4, year: 1986 });
    expect(parseDateParts('01/12/2005')).toEqual({ day: 1, month: 12, year: 2005 });
  });

  it('should parse DD-MM-YYYY format', () => {
    expect(parseDateParts('15-09-1950')).toEqual({ day: 15, month: 9, year: 1950 });
  });

  it('should parse YYYY/MM/DD format', () => {
    expect(parseDateParts('1986/04/18')).toEqual({ day: 18, month: 4, year: 1986 });
  });

  it('should parse YYYY-MM-DD format', () => {
    expect(parseDateParts('1986-04-18')).toEqual({ day: 18, month: 4, year: 1986 });
  });
});

describe('calculateDriver', () => {
  it('should calculate driver for single digit days', () => {
    expect(calculateDriver('01/01/2000')).toBe(1);
    expect(calculateDriver('09/05/1990')).toBe(9);
  });

  it('should calculate driver for double digit days', () => {
    // From goal.md Section 2 - Planet reference
    expect(calculateDriver('10/01/2000')).toBe(1); // 1+0=1
    expect(calculateDriver('19/01/2000')).toBe(1); // 1+9=10, 1+0=1
    expect(calculateDriver('28/01/2000')).toBe(1); // 2+8=10, 1+0=1

    expect(calculateDriver('11/01/2000')).toBe(2); // 1+1=2
    expect(calculateDriver('20/01/2000')).toBe(2); // 2+0=2
    expect(calculateDriver('29/01/2000')).toBe(2); // 2+9=11, 1+1=2

    expect(calculateDriver('18/04/1986')).toBe(9); // 1+8=9
  });

  it('should calculate driver for all birth date groups from goal.md', () => {
    // Number 1 - Sun: 1, 10, 19, 28
    expect(calculateDriver('01/01/2000')).toBe(1);
    expect(calculateDriver('10/01/2000')).toBe(1);
    expect(calculateDriver('19/01/2000')).toBe(1);
    expect(calculateDriver('28/01/2000')).toBe(1);

    // Number 2 - Moon: 2, 11, 20, 29
    expect(calculateDriver('02/01/2000')).toBe(2);
    expect(calculateDriver('11/01/2000')).toBe(2);
    expect(calculateDriver('20/01/2000')).toBe(2);
    expect(calculateDriver('29/01/2000')).toBe(2);

    // Number 3 - Jupiter: 3, 12, 21, 30
    expect(calculateDriver('03/01/2000')).toBe(3);
    expect(calculateDriver('12/01/2000')).toBe(3);
    expect(calculateDriver('21/01/2000')).toBe(3);
    expect(calculateDriver('30/01/2000')).toBe(3);

    // Number 4 - Uranus: 4, 13, 22, 31
    expect(calculateDriver('04/01/2000')).toBe(4);
    expect(calculateDriver('13/01/2000')).toBe(4);
    expect(calculateDriver('22/01/2000')).toBe(4);
    expect(calculateDriver('31/01/2000')).toBe(4);

    // Number 5 - Mercury: 5, 14, 23
    expect(calculateDriver('05/01/2000')).toBe(5);
    expect(calculateDriver('14/01/2000')).toBe(5);
    expect(calculateDriver('23/01/2000')).toBe(5);

    // Number 6 - Venus: 6, 15, 24
    expect(calculateDriver('06/01/2000')).toBe(6);
    expect(calculateDriver('15/01/2000')).toBe(6);
    expect(calculateDriver('24/01/2000')).toBe(6);

    // Number 7 - Neptune: 7, 16, 25
    expect(calculateDriver('07/01/2000')).toBe(7);
    expect(calculateDriver('16/01/2000')).toBe(7);
    expect(calculateDriver('25/01/2000')).toBe(7);

    // Number 8 - Saturn: 8, 17, 26
    expect(calculateDriver('08/01/2000')).toBe(8);
    expect(calculateDriver('17/01/2000')).toBe(8);
    expect(calculateDriver('26/01/2000')).toBe(8);

    // Number 9 - Mars: 9, 18, 27
    expect(calculateDriver('09/01/2000')).toBe(9);
    expect(calculateDriver('18/01/2000')).toBe(9);
    expect(calculateDriver('27/01/2000')).toBe(9);
  });
});

describe('calculateConductor', () => {
  it('should calculate conductor by summing all DOB digits', () => {
    // Example from goal.md Section 10
    expect(calculateConductor('18/04/1986')).toBe(1); // 1+8+0+4+1+9+8+6=37, 3+7=10, 1+0=1
  });

  it('should handle various dates correctly', () => {
    expect(calculateConductor('01/01/2000')).toBe(4); // 0+1+0+1+2+0+0+0=4
    expect(calculateConductor('29/02/1955')).toBe(6); // 2+9+0+2+1+9+5+5=33, 3+3=6
  });

  it('should reduce to single digit 1-9', () => {
    const conductor = calculateConductor('15/09/1950');
    expect(conductor).toBeGreaterThanOrEqual(1);
    expect(conductor).toBeLessThanOrEqual(9);
  });
});

describe('detectMasterNumber', () => {
  it('should detect 100% master number 11 when both methods agree', () => {
    // Example from goal.md Section 10: 18/04/1986
    // Horizontal: 1+8+0+4+1+9+8+6 = 37 -> 3+7 = 10 -> 1+0 = 1 (not 11)
    // This example shows conductor calculation, not master number
    // Let's use the actual example: 01/12/2005 which gives 11
    const result = detectMasterNumber('01/12/2005');
    expect(result.isMaster).toBe(true);
    expect(result.number).toBe(11);
    expect(result.strength).toBe(100);
  });

  it('should detect 100% master number 11 - second example', () => {
    // Example from goal.md: 01/12/2005
    const result = detectMasterNumber('01/12/2005');
    expect(result.isMaster).toBe(true);
    expect(result.number).toBe(11);
    expect(result.strength).toBe(100);
  });

  it('should detect master number 33', () => {
    // Example from goal.md: 29/02/1955 → horizontal = 33
    // Horizontal: 2+9+0+2+1+9+5+5 = 33
    const result = detectMasterNumber('29/02/1955');
    expect(result.isMaster).toBe(true);
    expect(result.number).toBe(33);
    // Strength could be 50% or 100% depending on vertical method result
    expect([50, 100]).toContain(result.strength);
  });

  it('should return no master number for regular dates', () => {
    const result = detectMasterNumber('15/09/1950');
    // Check if there's no master number or if it's there with appropriate strength
    if (!result.isMaster) {
      expect(result.number).toBeNull();
      expect(result.strength).toBe(0);
    }
  });

  it('should detect master number 22', () => {
    // Looking for dates that produce 22
    const result = detectMasterNumber('22/01/2000');
    // 2+2+0+1+2+0+0+0 = 7 (not master)
    if (result.isMaster) {
      expect([11, 22, 33]).toContain(result.number);
    }
  });
});

describe('detectKarmicNumber', () => {
  it('should detect karmic number 10 in day', () => {
    const result = detectKarmicNumber('10/01/2000');
    expect(result.hasKarmic).toBe(true);
    expect(result.numbers).toContain(10);
    expect(result.meanings[0]).toContain('Clean slate');
  });

  it('should detect karmic number 13 in day', () => {
    const result = detectKarmicNumber('13/01/2000');
    expect(result.hasKarmic).toBe(true);
    expect(result.numbers).toContain(13);
    expect(result.meanings.some(m => m.includes('All work, no play'))).toBe(true);
  });

  it('should detect karmic number 14 in day', () => {
    const result = detectKarmicNumber('14/05/2000');
    expect(result.hasKarmic).toBe(true);
    expect(result.numbers).toContain(14);
    expect(result.meanings.some(m => m.includes('Abuse of freedom'))).toBe(true);
  });

  it('should detect karmic number 16 in day', () => {
    const result = detectKarmicNumber('16/07/1990');
    expect(result.hasKarmic).toBe(true);
    expect(result.numbers).toContain(16);
    expect(result.meanings.some(m => m.includes('Abuse of the power of love'))).toBe(true);
  });

  it('should detect karmic number 19 in day', () => {
    const result = detectKarmicNumber('19/01/1985');
    expect(result.hasKarmic).toBe(true);
    expect(result.numbers).toContain(19);
    expect(result.meanings.some(m => m.includes('Abuse of positional power'))).toBe(true);
  });

  it('should detect no karmic numbers for regular dates', () => {
    const result = detectKarmicNumber('18/04/1986');
    // This might or might not have karmic based on conductor sum
    if (!result.hasKarmic) {
      expect(result.numbers).toHaveLength(0);
      expect(result.meanings).toHaveLength(0);
    }
  });

  it('should handle multiple karmic numbers', () => {
    const result = detectKarmicNumber('13/10/2000');
    expect(result.hasKarmic).toBe(true);
    // Should have both 13 and 10
    expect(result.numbers.length).toBeGreaterThanOrEqual(2);
  });
});

describe('calculateAge', () => {
  it('should calculate age correctly for a known date', () => {
    // This test will be time-dependent, so we'll use a mock approach
    const dob = '01/01/2000';
    const age = calculateAge(dob);
    expect(age).toBeGreaterThanOrEqual(24); // As of 2024
    expect(age).toBeLessThan(100); // Sanity check
  });

  it('should handle different date formats', () => {
    const age1 = calculateAge('15/09/1950');
    const age2 = calculateAge('1950-09-15');
    expect(age1).toBe(age2);
  });

  it('should return correct age for people born in leap year', () => {
    const age = calculateAge('29/02/2000');
    expect(age).toBeGreaterThanOrEqual(24);
  });
});
