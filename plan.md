  Key Points of the Plan:

  Migration Approach

  - Incremental with dual-system support - both systems visible initially, then gradual transition
  - Math-first architecture - all goal.md rules calculated deterministically, LLM only summarizes
  - Token-efficient context injection - only ~400 tokens of relevant goal.md excerpts (not the entire 760 lines)

  Major Changes

  1. Driver-Conductor becomes PRIMARY identity (replaces Kua element prominence)
  2. Add all missing Indian concepts: Master Numbers, Karmic Numbers, repetition effects, Driver-Conductor combinations
  3. Reframe terminology: "Kua Element" → "Ruling Planet", "Ba Zhai" → "Directional Remedies"
  4. Keep valuable features: Flying Stars becomes optional "2026 Energy Overlay", Lo Shu grid stays central

  Implementation Structure

  - 4 phases over 8 weeks
  - New lib/numerology/ folder with rule engine
  - All 81 Driver-Conductor combinations from goal.md
  - Full compatibility weightage system (40% driver match, 10% per exchange, etc.)
  - LLM flagging for ambiguous "?" entries in goal.md

  Critical Files

  - 11 new files to create (core.ts, planets.ts, combinations.ts, etc.)
  - 3 existing files to modify (signal-extractor.ts, loshu.tsx, analyze/route.ts)

  The plan is ready for your review!

──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
 Ready to code?

 Here is Claude's plan:
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
 Migration Plan: Chinese Feng Shui → Indian Numerology

 Executive Summary

 Current State: App uses Chinese Feng Shui (Kua, Ba Zhai, Flying Stars, Five Elements) with Lo Shu grid

 Target State: Indian numerology with Driver-Conductor as PRIMARY identity, planet-based interpretations, and Numero Vastu

 Strategy: Incremental migration with dual-system support, then gradual deprecation of Chinese elements

 Approach: Math-first (deterministic calculations) + LLM context injection (relevant goal.md excerpts)

 ---
 File Structure

 lib/
   numerology/                     # NEW - Rule engine core
     core.ts                       # Driver, Conductor, Master, Karmic calculations
     planets.ts                    # Planet mappings (1=Sun, 2=Moon, etc.)
     driver-conductor/
       combinations.ts             # All 81 D-C combinations from goal.md
       lookup.ts                   # Query functions
       types.ts                    # DC-specific types
     repetition.ts                 # Repetition effects (1x, 2x, 3x, 4x+)
     missing.ts                    # Missing number interpretations
     compatibility/
       marriage.ts                 # Weightage system (40% driver, etc.)
       scoring.ts                  # Score calculations
       exchanges.ts                # Number exchange logic
     remedies.ts                   # Remedies for missing elements
     numero-vastu.ts               # Kua-based directional remedies
     personal-year.ts              # PY/PM/PD (Dasa system)
     types.ts                      # All TypeScript interfaces
     context-builder.ts            # LLM context injection
   signal-extractor.ts             # MODIFY - add Indian signals
   groq-client.ts                  # KEEP - existing

 loshu.tsx                         # MODIFY - UI updates, DC display
 app/api/analyze/route.ts          # MODIFY - inject Indian context
 app/api/chat/route.ts             # KEEP - minimal changes

 ---
 Implementation Phases

 Phase 1: Foundation (Week 1-2)

 Goal: Build rule engine without breaking existing app

 Tasks:
 1. Create lib/numerology/ structure
 2. Implement core.ts:
   - calculateDriver(dob) - sum of day digits
   - calculateConductor(dob) - sum of all DOB digits
   - detectMasterNumber(dob) - both horizontal & vertical methods
   - detectKarmicNumber(dob) - check for 10, 13, 14, 16, 19
 3. Implement planets.ts - all 9 planet mappings from goal.md Section 2
 4. Populate driver-conductor/combinations.ts - all 81 combinations from goal.md Section 4
 5. Implement repetition.ts - effects from goal.md Section 7
 6. Implement missing.ts - effects from goal.md Section 8
 7. Write unit tests

 No UI changes yet - existing app continues working

 ---
 Phase 2: Dual System (Week 3-4)

 Goal: Add Indian numerology alongside Chinese Feng Shui

 Tasks:

 1. Create context-builder.ts (token-efficient LLM context):
 buildDriverConductorContext(driver, conductor) // ~150 tokens
 buildRepetitionContext(counts) // ~100 tokens
 buildMissingContext(missing) // ~100 tokens
 buildMasterKarmicContext(master, karmic) // ~50 tokens
 buildIndianNumerologyContext(profile) // Main builder
 2. Extend signal-extractor.ts with Indian signals:
 // ADD these fields
 driver: number
 conductor: number
 ruling_planet: string
 conductor_planet: string
 dc_strength: number
 dc_professions: string[]
 master_number: MasterNumberResult | null
 karmic_numbers: number[]
 repetition_effects: RepetitionEffect[]
 missing_effects: MissingEffect[]

 // KEEP existing (used in Numero Vastu)
 kua_number: number
 directional_remedies: {...}
 3. Modify loshu.tsx - add Driver-Conductor at TOP:
   - Display: "Driver 4 (Rahu) + Conductor 7 (Ketu) = Strength 4/5 ⭐ Best for Occult"
   - Add Master Number badge: "Master 22/100% 🌟"
   - Add Karmic warning: "⚠️ Karmic 13 - Rahu Debt"
   - Keep Kua/Ba Zhai display but move lower
 4. Update UI labels (reframing):
   - "Kua Element" → "Ruling Planet"
   - "Ba Zhai Directions" → "Directional Remedies"
   - Keep Flying Stars (label "2026 Energy Overlay")
 5. Update analyze/route.ts:
   - Import context-builder functions
   - Inject Indian context using buildIndianNumerologyContext()
   - Update system prompt:
   You are an Indian numerology analyst specializing in
 Driver-Conductor combinations and planetary influences.

 Numbers 1-9 = planets: 1=Sun, 2=Moon, 3=Jupiter, 4=Rahu,
 5=Mercury, 6=Venus, 7=Ketu, 8=Saturn, 9=Mars

 Driver = primary personality, Conductor = life path

 FLAG ambiguities with "?" when goal.md shows unclear strength

 ---
 Phase 3: Primary Identity Shift (Week 5-6)

 Goal: Make Driver-Conductor the PRIMARY identity

 Tasks:

 1. Reorder loshu.tsx display priority:
 [TOP]    Driver-Conductor Profile (largest, most prominent)
 [2nd]    Master/Karmic Numbers
 [3rd]    Lo Shu Grid with Planes & Arrows
 [4th]    Ruling Planet (was Kua Element)
 [5th]    Directional Remedies (was Ba Zhai)
 [BOTTOM] Flying Stars (keep as bonus)
 2. Update LLM framework in analyze/route.ts:
   - Primary analysis order: Driver-Conductor → Planet → Repetition → Missing → Arrows → Planes
   - De-emphasize Five Elements, Ba Zhai labels
 3. Implement compatibility/marriage.ts - full weightage system:
 calculateCompatibilityScore(p1, p2) {
   // 40% driver match (positive/neutral/anti)
   // 10% stronger driver (if same driver)
   // 10% per number exchange (mutual missing)
   // 5% if both have 5
   // 5% if both have 6
   // 5% if both have 5 & 6
 }
 4. Update couple mode in loshu.tsx:
   - Replace elemental relationship with planet friendship (friend/enemy/neutral)
   - Show DC compatibility score
   - Display number exchanges: "You have 4, partner missing 4 (+10%)"

 ---
 Phase 4: Clean Deprecation (Week 7-8)

 Goal: Remove or hide Chinese Feng Shui terminology

 Tasks:

 1. Optional Flying Stars toggle:
   - Add collapsible section: "Show 2026 Flying Stars"
   - Collapsed by default
   - Label: "Optional Chinese Feng Shui overlay for 2026"
 2. Rename everything:
   - "Five Elements" → "Planetary Energies"
   - "Supports/Controls" → "Friend/Enemy Planets"
   - "Ba Zhai" → Remove label entirely
 3. Update metadata in app/layout.tsx:
   - Title: "Indian Numerology - Driver-Conductor System"
   - Description: Remove "Feng Shui", add "Planetary Analysis"
 4. Implement numero-vastu.ts:
   - Kua-based directional remedies (goal.md Section 17)
   - Success/Health/Family/Personal Dev directions

 ---
 Core Calculations to Implement

 lib/numerology/core.ts

 export function calculateDriver(dob: string): number
 // Sum of day digits: "18/04/1986" → 18 → 1+8 = 9

 export function calculateConductor(dob: string): number
 // Sum of all DOB digits: "18/04/1986" → 1+8+0+4+1+9+8+6 = 37 → 3+7 = 10 → 1+0 = 1

 export function detectMasterNumber(dob: string): MasterNumberResult
 // Both horizontal and vertical methods
 // Returns: {isMaster, number: 11|22|33|null, strength: 50|100, method}

 export function detectKarmicNumber(dob: string): KarmicNumberResult
 // Check for 10, 13, 14, 16, 19 in driver or conductor
 // Returns: {hasKarmic, numbers: [], meanings: []}

 lib/numerology/driver-conductor/combinations.ts

 export const DC_TABLE: Record<string, DCCombination> = {
   "1-1": { strength: 4, affect: "Fortune's favorite", professions: [...] },
   "1-2": { strength: 4, affect: "Best for Navy", professions: ["Navy", "Water"] },
   "4-7": { strength: 4, affect: "Successful / best in occult", professions: ["Occult", "Law"] },
   // ... all 81 combinations from goal.md Section 4
   "9-9": { strength: 1, affect: "Marriage problem / anger", warnings: "Difficult marriage" }
 }

 export function getDriverConductorProfile(driver: number, conductor: number): DCCombination

 lib/numerology/planets.ts

 export const PLANET_MAPPING: Record<number, Planet> = {
   1: { name: "Sun", sanskrit: "Surya", title: "King", friends: [9,2,3,5,6,1], enemies: [8] },
   2: { name: "Moon", sanskrit: "Chandra", title: "Queen", friends: [1,5,3,2,7], enemies: [8,4,9] },
   // ... all 9 planets from goal.md Section 2
 }

 export function getPlanetAssociation(number: number): Planet
 export function getPlanetRelationship(n1: number, n2: number): 'friend' | 'enemy' | 'neutral'

 ---
 LLM Context Injection Strategy

 Token Budget: ~400 tokens max (vs. 10,000+ if we injected all of goal.md)

 Selective Injection:
 - Driver-Conductor: Only inject specific D-C combo (~150 tokens)
 - Repetition: Only numbers that repeat (~100 tokens)
 - Missing: Only missing numbers (~100 tokens)
 - Master/Karmic: Only if present (~50 tokens)

 Example Context:
 DRIVER-CONDUCTOR PROFILE:
 - Driver 4 (Rahu - Head without Body / Gunda)
 - Conductor 7 (Ketu - Shadow Planet / Body without Head)
 - Combination Strength: 4/5
 - Life Affect: Successful / best in occult
 - Best Professions: Occult, Law, Success

 MASTER NUMBER 22 (100% strength):
 Dreamer AND doer. Once decided, no one can stop them.
 Creates own support system.

 NUMBER REPETITION EFFECTS:
 - 1 appears 2x: Excellent communicator / articulate / impartial (strength)
 - 4 appears 3x: Struggle and cannot identify true potential (exaggerated)

 MISSING NUMBERS:
 - 5 (Mercury): Lacks balance in every sphere
 - 6 (Venus): Poor bonding, family members do not respect

 ---
 What to Keep vs. Remove

 ✅ KEEP (Used in Both Systems)

 - Lo Shu Grid
 - Planes (Mental, Emotional, Practical)
 - Arrows (Pythagoras)
 - Kua Number (for Numero Vastu)
 - Missing/Repetition counts

 🔄 REFRAME (Same Data, Different Labels)

 - Kua Element → Ruling Planet
 - Ba Zhai Directions → Directional Remedies
 - Element Relationships → Planet Friendship
 - Five-Element Compatibility → Planet Compatibility

 ⬇️ DE-EMPHASIZE (Optional/Secondary)

 - Flying Stars → "2026 Energy Overlay" (collapsed by default)
 - Year Element Modifier → Keep calculation, minimize UI
 - Trigram → Remove from main display

 ❌ REMOVE LABELS (Not Data)

 - "Five Elements" terminology
 - "East/West Group" labels
 - "Ba Zhai" name
 - Chinese characters (生氣, 天醫, etc.)

 ---
 TypeScript Types

 lib/numerology/types.ts

 export interface Planet {
   number: number
   name: string
   sanskrit: string
   title: string
   traits: string[]
   friends: number[]
   enemies: number[]
   neutral: number[]
 }

 export interface DCCombination {
   driver: number
   conductor: number
   strength: number // 1-5 scale, null = unclear
   affect: string
   professions: string[]
   warnings?: string
 }

 export interface MasterNumberResult {
   isMaster: boolean
   number: 11 | 22 | 33 | null
   strength: 0 | 50 | 100
   method: 'horizontal' | 'vertical' | 'both' | null
 }

 export interface KarmicNumberResult {
   hasKarmic: boolean
   numbers: number[]
   meanings: string[]
 }

 export interface RepetitionEffect {
   number: number
   count: number
   effect: string
   severity: 'ok' | 'strength' | 'exaggerated' | 'negative'
 }

 export interface MissingEffect {
   number: number
   planet: string
   effect: string
   brokenPlanes: string[]
 }

 export interface CompatibilityScore {
   total: number // 0-100
   breakdown: {
     driverMatch: number // 0, 30, or 40
     strongerDriver: number // 0 or 10
     numberExchanges: number // 0-40 (10% per)
     fivePresence: number // 0 or 5
     sixPresence: number // 0 or 5
     bothFiveSix: number // 0 or 5
   }
   interpretation: string
   warnings: string[]
 }

 export interface NumerologyProfile {
   dob: string
   driver: number
   conductor: number
   masterNumber: MasterNumberResult
   karmicNumbers: KarmicNumberResult
   counts: Record<number, number>
   repetitionEffects: RepetitionEffect[]
   missingEffects: MissingEffect[]
   dcProfile: DCCombination
   rulingPlanet: Planet
   conductorPlanet: Planet
   kua: number // Keep for Numero Vastu
   planes: PlaneScore
   arrows: ArrowDetection
 }

 ---
 Critical Files to Modify

 Priority 1 (Foundation)

 1. lib/numerology/core.ts - NEW
 2. lib/numerology/planets.ts - NEW
 3. lib/numerology/driver-conductor/combinations.ts - NEW

 Priority 2 (Integration)

 4. lib/numerology/repetition.ts - NEW
 5. lib/numerology/missing.ts - NEW
 6. lib/numerology/context-builder.ts - NEW
 7. lib/signal-extractor.ts - MODIFY

 Priority 3 (UI)

 8. loshu.tsx - MODIFY (major UI changes)
 9. app/api/analyze/route.ts - MODIFY (LLM prompts)

 Priority 4 (Compatibility)

 10. lib/numerology/compatibility/marriage.ts - NEW
 11. lib/numerology/numero-vastu.ts - NEW

 ---
 Testing Strategy

 Unit Tests

 // lib/numerology/__tests__/core.test.ts
 describe('Driver Calculation', () => {
   test('18 → 1+8 = 9', () => {
     expect(calculateDriver('18/04/1986')).toBe(9)
   })
 })

 describe('Master Number Detection', () => {
   test('18/04/1986 → C=11 (100%)', () => {
     expect(detectMasterNumber('18/04/1986')).toEqual({
       isMaster: true,
       number: 11,
       strength: 100,
       method: 'both'
     })
   })
 })

 Integration Tests

 - Full profile generation: DOB → all calculations → context
 - Compatibility scoring: two profiles → weightage breakdown
 - LLM context: verify token count < 500

 ---
 Risk Mitigation

 1. LLM Hallucination: Math-first - all calculations done BEFORE LLM
 2. Breaking Changes: Additive only - new fields added, old kept
 3. goal.md Ambiguities: Flag with "?" when strength unclear
 4. Performance: Pre-computed tables, O(1) lookups

 ---
 Migration Timeline

 - Month 1: Dual system (both Chinese & Indian visible)
 - Month 2: Indian primary, Chinese secondary (collapsible)
 - Month 3: Chinese optional (hidden by default)
 - Month 4: Evaluate user feedback

 ---
 Success Criteria

 ✓ Driver-Conductor displayed as PRIMARY identity
 ✓ All 81 DC combinations from goal.md implemented
 ✓ Master Numbers (11, 22, 33) calculated with both methods
 ✓ Karmic Numbers (10, 13, 14, 16, 19) flagged
 ✓ Repetition effects (1x, 2x, 3x, 4x+) interpreted
 ✓ Missing number effects shown with broken planes
 ✓ Planet associations replace element labels
 ✓ Compatibility uses Indian weightage system (40% driver, etc.)
 ✓ LLM receives focused context (~400 tokens, not full goal.md)
 ✓ LLM flags ambiguities from goal.md
 ✓ Flying Stars remains as optional 2026 overlay
 ✓ No breaking changes to API responses

 ---
 END OF PLAN