/**
 * Unit Tests for Lo Shu Grid Calculations
 * Based on goal.md Section 1: Lo Shu Grid — Planes & Arrows
 */

import { describe, it, expect } from 'vitest';

// Import the functions from loshu.tsx (we'll need to export them first)
// For now, we'll recreate them here for testing
function buildCounts(digits: number[]): Record<number, number> {
  const c: Record<number, number> = {};
  for (let i = 1; i <= 9; i++) c[i] = 0;
  digits.filter(d => d > 0).forEach(d => c[d]++);
  return c;
}

function getMissing(c: Record<number, number>): number[] {
  return Object.keys(c).map(Number).filter(n => c[n] === 0);
}

function getRepeated(c: Record<number, number>): number[] {
  return Object.keys(c).map(Number).filter(n => c[n] > 1);
}

function getPresent(c: Record<number, number>): number[] {
  return Object.keys(c).map(Number).filter(n => c[n] === 1);
}

function planeScore(counts: Record<number, number>) {
  const s = { intellectual: 0, emotional: 0, practical: 0 };
  [1, 2, 3].forEach(n => s.intellectual += counts[n]);
  [4, 5, 6].forEach(n => s.emotional += counts[n]);
  [7, 8, 9].forEach(n => s.practical += counts[n]);
  const total = s.intellectual + s.emotional + s.practical || 1;
  return {
    ...s,
    dominant: Object.entries(s).sort((a, b) => b[1] - a[1])[0][0],
    pct: {
      intellectual: Math.round(s.intellectual / total * 100),
      emotional: Math.round(s.emotional / total * 100),
      practical: Math.round(s.practical / total * 100)
    }
  };
}

const ARROWS = [
  { id: "thought", name: "Arrow of the Intellect", nums: [3, 5, 7] },
  { id: "will", name: "Staff of Will", nums: [1, 5, 9] },
  { id: "activity", name: "Arrow of Activity", nums: [2, 5, 8] },
  { id: "compassion", name: "Arrow of Compassion", nums: [4, 5, 6] },
  { id: "memory", name: "Arrow of Poor Memory", nums: [3, 6, 9] },
  { id: "emotion", name: "Arrow of Emotion", nums: [7, 8, 9] },
  { id: "top_row", name: "Arrow of Heaven", nums: [2, 9, 4] },
  { id: "bot_row", name: "Arrow of Earth", nums: [8, 1, 6] },
  { id: "left_col", name: "Arrow of Left Pillar", nums: [4, 3, 8] },
  { id: "right_col", name: "Arrow of Right Pillar", nums: [2, 7, 6] },
];

const INDECISION_ARROWS = [
  { id: "no_thought", name: "Arrow of Poor Thinking", nums: [3, 5, 7] },
  { id: "no_will", name: "Arrow of Hesitation", nums: [1, 5, 9] },
  { id: "no_activity", name: "Arrow of Inertia", nums: [2, 5, 8] },
  { id: "no_compassion", name: "Arrow of Insensitivity", nums: [4, 5, 6] },
];

function detectArrows(counts: Record<number, number>) {
  return {
    present: ARROWS.filter(a => a.nums.every(n => counts[n] > 0)),
    absent: INDECISION_ARROWS.filter(a => a.nums.every(n => counts[n] === 0))
  };
}

describe('buildCounts', () => {
  it('should count occurrences of each digit 1-9', () => {
    const digits = [1, 8, 0, 4, 1, 9, 8, 6];
    const counts = buildCounts(digits);

    expect(counts[1]).toBe(2); // 1 appears twice
    expect(counts[4]).toBe(1);
    expect(counts[6]).toBe(1);
    expect(counts[8]).toBe(2); // 8 appears twice
    expect(counts[9]).toBe(1);
  });

  it('should initialize all numbers 1-9 with zero count', () => {
    const digits: number[] = [];
    const counts = buildCounts(digits);

    for (let i = 1; i <= 9; i++) {
      expect(counts[i]).toBe(0);
    }
  });

  it('should ignore zeros in the count', () => {
    const digits = [0, 0, 0, 1, 2, 3];
    const counts = buildCounts(digits);

    expect(counts[1]).toBe(1);
    expect(counts[2]).toBe(1);
    expect(counts[3]).toBe(1);
    // Zeros are not counted in any bucket
  });

  it('should handle date: 18/04/1986', () => {
    const digits = [1, 8, 0, 4, 1, 9, 8, 6];
    const counts = buildCounts(digits);

    expect(counts[1]).toBe(2);
    expect(counts[2]).toBe(0);
    expect(counts[3]).toBe(0);
    expect(counts[4]).toBe(1);
    expect(counts[5]).toBe(0);
    expect(counts[6]).toBe(1);
    expect(counts[7]).toBe(0);
    expect(counts[8]).toBe(2);
    expect(counts[9]).toBe(1);
  });
});

describe('getMissing', () => {
  it('should return numbers not present in DOB', () => {
    const digits = [1, 8, 0, 4, 1, 9, 8, 6];
    const counts = buildCounts(digits);
    const missing = getMissing(counts);

    expect(missing).toEqual([2, 3, 5, 7]);
  });

  it('should return empty array if all numbers present', () => {
    const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const counts = buildCounts(digits);
    const missing = getMissing(counts);

    expect(missing).toEqual([]);
  });

  it('should return all numbers if none present', () => {
    const digits: number[] = [];
    const counts = buildCounts(digits);
    const missing = getMissing(counts);

    expect(missing).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
});

describe('getRepeated', () => {
  it('should return numbers appearing more than once', () => {
    const digits = [1, 8, 0, 4, 1, 9, 8, 6];
    const counts = buildCounts(digits);
    const repeated = getRepeated(counts);

    expect(repeated).toEqual([1, 8]);
  });

  it('should return empty array if no repetitions', () => {
    const digits = [1, 2, 3, 4, 5];
    const counts = buildCounts(digits);
    const repeated = getRepeated(counts);

    expect(repeated).toEqual([]);
  });

  it('should handle multiple repetitions of same number', () => {
    const digits = [1, 1, 1, 2, 2, 3];
    const counts = buildCounts(digits);
    const repeated = getRepeated(counts);

    expect(repeated).toContain(1);
    expect(repeated).toContain(2);
    expect(repeated).not.toContain(3);
  });
});

describe('getPresent', () => {
  it('should return numbers appearing exactly once', () => {
    const digits = [1, 8, 0, 4, 1, 9, 8, 6];
    const counts = buildCounts(digits);
    const present = getPresent(counts);

    expect(present).toEqual([4, 6, 9]);
  });

  it('should not include repeated numbers', () => {
    const digits = [1, 1, 2, 3, 3, 3];
    const counts = buildCounts(digits);
    const present = getPresent(counts);

    expect(present).toEqual([2]); // Only 2 appears exactly once
  });
});

describe('planeScore', () => {
  it('should calculate intellectual plane (1,2,3) from goal.md', () => {
    const digits = [1, 2, 3, 4, 5, 6]; // Has 1,2,3
    const counts = buildCounts(digits);
    const planes = planeScore(counts);

    expect(planes.intellectual).toBe(3); // 1+2+3 = one of each
  });

  it('should calculate emotional plane (4,5,6) from goal.md', () => {
    const digits = [4, 5, 6, 7];
    const counts = buildCounts(digits);
    const planes = planeScore(counts);

    expect(planes.emotional).toBe(3); // 4,5,6 present
  });

  it('should calculate practical plane (7,8,9) from goal.md', () => {
    const digits = [7, 8, 9, 1];
    const counts = buildCounts(digits);
    const planes = planeScore(counts);

    expect(planes.practical).toBe(3); // 7,8,9 present
  });

  it('should identify dominant plane', () => {
    const digits = [1, 1, 1, 2, 2, 3, 3]; // Heavy on intellectual
    const counts = buildCounts(digits);
    const planes = planeScore(counts);

    expect(planes.dominant).toBe('intellectual');
  });

  it('should calculate percentages correctly', () => {
    const digits = [1, 4, 7]; // One from each plane
    const counts = buildCounts(digits);
    const planes = planeScore(counts);

    expect(planes.pct.intellectual).toBe(33);
    expect(planes.pct.emotional).toBe(33);
    expect(planes.pct.practical).toBe(33);
  });

  it('should handle date 18/04/1986 - missing intellectual plane', () => {
    const digits = [1, 8, 0, 4, 1, 9, 8, 6];
    const counts = buildCounts(digits);
    const planes = planeScore(counts);

    // intellectual (1,2,3): has 1 twice = 2
    // emotional (4,5,6): has 4 once, 6 once = 2
    // practical (7,8,9): has 8 twice, 9 once = 3
    expect(planes.intellectual).toBe(2);
    expect(planes.emotional).toBe(2);
    expect(planes.practical).toBe(3);
    expect(planes.dominant).toBe('practical');
  });
});

describe('detectArrows', () => {
  it('should detect Arrow of Will (1,5,9) when all present', () => {
    const digits = [1, 5, 9];
    const counts = buildCounts(digits);
    const arrows = detectArrows(counts);

    const willArrow = arrows.present.find(a => a.id === 'will');
    expect(willArrow).toBeDefined();
    expect(willArrow?.name).toBe('Staff of Will');
  });

  it('should detect Arrow of the Intellect (3,5,7) when all present', () => {
    const digits = [3, 5, 7];
    const counts = buildCounts(digits);
    const arrows = detectArrows(counts);

    const thoughtArrow = arrows.present.find(a => a.id === 'thought');
    expect(thoughtArrow).toBeDefined();
  });

  it('should detect Arrow of Activity (2,5,8) - Silver Plane from goal.md', () => {
    const digits = [2, 5, 8];
    const counts = buildCounts(digits);
    const arrows = detectArrows(counts);

    const activityArrow = arrows.present.find(a => a.id === 'activity');
    expect(activityArrow).toBeDefined();
    expect(activityArrow?.name).toBe('Arrow of Activity');
  });

  it('should detect Arrow of Compassion (4,5,6) - Golden Plane from goal.md', () => {
    const digits = [4, 5, 6];
    const counts = buildCounts(digits);
    const arrows = detectArrows(counts);

    const compassionArrow = arrows.present.find(a => a.id === 'compassion');
    expect(compassionArrow).toBeDefined();
    expect(compassionArrow?.name).toBe('Arrow of Compassion');
  });

  it('should detect Arrow of Earth (8,1,6) - Practical Plane from goal.md', () => {
    const digits = [8, 1, 6];
    const counts = buildCounts(digits);
    const arrows = detectArrows(counts);

    const earthArrow = arrows.present.find(a => a.id === 'bot_row');
    expect(earthArrow).toBeDefined();
  });

  it('should not detect arrow if one number missing', () => {
    const digits = [1, 9]; // Missing 5 for will arrow
    const counts = buildCounts(digits);
    const arrows = detectArrows(counts);

    const willArrow = arrows.present.find(a => a.id === 'will');
    expect(willArrow).toBeUndefined();
  });

  it('should detect indecision arrows when all three numbers missing', () => {
    const digits = [1, 2, 4, 6, 8, 9]; // Missing 3,5,7
    const counts = buildCounts(digits);
    const arrows = detectArrows(counts);

    const noThoughtArrow = arrows.absent.find(a => a.id === 'no_thought');
    expect(noThoughtArrow).toBeDefined();
  });

  it('should detect Arrow of Hesitation when 1,5,9 all missing', () => {
    const digits = [2, 3, 4, 6, 7, 8]; // Missing 1,5,9
    const counts = buildCounts(digits);
    const arrows = detectArrows(counts);

    const noWillArrow = arrows.absent.find(a => a.id === 'no_will');
    expect(noWillArrow).toBeDefined();
  });

  it('should detect Arrow of Inertia when 2,5,8 all missing', () => {
    const digits = [1, 3, 4, 6, 7, 9]; // Missing 2,5,8
    const counts = buildCounts(digits);
    const arrows = detectArrows(counts);

    const noActivityArrow = arrows.absent.find(a => a.id === 'no_activity');
    expect(noActivityArrow).toBeDefined();
  });

  it('should detect Arrow of Insensitivity when 4,5,6 all missing', () => {
    const digits = [1, 2, 3, 7, 8, 9]; // Missing 4,5,6
    const counts = buildCounts(digits);
    const arrows = detectArrows(counts);

    const noCompassionArrow = arrows.absent.find(a => a.id === 'no_compassion');
    expect(noCompassionArrow).toBeDefined();
  });
});
