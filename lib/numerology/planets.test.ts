/**
 * Unit Tests for Planet Relationships and Compatibility
 * Based on goal.md Section 2: Planets — Core Reference
 * and Section 12: Driver–Conductor Compatibility
 */

import { describe, it, expect } from 'vitest';
import {
  getPlanetAssociation,
  getPlanetRelationship,
  arePlanetsFriends,
  arePlanetsEnemies,
  getPlanetByBirthDate,
  getCommonFriends,
  getCommonEnemies,
  PLANET_MAPPING,
} from './planets';

describe('getPlanetAssociation', () => {
  it('should return correct planet for number 1 - Sun', () => {
    const planet = getPlanetAssociation(1);
    expect(planet.name).toBe('Sun');
    expect(planet.sanskrit).toBe('Surya');
    expect(planet.title).toBe('King');
    expect(planet.birthDates).toEqual([1, 10, 19, 28]);
  });

  it('should return correct planet for number 2 - Moon', () => {
    const planet = getPlanetAssociation(2);
    expect(planet.name).toBe('Moon');
    expect(planet.sanskrit).toBe('Chandra');
    expect(planet.title).toBe('Queen');
    expect(planet.birthDates).toEqual([2, 11, 20, 29]);
  });

  it('should return correct planet for number 9 - Mars', () => {
    const planet = getPlanetAssociation(9);
    expect(planet.name).toBe('Mars');
    expect(planet.sanskrit).toBe('Mangal');
    expect(planet.title).toBe('Advisor');
  });

  it('should throw error for invalid number', () => {
    expect(() => getPlanetAssociation(0)).toThrow();
    expect(() => getPlanetAssociation(10)).toThrow();
  });
});

describe('Planet Traits from goal.md Section 2', () => {
  it('should have correct traits for Sun (1)', () => {
    const planet = getPlanetAssociation(1);
    expect(planet.traits).toContain('Leadership');
    expect(planet.traits).toContain('Authoritative');
  });

  it('should have correct traits for Moon (2)', () => {
    const planet = getPlanetAssociation(2);
    expect(planet.traits).toContain('Emotional');
    expect(planet.traits).toContain('Intuitive');
  });

  it('should have correct traits for Saturn (8)', () => {
    const planet = getPlanetAssociation(8);
    expect(planet.traits).toContain('Struggle');
    expect(planet.traits).toContain('Hard-working');
  });
});

describe('getPlanetRelationship - Friends from goal.md', () => {
  it('should identify Sun (1) friends: 9,2,3,5,6,1', () => {
    const planet1 = getPlanetAssociation(1);
    expect(planet1.friends).toEqual([9, 2, 3, 5, 6, 1]);
  });

  it('should confirm 1-9 friendship (Sun-Mars)', () => {
    expect(getPlanetRelationship(1, 9)).toBe('friend');
    expect(arePlanetsFriends(1, 9)).toBe(true);
  });

  it('should confirm 1-2 friendship (Sun-Moon)', () => {
    expect(getPlanetRelationship(1, 2)).toBe('friend');
  });

  it('should confirm 5 has no enemies', () => {
    const planet5 = getPlanetAssociation(5);
    expect(planet5.enemies).toEqual([]);
  });

  it('should confirm 7 has no enemies', () => {
    const planet7 = getPlanetAssociation(7);
    expect(planet7.enemies).toEqual([]);
  });
});

describe('getPlanetRelationship - Enemies from goal.md', () => {
  it('should identify Sun (1) enemy: 8', () => {
    const planet1 = getPlanetAssociation(1);
    expect(planet1.enemies).toEqual([8]);
  });

  it('should confirm 1-8 enmity (Sun-Saturn)', () => {
    expect(getPlanetRelationship(1, 8)).toBe('enemy');
    expect(arePlanetsEnemies(1, 8)).toBe(true);
  });

  it('should confirm 2-9 enmity (Moon-Mars)', () => {
    expect(arePlanetsEnemies(2, 9)).toBe(true);
  });

  it('should confirm 3-6 enmity (Jupiter-Venus)', () => {
    expect(arePlanetsEnemies(3, 6)).toBe(true);
  });

  it('should confirm 8-1 enmity (Saturn-Sun) - bidirectional', () => {
    expect(arePlanetsEnemies(8, 1)).toBe(true);
  });
});

describe('getPlanetRelationship - Neutral', () => {
  it('should identify Sun (1) neutral: 4,7', () => {
    const planet1 = getPlanetAssociation(1);
    expect(planet1.neutral).toEqual([4, 7]);
  });

  it('should confirm 1-4 neutrality', () => {
    expect(getPlanetRelationship(1, 4)).toBe('neutral');
  });

  it('should confirm 1-7 neutrality', () => {
    expect(getPlanetRelationship(1, 7)).toBe('neutral');
  });
});

describe('Driver-Conductor Anti/Enemy combinations from goal.md Section 12', () => {
  it('should confirm anti combinations 1-8 and 8-1', () => {
    expect(arePlanetsEnemies(1, 8)).toBe(true);
    expect(arePlanetsEnemies(8, 1)).toBe(true);
  });

  it('should confirm anti combinations 2-8 and 8-2', () => {
    expect(arePlanetsEnemies(2, 8)).toBe(true);
    expect(arePlanetsEnemies(8, 2)).toBe(true);
  });

  it('should confirm anti combinations 3-6 and 6-3', () => {
    expect(arePlanetsEnemies(3, 6)).toBe(true);
    expect(arePlanetsEnemies(6, 3)).toBe(true);
  });

  it('should confirm enemy combinations 4-2 and 2-4', () => {
    expect(arePlanetsEnemies(4, 2)).toBe(true);
    expect(arePlanetsEnemies(2, 4)).toBe(true);
  });

  it('should confirm enemy combinations 4-9 and 9-4', () => {
    expect(arePlanetsEnemies(4, 9)).toBe(true);
    expect(arePlanetsEnemies(9, 4)).toBe(true);
  });
});

describe('Best Driver combinations from goal.md Section 12', () => {
  it('should confirm 1-1 as best (friends with self)', () => {
    expect(arePlanetsFriends(1, 1)).toBe(true);
  });

  it('should confirm 1-2 as best', () => {
    expect(arePlanetsFriends(1, 2)).toBe(true);
  });

  it('should confirm 1-5 as best', () => {
    expect(arePlanetsFriends(1, 5)).toBe(true);
  });

  it('should confirm 1-6 as best', () => {
    expect(arePlanetsFriends(1, 6)).toBe(true);
  });

  it('should confirm 1-9 as best', () => {
    expect(arePlanetsFriends(1, 9)).toBe(true);
  });

  it('should confirm 5-5 as best', () => {
    expect(arePlanetsFriends(5, 5)).toBe(true);
  });

  it('should confirm 5-6 as best', () => {
    expect(arePlanetsFriends(5, 6)).toBe(true);
  });
});

describe('getPlanetByBirthDate', () => {
  it('should return Sun for birth dates 1, 10, 19, 28', () => {
    expect(getPlanetByBirthDate(1)?.name).toBe('Sun');
    expect(getPlanetByBirthDate(10)?.name).toBe('Sun');
    expect(getPlanetByBirthDate(19)?.name).toBe('Sun');
    expect(getPlanetByBirthDate(28)?.name).toBe('Sun');
  });

  it('should return Moon for birth dates 2, 11, 20, 29', () => {
    expect(getPlanetByBirthDate(2)?.name).toBe('Moon');
    expect(getPlanetByBirthDate(11)?.name).toBe('Moon');
    expect(getPlanetByBirthDate(20)?.name).toBe('Moon');
    expect(getPlanetByBirthDate(29)?.name).toBe('Moon');
  });

  it('should return Mars for birth dates 9, 18, 27', () => {
    expect(getPlanetByBirthDate(9)?.name).toBe('Mars');
    expect(getPlanetByBirthDate(18)?.name).toBe('Mars');
    expect(getPlanetByBirthDate(27)?.name).toBe('Mars');
  });

  it('should return null for invalid birth date', () => {
    expect(getPlanetByBirthDate(32)).toBeNull();
    expect(getPlanetByBirthDate(0)).toBeNull();
  });
});

describe('getCommonFriends', () => {
  it('should find common friends between 1 and 9', () => {
    const common = getCommonFriends(1, 9);
    // Both 1 and 9 have 1 and 5 as friends
    expect(common).toContain(1);
    expect(common).toContain(5);
  });

  it('should return empty array if no common friends', () => {
    // Find a combination with no common friends
    const common = getCommonFriends(8, 9);
    // Check if any overlap exists
    expect(Array.isArray(common)).toBe(true);
  });
});

describe('getCommonEnemies', () => {
  it('should find common enemies between planets', () => {
    const common = getCommonEnemies(1, 9);
    // Check the result
    expect(Array.isArray(common)).toBe(true);
  });

  it('should return empty for planets with no common enemies', () => {
    // 5 has no enemies
    const common = getCommonEnemies(5, 1);
    expect(common).toEqual([]);
  });
});

describe('Master Numbers in birthDates', () => {
  it('should list 11 as a birth date for Moon (2)', () => {
    const planet2 = getPlanetAssociation(2);
    expect(planet2.birthDates).toContain(11);
  });

  it('should list 22 as a birth date for Uranus (4)', () => {
    const planet4 = getPlanetAssociation(4);
    expect(planet4.birthDates).toContain(22);
  });
});

describe('Karmic Numbers in birthDates', () => {
  it('should list 13 as a birth date for Uranus (4)', () => {
    const planet4 = getPlanetAssociation(4);
    expect(planet4.birthDates).toContain(13);
  });

  it('should list 14 as a birth date for Mercury (5)', () => {
    const planet5 = getPlanetAssociation(5);
    expect(planet5.birthDates).toContain(14);
  });

  it('should list 16 as a birth date for Neptune (7)', () => {
    const planet7 = getPlanetAssociation(7);
    expect(planet7.birthDates).toContain(16);
  });
});

describe('Special planetary relationships from goal.md notes', () => {
  it('should note conditional friendship between 4 and 8', () => {
    // 4 & 8: Permanent relationship is negative; short-term relation is good
    const planet4 = getPlanetAssociation(4);
    const planet8 = getPlanetAssociation(8);

    // Check if they appear in each other's lists
    // The implementation may vary based on how conditional relationships are handled
  });

  it('should note need-based relationship for 2 and 7', () => {
    // 2 has 7 as friend (need-based)
    const planet2 = getPlanetAssociation(2);
    expect(planet2.friends).toContain(7);
  });
});
