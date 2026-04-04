/**
 * Number Repetition Effects
 * Based on goal.md Section 7: Number Repetition — Thumb Rules & Effects
 *
 * Thumb Rule:
 * - 1 time: Under power or OK
 * - 2 times: Strength is good / best (pair is best)
 * - 3 times: Exaggerated / aggravated
 * - 4+ times: Negative zone
 */

import type { RepetitionEffect } from './types';

/**
 * Get repetition effects for all numbers in the Lo Shu grid
 * Analyzes each number 1-9 based on how many times it appears
 */
export function getRepetitionEffects(counts: Record<number, number>): RepetitionEffect[] {
  const effects: RepetitionEffect[] = [];

  for (let num = 1; num <= 9; num++) {
    const count = counts[num] || 0;

    if (count === 0) {
      continue; // Missing numbers handled separately
    }

    const effect = getRepetitionEffectForNumber(num, count);
    if (effect) {
      effects.push(effect);
    }
  }

  return effects;
}

/**
 * Get repetition effect for a specific number based on its count
 */
function getRepetitionEffectForNumber(number: number, count: number): RepetitionEffect | null {
  if (count === 0) return null;

  // Determine severity based on count
  let severity: 'ok' | 'strength' | 'exaggerated' | 'negative';
  if (count === 1) severity = 'ok';
  else if (count === 2) severity = 'strength';
  else if (count === 3) severity = 'exaggerated';
  else severity = 'negative'; // 4+

  const effect = REPETITION_EFFECTS[number]?.[count] || REPETITION_EFFECTS[number]?.['default'];

  if (!effect) return null;

  return {
    number,
    count,
    effect,
    severity
  };
}

/**
 * Repetition effects database from goal.md Section 7
 * Organized by number and count
 */
const REPETITION_EFFECTS: Record<number, Record<number | 'default', string>> = {
  1: { // Communicator
    1: "May be a good communicator but finds it hard to let inner self come out",
    2: "Excellent communicator / articulate / impartial",
    3: "Chatterbox / diplomatic / introverted depending on situation",
    4: "Expressive but misunderstood in society",
    5: "May be a communicator surrounded with scandals/controversies. Definitely big name & fame in society.",
    default: "Very expressive but often misunderstood"
  },
  2: { // Intuitive
    1: "Sensitive & intuitive but may not use it",
    2: "Highly intelligent, sensitive & intuitive",
    3: "Over-sensitive, easily hurt, avoids big gatherings",
    4: "Impatient, extremely sensitive, many face depression. If driver is 2,4,8,9 — be careful in handling them.",
    default: "Extremely sensitive - handle with care"
  },
  3: { // Creative
    1: "Good & creative mind",
    2: "Good imagination, good communication. May be eccentric & enjoy flouting rules. Good starters, bad finishers.",
    3: "Over-imagination, may not connect well with society. Argumentative.",
    4: "Impractical, fearful, lives in fool's paradise",
    default: "Over-imaginative and impractical"
  },
  4: { // Disciplined
    1: "Practical and hard working, punctual. Enjoys hands-on activities — artists, handicrafts, chef, etc.",
    2: "Excellent organizational skills. Creates order in anything. More impatient, can annoy others. Penny wise, pound foolish.",
    3: "Struggle and cannot identify true potential. Wastes time in wrong fields.",
    4: "Aggressive behavior. Destructive, negative outputs.",
    default: "Highly aggressive and destructive tendencies"
  },
  5: { // Balanced
    1: "Emotionally well balanced, self-responsible & accountable, lazy",
    2: "Highly romantic, always young at heart, intense, determined, lazy. Always motivates & inspires others. Does not like interference. Gains weight after 32 yrs, usually on higher side.",
    3: "Always keeps resignation in pocket. Cannot tolerate interference. Does not trust others easily.",
    4: "Exaggerates things, speaks unwittingly, over-adventurous & prone to accidents. Very frequent job/work shifting. Cannot stick to one thing.",
    default: "Cannot stick to one thing - constant shifting"
  },
  6: { // Family
    1: "Great love for home and loved ones. Centre of attraction in family. Over-protective towards family.",
    2: "Worried/obsessed with kids and loved ones. Sense of insecurity. Thinks only they know what is good for family.",
    3: "Always looks at the negative side of life. Becomes a hindrance in kids' progress. Too involved in family members' affairs — will decide everything.",
    4: "Extreme family involvement - may obstruct family members' growth",
    default: "Obsessive about family matters"
  },
  7: { // Disappointments
    1: "Disappointment in love, health, money and emotional setback",
    2: "Highly disappointed in love, health and money. Frequently deceived by own people. Spiritualism & occult can solve intricate problems.",
    3: "Marriage may be a problem. Broken hearts in love. Attracted towards spiritualism, religion and occult.",
    4: "Depression because relationship sector is a problem. Marriage & love issues. Partnership & business should be avoided (do not invest money). Money given will not come back. Stick to occult/spiritualism.",
    default: "Severe relationship and partnership problems - avoid business partnerships"
  },
  8: { // Finance
    1: "Able to manage money and finance. Logical and argumentative.",
    2: "Does not trust others. Always relies on own experience. Keeps money in multiple pockets and bank accounts. Stubborn.",
    3: "Extremely restless, strong need for change. Fails due to attitude. Might not update themselves. Chances of loan default. Do not lend money to these people — bad money managers.",
    4: "Very poor money management - high risk of loan defaults",
    default: "Serious financial management issues"
  },
  9: { // Humanitarian
    1: "Intelligent and humanitarian",
    2: "Intelligent and thinks they are the best. Tries to prove their point. Egoist.",
    3: "Intelligent but tends to criticize/insult others. Needs to channelize intelligence (work out = positive aspects come out). May not find reciprocation in love.",
    4: "Caught in a rut. Highly egoistic, unpredictable, very angry, somersaults in behavior.",
    5: "Thinks they are the best and does not connect well with society in day-to-day life. Do not marry double-9 persons — difficult in the end.",
    default: "Extreme ego and unpredictable behavior - marriage very difficult"
  }
};

/**
 * Get special notes for specific numbers
 * From goal.md Section 7 special notes
 */
export function getSpecialRepetitionNotes(number: number, count: number): string | null {
  if (number === 7 && count === 1) {
    return "Disappointment even one time is OK — do not increase disappointment";
  }

  if ((number === 4 || number === 8) && count === 1) {
    return "Struggling number. Even one time is same as a pair";
  }

  return null;
}

/**
 * Get the most repeated number (strongest/most aggressive in grid)
 * From goal.md: "Number repeating the most times is the strongest/most aggressive in the grid"
 */
export function getMostRepeatedNumber(counts: Record<number, number>): { number: number; count: number } | null {
  let maxCount = 0;
  let maxNumber = 0;

  for (let num = 1; num <= 9; num++) {
    const count = counts[num] || 0;
    if (count > maxCount) {
      maxCount = count;
      maxNumber = num;
    }
  }

  if (maxCount === 0) return null;

  return { number: maxNumber, count: maxCount };
}

/**
 * Check if the most repeated number is a friend of the driver
 * "If this number is a friend of the driver, it will stop struggle and help growth/progress"
 */
export function doesStrongestNumberSupportDriver(
  strongestNumber: number,
  driver: number,
  planetFriends: number[]
): boolean {
  return planetFriends.includes(strongestNumber);
}
