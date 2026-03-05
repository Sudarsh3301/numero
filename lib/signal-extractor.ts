export interface NumerologySignals {
  name: string;
  kua_number: number;
  trigram: string;
  missing_numbers: number[];
  dominant_numbers: number[];
  present_numbers: number[];
  arrows_present: string[];
  arrows_absent: string[];
  kua_element: string;
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
    element_relation: string;
    shared_lucky_dirs: string[];
    shared_unlucky_dirs: string[];
    kua_harmony: string;
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

  return {
    name: profile.name || 'Person',
    kua_number: profile.kua || 0,
    trigram: profile.trigram || '',
    missing_numbers: profile.missing || [],
    dominant_numbers: profile.repeated || [],
    present_numbers: profile.present || [],
    arrows_present: profile.arrows?.present || [],
    arrows_absent: profile.arrows?.absent || [],
    kua_element: profile.element || '',
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
      element_relation: compatibility.elementRelation || 'Neutral',
      shared_lucky_dirs: compatibility.sharedLucky || [],
      shared_unlucky_dirs: compatibility.sharedUnlucky || [],
      kua_harmony: compatibility.sameGroup ? 'harmonious' : 'complementary',
      supports: Boolean(compatibility.supports),
      controls: Boolean(compatibility.controls),
      score: compatibility.score || 0,
      same_group: Boolean(compatibility.sameGroup),
    },
  };
}