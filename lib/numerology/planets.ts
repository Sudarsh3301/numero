/**
 * Planet Mappings for Indian Numerology
 * Based on goal.md Section 2: Planets — Core Reference
 */

import type { Planet } from './types';

/**
 * Complete planet mapping for numbers 1-9
 * Each number corresponds to a ruling planet from Vedic astrology
 */
export const PLANET_MAPPING: Record<number, Planet> = {
  1: {
    number: 1,
    name: "Sun",
    sanskrit: "Surya",
    title: "King",
    birthDates: [1, 10, 19, 28],
    traits: [
      "Authoritative",
      "Pioneer",
      "Royal",
      "Trend setter",
      "Leadership",
      "Ego",
      "Good manager",
      "Name/fame/material"
    ],
    friends: [9, 2, 3, 5, 6, 1],
    enemies: [8],
    neutral: [4, 7]
  },
  2: {
    number: 2,
    name: "Moon",
    sanskrit: "Chandra",
    title: "Queen",
    birthDates: [2, 11, 20, 29], // 11 is Master Number
    traits: [
      "Emotional",
      "Gentle",
      "Slow",
      "Sensitive",
      "Attractive",
      "Intuitive",
      "Mood swings"
    ],
    friends: [1, 5, 3, 2, 7], // 7 is need-based
    enemies: [8, 4, 9],
    neutral: [6] // 7 can also be neutral depending on need
  },
  3: {
    number: 3,
    name: "Jupiter",
    sanskrit: "Guru",
    title: "+Ve Teacher",
    birthDates: [3, 12, 21, 30],
    traits: [
      "Imaginative",
      "Healer",
      "Preacher",
      "Spiritual",
      "Religious",
      "Counselor",
      "Good arguments",
      "Knowledgeable"
    ],
    friends: [1, 5, 3, 7], // 7 is need-based
    enemies: [6],
    neutral: [4, 8, 9, 2] // 7 can also be neutral
  },
  4: {
    number: 4,
    name: "Uranus (Rahu)",
    sanskrit: "Rahu",
    title: "Head without Body / Gunda",
    birthDates: [4, 13, 22, 31], // 13 Karmic, 22 Master
    traits: [
      "Disciplined",
      "Organized",
      "Short-tempered",
      "Rebellious",
      "Abusive",
      "Stubborn",
      "Logical",
      "Impulsive",
      "Mysterious",
      "Expenses increase",
      "Addiction",
      "Revengeful"
    ],
    friends: [7, 1, 5, 6], // 4 & 8 are conditional
    enemies: [2, 9], // 4 & 8 permanent relation is negative
    neutral: [3]
  },
  5: {
    number: 5,
    name: "Mercury",
    sanskrit: "Budh",
    title: "Prince / RajKumar",
    birthDates: [5, 14, 23], // 14 is Karmic
    traits: [
      "Happy-go-lucky",
      "Lazy",
      "Dark horse",
      "Entertaining",
      "Communicative",
      "Lucky"
    ],
    friends: [1, 2, 3, 6, 5],
    enemies: [],
    neutral: [4, 7, 8, 9]
  },
  6: {
    number: 6,
    name: "Venus",
    sanskrit: "Shukra",
    title: "–Ve Teacher / Seeks Luxury",
    birthDates: [6, 15, 24],
    traits: [
      "Romantic",
      "Communicator",
      "Manipulative",
      "Diplomatic",
      "Family-oriented",
      "Shrewd",
      "Materialistic"
    ],
    friends: [1, 7, 4, 6, 5],
    enemies: [3],
    neutral: [2, 8, 9]
  },
  7: {
    number: 7,
    name: "Neptune (Ketu)",
    sanskrit: "Ketu",
    title: "Shadow Planet / Body without Head",
    birthDates: [7, 16, 25], // 16 is Karmic
    traits: [
      "Low confidence",
      "Inquisitive",
      "Very good healer",
      "Occult",
      "Spiritual",
      "Religious",
      "Researcher",
      "Extrovert"
    ],
    friends: [4, 6, 1, 5, 3], // 3 is need-based
    enemies: [],
    neutral: [2, 8, 9, 7] // 3 can also be neutral
  },
  8: {
    number: 8,
    name: "Saturn",
    sanskrit: "Shani",
    title: "Judge",
    birthDates: [8, 17, 26],
    traits: [
      "Struggle",
      "Laborious",
      "Hard-working",
      "Logical",
      "Argumentative",
      "Stubborn",
      "Law",
      "Finance"
    ],
    friends: [5, 3, 8, 4], // 8 & 4 conditional, 6 & 7 need-based
    enemies: [1, 2], // 4 & 8 permanent relation is negative
    neutral: [9] // 6 & 7 can also be neutral
  },
  9: {
    number: 9,
    name: "Mars",
    sanskrit: "Mangal",
    title: "Advisor",
    birthDates: [9, 18, 27],
    traits: [
      "Unpredictable behavior",
      "Warrior",
      "Rough & tough",
      "Good humanitarian",
      "Egoist",
      "Bold",
      "Spiritual"
    ],
    friends: [1, 5],
    enemies: [2, 4],
    neutral: [3, 7, 6, 8, 9]
  }
};

/**
 * Get planet association for a given number
 */
export function getPlanetAssociation(number: number): Planet {
  if (number < 1 || number > 9) {
    throw new Error(`Invalid number: ${number}. Must be between 1 and 9.`);
  }
  return PLANET_MAPPING[number];
}

/**
 * Get relationship between two planets (for compatibility)
 * @returns 'friend' | 'enemy' | 'neutral'
 */
export function getPlanetRelationship(n1: number, n2: number): 'friend' | 'enemy' | 'neutral' {
  const planet1 = getPlanetAssociation(n1);

  if (planet1.friends.includes(n2)) {
    return 'friend';
  }
  if (planet1.enemies.includes(n2)) {
    return 'enemy';
  }
  return 'neutral';
}

/**
 * Check if two planets are friends (mutual support)
 */
export function arePlanetsFriends(n1: number, n2: number): boolean {
  return getPlanetRelationship(n1, n2) === 'friend';
}

/**
 * Check if two planets are enemies (conflict)
 */
export function arePlanetsEnemies(n1: number, n2: number): boolean {
  return getPlanetRelationship(n1, n2) === 'enemy';
}

/**
 * Get planet by birth date
 */
export function getPlanetByBirthDate(date: number): Planet | null {
  for (const planet of Object.values(PLANET_MAPPING)) {
    if (planet.birthDates.includes(date)) {
      return planet;
    }
  }
  return null;
}

/**
 * Get common friends between two planets
 */
export function getCommonFriends(n1: number, n2: number): number[] {
  const planet1 = getPlanetAssociation(n1);
  const planet2 = getPlanetAssociation(n2);

  return planet1.friends.filter(f => planet2.friends.includes(f));
}

/**
 * Get common enemies between two planets
 */
export function getCommonEnemies(n1: number, n2: number): number[] {
  const planet1 = getPlanetAssociation(n1);
  const planet2 = getPlanetAssociation(n2);

  return planet1.enemies.filter(e => planet2.enemies.includes(e));
}
