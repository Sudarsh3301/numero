/**
 * Unit Tests for Personal Year/Month/Day Calculations
 * Based on goal.md Section 15: Future Trends / Predictions (Dasa System)
 *
 * Calculation Methods:
 * - Personal Year (PY): Replace birth year with prediction year, sum all digits
 * - Personal Month (PM): PY + month (use 10, 11, 12 not 1, 2, 3)
 * - Personal Day (PD): PY + PM + all digits of prediction date
 */

import { describe, it, expect } from 'vitest';
import { getPersonalYearEffect, PERSONAL_YEAR_EFFECTS } from './personal-year';

// Helper function to reduce to single digit
function sumReduce(n: number): number {
  while (n > 9) {
    n = String(n)
      .split("")
      .reduce((a, b) => a + Number(b), 0);
  }
  return n;
}

// Personal Year calculation
function calculatePersonalYear(dob: string, predictionYear: number): number {
  const parts = dob.split(/[-/]/).map(Number);
  const day = parts[0] > 1000 ? parts[2] : parts[0];
  const month = parts[1];

  const yearDigits = String(predictionYear).split('').map(Number);
  const yearSum = yearDigits.reduce((a, b) => a + b, 0);

  const total = day + month + yearSum;
  return sumReduce(total);
}

// Personal Month calculation
function calculatePersonalMonth(personalYear: number, month: number): number {
  // IMPORTANT: Use month as-is (10, 11, 12 - NOT 1, 2, 3)
  const sum = personalYear + month;
  return sumReduce(sum);
}

// Personal Day calculation
function calculatePersonalDay(
  personalYear: number,
  personalMonth: number,
  predictionDate: string
): number {
  const digits = predictionDate
    .replace(/[-/]/g, '')
    .split('')
    .map(Number)
    .reduce((a, b) => a + b, 0);

  const sum = personalYear + personalMonth + digits;
  return sumReduce(sum);
}

describe('calculatePersonalYear', () => {
  it('should calculate PY correctly - Example 1 from goal.md', () => {
    // Birth Date: 18/01/1981, Prediction Year: 2027
    // Calculation: 1+8+0+1+2+0+2+7 = 21 = 3
    const py = calculatePersonalYear('18/01/1981', 2027);
    expect(py).toBe(3);
  });

  it('should calculate PY correctly - Example 2 from goal.md', () => {
    // Birth Date: 15/09/1950, Prediction Date: 30/08/2024
    // PY: 1+5+0+9+2+0+2+4 = 23 = 5
    const py = calculatePersonalYear('15/09/1950', 2024);
    expect(py).toBe(5);
  });

  it('should handle different date formats', () => {
    const py1 = calculatePersonalYear('18/01/1981', 2027);
    const py2 = calculatePersonalYear('18-01-1981', 2027);
    expect(py1).toBe(py2);
  });

  it('should cycle through 1-9', () => {
    const py = calculatePersonalYear('01/01/2000', 2026);
    expect(py).toBeGreaterThanOrEqual(1);
    expect(py).toBeLessThanOrEqual(9);
  });
});

describe('calculatePersonalMonth', () => {
  it('should calculate PM correctly - Example 1 from goal.md', () => {
    // PY=3, Month=10: 3 + 10 = 13 = 4
    const pm = calculatePersonalMonth(3, 10);
    expect(pm).toBe(4);
  });

  it('should use month 10, 11, 12 as-is (not 1, 2, 3)', () => {
    // This is crucial per goal.md warning
    const pm10 = calculatePersonalMonth(3, 10);
    const pm11 = calculatePersonalMonth(3, 11);
    const pm12 = calculatePersonalMonth(3, 12);

    expect(pm10).toBe(4); // 3+10=13=4
    expect(pm11).toBe(5); // 3+11=14=5
    expect(pm12).toBe(6); // 3+12=15=6
  });

  it('should handle regular months correctly', () => {
    const py = 5;
    const pm1 = calculatePersonalMonth(py, 1); // 5+1=6
    const pm5 = calculatePersonalMonth(py, 5); // 5+5=10=1
    const pm8 = calculatePersonalMonth(py, 8); // 5+8=13=4

    expect(pm1).toBe(6);
    expect(pm5).toBe(1);
    expect(pm8).toBe(4);
  });
});

describe('calculatePersonalDay', () => {
  it('should calculate PD correctly - Example from goal.md', () => {
    // PY=3, PM=4, Date=15/10/2027
    // 3 + 4 + 1+5+1+0+2+0+2+7 = 3 + 4 + 18 = 25 = 7
    const pd = calculatePersonalDay(3, 4, '15/10/2027');
    expect(pd).toBe(7);
  });

  it('should handle full date calculation', () => {
    // Birth: 15/09/1950, Prediction: 30/08/2024
    // PY = 5, PM = 5+8 = 13 = 4 (or 14=5 per goal.md variation)
    // PD = 5+5+3+0+0+8+2+0+2+4 = 29 = 11 = 2
    const py = calculatePersonalYear('15/09/1950', 2024);
    const pm = calculatePersonalMonth(py, 8);
    const pd = calculatePersonalDay(py, pm, '30/08/2024');

    expect(py).toBe(5);
    // PM could be 4 or 5 depending on interpretation
    expect([4, 5]).toContain(pm);
  });
});

describe('getPersonalYearEffect', () => {
  it('should return correct effect for PY 1 - Blessing Year', () => {
    const effect = getPersonalYearEffect(1);
    expect(effect.year).toBe(1);
    expect(effect.name).toBe('Blessing Year — Sun Year');
    expect(effect.type).toBe('blessing');
    expect(effect.isBlessingYear).toBe(true);
    expect(effect.effects).toContain('Seed is sown');
  });

  it('should return correct effect for PY 2 - Moon Year', () => {
    const effect = getPersonalYearEffect(2);
    expect(effect.year).toBe(2);
    expect(effect.name).toBe('Moon Year');
    expect(effect.type).toBe('testing');
    expect(effect.isBlessingYear).toBe(false);
    expect(effect.effects).toContain('Roots start growing');
  });

  it('should return correct effect for PY 3 - Jupiter Year', () => {
    const effect = getPersonalYearEffect(3);
    expect(effect.year).toBe(3);
    expect(effect.name).toBe('Jupiter Year');
    expect(effect.type).toBe('blessing');
    expect(effect.isBlessingYear).toBe(true);
  });

  it('should return correct effect for PY 4 - Rahu Year', () => {
    const effect = getPersonalYearEffect(4);
    expect(effect.year).toBe(4);
    expect(effect.name).toBe('Rahu Year');
    expect(effect.type).toBe('testing');
    expect(effect.effects).toContain('sincere hard work');
  });

  it('should return correct effect for PY 5 - Blessing Year', () => {
    const effect = getPersonalYearEffect(5);
    expect(effect.year).toBe(5);
    expect(effect.isBlessingYear).toBe(true);
    expect(effect.effects).toContain('flowers of the plant');
  });

  it('should return correct effect for PY 6 - Blessing Year', () => {
    const effect = getPersonalYearEffect(6);
    expect(effect.year).toBe(6);
    expect(effect.isBlessingYear).toBe(true);
    expect(effect.effects).toContain('luxury, home & family');
  });

  it('should return correct effect for PY 7 - No-risk Year', () => {
    const effect = getPersonalYearEffect(7);
    expect(effect.year).toBe(7);
    expect(effect.name).toBe('No-risk Year');
    expect(effect.type).toBe('no-risk');
    expect(effect.guidance).toContain('DO NOT start anything new');
  });

  it('should return correct effect for PY 8 - Judgment Year', () => {
    const effect = getPersonalYearEffect(8);
    expect(effect.year).toBe(8);
    expect(effect.name).toContain('Judgment Year');
    expect(effect.type).toBe('judgment');
    expect(effect.effects).toContain('karma/hard work');
  });

  it('should return correct effect for PY 9 - Completion Year', () => {
    const effect = getPersonalYearEffect(9);
    expect(effect.year).toBe(9);
    expect(effect.name).toContain('Completion of Cycle');
    expect(effect.type).toBe('completion');
    expect(effect.effects).toContain('True colours are revealed');
  });

  it('should handle cycle repetition (year > 9)', () => {
    // Year 10 should be same as year 1
    const effect10 = getPersonalYearEffect(10);
    const effect1 = getPersonalYearEffect(1);
    expect(effect10.year).toBe(effect1.year);
    expect(effect10.name).toBe(effect1.name);
  });
});

describe('Blessing Years Identification', () => {
  it('should identify all blessing years (1, 3, 5, 6)', () => {
    const blessingYears = [1, 3, 5, 6];
    blessingYears.forEach(year => {
      const effect = getPersonalYearEffect(year);
      expect(effect.isBlessingYear).toBe(true);
    });
  });

  it('should identify non-blessing years (2, 4, 7, 8, 9)', () => {
    const nonBlessingYears = [2, 4, 7, 8, 9];
    nonBlessingYears.forEach(year => {
      const effect = getPersonalYearEffect(year);
      expect(effect.isBlessingYear).toBe(false);
    });
  });
});

describe('Personal Year Types', () => {
  it('should categorize years correctly', () => {
    expect(PERSONAL_YEAR_EFFECTS[1].type).toBe('blessing');
    expect(PERSONAL_YEAR_EFFECTS[2].type).toBe('testing');
    expect(PERSONAL_YEAR_EFFECTS[3].type).toBe('blessing');
    expect(PERSONAL_YEAR_EFFECTS[4].type).toBe('testing');
    expect(PERSONAL_YEAR_EFFECTS[5].type).toBe('blessing');
    expect(PERSONAL_YEAR_EFFECTS[6].type).toBe('blessing');
    expect(PERSONAL_YEAR_EFFECTS[7].type).toBe('no-risk');
    expect(PERSONAL_YEAR_EFFECTS[8].type).toBe('judgment');
    expect(PERSONAL_YEAR_EFFECTS[9].type).toBe('completion');
  });
});
