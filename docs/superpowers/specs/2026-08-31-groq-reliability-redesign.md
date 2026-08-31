# Groq Reliability Redesign — Design Spec

**Date:** 2026-08-31  
**Repo:** numero / loshu  
**Baseline commit:** `ee2513f`  
**Approach:** B — surgical patch + 3-tier all-strict collapse

---

## Scope

Five targeted changes. No circuit breaker removal, no repair-layer changes, no outer retry wrapper changes, no chat tools, no CI canary, no `.gitattributes`.

| # | Change | File(s) |
|---|---|---|
| 1 | Frontend two-phase state split | `loshu.tsx`, `NarrativeCard.tsx`, `NumerologyDashboard.tsx` |
| 2 | `finish_reason === 'length'` truncation check | `lib/groq-client.ts` |
| 3 | Disable SDK `maxRetries`; read `retry-after` header | `lib/groq-client.ts` |
| 4 | Named-tier enum + collapse to 3-tier all-strict | `lib/groq-client.ts` |
| 5 | Replace 25 placeholder tests with numerology unit tests | `lib/groq-client.test.ts` |

---

## 1 · Frontend two-phase state split

### Problem
`loshu.tsx`'s `calculate()` calls `await fetchNarrative(...)` before calling `setResult()`. Any Groq failure sets an error string and never calls `setResult`, so the entire dashboard — including the synchronously-computed Lo Shu grid — stays hidden. A Groq outage delivers 0% of the product's value.

### Design

**New state in `loshu.tsx`:**
```ts
const [narrativeLoading, setNarrativeLoading] = useState(false);
const [narrativeError, setNarrativeError] = useState<string | null>(null);
```

**`AnalysisResult` type** — `narrative`, `signals`, `archetypes` become nullable:
```ts
type AnalysisResult = {
  m1: any; m2: any; mode: string; lang: string; prof1: any; prof2: any;
  narrative: NarrativePayload["narrative"] | null;
  signals: NarrativePayload["signals"] | null;
  archetypes: NarrativePayload["archetypes"] | null;
};
```

**`calculate()` — two phases:**
```ts
setError(""); setLoading(true); setResult(null); setNarrativeError(null);

// Phase 1 — synchronous, cannot fail
const m1 = { ...mathLayer(p1.dob, p1.gender), name: p1.name };
const m2 = mode === "couple" ? { ...mathLayer(p2.dob, p2.gender), name: p2.name } : null;
const prof1 = buildProfile(m1, m1.name);
const prof2 = m2 ? buildProfile(m2, m2.name) : null;
setResult({ m1, m2, mode, lang, prof1, prof2, narrative: null, signals: null, archetypes: null });
setLoading(false);

// Phase 2 — async, scoped failure, must never un-render phase 1
setNarrativeLoading(true);
try {
  const analysis = await fetchNarrative(prof1, prof2, null, mode, lang);
  setResult(prev => prev && ({
    ...prev,
    narrative: analysis.narrative,
    signals: analysis.signals,
    archetypes: analysis.archetypes,
  }));
} catch (e) {
  setNarrativeError((e as Error).message);
} finally {
  setNarrativeLoading(false);
}
```

**`chatProps` guard** — gate on `R.archetypes` being truthy, not just on mode, to prevent passing a null context to `/api/chat`:
```ts
chatProps={mode === "single" && R.archetypes ? { chartContext: chartCtx, lang, fetchFollowUp } : undefined}
```

**`NumerologyDashboard`** — pass two new optional props through:
```ts
<NumerologyDashboard
  ...existing props...
  narrativeLoading={narrativeLoading}
  narrativeError={narrativeError}
/>
```

### `NarrativeCard` changes

Add two optional props:
```ts
interface NarrativeCardProps {
  sections: Array<{ title: string; body: string }>;
  onGenerate?: () => void;
  isGenerating?: boolean;
  errorMessage?: string;  // new
}
```

Render priority (top to bottom, first truthy wins):
1. `errorMessage` → inline muted message: "AI insights temporarily unavailable. Your chart above is unaffected."
2. `isGenerating` → "Generating..." button (existing)
3. `sections?.length > 0` → section list (existing)
4. default → "Generate AI Insights" button (existing)

No other dashboard children are touched. `NumerologyDashboard` passes `isGenerating` and `errorMessage` straight through.

---

## 2 · `finish_reason` truncation check

### Problem
`attemptGeneration` reads only `response.choices[0]?.message?.content`. When the model hits a token limit mid-structure, the response arrives with `finish_reason: 'length'` and malformed JSON. This is classified as `JSON_VALIDATE_FAILED` and routed to a best-effort tier — treating a token-budget problem as a schema-following problem. This has caused three separate incidents.

### Design

Insert before JSON parsing in `attemptGeneration`:
```ts
if (response.choices[0]?.finish_reason === 'length') {
  throw new TruncatedOutputError(model, response.usage?.completion_tokens);
}
```

New error class:
```ts
class TruncatedOutputError extends Error {
  constructor(model: string, completionTokens?: number) {
    super(`Output truncated by token limit on model ${model} (completion_tokens: ${completionTokens ?? 'unknown'})`);
    this.name = 'TruncatedOutputError';
  }
}
```

`categorizeGroqError` — add before the `JSON_VALIDATE_FAILED` branch:
```ts
if (error instanceof TruncatedOutputError) return GroqErrorType.TRUNCATED;
```

`determineNextAction` — `TRUNCATED` routes identically to `JSON_VALIDATE_FAILED` (skip to next tier, 300ms wait). The distinction is preserved in the error type for logging.

Add `TRUNCATED = 'truncated'` to the `GroqErrorType` enum.

---

## 3 · Disable SDK retries; read `retry-after` header

### Problem
The Groq SDK's default `maxRetries: 2` runs invisibly underneath the tier cascade and circuit breaker. Five breaker-counted failures can represent up to 15 real HTTP attempts. The app's own `RATE_LIMIT` backoff then stacks on top of backoff the SDK already ran. On rate limits, the app computes a blind `2000·2^tier` wait instead of reading the `retry-after` header Groq already provides.

### Design

**Disable SDK retries:**
```ts
groqInstance = new Groq({ apiKey: process.env.GROQ_API_KEY || '', maxRetries: 0 });
```

**Read `retry-after` in `determineNextAction` for `RATE_LIMIT`:**
```ts
case GroqErrorType.RATE_LIMIT: {
  const retryAfterSec = error?.headers?.['retry-after'];
  const waitMs = retryAfterSec
    ? Number(retryAfterSec) * 1000
    : Math.min(2000 * Math.pow(2, tierIndex), 8000);
  await sleep(waitMs);
  // hop to next tier instead of retrying same model (different TPM bucket)
  return { action: 'next_tier' };
}
```

The existing "retry same tier on tier 0" behavior for rate limits is removed — hopping to the next model reaches a fresh TPM bucket immediately rather than waiting out the same one.

---

## 4 · Named-tier enum + 3-tier all-strict collapse

### Problem
`determineNextAction` references tier positions as raw integer literals (`2`, `3`). Reordering or resizing `STRUCTURED_OUTPUT_TIERS` silently retargets these. This is the structural fragility that let a dead Tier 4 model go unnoticed. Tiers 3–4 are set to `strict: false` on models that support `strict: true`, giving up Groq's strongest guarantee at the last line of defense.

### Design

**Tier enum:**
```ts
enum TierIndex {
  T1 = 0,
  T2 = 1,
  T3 = 2,
}
```

**Collapsed tier config (4 → 3, all strict):**
```ts
const STRUCTURED_OUTPUT_TIERS = [
  { model: 'openai/gpt-oss-20b',  strict: true, temperature: 0.3 },  // T1: fast primary
  { model: 'openai/gpt-oss-120b', strict: true, temperature: 0.2 },  // T2: larger, same guarantee
  { model: 'qwen/qwen3.8-27b',    strict: true, temperature: 0.5 },  // T3: different family
];
```

`determineNextAction` — replace all literal indices:
- `2` → `TierIndex.T2`
- `3` → `TierIndex.T3`

`MODELS` constant — remove `STRUCTURED_TIER3` (was duplicate of `STRUCTURED_TIER2`, best-effort). All other constants kept for backward compatibility.

---

## 5 · Numerology unit tests

### Problem
25 of ~28 non-trivial tests in `lib/groq-client.test.ts` are `expect(true).toBe(true)` placeholders. They cover the tier cascade and circuit breaker while asserting nothing. The dead Tier 4 model would have been caught by one real assertion.

### Design

Delete all 25 placeholder stubs. Replace with real assertions on pure numerology functions from `lib/numerology/*.ts`. No Groq SDK mocking required — these are synchronous, deterministic functions.

Target functions (representative, not exhaustive):
- `calculateDriver(dob)` — known DOB → expected driver number
- `calculateConductor(dob)` — known DOB → expected conductor number  
- `getPersonalYearEffect(dob, year)` — known inputs → expected personal year number
- Missing number detection — known digit set → expected missing array
- Repeated number detection — known digit set → expected repeated array
- Plane scoring — known counts → expected dominant plane

Each test: one input, one `expect(result).toBe(expected)`. Aim for ~15–20 real assertions covering edge cases (master numbers, karmic numbers, single-digit DOBs).

The placeholder file is renamed or the Groq-specific describe blocks are removed; a new `lib/numerology/numerology.test.ts` file holds the new tests if the existing file structure warrants separation.

---

## Error handling summary

| Failure scenario | User experience after |
|---|---|
| All Groq tiers exhausted | Grid renders, NarrativeCard: "AI insights temporarily unavailable. Your chart above is unaffected." |
| Groq outage / network error | Same as above |
| Token truncation (was misclassified) | Named `TruncatedOutputError`, skips to next strict tier, logged clearly |
| Rate limit | Reads `retry-after` from header, hops to next model's fresh TPM bucket |
| Input validation error (bad DOB) | Unchanged — `setError()` path, grid never renders (correct) |

## Out of scope

- Circuit breaker (left in place, no change)
- Repair layer / partial-acceptance threshold (left as-is)
- Outer retry wrapper logic (unchanged; benefits passively from SDK retry disable)
- Chat tools (`/api/chat` numerology tool-calling)
- CI canary for deprecated models
- `.gitattributes` / `core.autocrlf`
- `GROQ_ARCHITECTURE_REVIEW.md`, `GROQ_FALLBACK_STACK.md` — reference docs, not updated
