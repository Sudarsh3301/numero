# Groq Fallback Layer — Code-Grounded Architecture Review

This document is a factual review of `lib/groq-client.ts` as it exists in the
code today. It intentionally does not restate claims from
`GROQ_FALLBACK_ARCHITECTURE.md` (e.g. tier success-rate percentages,
"Production Ready" status) unless they are verifiable from the code itself —
that document describes aspirational monitoring/metrics that are not
implemented anywhere in the codebase.

Every finding below cites the exact file and line.

---

## 1. Circuit breaker does not protect anything the tier cascade doesn't already handle

**Code:** `lib/groq-client.ts:144-206`, invoked from `attemptGeneration` at
`lib/groq-client.ts:252` (`checkCircuitBreaker(model)`).

**What it does:** keys a `Map<string, CircuitBreakerState>` by model name.
After 5 consecutive failures for a given model (`failureThreshold: 5`,
line 154), it opens the circuit and throws on every subsequent call for that
model until `resetTimeout: 60000` (60s) passes.

**Why it doesn't add value here:**

- Each tier in `STRUCTURED_OUTPUT_TIERS` (`lib/groq-client.ts:216-241`) maps
  to a specific model. When Tier 1 (`openai/gpt-oss-20b`) fails,
  `structuredGenerationWithTiers` (`lib/groq-client.ts:404-473`) already moves
  to the next tier in the same request via `currentTierIndex++`
  (`lib/groq-client.ts:466`) or `nextAction.skipToTier`
  (`lib/groq-client.ts:459-460`). The breaker's job — "stop calling a model
  that's failing" — is already done by the cascade, per request, with zero
  extra state.
- The breaker only has a chance to matter *across* requests (closing a model
  out for 60s after 5 failures elsewhere). But `circuitBreakers`
  (`lib/groq-client.ts:151`) is a plain module-level `const`. The stack trace
  in `logs.md` shows this app running under
  `/var/task/.next/server/app/api/analyze/route.js` — a Next.js serverless
  function. Module-level state in a serverless function is not guaranteed to
  persist between invocations (cold starts get a fresh module scope). This
  means the "5 consecutive failures" counter can silently reset to 0 at any
  time for reasons unrelated to the model actually recovering, so the
  breaker's cross-request protection is unreliable in this deployment target.
- No test in `lib/groq-client.test.ts` actually exercises this against a
  cold-start reset scenario or verifies persistence — the existing circuit
  breaker tests (`lib/groq-client.test.ts:187-208`) are `expect(true).toBe(true)`
  placeholders that don't assert real behavior (see finding 4).

**Concrete cost:** ~65 lines (144-206) plus a call site (252) plus a
failure-recording call site (`lib/groq-client.ts:298`) and success-recording
call site (`lib/groq-client.ts:292`), all to implement a safeguard whose
actual protective value in this deployment is close to zero.

---

## 2. Tier-skip logic references tiers by raw array index, not by name

**Code:** `determineNextAction`, `lib/groq-client.ts:315-349`.

```ts
case GroqErrorType.JSON_VALIDATE_FAILED:
  return { wait: 300, retry: false, skipToTier: Math.max(2, currentTier + 1) };  // line 322
...
case GroqErrorType.TIMEOUT:
  return { wait: 500, retry: false, skipToTier: 2 };                             // line 335
...
case GroqErrorType.CONTEXT_LENGTH:
  return { wait: null, retry: false, skipToTier: 3 };                            // line 339
```

These magic numbers (`2`, `3`) are positional indices into
`STRUCTURED_OUTPUT_TIERS` (`lib/groq-client.ts:216-241`), where index 2 is
"Tier 3: Best-effort mode" and index 3 is "Tier 4: Different model family."
Nothing ties these numbers to the array by name or constant — if a tier is
ever added, removed, or reordered in `STRUCTURED_OUTPUT_TIERS`, these three
line numbers silently point at the wrong tier. No test catches this: the
tests that describe this behavior (`lib/groq-client.test.ts:150-183`,
`"should skip to different model on context length"` etc.) are all
placeholder `expect(true).toBe(true)` assertions — they document intent, they
verify nothing.

**Concrete cost:** this is the mechanism that produced the exact bug fixed in
this session — Tier 4 being `meta-llama/llama-4-scout-17b-16e-instruct`
(a model returning HTTP 404 `model_not_found`, per `logs.md:42-52`) sat
unnoticed because `determineNextAction`'s branches kept routing traffic
*around* it via other tiers, and no test asserted what tier index 3 actually
resolves to.

---

## 3. Error classification is done by substring-matching HTTP error messages

**Code:** `categorizeGroqError`, `lib/groq-client.ts:62-142`.

Representative lines:

```ts
if (errorCode === 'timeout' || message.includes('timeout') || message.includes('timed out')) {
  // line 103
```
```ts
error?.message?.includes('rate limit') ||
error?.message?.includes('Rate limit')
  // lines 39-40, isRateLimitError
```

**Why this is fragile:** classification depends on whatever free-text string
Groq (or the SDK, or a network layer in between) happens to put in
`error.message`. If Groq changes their error message wording, or a proxy/CDN
in front of the API returns an HTML error page whose body happens to contain
the substring "timeout", the request gets classified — and routed — based on
an accident of string content rather than a stable error code. The categorized
error type then drives real control flow in `determineNextAction`
(`lib/groq-client.ts:315-349`), so a misclassification doesn't just mislabel a
log line, it changes which tier the request goes to next and how long it
waits.

**Concrete cost:** 7 error types, each requiring message-shape knowledge that
isn't derived from any single source of truth (the Groq SDK does export typed
error codes in `error.error.code` — that field is checked first in several
branches, e.g. `errorCode === 'json_validate_failed'` at line 79 — but every
branch also falls through to substring matching on freeform text as a
secondary path).

---

## 4. Roughly a third of `groq-client.test.ts` is placeholder assertions

**Code:** `lib/groq-client.test.ts`, specifically:
- `"Error-Adaptive Strategy Logic"` block, lines 145-185 (5 tests)
- `"Circuit Breaker Integration"` block, lines 187-208 (3 tests)
- `"Tier Cascade Integration"` block, lines 210-252 (6 tests)
- `"Logging and Observability"` block, lines 254-300 (8 tests)
- `"Backward Compatibility"` block, lines 302-320 (3 tests)

That's 25 of the file's tests (out of ~28 total test cases beyond
`categorizeGroqError`/`isRateLimitError`/`Model Constants`) whose bodies are
literally `expect(true).toBe(true);` with a comment describing what
"should" happen. Example, verbatim (`lib/groq-client.test.ts:157-162`):

```ts
it('should skip immediately on model not found', () => {
  // Expected behavior:
  // - MODEL_NOT_FOUND → Next tier immediately
  // - No wait time
  expect(true).toBe(true);
});
```

**Why this matters for the "overcomplicated" question specifically:** these
tests give the *appearance* of covering the tier cascade, circuit breaker,
and adaptive retry logic — the exact subsystems flagged above as high-risk
(magic tier indices, substring matching, serverless-incompatible shared
state) — while actually asserting nothing about them. Anyone reading the test
file's `describe` block names without opening the bodies would reasonably
believe this logic is under test. It is not. The bug fixed in this session
(dead Tier 4 model, `logs.md:42-52`) would have been caught by a real test
asserting `determineNextAction`'s `skipToTier` output resolves to a model
that responds — none of the 25 placeholder tests do this.

---

## 5. The outer retry wrapper is structurally inert for the one failure mode it exists to handle

**Code:** `withRetryAndFallback`, `app/api/analyze/route.ts:11-50`, wrapping
calls to `generateWithFallback` (which internally runs
`structuredGenerationWithTiers`, `lib/groq-client.ts:404-473`).

`withRetryAndFallback` retries its `primaryFn` up to `maxRetries` (2) times
(`app/api/analyze/route.ts:19`), but explicitly refuses to retry when the
error message contains `'failed after attempting all fallback tiers'`
(`app/api/analyze/route.ts:29-32`):

```ts
if (errorMessage.includes('failed after attempting all fallback tiers')) {
  console.error(`[${label}] All tiers exhausted, not retrying`);
  throw err;
}
```

That exact string is the *only* error message `structuredGenerationWithTiers`
throws on full exhaustion — it's built by `buildComprehensiveError`
(`lib/groq-client.ts:352-367`), which always returns an `Error` whose message
starts with `"AI service failed after attempting all fallback tiers:"`
(`lib/groq-client.ts:364-366`). So for any structured-output call (the
archetype and narrative calls, which are the only calls using
`withRetryAndFallback` in this file), the moment the 4-tier cascade is fully
exhausted, the outer retry layer's own guard condition fires immediately and
it does not retry — confirmed exactly by the log sequence in `logs.md`: one
`[archetypes] Attempt 1/2` (line 14) followed directly by
`[archetypes] All tiers exhausted, not retrying` (line 57), with no
`Attempt 2/2` ever logged.

**Concrete cost:** this is not a hypothetical — the actual production
incident in `logs.md` demonstrates the outer retry loop contributing zero
retries. Its only live purpose in the observed failure path is running the
2-attempt loop's *first* attempt, i.e. it behaves as a single pass-through
for full-cascade failures, which is exactly the scenario it was ostensibly
built for.

---

## Summary table

| # | Component | Lines | Code-verified defect |
|---|-----------|-------|----------------------|
| 1 | Circuit breaker | `lib/groq-client.ts:144-206` | Redundant with tier cascade for in-request failures; cross-request state unreliable in the serverless deployment shown in `logs.md`'s stack trace |
| 2 | `determineNextAction` tier-skip | `lib/groq-client.ts:315-349` | Tier targets are raw array indices (2, 3), not named/derived — this exact fragility let the dead Tier 4 model go unnoticed |
| 3 | `categorizeGroqError` | `lib/groq-client.ts:62-142` | Falls through to substring-matching freeform error text; misclassification changes control flow, not just logs |
| 4 | `groq-client.test.ts` | lines 145-320 (25 tests) | Placeholder `expect(true).toBe(true)` assertions covering exactly the subsystems flagged in #1-3; give false confidence |
| 5 | `withRetryAndFallback` | `app/api/analyze/route.ts:11-50` | Its own guard clause (line 29-32) makes it a no-op retry for full-cascade failures, confirmed by the actual `logs.md` trace |

## What would reduce real risk, in order of leverage

1. Fix finding 4 first — replace the 25 placeholder tests with real
   assertions against `determineNextAction`'s actual `skipToTier` output and
   the models each tier resolves to. This is what would have caught the dead
   Tier 4 model automatically, and it's the cheapest change (no production
   code touched).
2. Fix finding 2 — reference tiers by a named constant/enum instead of raw
   indices, so reordering `STRUCTURED_OUTPUT_TIERS` can't silently retarget a
   skip.
3. Remove the circuit breaker (finding 1) — delete
   `lib/groq-client.ts:144-206` and its three call sites (252, 292, 298). The
   tier cascade already provides the in-request protection; the cross-request
   protection isn't reliable in this deployment.
4. Address finding 5 by either removing `withRetryAndFallback`'s outer loop
   for structured-output calls (since it never retries in the one scenario
   observed) or removing the guard clause that disables it — pick one
   deliberately rather than keeping code whose two halves contradict each
   other.
5. Finding 3 (substring matching) is the least urgent — it's a robustness
   gap, not an active bug — but worth tightening if Groq's error message
   wording changes are ever observed to cause misrouting.
