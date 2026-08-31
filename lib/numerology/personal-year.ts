/**
 * Personal Year Effects
 *
 * Provides detailed effects and guidance for each Personal Year (1-9)
 * in the Dasa system of Indian numerology.
 *
 * Source: goal.md Section 18 - Personal Year Effects
 */

export type PersonalYearType = 'blessing' | 'testing' | 'no-risk' | 'judgment' | 'completion';

export interface PersonalYearEffect {
  year: number;
  name: string;
  type: PersonalYearType;
  effects: string;
  guidance: string;
  isBlessingYear: boolean;
}

/**
 * Personal Year effects for years 1-9
 * Each 10th year the planets realign and the cycle restarts
 */
export const PERSONAL_YEAR_EFFECTS: Record<number, PersonalYearEffect> = {
  1: {
    year: 1,
    name: "Blessing Year — Surya Year",
    type: "blessing",
    effects: "Seed is sown. Start of cycle. Year of execution, not planning.",
    guidance: "Enthusiasm and energy drive greater results in all works started. This is the time to take initiative and start new projects.",
    isBlessingYear: true
  },
  2: {
    year: 2,
    name: "Chandra Year",
    type: "testing",
    effects: "Roots start growing. Slow down and go gentle. Year of consolidation, demands patience.",
    guidance: "Analyze & consolidate past/present. Plan & organize. Year of partnership — except with 4, 8 & 9.",
    isBlessingYear: false
  },
  3: {
    year: 3,
    name: "Guru Year",
    type: "blessing",
    effects: "Sprouting starts. Year of knowledge, education, spiritual pursuits.",
    guidance: "Focus on upgrading self. Year of expansion. Business linked with education may flourish. Be creative — socialize, travel, plan for kids.",
    isBlessingYear: true
  },
  4: {
    year: 4,
    name: "Rahu Year",
    type: "testing",
    effects: "Plant strengthening year. Testing year. Only true & sincere hard work gives success.",
    guidance: "Do not get diverted by misleading thoughts. Have a goal and pursue it — else the year gets wasted.",
    isBlessingYear: false
  },
  5: {
    year: 5,
    name: "Blessing Year",
    type: "blessing",
    effects: "Enjoy the flowers of the plant. Year of success. Good for all — expect the unexpected.",
    guidance: "Auspicious for change/variety including a career shift. Embrace opportunities as they come.",
    isBlessingYear: true
  },
  6: {
    year: 6,
    name: "Blessing Year",
    type: "blessing",
    effects: "Enjoy the fruits. Year of luxury, home & family.",
    guidance: "Good time to get married. New home/vehicle, birth of a child, marriage. If relation is bad — might get a divorce.",
    isBlessingYear: true
  },
  7: {
    year: 7,
    name: "No-risk Year",
    type: "no-risk",
    effects: "Rest and introspect. Learn new skills. Can get sudden disappointment.",
    guidance: "Better to be religious/god-fearing. DO NOT start anything new. Focus on learning and spiritual growth.",
    isBlessingYear: false
  },
  8: {
    year: 8,
    name: "Judgment Year — Karmic Year",
    type: "judgment",
    effects: "Reap the fruits of your karma/hard work. Usually a balanced year.",
    guidance: "No exceptional or unexpected results/events. Stay steady and continue your efforts.",
    isBlessingYear: false
  },
  9: {
    year: 9,
    name: "Completion of Cycle — Abusive Year",
    type: "completion",
    effects: "True colours are revealed. Unpredictable year — can be good or very bad.",
    guidance: "Prepare for next blessing year (1). Let go of what no longer serves you and get ready for a new cycle.",
    isBlessingYear: false
  }
};

/**
 * Get Personal Year effect information for a given year number
 * @param pyNumber - Personal Year number (1-9)
 * @returns PersonalYearEffect information
 */
export function getPersonalYearEffect(pyNumber: number): PersonalYearEffect {
  const normalizedYear = ((pyNumber - 1) % 9) + 1;
  if (normalizedYear < 1 || normalizedYear > 9) {
    throw new Error(`Invalid Personal Year: ${pyNumber}`);
  }
  return PERSONAL_YEAR_EFFECTS[normalizedYear];
}
