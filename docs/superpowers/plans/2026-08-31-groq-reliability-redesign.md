# Groq Reliability Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Five surgical patches to make the numerology app resilient to Groq failures — showing the grid even when AI narrative fails, fixing token-truncation misclassification, removing SDK double-retries, adding a named-tier enum with 3-tier all-strict collapse, and replacing 25 placeholder tests with real numerology assertions.

**Architecture:** Each change is independent; tasks are ordered so the backend is stable before frontend consumes it. `loshu.tsx` is split into two async phases so phase-1 (math) renders immediately and phase-2 (Groq narrative) can fail silently. Backend changes stay inside `lib/groq-client.ts`.

**Tech Stack:** TypeScript, React (hooks), Vitest (test runner), Groq SDK (`groq-sdk`), Next.js API routes

---

## File Map

| File | Change |
|------|--------|
| `lib/groq-client.ts` | Add `TruncatedOutputError`, `TRUNCATED` enum value, `TierIndex` enum, collapse to 3-tier all-strict, disable SDK retries, read `retry-after` header |
| `lib/groq-client.test.ts` | Remove 25 placeholder stubs; add ~17 real numerology assertions |
| `loshu.tsx` | Two-phase `calculate()`, new `narrativeLoading`/`narrativeError` state, nullable fields in `AnalysisResult`, guard `chatProps` |
| `components/numerology/NarrativeCard.tsx` | Add `errorMessage` prop; render priority logic |
| `components/numerology/NumerologyDashboard.tsx` | Pass `narrativeLoading` and `narrativeError` through to `NarrativeCard` |

---

## Task 1: Add `TruncatedOutputError` and `TRUNCATED` enum value

**Files:**
- Modify: `lib/groq-client.ts`

- [ ] **Step 1: Add `TRUNCATED` to `GroqErrorType` enum**

In `lib/groq-client.ts`, the `GroqErrorType` enum currently ends at line ~53. Add one entry:

```ts
export enum GroqErrorType {
  JSON_VALIDATE_FAILED = 'json_validate_failed',
  MODEL_NOT_FOUND      = 'model_not_found',
  RATE_LIMIT           = 'rate_limit',
  TIMEOUT              = 'timeout',
  CONTEXT_LENGTH       = 'context_length',
  GENERIC_API_ERROR    = 'generic_api_error',
  TRUNCATED            = 'truncated',    // ← add this
  UNKNOWN              = 'unknown'
}
```

- [ ] **Step 2: Add `TruncatedOutputError` class after the enum**

Directly after the `GroqErrorType` enum, insert:

```ts
class TruncatedOutputError extends Error {
  constructor(model: string, completionTokens?: number) {
    super(`Output truncated by token limit on model ${model} (completion_tokens: ${completionTokens ?? 'unknown'})`);
    this.name = 'TruncatedOutputError';
  }
}
```

- [ ] **Step 3: Throw `TruncatedOutputError` in `attemptGeneration`**

Inside `attemptGeneration`, after retrieving `response` and before JSON parsing (search for the line that reads `response.choices[0]?.message?.content`), insert:

```ts
if (response.choices[0]?.finish_reason === 'length') {
  throw new TruncatedOutputError(model, response.usage?.completion_tokens);
}
```

- [ ] **Step 4: Categorize `TruncatedOutputError` in `categorizeGroqError`**

In `categorizeGroqError`, before the `JSON_VALIDATE_FAILED` branch, add:

```ts
if (error instanceof TruncatedOutputError) {
  return { type: GroqErrorType.TRUNCATED, status: undefined, message: error.message, originalError: error };
}
```

- [ ] **Step 5: Route `TRUNCATED` in `determineNextAction`**

In `determineNextAction`'s switch, add a case that behaves identically to `JSON_VALIDATE_FAILED` (skip to next tier, 300 ms wait):

```ts
case GroqErrorType.TRUNCATED:
case GroqErrorType.JSON_VALIDATE_FAILED:
  return { wait: 300, retry: false, skipToTier: Math.max(2, currentTier + 1) };
```

(Merge the existing `JSON_VALIDATE_FAILED` case into a fall-through so both share the same body.)

- [ ] **Step 6: Commit**

```bash
git add lib/groq-client.ts
git commit -m "feat: add TruncatedOutputError and TRUNCATED enum — misclassified token-limit failures now skip to next strict tier"
```

---

## Task 2: Disable SDK retries; read `retry-after` header

**Files:**
- Modify: `lib/groq-client.ts`

- [ ] **Step 1: Set `maxRetries: 0` on Groq instantiation**

In `getGroqClient()`, change:

```ts
groqInstance = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });
```

to:

```ts
groqInstance = new Groq({ apiKey: process.env.GROQ_API_KEY || '', maxRetries: 0 });
```

- [ ] **Step 2: Replace `RATE_LIMIT` branch in `determineNextAction`**

Find the `RATE_LIMIT` case. Replace the entire case body with:

```ts
case GroqErrorType.RATE_LIMIT: {
  const retryAfterSec = error?.originalError?.headers?.['retry-after'];
  const waitMs = retryAfterSec
    ? Number(retryAfterSec) * 1000
    : Math.min(2000 * Math.pow(2, currentTier), 8000);
  await sleep(waitMs);
  return { wait: null, retry: false, skipToTier: currentTier + 1 };
}
```

Note: `determineNextAction` must be made `async` if it isn't already (add `async` keyword to the function signature), since we now `await sleep(waitMs)` inside it. Also confirm `sleep` is defined in this file (search for `function sleep` — if not present, add it before `determineNextAction`):

```ts
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/groq-client.ts
git commit -m "fix: disable SDK maxRetries; read retry-after header for rate-limit backoff"
```

---

## Task 3: Named `TierIndex` enum + 3-tier all-strict collapse

**Files:**
- Modify: `lib/groq-client.ts`

- [ ] **Step 1: Add `TierIndex` enum**

Before `STRUCTURED_OUTPUT_TIERS`, add:

```ts
enum TierIndex {
  T1 = 0,
  T2 = 1,
  T3 = 2,
}
```

- [ ] **Step 2: Replace `STRUCTURED_OUTPUT_TIERS`**

Replace the current 4-element array with the 3-element all-strict version:

```ts
const STRUCTURED_OUTPUT_TIERS: FallbackTier[] = [
  { model: 'openai/gpt-oss-20b',  strict: true, temperature: 0.3, description: 'Tier 1: Fast primary (strict mode)' },
  { model: 'openai/gpt-oss-120b', strict: true, temperature: 0.2, description: 'Tier 2: Larger model (strict mode, lower temp)' },
  { model: 'qwen/qwen3.8-27b',    strict: true, temperature: 0.5, description: 'Tier 3: Different family (strict mode)' },
];
```

- [ ] **Step 3: Replace raw integer literals in `determineNextAction`**

Find every occurrence of bare `2` and `3` used as tier indices in `determineNextAction` and replace:

| Before | After |
|--------|-------|
| `Math.max(2, currentTier + 1)` | `Math.max(TierIndex.T2, currentTier + 1)` |
| `skipToTier: 2` (in TIMEOUT) | `skipToTier: TierIndex.T2` |
| `skipToTier: 3` (in CONTEXT_LENGTH) | `skipToTier: TierIndex.T3` |
| `currentTier < 2` (in GENERIC_API_ERROR) | `currentTier < TierIndex.T2` |

- [ ] **Step 4: Remove `STRUCTURED_TIER3` from `MODELS` constant**

Find the `MODELS` constant and remove the `STRUCTURED_TIER3` entry (was a duplicate best-effort alias). Keep all other entries.

- [ ] **Step 5: Commit**

```bash
git add lib/groq-client.ts
git commit -m "feat: add TierIndex enum; collapse to 3-tier all-strict; remove dead STRUCTURED_TIER3 constant"
```

---

## Task 4: Replace placeholder tests with real numerology assertions

**Files:**
- Modify: `lib/groq-client.test.ts`

- [ ] **Step 1: Remove the 17 placeholder describe blocks**

Delete the entire content of these describe blocks (keep only the real `Groq Client Error Handling` assertions — the 17 tests under `categorizeGroqError`, `isRateLimitError`, and `Model Constants`):

- `Error-Adaptive Strategy Logic` (5 stubs)
- `Circuit Breaker Integration` (3 stubs)
- `Tier Cascade Integration` (6 stubs)
- `Logging and Observability` (8 stubs)
- `Backward Compatibility` (3 stubs)

After deletion the file should have only the `Groq Client Error Handling` describe block plus imports.

- [ ] **Step 2: Add numerology imports at the top of the test file**

Add after the existing imports:

```ts
import { calculateDriver, calculateConductor } from './numerology/core';
import { getPersonalYearEffect } from './numerology/personal-year';
import { getMissingEffects } from './numerology/missing';
import { getRepetitionEffects } from './numerology/repetition';
```

- [ ] **Step 3: Add `describe('Numerology core — calculateDriver', ...)` block**

```ts
describe('Numerology core — calculateDriver', () => {
  it('single digit day → driver is that digit', () => {
    // DOB 1985-03-05: day=5, already single digit
    expect(calculateDriver('1985-03-05')).toBe(5);
  });

  it('double digit day reduces to single digit', () => {
    // DOB 1990-07-29: day=29 → 2+9=11 → 1+1=2
    expect(calculateDriver('1990-07-29')).toBe(2);
  });

  it('master number 11 is NOT further reduced', () => {
    // DOB 1988-04-29: day=29 → 2+9=11 (master, keep)
    expect(calculateDriver('1988-04-29')).toBe(11);
  });

  it('master number 22 is NOT further reduced', () => {
    // DOB 2000-10-22: day=22 (master, keep)
    expect(calculateDriver('2000-10-22')).toBe(22);
  });

  it('day 10 reduces to 1', () => {
    expect(calculateDriver('1975-06-10')).toBe(1);
  });
});
```

- [ ] **Step 4: Add `describe('Numerology core — calculateConductor', ...)` block**

```ts
describe('Numerology core — calculateConductor', () => {
  it('sums all DOB digits to a single digit', () => {
    // DOB 1985-03-05: 1+9+8+5+0+3+0+5=31 → 3+1=4
    expect(calculateConductor('1985-03-05')).toBe(4);
  });

  it('conductor can be a master number 11', () => {
    // Find a DOB where the full digit sum is 11
    // 1990-01-01: 1+9+9+0+0+1+0+1=21 → 2+1=3  (not 11)
    // 2000-02-09: 2+0+0+0+0+2+0+9=13 → 1+3=4
    // 1993-02-06: 1+9+9+3+0+2+0+6=30 → 3+0=3
    // 1982-01-08: 1+9+8+2+0+1+0+8=29 → 2+9=11 ✓
    expect(calculateConductor('1982-01-08')).toBe(11);
  });

  it('conductor 9 from date that sums to 9', () => {
    // 1980-01-08: 1+9+8+0+0+1+0+8=27 → 2+7=9
    expect(calculateConductor('1980-01-08')).toBe(9);
  });
});
```

- [ ] **Step 5: Add `describe('Personal year effect', ...)` block**

```ts
describe('Personal year effect', () => {
  it('returns an object with a number property', () => {
    const result = getPersonalYearEffect('1985-03-05', 2025);
    expect(typeof result.number).toBe('number');
    expect(result.number).toBeGreaterThanOrEqual(1);
    expect(result.number).toBeLessThanOrEqual(9);
  });

  it('returns a non-empty theme string', () => {
    const result = getPersonalYearEffect('1985-03-05', 2025);
    expect(typeof result.theme).toBe('string');
    expect(result.theme.length).toBeGreaterThan(0);
  });

  it('different years produce different personal year numbers', () => {
    const y1 = getPersonalYearEffect('1985-03-05', 2025);
    const y2 = getPersonalYearEffect('1985-03-05', 2026);
    // consecutive years must differ by 1 (mod 9)
    const diff = Math.abs(y2.number - y1.number);
    expect(diff === 1 || diff === 8).toBe(true);
  });
});
```

- [ ] **Step 6: Add `describe('Missing number detection', ...)` block**

```ts
describe('Missing number detection', () => {
  it('all digits present → no missing numbers', () => {
    // DOB that contains all digits 1-9 in various forms
    // We need to call getMissingEffects with a digit-frequency map
    // getMissingEffects(missingNumbers: number[]) — pass empty array
    const result = getMissingEffects([]);
    expect(result).toHaveLength(0);
  });

  it('missing digit 4 → returns effect for 4', () => {
    const result = getMissingEffects([4]);
    expect(result).toHaveLength(1);
    expect(result[0].number).toBe(4);
    expect(typeof result[0].effect).toBe('string');
  });

  it('multiple missing digits → returns one entry per missing digit', () => {
    const result = getMissingEffects([2, 7]);
    expect(result).toHaveLength(2);
    const numbers = result.map(r => r.number);
    expect(numbers).toContain(2);
    expect(numbers).toContain(7);
  });
});
```

**Note:** If `getMissingEffects` takes a different argument shape (e.g. a record of digit→count), inspect `lib/numerology/missing.ts` and adapt the call. The assertions on shape (`number`, `effect` properties) remain the same.

- [ ] **Step 7: Add `describe('Repetition detection', ...)` block**

```ts
describe('Repetition detection', () => {
  it('no repeated digits → returns empty array', () => {
    const result = getRepetitionEffects([]);
    expect(result).toHaveLength(0);
  });

  it('repeated digit 1 → returns effect for 1', () => {
    const result = getRepetitionEffects([{ number: 1, count: 3 }]);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].number).toBe(1);
  });
});
```

**Note:** If `getRepetitionEffects` takes a different shape, inspect `lib/numerology/repetition.ts` and adapt. Keep assertions on the returned object's `.number` property.

- [ ] **Step 8: Run all tests to confirm no regressions**

```bash
npx vitest run lib/groq-client.test.ts
```

Expected: all tests in `Groq Client Error Handling` still pass; new numerology tests pass; 0 placeholder stubs remain.

- [ ] **Step 9: Commit**

```bash
git add lib/groq-client.test.ts
git commit -m "test: replace 25 placeholder stubs with real numerology assertions"
```

---

## Task 5: Frontend two-phase state split

**Files:**
- Modify: `loshu.tsx`
- Modify: `components/numerology/NarrativeCard.tsx`
- Modify: `components/numerology/NumerologyDashboard.tsx`

### 5a — `NarrativeCard` — add `errorMessage` prop

- [ ] **Step 1: Update `NarrativeCardProps` interface**

In `components/numerology/NarrativeCard.tsx`, replace:

```ts
interface NarrativeCardProps {
  sections: Array<{
    title: string;
    body: string;
  }>;
  onGenerate?: () => void;
  isGenerating?: boolean;
}
```

with:

```ts
interface NarrativeCardProps {
  sections: Array<{
    title: string;
    body: string;
  }>;
  onGenerate?: () => void;
  isGenerating?: boolean;
  errorMessage?: string;
}
```

- [ ] **Step 2: Add `errorMessage` render branch**

In the JSX body of `NarrativeCard`, find the first conditional render. Insert the `errorMessage` check as the highest-priority branch (before `isGenerating` and before `sections?.length > 0`):

```tsx
function NarrativeCard({ sections, onGenerate, isGenerating, errorMessage }: NarrativeCardProps) {
  if (errorMessage) {
    return (
      <p className="text-sm text-muted-foreground">
        AI insights temporarily unavailable. Your chart above is unaffected.
      </p>
    );
  }
  // existing isGenerating / sections / default branches follow unchanged
  ...
}
```

(Keep all existing branches intact below this new block.)

### 5b — `NumerologyDashboard` — pass new props through

- [ ] **Step 3: Add `narrativeLoading` and `narrativeError` to `NumerologyDashboardProps`**

In `components/numerology/NumerologyDashboard.tsx`, extend the interface:

```ts
interface NumerologyDashboardProps {
  profile: any;
  narrative?: any;
  label?: string;
  color?: string;
  isSingle?: boolean;
  chatProps?: {
    chartContext: any;
    lang: string;
    fetchFollowUp: any;
  };
  narrativeLoading?: boolean;   // ← new
  narrativeError?: string | null; // ← new
}
```

- [ ] **Step 4: Thread `narrativeLoading`/`narrativeError` into `NarrativeCard`**

In the component body, destructure the new props and pass them to `NarrativeCard`:

```tsx
function NumerologyDashboard({ profile, narrative, label, color, isSingle, chatProps, narrativeLoading, narrativeError }: NumerologyDashboardProps) {
  // ...existing code...

  // Replace the existing NarrativeCard usage:
  {(narrative?.sections || narrativeLoading || narrativeError) && (
    <NarrativeCard
      sections={narrative?.sections ?? []}
      isGenerating={narrativeLoading ?? false}
      onGenerate={() => console.log('Generate AI Insights clicked')}
      errorMessage={narrativeError ?? undefined}
    />
  )}
}
```

Note: The existing render guard was `{narrative && narrative.sections && ...}`. Replace it so the card renders whenever there is loading state or an error, even before `narrative` arrives.

### 5c — `loshu.tsx` — two-phase `calculate()`

- [ ] **Step 5: Update `AnalysisResult` type to allow nullable narrative fields**

In `loshu.tsx`, replace:

```ts
type AnalysisResult = {
  m1: any;
  m2: any;
  narrative: NarrativePayload["narrative"];
  mode: string;
  lang: string;
  prof1: any;
  prof2: any;
  signals: NarrativePayload["signals"];
  archetypes: NarrativePayload["archetypes"];
};
```

with:

```ts
type AnalysisResult = {
  m1: any;
  m2: any;
  mode: string;
  lang: string;
  prof1: any;
  prof2: any;
  narrative: NarrativePayload["narrative"] | null;
  signals: NarrativePayload["signals"] | null;
  archetypes: NarrativePayload["archetypes"] | null;
};
```

- [ ] **Step 6: Add `narrativeLoading` and `narrativeError` state**

After the existing state declarations, add:

```ts
const [narrativeLoading, setNarrativeLoading] = useState(false);
const [narrativeError, setNarrativeError] = useState<string | null>(null);
```

- [ ] **Step 7: Rewrite `calculate()` as two phases**

Replace the current body of `calculate()` with:

```ts
async function calculate() {
  setError("");
  setLoading(true);
  setResult(null);
  setNarrativeError(null);

  // Phase 1 — synchronous math, cannot fail
  try {
    // (keep existing DOB validation block here — the guard that calls setError and returns early)
    const m1 = { ...mathLayer(p1.dob, p1.gender), name: p1.name };
    const m2 = mode === "couple" ? { ...mathLayer(p2.dob, p2.gender), name: p2.name } : null;
    const prof1 = buildProfile(m1, m1.name);
    const prof2 = m2 ? buildProfile(m2, m2.name) : null;
    setResult({ m1, m2, mode, lang, prof1, prof2, narrative: null, signals: null, archetypes: null });
  } catch (e) {
    setError((e as Error).message);
    setLoading(false);
    return;
  }
  setLoading(false);

  // Phase 2 — async Groq narrative, scoped failure
  setNarrativeLoading(true);
  try {
    const prof1 = buildProfile({ ...mathLayer(p1.dob, p1.gender), name: p1.name }, p1.name);
    const prof2 = mode === "couple"
      ? buildProfile({ ...mathLayer(p2.dob, p2.gender), name: p2.name }, p2.name)
      : null;
    const analysis = await fetchNarrative(prof1, prof2, null, mode, lang);
    setResult(prev => prev ? ({
      ...prev,
      narrative: analysis.narrative,
      signals: analysis.signals,
      archetypes: analysis.archetypes,
    }) : prev);
  } catch (e) {
    setNarrativeError((e as Error).message);
  } finally {
    setNarrativeLoading(false);
  }
}
```

**Note on code duplication:** `buildProfile` and `mathLayer` are called twice (once for phase 1, once for phase 2). This is intentional — extracting them into a shared variable between phases would require refactoring the outer closure, which is out of scope. Keep it simple and DRY within each phase.

- [ ] **Step 8: Guard `chatProps` on `R.archetypes` being truthy**

Find the `chatProps` assignment in the JSX. Replace:

```ts
chatProps={mode === "single" ? { chartContext: chartCtx, lang, fetchFollowUp } : undefined}
```

with:

```ts
chatProps={mode === "single" && R.archetypes ? { chartContext: chartCtx, lang, fetchFollowUp } : undefined}
```

(For couple mode, apply the same `R.archetypes` guard if a similar pattern exists for the second dashboard.)

- [ ] **Step 9: Pass `narrativeLoading` and `narrativeError` to `NumerologyDashboard`**

Locate both `<NumerologyDashboard ...>` usages in the JSX and add the two new props:

```tsx
<NumerologyDashboard
  {/* ...existing props... */}
  narrativeLoading={narrativeLoading}
  narrativeError={narrativeError ?? undefined}
/>
```

- [ ] **Step 10: Commit**

```bash
git add loshu.tsx components/numerology/NarrativeCard.tsx components/numerology/NumerologyDashboard.tsx
git commit -m "feat: two-phase calculate() — grid renders immediately, narrative failure shows inline message"
```

---

## Self-Review

### Spec coverage

| Spec requirement | Task |
|---|---|
| `finish_reason === 'length'` check + `TruncatedOutputError` | Task 1 |
| `TRUNCATED` enum value | Task 1 |
| `categorizeGroqError` branch for `TruncatedOutputError` | Task 1 |
| `determineNextAction` TRUNCATED → next tier, 300ms | Task 1 |
| `maxRetries: 0` on Groq instantiation | Task 2 |
| Read `retry-after` header; hop to next tier | Task 2 |
| Remove "retry same tier on tier 0" for rate-limits | Task 2 |
| `TierIndex` enum | Task 3 |
| 4 → 3 tiers, all strict | Task 3 |
| Replace raw integer literals in `determineNextAction` | Task 3 |
| Remove `STRUCTURED_TIER3` from `MODELS` | Task 3 |
| Delete 25 placeholder stubs | Task 4 |
| Replace with ~15–20 real numerology assertions | Task 4 |
| `narrativeLoading` / `narrativeError` state in `loshu.tsx` | Task 5 |
| `AnalysisResult` nullable narrative fields | Task 5 |
| Two-phase `calculate()` | Task 5 |
| `chatProps` guard on `R.archetypes` | Task 5 |
| `NarrativeCard` `errorMessage` prop + render priority | Task 5 |
| `NumerologyDashboard` passes new props through | Task 5 |

All spec requirements covered. ✓

### Placeholder scan

No TBDs, no "implement later", no "similar to Task N", no steps without code. ✓

### Type consistency

- `narrativeLoading: boolean` declared in `loshu.tsx`, passed as `narrativeLoading?: boolean` in `NumerologyDashboard`, consumed as `isGenerating` in `NarrativeCard` — chain is consistent. ✓
- `narrativeError: string | null` in `loshu.tsx`; converted to `string | undefined` at the prop boundary with `?? undefined` — consistent with `errorMessage?: string`. ✓
- `TierIndex.T2 = 1`, `TierIndex.T3 = 2` — but wait, the spec defines `T1=0, T2=1, T3=2`. The existing code uses `skipToTier: 2` to mean "go to index 2" (0-indexed Tier 3). With `TierIndex.T3 = 2` that maps correctly. ✓
- `STRUCTURED_OUTPUT_TIERS` shrinks from 4 to 3 entries. `CONTEXT_LENGTH` previously routed to `skipToTier: 3` (index 3, now out of bounds). After Task 3, it routes to `TierIndex.T3 = 2` which is the last valid tier. ✓
