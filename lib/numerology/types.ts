/**
 * TypeScript types for Indian Numerology System
 * Based on goal.md and remedies.md
 */

// ============================================================================
// CORE TYPES
// ============================================================================

export interface Planet {
  number: number;
  name: string;
  sanskrit: string;
  title: string;
  birthDates: number[];
  traits: string[];
  friends: number[];
  enemies: number[];
  neutral: number[];
}

export interface DCCombination {
  driver: number;
  conductor: number;
  strength: number | null; // 1-5 scale, null = unclear ("?")
  affect: string;
  professions: string[];
  warnings?: string;
}

export interface MasterNumberResult {
  isMaster: boolean;
  number: 11 | 22 | 33 | null;
  strength: 0 | 50 | 100;
  method: 'horizontal' | 'vertical' | 'both' | null;
}

export interface KarmicNumberResult {
  hasKarmic: boolean;
  numbers: number[];
  meanings: string[];
}

export interface RepetitionEffect {
  number: number;
  count: number;
  effect: string;
  severity: 'ok' | 'strength' | 'exaggerated' | 'negative';
}

export interface MissingEffect {
  number: number;
  planet: string;
  effect: string;
  brokenPlanes: string[];
}

// ============================================================================
// HEALTH & REMEDIES TYPES
// ============================================================================

export interface HealthProfile {
  number: number;
  planet: string;
  title: string;
  issues: string[];
  lifestyle: string;
  remedies: string[];
}

export interface Remedy {
  action: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'as_needed';
  condition?: string; // e.g., "Only if Driver is not 8"
}

export interface ElementRemedy {
  element: string; // "Wood", "Fire", "Earth", "Water", "Metal_Silver", "Metal_Gold"
  numbers: number[];
  remedy: string;
}

export interface GeneralRemedy {
  name: string;
  description: string;
  actions: string[];
}

// ============================================================================
// COMPATIBILITY TYPES
// ============================================================================

export interface CompatibilityScore {
  total: number; // 0-100
  breakdown: {
    driverMatch: number; // 0, 30, or 40
    strongerDriver: number; // 0 or 10
    numberExchanges: number; // 0-40 (10% per exchange)
    fivePresence: number; // 0 or 5
    sixPresence: number; // 0 or 5
    bothFiveSix: number; // 0 or 5
  };
  interpretation: string; // "Not Compatible", "Average", "Good", "Best", "Excellent"
  warnings: string[];
}

export interface NumberExchange {
  person1Missing: number[];
  person2Missing: number[];
  exchanges: Array<{
    number: number;
    person1Has: boolean;
    person2Has: boolean;
  }>;
  exchangeCount: number;
}

// ============================================================================
// PLANES & ARROWS TYPES (existing, kept for compatibility)
// ============================================================================

export interface PlaneScore {
  intellectual: number;
  emotional: number;
  practical: number;
  dominant: 'intellectual' | 'emotional' | 'practical';
  pct: {
    intellectual: number;
    emotional: number;
    practical: number;
  };
}

export interface Arrow {
  id: string;
  name: string;
  nums: number[];
  desc?: string;
}

export interface ArrowDetection {
  present: Arrow[];
  absent: Arrow[];
}

// ============================================================================
// COMPREHENSIVE NUMEROLOGY PROFILE
// ============================================================================

export interface NumerologyProfile {
  // Basic Info
  dob: string;
  age: number;

  // Core Numbers
  driver: number;
  conductor: number;
  masterNumber: MasterNumberResult;
  karmicNumbers: KarmicNumberResult;

  // Lo Shu Grid
  counts: Record<number, number>;
  missing: number[];
  repeated: number[];
  present: number[];

  // Interpretations
  repetitionEffects: RepetitionEffect[];
  missingEffects: MissingEffect[];

  // Driver-Conductor
  dcProfile: DCCombination;
  rulingPlanet: Planet;
  conductorPlanet: Planet;

  // Health & Remedies
  healthProfile: HealthProfile; // Based on age: driver <40, conductor ≥40
  activeRemedies: Remedy[]; // Planet remedies for missing numbers
  elementRemedies: ElementRemedy[]; // Element remedies from goal.md

  // Planes & Arrows (existing)
  planes: PlaneScore;
  arrows: ArrowDetection;

  // Kua (for Numero Vastu)
  kua: number;

  // Personal Year (Dasa system)
  personalYear?: number;
  personalMonth?: number;
  personalDay?: number;
}

// ============================================================================
// COUPLE PROFILE
// ============================================================================

export interface CoupleProfile {
  person1: NumerologyProfile;
  person2: NumerologyProfile;
  compatibility: CompatibilityScore;
  numberExchanges: NumberExchange;
  planetRelationship: 'friend' | 'enemy' | 'neutral';
  sharedLucky: string[]; // Shared lucky directions
  sharedUnlucky: string[]; // Shared unlucky directions
}
