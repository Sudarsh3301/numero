/**
 * Remedies System - Planet Balancing & Element Remedies
 * Combines:
 * - remedies.md Section 2: Planet Balancing Remedies
 * - goal.md Section 5: Remedies for Missing Elements
 *
 * KEY RULE from remedies.md: Remedies needed when number is missing
 */

import type { Remedy, ElementRemedy, GeneralRemedy } from './types';

// ============================================================================
// PLANET BALANCING REMEDIES (from remedies.md Section 2)
// ============================================================================

/**
 * Planet remedies for each number (1-9)
 * Organized by frequency: daily, weekly, monthly, quarterly, as_needed
 */
export const PLANET_REMEDIES: Record<number, Remedy[]> = {
  1: [ // Surya (Surya) - Number 1
    { action: "Offer water to the sun daily", frequency: "daily", condition: "Only if Driver is not 8" },
    { action: "Do Surya Namaskar", frequency: "daily", condition: "Only if Driver is not 8" },
    { action: "Take blessings from father daily", frequency: "daily", condition: "Only if Driver is not 8" },
    { action: "Offer water to birds daily", frequency: "daily", condition: "Only if Driver is not 8" },
    { action: "Walk in sunlight", frequency: "daily", condition: "Only if Driver is not 8" },
    { action: "Wake up before sunrise and pray to the sun", frequency: "daily", condition: "Only if Driver is not 8" },
    { action: "Donate water to the thirsty", frequency: "as_needed" },
    { action: "Donate wheat to the needy", frequency: "as_needed" }
  ],
  2: [ // Chandra (Chandra) - Number 2
    { action: "Shiva upasana", frequency: "daily" },
    { action: "Offer water or panchamruth to Shivalinga in Shiva mandir", frequency: "weekly" },
    { action: "Walk in moonlight on Poornima", frequency: "monthly" },
    { action: "Fast on Poornima", frequency: "monthly" },
    { action: "Take blessings of mother daily", frequency: "daily" },
    { action: "Drink water & milk in a silver glass", frequency: "daily" },
    { action: "Read Shiva Chalisa or mantra", frequency: "weekly" },
    { action: "Donate white things (sugar, rice, clothes) to the needy", frequency: "as_needed" },
    { action: "Wear and donate silver", frequency: "as_needed" }
  ],
  3: [ // Guru (Guru) - Number 3
    { action: "Apply kesar (saffron) tilak on forehead daily", frequency: "daily" },
    { action: "Drink kesar milk or kesar water daily, or at least on Thursdays", frequency: "daily" },
    { action: "Offer haldi (turmeric) water on banana plant on Thursdays", frequency: "weekly" },
    { action: "Fast on Thursdays", frequency: "weekly" },
    { action: "Offer chana dal and gur (jaggery) to cow on Thursdays", frequency: "weekly" },
    { action: "Donate bananas", frequency: "as_needed" },
    { action: "Give/donate yellow pulses/fruits to the needy", frequency: "as_needed" },
    { action: "Offer yellow clothes to temple / pandit / needy", frequency: "as_needed" }
  ],
  4: [ // Rahu - Number 4 (shares with 7/Ketu)
    { action: "Feed birds (especially crows) and dogs daily", frequency: "daily" },
    { action: "Feed street dogs biscuits, bread, etc.", frequency: "daily" },
    { action: "Visit Kalbhairav temple on Saturday / Tuesday", frequency: "weekly" },
    { action: "Read Hanuman Chalisa; visit Hanuman mandir regularly", frequency: "weekly" },
    { action: "Pay at Shani mandir on Saturday", frequency: "weekly" },
    { action: "Visit Shiva temple", frequency: "weekly" },
    { action: "Do Durga puja / paath", frequency: "as_needed" },
    { action: "Donate electronics to the needy", frequency: "as_needed" },
    { action: "Donate mustard oil", frequency: "as_needed" },
    { action: "Donate pencil, lead, black items", frequency: "as_needed" },
    { action: "Donate sesame (til) oil", frequency: "as_needed" },
    { action: "Put coal in flowing water on Saturday / Tuesday", frequency: "weekly" }
  ],
  5: [ // Budh (Budh) - Number 5
    { action: "Eat tulsi leaves daily", frequency: "daily" },
    { action: "Eat more green vegetables", frequency: "daily" },
    { action: "Walk barefoot on green grass", frequency: "daily" },
    { action: "Feed cow green grass / palak / green vegetables on Wednesday", frequency: "weekly" },
    { action: "Visit Ganesh temple on Wednesday", frequency: "weekly" },
    { action: "Wear green bracelets / green clothes on Wednesday", frequency: "weekly" },
    { action: "Free a parrot or green bird on Wednesday", frequency: "as_needed", condition: "Every year or once in two years" },
    { action: "Donate green things to the needy or temple on Wednesday", frequency: "as_needed" },
    { action: "Plant or donate plants", frequency: "as_needed" },
    { action: "Donate palak / green vegetables to the needy", frequency: "as_needed" },
    { action: "Donate notebooks / stationery to kids", frequency: "as_needed" },
    { action: "Donate or contribute to child education / charity", frequency: "as_needed" }
  ],
  6: [ // Shukra (Shukra) - Number 6
    { action: "Visit Durga / Laxmi temple on Friday", frequency: "weekly" },
    { action: "Feed sweets to the needy on Friday", frequency: "weekly" },
    { action: "Donate white clothes / sweets / grain / rice / sugar to the needy on Friday", frequency: "as_needed" },
    { action: "Donate perfume to ladies on Friday", frequency: "as_needed" },
    { action: "Can wear diamond", frequency: "as_needed" }
  ],
  7: [ // Ketu - Number 7 (shares with 4/Rahu)
    { action: "Feed birds (especially crows) and dogs daily", frequency: "daily" },
    { action: "Feed street dogs biscuits, bread, etc.", frequency: "daily" },
    { action: "Visit Kalbhairav temple on Saturday / Tuesday", frequency: "weekly" },
    { action: "Read Hanuman Chalisa; visit Hanuman mandir regularly", frequency: "weekly" },
    { action: "Pay at Shani mandir on Saturday", frequency: "weekly" },
    { action: "Visit Shiva temple", frequency: "weekly" },
    { action: "Do Durga puja / paath", frequency: "as_needed" },
    { action: "Donate electronics to the needy", frequency: "as_needed" },
    { action: "Donate mustard oil", frequency: "as_needed" },
    { action: "Donate pencil, lead, black items", frequency: "as_needed" },
    { action: "Donate sesame (til) oil", frequency: "as_needed" },
    { action: "Put coal in flowing water on Saturday / Tuesday", frequency: "weekly" }
  ],
  8: [ // Shani (Shani) - Number 8
    { action: "Make your legs work — do physical exercise", frequency: "daily" },
    { action: "Do jhoota ghar seva (humble household service)", frequency: "daily" },
    { action: "Do Shani upasana / visit Shani temple on Saturday / read Shani Chalisa", frequency: "weekly" },
    { action: "Visit Hanuman mandir; read Hanuman Chalisa / Sunderkanda on Saturday", frequency: "weekly" },
    { action: "Light diya in Shani mandir / Hanuman temple with mustard oil", frequency: "weekly" },
    { action: "Donate black items: kambal (blanket) / umbrella / shoes / clothes", frequency: "as_needed" },
    { action: "Give coins to poor/needy (not to children)", frequency: "as_needed" },
    { action: "Give fried food to the needy", frequency: "as_needed" },
    { action: "Donate: mustard oil, til oil, black metal, iron, coins, black cloth, black lentils (dal)", frequency: "as_needed" },
    { action: "Tie all the above in a black cloth, touch to forehead, and offer at Shani mandir", frequency: "as_needed" }
  ],
  9: [ // Mangal (Mangal) - Number 9
    { action: "Read Hanuman Chalisa / Sunderkanda on Tuesdays", frequency: "weekly" },
    { action: "Visit Hanuman temple on Tuesday", frequency: "weekly" },
    { action: "Offer Sindoor + Jasmine oil + Orange Sindoor to Hanuman mandir", frequency: "weekly" },
    { action: "Pray to Lord Vishnu", frequency: "weekly" },
    { action: "Donate red clothes to needy / pujari (he should wear and give away)", frequency: "as_needed" },
    { action: "Give red sweets (motichoor laddu) to the needy", frequency: "as_needed" },
    { action: "Donate blood / organise blood donation camps", frequency: "quarterly" },
    { action: "Donate red fruits (tomatoes, etc.)", frequency: "as_needed" }
  ]
};

/**
 * General Blood Remedy (applicable to all)
 * From remedies.md Section 2
 * To be done quarterly once OR half-yearly once OR in an anti month
 */
export const BLOOD_REMEDY: GeneralRemedy = {
  name: "Blood Remedy",
  description: "To be done quarterly once OR half-yearly once OR in an anti month",
  actions: [
    "Donate blood / organize blood donation camps",
    "Drop 1–2 drops of blood on grass / garden / earth / mud",
    "Visit a surgical hospital, sit for 15 minutes and drink water from their dispenser (do not bring water home)",
    "Pray with family to avoid mishap",
    "Hear / read Hanuman Chalisa"
  ]
};

// ============================================================================
// ELEMENT REMEDIES (from goal.md Section 5)
// ============================================================================

/**
 * Element remedies for missing numbers
 * From goal.md Section 5: Remedies for Missing Elements
 */
export const ELEMENT_REMEDIES: ElementRemedy[] = [
  {
    element: "Wood",
    numbers: [4, 3],
    remedy: "Rudraksh"
  },
  {
    element: "Fire",
    numbers: [9],
    remedy: "Red thread"
  },
  {
    element: "Earth",
    numbers: [2, 5, 8],
    remedy: "White quartz / spatik / crystal"
  },
  {
    element: "Water",
    numbers: [1],
    remedy: "Carry water / keep on workplace"
  },
  {
    element: "Metal (Silver)",
    numbers: [7],
    remedy: "Silver-colour watch"
  },
  {
    element: "Metal (Gold)",
    numbers: [6],
    remedy: "Golden-colour watch"
  }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get planet remedies for a specific missing number
 */
export function getRemediesForNumber(number: number): Remedy[] {
  if (number < 1 || number > 9) {
    throw new Error(`Invalid number: ${number}. Must be between 1 and 9.`);
  }
  return PLANET_REMEDIES[number] || [];
}

/**
 * Get remedies for all missing numbers
 */
export function getRemediesForMissing(missing: number[], driver?: number): Remedy[] {
  const allRemedies: Remedy[] = [];

  for (const num of missing) {
    const remedies = getRemediesForNumber(num);

    // Filter out conditional remedies if driver doesn't match
    const filteredRemedies = remedies.filter(remedy => {
      if (!remedy.condition) return true;

      // Check "Only if Driver is not 8" condition
      if (remedy.condition.includes("Only if Driver is not 8")) {
        return driver !== 8;
      }

      return true;
    });

    allRemedies.push(...filteredRemedies);
  }

  return allRemedies;
}

/**
 * Get element remedies for missing numbers
 */
export function getElementRemediesForMissing(missing: number[]): ElementRemedy[] {
  return ELEMENT_REMEDIES.filter(remedy =>
    remedy.numbers.some(n => missing.includes(n))
  );
}

/**
 * Get remedies organized by frequency
 */
export function organizeRemediesByFrequency(remedies: Remedy[]): Record<string, Remedy[]> {
  const organized: Record<string, Remedy[]> = {
    daily: [],
    weekly: [],
    monthly: [],
    quarterly: [],
    as_needed: []
  };

  for (const remedy of remedies) {
    organized[remedy.frequency].push(remedy);
  }

  return organized;
}

/**
 * Get top remedies (prioritize by frequency)
 * Returns top N remedies ordered by: daily > weekly > monthly > quarterly > as_needed
 */
export function getTopRemedies(remedies: Remedy[], count: number = 5): Remedy[] {
  const organized = organizeRemediesByFrequency(remedies);

  const sorted: Remedy[] = [
    ...organized.daily,
    ...organized.weekly,
    ...organized.monthly,
    ...organized.quarterly,
    ...organized.as_needed
  ];

  return sorted.slice(0, count);
}

/**
 * Get combined remedies (both Rahu and Ketu) if both 4 and 7 are missing
 * They share many remedies, so combine and deduplicate
 */
export function getCombinedRahuKetuRemedies(): Remedy[] {
  const rahu = PLANET_REMEDIES[4];
  const ketu = PLANET_REMEDIES[7];

  // Deduplicate by action text
  const seen = new Set<string>();
  const combined: Remedy[] = [];

  for (const remedy of [...rahu, ...ketu]) {
    if (!seen.has(remedy.action)) {
      seen.add(remedy.action);
      combined.push(remedy);
    }
  }

  return combined;
}

/**
 * Check if a person should perform a specific remedy
 * Based on conditions (e.g., "Only if Driver is not 8")
 */
export function shouldPerformRemedy(remedy: Remedy, driver: number): boolean {
  if (!remedy.condition) return true;

  if (remedy.condition.includes("Only if Driver is not 8")) {
    return driver !== 8;
  }

  return true;
}

/**
 * Get remedy summary for UI display
 */
export function getRemedySummary(remedies: Remedy[]): {
  daily: number;
  weekly: number;
  monthly: number;
  quarterly: number;
  as_needed: number;
  total: number;
} {
  const organized = organizeRemediesByFrequency(remedies);

  return {
    daily: organized.daily.length,
    weekly: organized.weekly.length,
    monthly: organized.monthly.length,
    quarterly: organized.quarterly.length,
    as_needed: organized.as_needed.length,
    total: remedies.length
  };
}
