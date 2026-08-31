/**
 * Health Profiles by Number
 * Based on remedies.md Section 1: Likely Health Issues by Number
 *
 * KEY RULE: Before age 40 — Driver governs health. Post age 40 — Conductor governs health.
 */

import type { HealthProfile } from './types';
import { getPlanetAssociation } from './planets';

/**
 * Health issues database for all 9 numbers
 * From remedies.md Section 1
 */
export const HEALTH_ISSUES: Record<number, HealthProfile> = {
  1: {
    number: 1,
    planet: "Surya",
    title: "High Energy",
    issues: [
      "Heart-related issues",
      "Blood-related issues (blood pressure, circulation)",
      "Poor eyesight"
    ],
    lifestyle: "Eat easy-to-digest food: barley, citrus fruits, ginger, raisins, honey, dates. Avoid foods that increase stomach bile — no fatty foods, no late-night food. Set up an exercise routine to relax & de-stress. Anti-anxiety activities. Yoga can help.",
    remedies: [
      "Easy-to-digest food",
      "Avoid fatty foods",
      "No late-night eating",
      "Regular exercise routine",
      "Anti-anxiety activities",
      "Yoga practice"
    ]
  },
  2: {
    number: 2,
    planet: "Chandra",
    title: "Sensitive",
    issues: [
      "Anemia",
      "Stress",
      "Trouble sleeping",
      "Strain causing nervousness",
      "Asthma"
    ],
    lifestyle: "Eat seasonal fruits, melons, turnips, cucumber, bananas. Avoid emotional conflicts, cool/dark/dirty places. Sleep with a light on to avoid depressive tendencies. Do not overthink. Do yoga to relax.",
    remedies: [
      "Seasonal fruits",
      "Avoid emotional conflicts",
      "Sleep with light on",
      "Don't overthink",
      "Yoga for relaxation"
    ]
  },
  3: {
    number: 3,
    planet: "Guru",
    title: "Over-thinking",
    issues: [
      "Skin diseases (rashes)",
      "Joint pains",
      "Diabetes",
      "Paralysis",
      "Heart and chest problems",
      "Lung issues",
      "Over-thinking can cause problems"
    ],
    lifestyle: "Do not garner hate or plan revenge — adds to stress. Avoid emotional conflicts. Eat: apple, pomegranates, grapes, spices, herbs, cloves, mint. Take fenugreek seeds soaked overnight and drink the water in the morning. Massage head with sesame oil. Include fig and wheat in diet. Avoid non-veg. Avoid addictions (smoking, drinking, etc.).",
    remedies: [
      "Avoid hate and revenge",
      "Fenugreek water (morning)",
      "Head massage with sesame oil",
      "Avoid non-veg",
      "No smoking/drinking"
    ]
  },
  4: {
    number: 4,
    planet: "Rahu",
    title: "Addictive",
    issues: [
      "Cold, cough, influenza",
      "Lung problems",
      "Piles",
      "Constipation",
      "Tumor",
      "Urinary/kidney issues",
      "Back and head pain",
      "Depressive tendency at later stages",
      "Prone to addictions"
    ],
    lifestyle: "Eat seasonal fruits, beetroot, spinach, herbal foods, green leafy vegetables, sprouts. Avoid intoxicants, red meat and spicy foods. (They will usually dislike all healthy foods.) Regular workout.",
    remedies: [
      "Seasonal fruits and greens",
      "Avoid intoxicants",
      "No red meat or spicy food",
      "Regular physical workout"
    ]
  },
  5: {
    number: 5,
    planet: "Budh",
    title: "Nervous",
    issues: [
      "Mental strain",
      "Nervousness",
      "Frequent cough/cold/flu",
      "Insomnia",
      "Kidney & skin problems"
    ],
    lifestyle: "Eat: parsley, parsnip, mushroom, nuts, carrots, potatoes, oatmeal, rice. Avoid stress. Adequate sleep necessary. Walnuts and citrus fruits. Rest needed.",
    remedies: [
      "Stress avoidance",
      "Adequate sleep",
      "Walnuts and citrus fruits",
      "Regular rest periods"
    ]
  },
  6: {
    number: 6,
    planet: "Shukra",
    title: "ENT",
    issues: [
      "ENT issues",
      "Weak heart",
      "Infection of nose/throat/lungs",
      "Women may have breast problems"
    ],
    lifestyle: "Eat greens, cucumber, apples, salads, rice, pomegranates, almonds and beans regularly. Do pranayama. Avoid non-veg and addictions.",
    remedies: [
      "Green vegetables",
      "Pranayama breathing",
      "Avoid non-veg",
      "No addictions"
    ]
  },
  7: {
    number: 7,
    planet: "Ketu",
    title: "Skin & Digestion",
    issues: [
      "Skin diseases",
      "Excessive perspiration",
      "Indigestion",
      "Bronchitis",
      "Cough, cold",
      "Nasal congestion",
      "Poor eyesight"
    ],
    lifestyle: "Avoid intoxicants, smoking & non-veg. Take Vitamin D & E. Drink fresh fruit juices. Should not overwork. Eat grapes & mushrooms regularly.",
    remedies: [
      "No smoking or intoxicants",
      "Vitamin D & E",
      "Fresh fruit juices",
      "Avoid overwork",
      "Grapes and mushrooms"
    ]
  },
  8: {
    number: 8,
    planet: "Shani",
    title: "Chronic",
    issues: [
      "Liver, bile & intestine-related issues",
      "Teeth and ear problems",
      "Chronic diseases: epilepsy, leprosy, diphtheria, anemia",
      "Leg-related issues",
      "Can be overweight"
    ],
    lifestyle: "Massage regularly with mustard oil. Consume more iron and calcium. Have buttermilk daily. Include carrot in daily diet. Consume lots of fluids during the day. Do lots of physical work — legs should be tired. Walk ½ hour daily.",
    remedies: [
      "Mustard oil massage",
      "Iron and calcium intake",
      "Daily buttermilk",
      "Carrot in diet",
      "Walk 30 minutes daily",
      "Physical leg work"
    ]
  },
  9: {
    number: 9,
    planet: "Mangal",
    title: "High Energy / Impulsive",
    issues: [
      "Smallpox, measles",
      "Headaches",
      "Heart issues",
      "Fever (all kinds)",
      "Sexual diseases",
      "High blood pressure",
      "Throat, lung & kidney infections",
      "Over-thinking and short temper"
    ],
    lifestyle: "Avoid impulsive behavior & mental anxiety. Garlic, onion, ginger, green chilies and coconut water are very beneficial. Prone to addictions — avoid intoxicants & drugs. Avoid oily/greasy food, pickles & hot spices. Do lots of physical workout.",
    remedies: [
      "Control impulsive behavior",
      "Garlic, ginger, coconut water",
      "Avoid intoxicants",
      "No oily/greasy food",
      "Lots of physical workout"
    ]
  }
};

/**
 * Get health profile for a specific number
 */
export function getHealthProfile(number: number): HealthProfile {
  if (number < 1 || number > 9) {
    throw new Error(`Invalid number: ${number}. Must be between 1 and 9.`);
  }
  return HEALTH_ISSUES[number];
}

/**
 * Get current health profile based on age
 * KEY RULE from remedies.md:
 * - Before age 40: Driver governs health
 * - Post age 40: Conductor governs health
 */
export function getCurrentHealthProfile(driver: number, conductor: number, age: number): HealthProfile {
  const governingNumber = age < 40 ? driver : conductor;
  const profile = getHealthProfile(governingNumber);

  return {
    ...profile,
    // Add age context to the profile
    number: governingNumber
  };
}

/**
 * Get health governance info for display
 */
export function getHealthGovernanceInfo(age: number): {
  governedBy: 'driver' | 'conductor';
  message: string;
} {
  if (age < 40) {
    return {
      governedBy: 'driver',
      message: `Age ${age} - Health governed by Driver`
    };
  } else {
    return {
      governedBy: 'conductor',
      message: `Age ${age} - Health governed by Conductor`
    };
  }
}

/**
 * Check if person should be extra careful about health
 * Based on specific number combinations
 */
export function getHealthWarnings(driver: number, conductor: number, age: number): string[] {
  const warnings: string[] = [];
  const currentNumber = age < 40 ? driver : conductor;

  // 4 or 8: Struggling numbers with health issues
  if (currentNumber === 4 || currentNumber === 8) {
    warnings.push("Struggling number - pay extra attention to health");
  }

  // 7: Disappointment and health issues
  if (currentNumber === 7) {
    warnings.push("Prone to disappointment in health - regular checkups recommended");
  }

  // 9: High energy but prone to impulsive health decisions
  if (currentNumber === 9) {
    warnings.push("Control impulsive behavior to avoid health risks");
  }

  // Transition warning (age 38-42)
  if (age >= 38 && age <= 42) {
    warnings.push("Transitional age - health governance shifting from Driver to Conductor");
  }

  return warnings;
}

/**
 * Get lifestyle recommendations summary
 */
export function getLifestyleSummary(number: number): {
  dos: string[];
  donts: string[];
} {
  const profile = getHealthProfile(number);

  // Extract dos and donts from lifestyle string
  const lifestyle = profile.lifestyle;

  // Simple parsing - in real implementation, could be more sophisticated
  const dos = profile.remedies;
  const donts = lifestyle.match(/Avoid ([^.]+)/g)?.map(s => s.replace('Avoid ', '')) || [];

  return { dos, donts };
}
