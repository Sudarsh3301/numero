/**
 * Driver-Conductor Combinations Table
 * All 81 combinations from goal.md Section 4
 *
 * D = Driver (day number), C = Conductor (life path)
 * Strength: 1-5 scale (null = unclear "?")
 *
 * Key:
 * (a) = Good birth date rating
 * (b) = Better birth date rating
 * (c) = Best birth date rating
 * (d) = Difficult birth date rating
 */

import type { DCCombination } from '../types';

export const DC_TABLE: Record<string, DCCombination> = {
  // ========================================================================
  // DRIVER 1 COMBINATIONS
  // ========================================================================
  "1-1": {
    driver: 1,
    conductor: 1,
    strength: 4,
    affect: "Fortune's favorite",
    professions: ["Leadership", "Authority", "Management"]
  },
  "1-2": {
    driver: 1,
    conductor: 2,
    strength: 4,
    affect: "Best for Navy",
    professions: ["Navy", "Water-related work", "Maritime"]
  },
  "1-3": {
    driver: 1,
    conductor: 3,
    strength: 3.5,
    affect: "Best for occult",
    professions: ["Occult", "Spiritual teaching", "Mysticism"]
  },
  "1-4": {
    driver: 1,
    conductor: 4,
    strength: 3,
    affect: "Politics",
    professions: ["Politics", "Government", "Public service"],
    warnings: "1 Sun/King & 4 Rahu - power struggle possible"
  },
  "1-5": {
    driver: 1,
    conductor: 5,
    strength: 4,
    affect: "Banking & finance",
    professions: ["Banking", "Finance", "Investment"]
  },
  "1-6": {
    driver: 1,
    conductor: 6,
    strength: 3.5,
    affect: "Luxury / glamour",
    professions: ["Luxury goods", "Glamour industry", "High-end services"]
  },
  "1-7": {
    driver: 1,
    conductor: 7,
    strength: 3,
    affect: "Best for occult, education, research",
    professions: ["Occult", "Education", "Research", "Academia"]
  },
  "1-8": {
    driver: 1,
    conductor: 8,
    strength: null, // "?"
    affect: "Struggle / marriage? / police / politics",
    professions: ["Police", "Politics", "Law enforcement"],
    warnings: "Unclear combination - potential struggle in marriage"
  },
  "1-9": {
    driver: 1,
    conductor: 9,
    strength: 5,
    affect: "Super successful",
    professions: ["Leadership", "Army", "High achievement"]
  },

  // ========================================================================
  // DRIVER 2 COMBINATIONS
  // ========================================================================
  "2-1": {
    driver: 2,
    conductor: 1,
    strength: 3.5,
    affect: "Successful",
    professions: ["Leadership with sensitivity", "Management"]
  },
  "2-2": {
    driver: 2,
    conductor: 2,
    strength: 2,
    affect: "Best water-related works / navy / sweets / cold drinks",
    professions: ["Navy", "Sweets business", "Cold drinks", "Water-related"]
  },
  "2-3": {
    driver: 2,
    conductor: 3,
    strength: 2.5,
    affect: "Occult education / healer / teacher",
    professions: ["Occult education", "Healing", "Teaching"]
  },
  "2-4": {
    driver: 2,
    conductor: 4,
    strength: 1.5,
    affect: "Struggle / depression",
    professions: ["Analytical work"],
    warnings: "Prone to struggle and depression"
  },
  "2-5": {
    driver: 2,
    conductor: 5,
    strength: 3,
    affect: "Best for property / real estate / finance / MBA / banking",
    professions: ["Property", "Real estate", "Finance", "MBA", "Banking"]
  },
  "2-6": {
    driver: 2,
    conductor: 6,
    strength: 2.5,
    affect: "Best for sweets",
    professions: ["Sweets business", "Celebration industry"],
    warnings: "2 = water, 6 = Venus/celebration"
  },
  "2-7": {
    driver: 2,
    conductor: 7,
    strength: 2.5,
    affect: "Teaching / occult",
    professions: ["Teaching", "Occult", "Spirituality"]
  },
  "2-8": {
    driver: 2,
    conductor: 8,
    strength: null, // "?"
    affect: "Struggle / health issues",
    professions: ["Law", "Administrative"],
    warnings: "Prone to struggle and health issues"
  },
  "2-9": {
    driver: 2,
    conductor: 9,
    strength: 1,
    affect: "Marriage problems",
    professions: ["Humanitarian work"],
    warnings: "Significant marriage problems likely"
  },

  // ========================================================================
  // DRIVER 3 COMBINATIONS
  // ========================================================================
  "3-1": {
    driver: 3,
    conductor: 1,
    strength: 3.5,
    affect: "Occult / education / healer / doctor / administrative",
    professions: ["Occult", "Education", "Healing", "Doctor", "Administration"]
  },
  "3-2": {
    driver: 3,
    conductor: 2,
    strength: 2.5,
    affect: "Water-related work / navy",
    professions: ["Water-related work", "Navy"]
  },
  "3-3": {
    driver: 3,
    conductor: 3,
    strength: 3,
    affect: "Best for education / occult",
    professions: ["Education", "Occult", "Teaching", "Spiritual guidance"]
  },
  "3-4": {
    driver: 3,
    conductor: 4,
    strength: 2,
    affect: "Good for sales & marketing",
    professions: ["Sales", "Marketing", "Business development"]
  },
  "3-5": {
    driver: 3,
    conductor: 5,
    strength: 3,
    affect: "Excellent communication, anchoring, news, reading, acting, teaching, banking",
    professions: ["Communication", "Anchoring", "News", "Acting", "Teaching", "Banking"]
  },
  "3-6": {
    driver: 3,
    conductor: 6,
    strength: null, // "?"
    affect: "Marriage / health",
    professions: ["Creative work"],
    warnings: "3 & 6 are anti to each other - health and marriage issues"
  },
  "3-7": {
    driver: 3,
    conductor: 7,
    strength: 4,
    affect: "Best for education / occult / healing / teaching",
    professions: ["Education", "Occult", "Healing", "Teaching"]
  },
  "3-8": {
    driver: 3,
    conductor: 8,
    strength: 2,
    affect: "Lawyer / printing / sales",
    professions: ["Law", "Printing", "Sales"]
  },
  "3-9": {
    driver: 3,
    conductor: 9,
    strength: 4,
    affect: "Education / occult / army / administrative / doctor",
    professions: ["Education", "Occult", "Army", "Administration", "Doctor"]
  },

  // ========================================================================
  // DRIVER 4 COMBINATIONS
  // ========================================================================
  "4-1": {
    driver: 4,
    conductor: 1,
    strength: 3.5,
    affect: "Politics",
    professions: ["Politics", "Government"]
  },
  "4-2": {
    driver: 4,
    conductor: 2,
    strength: 2,
    affect: "Depression / struggle",
    professions: ["Analytical work"],
    warnings: "Prone to depression and struggle"
  },
  "4-3": {
    driver: 4,
    conductor: 3,
    strength: 2.5,
    affect: "Sales / marketing / occult education",
    professions: ["Sales", "Marketing", "Occult education"]
  },
  "4-4": {
    driver: 4,
    conductor: 4,
    strength: 1.5,
    affect: "Best for law / struggle",
    professions: ["Law", "Legal services"],
    warnings: "Significant struggle in life"
  },
  "4-5": {
    driver: 4,
    conductor: 5,
    strength: 3,
    affect: "Banking / event management",
    professions: ["Banking", "Event management", "Organization"]
  },
  "4-6": {
    driver: 4,
    conductor: 6,
    strength: 3,
    affect: "Media / luxury / glamour",
    professions: ["Media", "Luxury", "Glamour industry"]
  },
  "4-7": {
    driver: 4,
    conductor: 7,
    strength: 4,
    affect: "Successful / best in occult",
    professions: ["Occult", "Mysticism", "Spiritual work"]
  },
  "4-8": {
    driver: 4,
    conductor: 8,
    strength: 1,
    affect: "Struggle / excellent for law",
    professions: ["Law", "Legal services"],
    warnings: "Life of struggle despite legal aptitude"
  },
  "4-9": {
    driver: 4,
    conductor: 9,
    strength: 1,
    affect: "Struggle / health problems / surgeries / accidents",
    professions: ["Medical", "Emergency services"],
    warnings: "Prone to health problems, surgeries, accidents"
  },

  // ========================================================================
  // DRIVER 5 COMBINATIONS
  // ========================================================================
  "5-1": {
    driver: 5,
    conductor: 1,
    strength: 4,
    affect: "Successful / finance / loan / property / balanced life",
    professions: ["Finance", "Loans", "Property", "Banking"]
  },
  "5-2": {
    driver: 5,
    conductor: 2,
    strength: 3.5,
    affect: "Property / agriculture",
    professions: ["Property", "Agriculture", "Real estate"]
  },
  "5-3": {
    driver: 5,
    conductor: 3,
    strength: 3,
    affect: "Communication / occult",
    professions: ["Communication", "Occult", "Media"]
  },
  "5-4": {
    driver: 5,
    conductor: 4,
    strength: 3,
    affect: "Overall success / sales marketing",
    professions: ["Sales", "Marketing", "Business"]
  },
  "5-5": {
    driver: 5,
    conductor: 5,
    strength: 4,
    affect: "Very successful / romantic / may be lazy",
    professions: ["Finance", "Business", "Entertainment"],
    warnings: "Tendency towards laziness"
  },
  "5-6": {
    driver: 5,
    conductor: 6,
    strength: 4.5,
    affect: "Life is successful / luxury / media / sitting jobs",
    professions: ["Luxury", "Media", "Desk jobs", "Management"]
  },
  "5-7": {
    driver: 5,
    conductor: 7,
    strength: 3,
    affect: "Occult & banking",
    professions: ["Occult", "Banking", "Finance"]
  },
  "5-8": {
    driver: 5,
    conductor: 8,
    strength: 3,
    affect: "Property / law / printing",
    professions: ["Property", "Law", "Printing"]
  },
  "5-9": {
    driver: 5,
    conductor: 9,
    strength: 3,
    affect: "Successful / law / doctor / food / cooking",
    professions: ["Law", "Doctor", "Food", "Cooking", "Hospitality"]
  },

  // ========================================================================
  // DRIVER 6 COMBINATIONS
  // ========================================================================
  "6-1": {
    driver: 6,
    conductor: 1,
    strength: 3.5,
    affect: "Media / luxury / glamour",
    professions: ["Media", "Luxury", "Glamour"]
  },
  "6-2": {
    driver: 6,
    conductor: 2,
    strength: 2,
    affect: "Sweet shop / liquid",
    professions: ["Sweet shop", "Liquids", "Beverages"]
  },
  "6-3": {
    driver: 6,
    conductor: 3,
    strength: null, // "(–)?"
    affect: "Health & marriage issues",
    professions: ["Creative work"],
    warnings: "Significant health and marriage issues"
  },
  "6-4": {
    driver: 6,
    conductor: 4,
    strength: 3,
    affect: "Successful / media",
    professions: ["Media", "Communication"]
  },
  "6-5": {
    driver: 6,
    conductor: 5,
    strength: 4.5,
    affect: "Super successful",
    professions: ["Business", "Luxury", "High-end services"]
  },
  "6-6": {
    driver: 6,
    conductor: 6,
    strength: 4,
    affect: "Super successful / media / film industry / tours & travels",
    professions: ["Media", "Film", "Tours & travels", "Entertainment"]
  },
  "6-7": {
    driver: 6,
    conductor: 7,
    strength: 3.5,
    affect: "Successful / sports / romantic",
    professions: ["Sports", "Entertainment", "Romance industry"]
  },
  "6-8": {
    driver: 6,
    conductor: 8,
    strength: 3,
    affect: "Best for law",
    professions: ["Law", "Legal services"]
  },
  "6-9": {
    driver: 6,
    conductor: 9,
    strength: 3,
    affect: "Successful but marriage problems / scandal / controversies",
    professions: ["Media", "Entertainment"],
    warnings: "Marriage problems, prone to scandals and controversies"
  },

  // ========================================================================
  // DRIVER 7 COMBINATIONS
  // ========================================================================
  "7-1": {
    driver: 7,
    conductor: 1,
    strength: 3,
    affect: "Best occult",
    professions: ["Occult", "Mysticism", "Spiritual work"]
  },
  "7-2": {
    driver: 7,
    conductor: 2,
    strength: 2,
    affect: "Intuitive / occult",
    professions: ["Occult", "Intuitive work", "Healing"]
  },
  "7-3": {
    driver: 7,
    conductor: 3,
    strength: 3,
    affect: "Teaching / healing / occult",
    professions: ["Teaching", "Healing", "Occult"]
  },
  "7-4": {
    driver: 7,
    conductor: 4,
    strength: 3,
    affect: "Successful / law / occult",
    professions: ["Law", "Occult", "Legal mysticism"]
  },
  "7-5": {
    driver: 7,
    conductor: 5,
    strength: 3,
    affect: "Occult / desk work",
    professions: ["Occult", "Desk work", "Research"]
  },
  "7-6": {
    driver: 7,
    conductor: 6,
    strength: 4,
    affect: "Sports / luxury",
    professions: ["Sports", "Luxury", "High-end fitness"]
  },
  "7-7": {
    driver: 7,
    conductor: 7,
    strength: 1,
    affect: "Disappointment in life / marriage life in danger",
    professions: ["Occult", "Spiritual work"],
    warnings: "Severe disappointment in life, marriage in danger"
  },
  "7-8": {
    driver: 7,
    conductor: 8,
    strength: 1,
    affect: "Occult / teaching",
    professions: ["Occult", "Teaching"],
    warnings: "Difficult combination"
  },
  "7-9": {
    driver: 7,
    conductor: 9,
    strength: 1,
    affect: "Teaching / occult / research / law",
    professions: ["Teaching", "Occult", "Research", "Law"],
    warnings: "Challenging life path"
  },

  // ========================================================================
  // DRIVER 8 COMBINATIONS
  // ========================================================================
  "8-1": {
    driver: 8,
    conductor: 1,
    strength: null, // "?"
    affect: "Marriage problems / struggle",
    professions: ["Law", "Administration"],
    warnings: "Marriage problems and struggle likely"
  },
  "8-2": {
    driver: 8,
    conductor: 2,
    strength: null, // "?"
    affect: "Health issues / struggle",
    professions: ["Healthcare", "Social work"],
    warnings: "Health issues and struggle"
  },
  "8-3": {
    driver: 8,
    conductor: 3,
    strength: 2,
    affect: "Law / printing",
    professions: ["Law", "Printing", "Publishing"]
  },
  "8-4": {
    driver: 8,
    conductor: 4,
    strength: 1,
    affect: "Best for law / sales & marketing",
    professions: ["Law", "Sales", "Marketing"],
    warnings: "Life of struggle"
  },
  "8-5": {
    driver: 8,
    conductor: 5,
    strength: 3,
    affect: "Real estate / property",
    professions: ["Real estate", "Property", "Land development"]
  },
  "8-6": {
    driver: 8,
    conductor: 6,
    strength: 3,
    affect: "Best for law",
    professions: ["Law", "Legal services"]
  },
  "8-7": {
    driver: 8,
    conductor: 7,
    strength: 2,
    affect: "Occult / leather business",
    professions: ["Occult", "Leather business", "Manufacturing"]
  },
  "8-8": {
    driver: 8,
    conductor: 8,
    strength: 1,
    affect: "Struggle but good in sports",
    professions: ["Sports", "Athletics"],
    warnings: "Significant struggle in life"
  },
  "8-9": {
    driver: 8,
    conductor: 9,
    strength: 1,
    affect: "Army / doctor / navy / law / leather business",
    professions: ["Army", "Doctor", "Navy", "Law", "Leather"],
    warnings: "Challenging path"
  },

  // ========================================================================
  // DRIVER 9 COMBINATIONS
  // ========================================================================
  "9-1": {
    driver: 9,
    conductor: 1,
    strength: 3,
    affect: "Successful / army is best",
    professions: ["Army", "Military", "Defense"]
  },
  "9-2": {
    driver: 9,
    conductor: 2,
    strength: 1,
    affect: "Struggle / marriage problem",
    professions: ["Humanitarian work"],
    warnings: "Struggle and marriage problems"
  },
  "9-3": {
    driver: 9,
    conductor: 3,
    strength: 2.5,
    affect: "Occult / healing",
    professions: ["Occult", "Healing", "Spiritual work"]
  },
  "9-4": {
    driver: 9,
    conductor: 4,
    strength: 1.5,
    affect: "Struggle / surgeries / health issues",
    professions: ["Medical", "Surgery"],
    warnings: "Prone to surgeries and health issues"
  },
  "9-5": {
    driver: 9,
    conductor: 5,
    strength: 3,
    affect: "Successful / law / desk work",
    professions: ["Law", "Desk work", "Administration"]
  },
  "9-6": {
    driver: 9,
    conductor: 6,
    strength: 2,
    affect: "Scandals / controversies",
    professions: ["Media", "Public work"],
    warnings: "Prone to scandals and controversies"
  },
  "9-7": {
    driver: 9,
    conductor: 7,
    strength: 1,
    affect: "Occult / teaching",
    professions: ["Occult", "Teaching"],
    warnings: "Difficult path"
  },
  "9-8": {
    driver: 9,
    conductor: 8,
    strength: 2,
    affect: "Army / police / navy",
    professions: ["Army", "Police", "Navy", "Defense"]
  },
  "9-9": {
    driver: 9,
    conductor: 9,
    strength: 1,
    affect: "Marriage problem / anger",
    professions: ["Army", "Defense", "Humanitarian"],
    warnings: "Severe marriage problems and anger issues"
  }
};

/**
 * Get Driver-Conductor profile for a combination
 */
export function getDriverConductorProfile(driver: number, conductor: number): DCCombination {
  const key = `${driver}-${conductor}`;
  const profile = DC_TABLE[key];

  if (!profile) {
    throw new Error(`No profile found for Driver ${driver}, Conductor ${conductor}`);
  }

  return profile;
}

/**
 * Get all combinations for a specific driver
 */
export function getCombinationsByDriver(driver: number): DCCombination[] {
  return Object.values(DC_TABLE).filter(combo => combo.driver === driver);
}

/**
 * Get all combinations for a specific conductor
 */
export function getCombinationsByConductor(conductor: number): DCCombination[] {
  return Object.values(DC_TABLE).filter(combo => combo.conductor === conductor);
}

/**
 * Get all strong combinations (strength >= 4)
 */
export function getStrongCombinations(): DCCombination[] {
  return Object.values(DC_TABLE).filter(combo => combo.strength !== null && combo.strength >= 4);
}

/**
 * Get all struggling combinations (strength <= 1.5)
 */
export function getStrugglingCombinations(): DCCombination[] {
  return Object.values(DC_TABLE).filter(combo => combo.strength !== null && combo.strength <= 1.5);
}

/**
 * Get all unclear combinations (strength = null, marked with "?")
 */
export function getUnclearCombinations(): DCCombination[] {
  return Object.values(DC_TABLE).filter(combo => combo.strength === null);
}
