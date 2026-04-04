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

  // Health & Remedies (NEW)
  age: number;
  health_governed_by: 'driver' | 'conductor';
  health_planet: string;
  health_issues: string[];
  top_remedies: string[];
  element_remedies: string[];

  // Lo Shu Grid
  kua_number: number;
  trigram: string;
  missing_numbers: number[];
  dominant_numbers: number[];
  present_numbers: number[];
  arrows_present: string[];
  arrows_absent: string[];

  // Planes & Elements (kept for Numero Vastu)
  kua_element: string; // Now represents "ruling planet element"
  kua_group: string;
  kua_trait: string;
  personal_year: number;
  personal_year_theme: string;
  year_modifier: string;
  year_relation: string;
  directional_energy: {
    lucky_primary: string;
    unlucky_primary: string;
    lucky_directions: string[];
    unlucky_directions: string[];
  };
  feng_shui_alerts: string[];
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
    // Driver-Conductor compatibility (NEW - PRIMARY)
    driver_relationship: string; // friend/enemy/neutral
    dc_compatibility_score: number;

    // Element/Planet relationship
    element_relation: string;
    planet_relationship: string;

    // Directional compatibility
    shared_lucky_dirs: string[];
    shared_unlucky_dirs: string[];
    kua_harmony: string;

    // Traditional metrics (kept)
    supports: boolean;
    controls: boolean;
    score: number;
    same_group: boolean;
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

  // Indian Numerology (NEW)
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

  // Existing fields
  kua?: number;
  trigram?: string;
  element?: string;
  group?: string;
  trait?: string;
  missing?: number[];
  repeated?: number[];
  present?: number[];
  personalYear?: number;
  pyTheme?: string;
  yearElementModifier?: { tone?: string; rel?: string };
  planes?: { intellectual?: number; emotional?: number; practical?: number; dominant?: string };
  arrows?: { present?: string[]; absent?: string[] };
  baZhai?: { lucky?: Record<string, string>; unlucky?: Record<string, string> };
  flyingStarAlerts?: string[];
  flyingStars?: Record<string, any>;
};

type CompatibilityProfile = {
  // Indian Numerology (NEW)
  driverRelationship?: string;
  dcCompatibilityScore?: number;
  planetRelationship?: string;

  // Existing
  elementRelation?: string;
  sharedLucky?: string[];
  sharedUnlucky?: string[];
  sameGroup?: boolean;
  supports?: boolean;
  controls?: boolean;
  score?: number;
};

function recordValues(record?: Record<string, string>): string[] {
  return Object.values(record || {}).filter(Boolean);
}

export function extractFengShuiAlerts(
  flyingStarsOrAlerts?: string[] | Record<string, any>
): string[] {
  if (!flyingStarsOrAlerts) return [];

  if (Array.isArray(flyingStarsOrAlerts)) {
    return flyingStarsOrAlerts.filter(Boolean);
  }

  return Object.entries(flyingStarsOrAlerts)
    .filter(([palace]) => palace !== '_centerStar')
    .flatMap(([palace, data]) => {
      if (!data || typeof data !== 'object') return [];
      if (typeof data.danger === 'string' && data.danger) {
        return [`${palace}: ${data.danger}`];
      }
      return [];
    });
}

export function extractSignals(profile: PersonProfile): NumerologySignals {
  const luckyDirections = recordValues(profile.baZhai?.lucky);
  const unluckyDirections = recordValues(profile.baZhai?.unlucky);

  // Extract Indian numerology data
  const driver = profile.driver || 0;
  const conductor = profile.conductor || 0;
  const age = profile.age || 0;
  const healthGovernedBy = age < 40 ? 'driver' : 'conductor';

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
    kua_number: profile.kua || 0,
    trigram: profile.trigram || '',
    missing_numbers: profile.missing || [],
    dominant_numbers: profile.repeated || [],
    present_numbers: profile.present || [],
    arrows_present: profile.arrows?.present || [],
    arrows_absent: profile.arrows?.absent || [],

    // Planes & Elements (kept for Numero Vastu)
    kua_element: profile.element || profile.rulingPlanet?.element || '',
    kua_group: profile.group || '',
    kua_trait: profile.trait || '',
    personal_year: profile.personalYear || 0,
    personal_year_theme: profile.pyTheme || '',
    year_modifier: profile.yearElementModifier?.tone || '',
    year_relation: profile.yearElementModifier?.rel || '',
    directional_energy: {
      lucky_primary: profile.baZhai?.lucky?.shengQi || luckyDirections[0] || '',
      unlucky_primary: profile.baZhai?.unlucky?.jueMing || unluckyDirections[0] || '',
      lucky_directions: luckyDirections,
      unlucky_directions: unluckyDirections,
    },
    feng_shui_alerts: extractFengShuiAlerts(profile.flyingStarAlerts || profile.flyingStars),
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
      // Driver-Conductor compatibility (NEW - PRIMARY)
      driver_relationship: compatibility.driverRelationship || compatibility.planetRelationship || 'neutral',
      dc_compatibility_score: compatibility.dcCompatibilityScore || compatibility.score || 0,

      // Element/Planet relationship
      element_relation: compatibility.elementRelation || 'Neutral',
      planet_relationship: compatibility.planetRelationship || 'neutral',

      // Directional compatibility
      shared_lucky_dirs: compatibility.sharedLucky || [],
      shared_unlucky_dirs: compatibility.sharedUnlucky || [],
      kua_harmony: compatibility.sameGroup ? 'harmonious' : 'complementary',

      // Traditional metrics (kept)
      supports: Boolean(compatibility.supports),
      controls: Boolean(compatibility.controls),
      score: compatibility.score || compatibility.dcCompatibilityScore || 0,
      same_group: Boolean(compatibility.sameGroup),
    },
  };
}