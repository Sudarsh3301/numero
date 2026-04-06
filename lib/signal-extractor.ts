import { getPlanetDay } from './numerology/planet-days';
import { getPersonalYearEffect } from './numerology/personal-year';
import { analyzeComplementary } from './numerology/complementary';

export interface NumerologySignals {
  name: string;

  // Indian Numerology - PRIMARY
  driver: number;
  conductor: number;
  ruling_planet: string;
  conductor_planet: string;
  dc_strength: number | null;
  dc_professions: string[];
  dc_affect: string;
  master_number: { isMaster: boolean; number: number | null; strength: number } | null;
  karmic_numbers: number[];
  karmic_meanings: string[];

  // Health & Remedies
  age: number;
  health_governed_by: 'driver' | 'conductor';
  health_planet: string;
  health_issues: string[];
  top_remedies: string[];
  element_remedies: string[];

  // Lo Shu Grid
  missing_numbers: number[];
  dominant_numbers: number[];
  present_numbers: number[];
  arrows_present: string[];
  arrows_absent: string[];

  // Personal Year
  personal_year: number;
  personal_year_theme: string;
  personal_year_effect: {
    year: number;
    name: string;
    type: string;
    guidance: string;
    is_blessing_year: boolean;
  };

  // Planet Days & Colors (NEW)
  planet_day_info: {
    driver_day: string;
    conductor_day: string;
    driver_colors_use: string[];
    driver_colors_avoid: string[];
    conductor_colors_use: string[];
    conductor_colors_avoid: string[];
  };

  // Complementary Numbers (NEW)
  complementary_support: Array<{
    missing_number: number;
    complements_needed: number[];
    complements_present: number[];
    support_level: string;
  }>;

  // Plane Distribution
  plane_distribution: {
    intellectual: number;
    emotional: number;
    practical: number;
    dominant: string;
  };
}

export interface CoupleSignals {
  person1: NumerologySignals;
  person2: NumerologySignals;
  compatibility: {
    // Driver-Conductor compatibility - PRIMARY
    driver_relationship: string; // friend/enemy/neutral
    dc_compatibility_score: number;

    // Planet relationship
    planet_relationship: string;
  };
}

export interface ArchetypeDescriptor {
  name: string;
  description: string;
}

export interface SingleArchetypes {
  primary: ArchetypeDescriptor;
  secondary: ArchetypeDescriptor;
  shadow: ArchetypeDescriptor;
}

export interface CoupleArchetypes {
  person1: SingleArchetypes;
  person2: SingleArchetypes;
}

type PersonProfile = {
  name?: string;

  // Indian Numerology
  driver?: number;
  conductor?: number;
  rulingPlanet?: { name?: string; element?: string };
  conductorPlanet?: { name?: string };
  dcProfile?: { strength?: number | null; professions?: string[]; affect?: string; warnings?: string };
  masterNumber?: { isMaster?: boolean; number?: number | null; strength?: number };
  karmicNumbers?: { hasKarmic?: boolean; numbers?: number[]; meanings?: string[] };
  age?: number;
  healthProfile?: { planet?: string; issues?: string[]; lifestyle?: string };
  activeRemedies?: Array<{ action?: string; frequency?: string }>;
  elementRemedies?: Array<{ remedy?: string }>;

  // Lo Shu Grid
  missing?: number[];
  repeated?: number[];
  present?: number[];
  personalYear?: number;
  pyTheme?: string;
  planes?: { intellectual?: number; emotional?: number; practical?: number; dominant?: string };
  arrows?: { present?: string[]; absent?: string[] };
};

type CompatibilityProfile = {
  // Indian Numerology
  driverRelationship?: string;
  dcCompatibilityScore?: number;
  planetRelationship?: string;
};

export function extractSignals(profile: PersonProfile): NumerologySignals {
  // Extract Indian numerology data
  const driver = profile.driver || 0;
  const conductor = profile.conductor || 0;
  const age = profile.age || 0;
  const healthGovernedBy = age < 40 ? 'driver' : 'conductor';
  const missing = profile.missing || [];
  const present = profile.present || [];
  const personalYear = profile.personalYear || 0;

  // Get planet day information
  const driverDayInfo = getPlanetDay(driver);
  const conductorDayInfo = getPlanetDay(conductor);

  // Get personal year effect
  const pyEffect = getPersonalYearEffect(personalYear);

  // Analyze complementary numbers
  const complementaryAnalysis = analyzeComplementary(missing, present);

  return {
    name: profile.name || 'Person',

    // Indian Numerology - PRIMARY
    driver,
    conductor,
    ruling_planet: profile.rulingPlanet?.name || '',
    conductor_planet: profile.conductorPlanet?.name || '',
    dc_strength: profile.dcProfile?.strength ?? null,
    dc_professions: profile.dcProfile?.professions || [],
    dc_affect: profile.dcProfile?.affect || '',
    master_number: profile.masterNumber?.isMaster ? {
      isMaster: true,
      number: profile.masterNumber.number || null,
      strength: profile.masterNumber.strength || 0
    } : null,
    karmic_numbers: profile.karmicNumbers?.numbers || [],
    karmic_meanings: profile.karmicNumbers?.meanings || [],

    // Health & Remedies
    age,
    health_governed_by: healthGovernedBy,
    health_planet: profile.healthProfile?.planet || '',
    health_issues: profile.healthProfile?.issues || [],
    top_remedies: (profile.activeRemedies || [])
      .slice(0, 5)
      .map(r => r.action || '')
      .filter(Boolean),
    element_remedies: (profile.elementRemedies || [])
      .map(r => r.remedy || '')
      .filter(Boolean),

    // Lo Shu Grid
    missing_numbers: missing,
    dominant_numbers: profile.repeated || [],
    present_numbers: present,
    arrows_present: profile.arrows?.present || [],
    arrows_absent: profile.arrows?.absent || [],

    // Personal Year
    personal_year: personalYear,
    personal_year_theme: profile.pyTheme || '',
    personal_year_effect: {
      year: pyEffect.year,
      name: pyEffect.name,
      type: pyEffect.type,
      guidance: pyEffect.guidance,
      is_blessing_year: pyEffect.isBlessingYear,
    },

    // Planet Days & Colors
    planet_day_info: {
      driver_day: driverDayInfo.day,
      conductor_day: conductorDayInfo.day,
      driver_colors_use: driverDayInfo.colorsToUse,
      driver_colors_avoid: driverDayInfo.colorsToAvoid,
      conductor_colors_use: conductorDayInfo.colorsToUse,
      conductor_colors_avoid: conductorDayInfo.colorsToAvoid,
    },

    // Complementary Numbers
    complementary_support: complementaryAnalysis.map(item => ({
      missing_number: item.missing,
      complements_needed: item.complementsNeeded,
      complements_present: item.complementsPresent,
      support_level: item.supportLevel,
    })),

    // Plane Distribution
    plane_distribution: {
      intellectual: profile.planes?.intellectual || 0,
      emotional: profile.planes?.emotional || 0,
      practical: profile.planes?.practical || 0,
      dominant: profile.planes?.dominant || '',
    },
  };
}

export function extractCoupleSignals(
  person1: PersonProfile,
  person2: PersonProfile,
  compatibility: CompatibilityProfile = {}
): CoupleSignals {
  return {
    person1: extractSignals(person1),
    person2: extractSignals(person2),
    compatibility: {
      // Driver-Conductor compatibility - PRIMARY
      driver_relationship: compatibility.driverRelationship || compatibility.planetRelationship || 'neutral',
      dc_compatibility_score: compatibility.dcCompatibilityScore || 0,

      // Planet relationship
      planet_relationship: compatibility.planetRelationship || 'neutral',
    },
  };
}