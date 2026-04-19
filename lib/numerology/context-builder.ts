/**
 * Context Builder for LLM Integration
 * Creates focused, token-efficient context from Indian numerology data
 *
 * Token Budget: ~600 tokens max vs. 10,000+ if we injected full goal.md + remedies.md
 */

import type { NumerologyProfile, Remedy, MasterNumberResult, KarmicNumberResult, HealthProfile } from './types';
import { getPlanetAssociation } from './planets';
import { getDriverConductorProfile } from './driver-conductor/combinations';
import { organizeRemediesByFrequency } from './remedies';

/**
 * Build Driver-Conductor context (~150 tokens)
 * Only injects the SPECIFIC combination, not all 81
 */
export function buildDriverConductorContext(driver: number, conductor: number): string {
  const driverPlanet = getPlanetAssociation(driver);
  const conductorPlanet = getPlanetAssociation(conductor);
  const dcProfile = getDriverConductorProfile(driver, conductor);

  const strengthDisplay = dcProfile.strength !== null
    ? `${dcProfile.strength}/5`
    : '? (unclear - grey area)';

  const warningText = dcProfile.warnings
    ? `\n- Warnings: ${dcProfile.warnings}`
    : '';

  return `
DRIVER-CONDUCTOR PROFILE:
- Driver ${driver} (${driverPlanet.name} - ${driverPlanet.title})
- Conductor ${conductor} (${conductorPlanet.name} - ${conductorPlanet.title})
- Combination Strength: ${strengthDisplay}
- Life Affect: ${dcProfile.affect}
- Best Professions: ${dcProfile.professions.join(', ')}${warningText}
`.trim();
}

/**
 * Build repetition effects context (~100 tokens)
 * Only includes numbers that actually repeat
 */
export function buildRepetitionContext(counts: Record<number, number>): string {
  const effects: string[] = [];

  for (let num = 1; num <= 9; num++) {
    const count = counts[num] || 0;
    if (count > 1) { // Only show repetitions
      const planet = getPlanetAssociation(num);
      let severity = '';
      if (count === 2) severity = 'strength';
      else if (count === 3) severity = 'exaggerated';
      else severity = 'negative zone';

      effects.push(`- ${num} (${planet.name}) appears ${count}x: ${severity}`);
    }
  }

  if (effects.length === 0) {
    return 'NUMBER REPETITION: All numbers appear at most once - balanced distribution';
  }

  return `
NUMBER REPETITION EFFECTS:
${effects.join('\n')}

Note: 2x = strength, 3x = exaggerated, 4+ = negative zone
`.trim();
}

/**
 * Build missing numbers context (~100 tokens)
 * Only includes actually missing numbers
 */
export function buildMissingContext(missing: number[]): string {
  if (missing.length === 0) {
    return 'MISSING NUMBERS: None - complete Lo Shu grid (rare and powerful)';
  }

  const effects: string[] = missing.slice(0, 4).map(num => { // Limit to top 4 to save tokens
    const planet = getPlanetAssociation(num);
    return `- ${num} (${planet.name})`;
  });

  const criticalWarnings: string[] = [];
  if (missing.includes(5)) {
    criticalWarnings.push('Missing 5 is CRITICAL - breaks balance in all spheres');
  }
  if (missing.includes(4)) {
    criticalWarnings.push('Missing 4 breaks three planes: Thought, Mental & Golden Rajyog');
  }
  if (missing.includes(6)) {
    criticalWarnings.push('Missing 6 causes poor family bonding');
  }

  const warningText = criticalWarnings.length > 0
    ? `\n\nCRITICAL: ${criticalWarnings.join('. ')}`
    : '';

  return `
MISSING NUMBERS:
${effects.join('\n')}${missing.length > 4 ? `\n- Plus ${missing.length - 4} more...` : ''}${warningText}
`.trim();
}

/**
 * Build Master/Karmic numbers context (~50 tokens)
 * Only if present
 */
export function buildMasterKarmicContext(
  masterNumber: MasterNumberResult,
  karmicNumbers: KarmicNumberResult
): string {
  const parts: string[] = [];

  if (masterNumber.isMaster) {
    const meanings = {
      11: 'Dreamer, not achiever. Needs mentor/support system.',
      22: 'Dreamer AND doer. Creates own support system. Unstoppable once decided.',
      33: 'Very rare. Unconditional love, works for humanity, spiritual guru.'
    };

    parts.push(`
MASTER NUMBER ${masterNumber.number} (${masterNumber.strength}% strength via ${masterNumber.method} method):
${meanings[masterNumber.number!]}`.trim());
  }

  if (karmicNumbers.hasKarmic) {
    const karmicList = karmicNumbers.numbers.map((n, i) =>
      `${n}: ${karmicNumbers.meanings[i]}`
    ).join('\n');

    parts.push(`
KARMIC DEBT NUMBERS:
${karmicList}`.trim());
  }

  return parts.join('\n\n');
}

/**
 * Build health context (~100 tokens)
 * Based on age: Driver <40, Conductor ≥40
 */
export function buildHealthContext(healthProfile: HealthProfile, age: number): string {
  const governedBy = age < 40 ? 'Driver' : 'Conductor';

  return `
HEALTH PROFILE (Age ${age} - governed by ${governedBy} ${healthProfile.number}):
- Ruling Planet: ${healthProfile.planet} (${healthProfile.title})
- Likely Issues: ${healthProfile.issues.slice(0, 4).join(', ')}${healthProfile.issues.length > 4 ? '...' : ''}
- Key Lifestyle: ${healthProfile.lifestyle.substring(0, 150)}${healthProfile.lifestyle.length > 150 ? '...' : ''}
`.trim();
}

/**
 * Build remedies context (~100 tokens)
 * Top 3-5 remedies organized by frequency
 */
export function buildRemediesContext(remedies: Remedy[]): string {
  if (remedies.length === 0) {
    return 'REMEDIES: No missing numbers - no remedies needed';
  }

  const organized = organizeRemediesByFrequency(remedies);
  const parts: string[] = [];

  if (organized.daily.length > 0) {
    parts.push(`Daily: ${organized.daily.slice(0, 2).map(r => r.action).join('; ')}`);
  }
  if (organized.weekly.length > 0) {
    parts.push(`Weekly: ${organized.weekly.slice(0, 2).map(r => r.action).join('; ')}`);
  }
  if (organized.as_needed.length > 0) {
    parts.push(`As Needed: ${organized.as_needed.slice(0, 1).map(r => r.action).join('; ')}`);
  }

  return `
TOP REMEDIES FOR MISSING NUMBERS:
${parts.join('\n')}

Note: Blood Remedy (quarterly): Donate blood or visit surgical hospital
`.trim();
}

/**
 * Main builder - combines all context sections
 * Total: ~600 tokens (selective injection of ONLY relevant data)
 */
export function buildIndianNumerologyContext(profile: NumerologyProfile): string {
  const sections: string[] = [];

  // 1. Driver-Conductor (always included)
  sections.push(buildDriverConductorContext(profile.driver, profile.conductor));

  // 2. Master/Karmic (only if present)
  const masterKarmicContext = buildMasterKarmicContext(profile.masterNumber, profile.karmicNumbers);
  if (masterKarmicContext) {
    sections.push(masterKarmicContext);
  }

  // 3. Repetition (only if there are repetitions)
  const hasRepetitions = Object.values(profile.counts).some(count => count > 1);
  if (hasRepetitions) {
    sections.push(buildRepetitionContext(profile.counts));
  }

  // 4. Missing numbers (only if there are missing)
  if (profile.missing.length > 0) {
    sections.push(buildMissingContext(profile.missing));
  }

  // 5. Health (always included)
  sections.push(buildHealthContext(profile.healthProfile, profile.age));

  // 6. Remedies (only if there are missing numbers)
  if (profile.activeRemedies.length > 0) {
    sections.push(buildRemediesContext(profile.activeRemedies));
  }

  // 7. Planes & Arrows summary (brief)
  const planesSummary = `
PLANES: ${profile.planes.dominant} dominant (${profile.planes.pct[profile.planes.dominant]}%)
ARROWS: ${profile.arrows.present.length} present, ${profile.arrows.absent.length} absent
`.trim();
  sections.push(planesSummary);

  return sections.join('\n\n---\n\n');
}

/**
 * Build couple context (for compatibility analysis)
 * Combines both profiles + compatibility data
 */
export function buildCoupleContext(
  person1: NumerologyProfile,
  person2: NumerologyProfile,
  compatibilityScore?: any
): string {
  const sections: string[] = [];

  // Person 1
  sections.push(`=== ${person1.dob} (Person 1) ===`);
  sections.push(buildIndianNumerologyContext(person1));

  // Person 2
  sections.push(`\n=== ${person2.dob} (Person 2) ===`);
  sections.push(buildIndianNumerologyContext(person2));

  // Compatibility (if provided)
  if (compatibilityScore) {
    const driverRelation = getPlanetRelationship(person1.driver, person2.driver);
    sections.push(`
---

COMPATIBILITY:
- Driver Relationship: ${person1.driver} (${person1.rulingPlanet.name}) & ${person2.driver} (${person2.rulingPlanet.name}) = ${driverRelation}
- Score: ${compatibilityScore.total}% (${compatibilityScore.interpretation})
`.trim());
  }

  return sections.join('\n\n');
}

/**
 * Helper: Get planet relationship description
 */
function getPlanetRelationship(n1: number, n2: number): string {
  const p1 = getPlanetAssociation(n1);

  if (p1.friends.includes(n2)) return 'Friends';
  if (p1.enemies.includes(n2)) return 'Enemies';
  return 'Neutral';
}

/**
 * Build system instruction for LLM
 * Emphasizes Indian numerology framework
 */
export function buildSystemInstruction(mode: 'single' | 'couple', lang: 'en' | 'hi'): string {
  const langInstruction = lang === 'hi'
    ? 'Respond entirely in Hindi (Devanagari script). Use mystical but clear Hindi.'
    : 'Respond in English.';

  const singleInstructions = `
SINGLE MODE — 5 sections required:
1. "🧠 Core Psychological Profile" — personality from Driver-Conductor, planets, planes and archetypes. Include shadow side.
2. "⚡ Blind Spots & Weaknesses" — missing numbers and absent arrows as concrete psychological gaps. No softening.
3. "🔥 Innate Strengths" — present arrows, Driver-Conductor strength, ruling planet traits.
4. "🧭 Growth Directive" — one sharp behavioral instruction based on their specific numbers.
5. "📅 2026 Forecast & Health" — weave personal year theme, health profile (age-based), and top 1-2 remedies. Be specific about life domains.
`.trim();

  const coupleInstructions = `
COUPLE MODE — 6 sections required:
1. "🧠 Individual Essences" — psychological type per person, dominant weakness in partnership.
2. "🔗 Core Alignment" — Driver-Conductor compatibility, planet friendship, complementary strengths.
3. "⚡ Primary Friction Areas" — planet enemies, number gaps, conflicting patterns.
4. "📅 Long-Term Outlook" — natural momentum or constant work? What breaks vs. sustains.
5. "🛠 Behavioral Advice" — 2–3 specific actions from their actual data.
6. "🔮 2026 Forecast" — both health profiles, both remedies. Will 2026 pull them together or apart?
`.trim();

  const instructions = mode === 'single' ? singleInstructions : coupleInstructions;

  return `You are an Indian numerology analyst specializing in Driver-Conductor combinations and planetary influences. ${langInstruction}

TERMINOLOGY:
- Numbers 1-9 correspond to planets: 1=Sun, 2=Moon, 3=Jupiter (Guru), 4=Rahu, 5=Mercury (Budh), 6=Venus (Shukra), 7=Ketu, 8=Saturn (Shani), 9=Mars (Mangal)
- Driver = sum of birth day digits (primary personality)
- Conductor = sum of all DOB digits (life path)
- Master Numbers: 11=Dreamer, 22=Dreamer+Doer, 33=Unconditional Love
- Karmic Numbers: 10,13,14,16,19 (past-life debts)

FRAMEWORK:
1. **Driver-Conductor is the PRIMARY identity** - build analysis around this
2. Master/Karmic numbers are game changers - flag if present
3. Repetition effects show psychological patterns (2x=strength, 3x=exaggerated, 4+=negative)
4. Missing numbers reveal blind spots (5 is most critical)
5. Health governed by: Driver (<40 years) or Conductor (≥40 years)
6. Remedies are for missing numbers only

${instructions}

RULES:
- Use names provided in the data
- Honesty over comfort - be direct about weaknesses
- 300-360 words total
- FLAG AMBIGUITIES: Use "unclear" or "situational" when strength rating is null ("?")
- ONLY mention 1-2 remedies maximum (don't overwhelm)
- Return valid JSON only: { sections: [{title, body}] }
`;
}
