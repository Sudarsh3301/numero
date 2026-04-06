/**
 * Planet Days & Colors
 *
 * Maps each number (1-9) to its ruling planet's favorable day
 * and color recommendations.
 *
 * Source: goal.md Section 3 - Planet Days & Colors
 */

export interface PlanetDay {
  planet: string;
  number: number;
  day: string;
  colorsToAvoid: string[];
  colorsToUse: string[];
}

/**
 * Planet day and color associations for numbers 1-9
 * Based on traditional Indian numerology
 */
export const PLANET_DAYS: Record<number, PlanetDay> = {
  1: {
    planet: "Sun (Surya)",
    number: 1,
    day: "Sunday",
    colorsToAvoid: ["Black"],
    colorsToUse: ["Red"]
  },
  2: {
    planet: "Moon (Chandra)",
    number: 2,
    day: "Monday",
    colorsToAvoid: ["Black", "Red"],
    colorsToUse: ["White"]
  },
  3: {
    planet: "Jupiter (Guru)",
    number: 3,
    day: "Thursday",
    colorsToAvoid: ["White"],
    colorsToUse: ["Yellow"]
  },
  4: {
    planet: "Uranus (Rahu)",
    number: 4,
    day: "Saturday",
    colorsToAvoid: ["White"],
    colorsToUse: ["Black", "Grey", "Blue"]
  },
  5: {
    planet: "Mercury (Budh)",
    number: 5,
    day: "Wednesday",
    colorsToAvoid: [],
    colorsToUse: ["Green"]
  },
  6: {
    planet: "Venus (Shukra)",
    number: 6,
    day: "Friday",
    colorsToAvoid: ["Yellow"],
    colorsToUse: ["White"]
  },
  7: {
    planet: "Neptune (Ketu)",
    number: 7,
    day: "Saturday",
    colorsToAvoid: ["White"],
    colorsToUse: ["Black", "Grey", "Blue"]
  },
  8: {
    planet: "Saturn (Shani)",
    number: 8,
    day: "Saturday",
    colorsToAvoid: ["White"],
    colorsToUse: ["Black", "Grey", "Blue"]
  },
  9: {
    planet: "Mars (Mangal)",
    number: 9,
    day: "Tuesday",
    colorsToAvoid: ["Black"],
    colorsToUse: ["Red", "White"]
  }
};

/**
 * Get planet day and color information for a given number
 * @param number - Number 1-9
 * @returns PlanetDay information
 */
export function getPlanetDay(number: number): PlanetDay {
  if (number < 1 || number > 9) {
    throw new Error(`Invalid number: ${number}. Must be between 1 and 9.`);
  }
  return PLANET_DAYS[number];
}
