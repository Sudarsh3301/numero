# The Groq Fallback Stack — Full Architecture Reference

A code-grounded map of every retry, fallback, and guard rail sitting between a request and Groq in the `numero` (Lo Shu) codebase, plus the frontend layer that decides what the user actually sees when one of those calls fails.

Compiled from a direct reading of `lib/groq-client.ts`, `lib/groq-client.test.ts`, `app/api/analyze/route.ts`, `app/api/chat/route.ts`, `loshu.tsx`, `logs.md`, `CRITICAL_FIXES.md`, `RELIABILITY_IMPROVEMENTS.md`, `GROQ_ARCHITECTURE_REVIEW.md`, the `groq-sdk` package internals, and `groq-docs/{structured-outputs,models,rate-limits,compound,prefilling}.md`. No production code was changed to produce this document — recommendations are proposals, not diffs.

**Repo:** numero / loshu · **Baseline commit:** `ee2513f` · **Reviewed:** 31 Aug 2026

---

## Contents

1. [Overview](#01-overview)
2. [Architecture map](#02-architecture-map)
3. [Rule logic reference](#03-rule-logic-reference)
4. [Verified findings (original review)](#04-verified-findings-original-review)
5. [Deeper findings](#05-deeper-findings)
6. [Checked against Groq's own documentation](#06-checked-against-groqs-own-documentation)
7. [Proposed redesign](#07-proposed-redesign)
8. [Prioritized action list](#08-prioritized-action-list)
9. [Frontend resilience: decoupling the grid from AI failures](#09-frontend-resilience-decoupling-the-grid-from-ai-failures)

---

## 01 · Overview

This documents the full reliability stack around Groq calls in two endpoints — `app/api/analyze/route.ts` (structured JSON: archetypes + narrative) and `app/api/chat/route.ts` (plain-text follow-up chat) — plus every rule inside `lib/groq-client.ts` that decides what happens on failure, and (new in this revision) the frontend orchestration in `loshu.tsx` that decides whether a Groq failure is allowed to take the rest of the page down with it.

Four questions run through the document: which layers are load-bearing, which are quietly fighting each other, which problems Groq's own API already solves for free if you read the response correctly, and whether an AI failure should ever be allowed to hide work the app already finished without any AI involved.

**Status legend:** ✅ confirmed against source · ⚠️ open / recommended change · ❌ actively contradicts another layer

---

## 02 · Architecture map

A structured-output request passes through **six** distinct reliability mechanisms before a response reaches the route handler — five written by hand, one invisible inside the SDK. They were added incrementally across three separate incidents and were never designed as one system, which is why several overlap or undo each other.

```
Request path, outermost → innermost
┌─────────────────────────────────────────────────────────────────────┐
│ 1 · Outer retry wrapper — withRetryAndFallback()                    │  keep — real job once
│    app/api/analyze/route.ts:9-49                                    │  layer 4 is tamed
│    network-level failures only, 2 attempts                          │
├─────────────────────────────────────────────────────────────────────┤
│ 2 · Tier cascade + adaptive skip                                    │  core mechanism —
│    structuredGenerationWithTiers() · lib/groq-client.ts:404-473     │  keep, simplify
│    determineNextAction() routes by error type, 4 tiers              │
├─────────────────────────────────────────────────────────────────────┤
│ 3 · Circuit breaker — checkCircuitBreaker()                         │  recommend removing
│    lib/groq-client.ts:144-206                                       │
│    module-level Map, unreliable across serverless cold starts       │
├─────────────────────────────────────────────────────────────────────┤
│ 4 · Groq SDK's own retry + timeout (HIDDEN)                         │  invisible — nothing in
│    groq-sdk/core.js:127 · maxRetries: 2, timeout: 60000ms           │  the app accounts for it
│    runs before your code ever sees the error                        │
├─────────────────────────────────────────────────────────────────────┤
│ 5 · Section repair layer                                            │  scope down to
│    app/api/analyze/route.ts:500-580                                 │  best-effort tiers only
│    regenerates 1-2 missing narrative fields via a 2nd call          │
├─────────────────────────────────────────────────────────────────────┤
│ 6 · Partial-acceptance threshold                                    │  recommend removing
│    app/api/analyze/route.ts:485                                     │  once tiers are all-strict
│    accepts a response with as few as 3 of 5 (or 4 of 6) sections    │
└─────────────────────────────────────────────────────────────────────┘
```

**Call graph, in words:** `route.ts` calls `withRetryAndFallback(() => generateWithFallback(...))`. For a structured-output call, `generateWithFallback` (`lib/groq-client.ts:452-473`) delegates to `structuredGenerationWithTiers`, which loops over `STRUCTURED_OUTPUT_TIERS` and calls `attemptGeneration` per tier. `attemptGeneration` checks the circuit breaker, calls the Groq SDK, validates JSON syntax if a schema was requested, and records breaker success/failure. Any thrown error is classified by `categorizeGroqError` and handed to `determineNextAction`, which decides whether to wait, retry the same tier, or jump to a specific tier index. Once the cascade returns text, `route.ts` parses it, and — only for the narrative call, which models its schema as an array of named sections rather than trusting the object schema's own `required` array — checks for missing fields and optionally repairs or partially accepts.

---

## 03 · Rule logic reference

Every threshold, mapping, and decision table currently encoded in the stack, transcribed directly from source.

### Tier configuration — `STRUCTURED_OUTPUT_TIERS`

| Tier | Model | Strict | Temp | Strict-mode support? |
|---|---|---|---|---|
| 1 | `openai/gpt-oss-20b` | `true` | 0.3 | ✅ yes |
| 2 | `openai/gpt-oss-120b` | `true` | 0.2 | ✅ yes |
| 3 | `openai/gpt-oss-120b` | **`false`** | 0.3 | ⚠️ yes — unused |
| 4 | `qwen/qwen3.8-27b` | **`false`** | 0.5 | ⚠️ yes — unused |

`lib/groq-client.ts:216-241`. Tier 4 was `meta-llama/llama-4-scout-17b-16e-instruct` until commit `ee2513f` (31 Aug, 20:02 IST) — Groq had removed it from its catalog, returning `404 model_not_found` in production (see §04). Tiers 3 and 4 are set to `strict: false` even though both models support `strict: true` per Groq's current model table — see §06.

### Error classification — `categorizeGroqError()`

`lib/groq-client.ts:62-142`. Evaluated top-to-bottom, first match wins:

| Order | Type | Primary signal | Fallback signal |
|---|---|---|---|
| 1 | `RATE_LIMIT` | `status === 429` | `errorCode === 'rate_limit_exceeded'` · message includes "rate limit" |
| 2 | `JSON_VALIDATE_FAILED` | `status === 400` + `errorCode === 'json_validate_failed'` | message includes "does not match the expected schema" / "Failed to validate JSON" |
| 3 | `MODEL_NOT_FOUND` | `status === 404` | `errorCode === 'model_not_found'` · message includes it |
| 4 | `TIMEOUT` | `errorCode === 'timeout'` | message includes "timeout" / "timed out" |
| 5 | `CONTEXT_LENGTH` | `status === 400` + `errorCode === 'context_length_exceeded'` | message includes it / "maximum context length" |
| 6 | `GENERIC_API_ERROR` | `status >= 500` | — |
| 7 | `UNKNOWN` | default | — |

No branch ever inspects `response.choices[0]?.finish_reason` — see §05.

### Next-action decision — `determineNextAction()`

`lib/groq-client.ts:315-349`.

| Error type | Wait | Retry same tier? | Skip to tier |
|---|---|---|---|
| `JSON_VALIDATE_FAILED` | 300ms | no | `max(2, current+1)` — index 2 |
| `MODEL_NOT_FOUND` | — | no | `current + 1` |
| `RATE_LIMIT` | `min(2000·2^tier, 8000)`ms | only on tier 0 | — |
| `TIMEOUT` | 500ms | no | index 2 (hardcoded) |
| `CONTEXT_LENGTH` | — | no | index 3 (hardcoded) |
| `GENERIC_API_ERROR` | 1000ms | if current < 2 | — |
| `UNKNOWN` (default) | 500ms | no | next tier |

Indices `2` and `3` are raw positions into `STRUCTURED_OUTPUT_TIERS`, not resolved by name — reorder or resize the array and these silently repoint.

### Circuit breaker

| Setting | Value |
|---|---|
| Failure threshold | 5 consecutive failures |
| Reset timeout | 60,000ms |
| Half-open attempts | 1 |
| State store | `Map<model, state>` — module-level `const`, per Lambda instance |

`lib/groq-client.ts:150-206`.

### Outer retry wrapper & repair / partial-acceptance

- **`withRetryAndFallback`** (`app/api/analyze/route.ts:9-49`): up to 2 attempts, `500ms · attempt` backoff, aborts immediately (no retry) if the error message contains `"failed after attempting all fallback tiers"` or `"model_not_found"` or `"Invalid analysis request"`.
- **Repair layer** (`route.ts:500-580`): fires only when 1–2 of the required narrative fields are missing after parsing; issues one additional best-effort (`strict:false`) call asking only for the missing fields.
- **Partial acceptance** (`route.ts:485`): a response with `< minRequiredSections` (3) throws; anything ≥ 3 is accepted, tagged `complete` / `repaired` / `partial`.

### Groq SDK defaults (not overridden anywhere in this codebase)

| Setting | Value |
|---|---|
| `maxRetries` | 2 |
| `timeout` | 60,000ms |
| Auto-retries on | `429`, any `>= 500`, honoring `retry-after` / `retry-after-ms` headers |

`node_modules/groq-sdk/core.js:127, 396-436`. `getGroqClient()` (`lib/groq-client.ts:5-10`) constructs the client with no overrides, so every one of these applies underneath layers 2 and 3 without either knowing.

---

## 04 · Verified findings (original review)

Five findings from `GROQ_ARCHITECTURE_REVIEW.md`, independently re-checked against current source. All five still describe real structural risk; the acute incident they were written next to is already patched.

> **Already fixed, for context:** commit `ee2513f` replaced the dead Tier 4 model and removed the `maxTokens: 400` cap that was truncating strict-mode JSON mid-structure. `logs.md` and the original review both predate that commit.

**1. Circuit breaker adds ~65 lines to guard against a failure mode the tier cascade already handles in-request.** ❌ open
`lib/groq-client.ts:144-206, 252, 292, 298`. Its only distinct value is cross-request protection, but its state is a plain module-level `Map` in a Vercel/Lambda serverless function (stack trace confirms `/var/task/.next/server/...`) — cold starts reset it for reasons unrelated to the model actually recovering.

**2. Tier-skip targets are raw array indices, not names.** ❌ open
`lib/groq-client.ts:322, 335, 339` → `STRUCTURED_OUTPUT_TIERS` at 216-241. This is the exact fragility that let a dead Tier 4 model go unnoticed — `determineNextAction`'s branches keep routing traffic around whatever sits at a hardcoded index, whether or not that model actually responds.

**3. Error classification falls through to substring-matching freeform error text.** ⚠️ lower urgency
`lib/groq-client.ts:39-40, 62-142`. Every branch checks a typed `error.error.code` first, then falls through to matching strings like `"timeout"` or `"rate limit"` in `error.message` — a wording change upstream, or a proxy's HTML error page, changes routing, not just a log line.

**4. 25 of ~28 non-trivial tests are `expect(true).toBe(true)` placeholders.** ❌ open
`lib/groq-client.test.ts:145-320`. Confirmed by direct read of all 326 lines. They cover exactly the subsystems flagged above (tier cascade, circuit breaker, adaptive retry) while asserting nothing — the dead Tier 4 model would have been caught by one real assertion on `determineNextAction`'s output; none of the 25 make one.

**5. The outer retry wrapper's own guard clause makes it a no-op for the one path it was observed handling.** ⚠️ design tension, not purely a bug
`app/api/analyze/route.ts:29-32`. `logs.md` shows `[archetypes] Attempt 1/2` immediately followed by `All tiers exhausted, not retrying` — `Attempt 2/2` never fires, because the guard explicitly excludes full-cascade exhaustion. The comment at line 8 says this is deliberate ("network-level failures only"), which is a defensible design — but it means the wrapper is currently doing nothing for the failure mode that actually put a user-facing 500 in the logs.

---

## 05 · Deeper findings

Found while tracing the code path end to end and cross-referencing the SDK and Groq's documentation — not in the original review.

**The SDK's own retry logic runs underneath layers 2 and 3, invisibly.** ❌ contradicts layers 2–3
`node_modules/groq-sdk/core.js:127, 396-436` · `lib/groq-client.ts:5-10`. Every failure the circuit breaker counts, and every `RATE_LIMIT`/`GENERIC_API_ERROR` branch reacts to, may already represent up to 3 real HTTP attempts with the SDK's own backoff baked in. Five breaker-counted "failures" can be up to 15 actual requests. The app's own exponential backoff for `RATE_LIMIT` then stacks on top of backoff the SDK already ran.

**`finish_reason` is never read, in three incidents that all had the same shape.** ❌ highest-leverage fix
`lib/groq-client.ts:269` · `groq-sdk/resources/chat/completions.d.ts:337`. `attemptGeneration` only reads `response.choices[0]?.message?.content`. The SDK types every response with `finish_reason: 'stop' | 'length' | 'tool_calls' | 'function_call' | null` — a structural, unambiguous truncation signal that's discarded. `CRITICAL_FIXES.md` ("word budget too tight"), `RELIABILITY_IMPROVEMENTS.md`, and the `maxTokens: 400` incident are the same root cause three times; each was diagnosed by reading raw logs instead of one field already on the response.

**Rate-limit headers are never read either.** ⚠️ open
`groq-sdk/error.js:13` (`APIError.headers`) · `groq-docs/rate-limits.md`. Groq returns `retry-after` on every 429. The SDK already parses it for its own internal retries; the app's `RATE_LIMIT` branch ignores it and computes a blind `2000 · 2^tier` guess instead of reading the real number off `error.headers`.

**A sixth, uncounted reliability layer: section repair.** ⚠️ scope down, don't remove outright
`app/api/analyze/route.ts:500-580`. Regenerates 1–2 missing narrative fields via a second Groq call. Legitimate only for the best-effort tiers (3–4), where `required` isn't enforced — meaningless dead weight on strict tiers 1–2, where a missing field can't happen. Has no test coverage of its own.

**Repo-wide diff noise is masking real changes.** Hygiene, not architecture
`git diff --stat` vs. `git diff -b --stat`. ~50 files show as modified; `git diff -b` (ignoring whitespace) against every one of them is empty. Pure CRLF/LF churn from a Windows checkout with no `.gitattributes`. Today's actual fix — 5 lines in `route.ts` — is sitting in a repo where every file looks touched.

---

## 06 · Checked against Groq's own documentation

Cross-referencing `groq-docs/structured-outputs.md`, `models.md`, `rate-limits.md`, `compound.md`, and `prefilling.md` against what the codebase actually does.

### Strict mode's own guarantee contradicts the tier design

Groq states, twice, without qualification: strict mode "**never produces invalid JSON**" and "guarantees that the output will always match your schema exactly... **no error handling needed**" (`structured-outputs.md`, lines 18-19 and 1395-1397). Yet `logs.md` shows Tier 1 — `strict: true` — failing with `json_validate_failed`. The only way to reconcile that is external truncation cutting the constrained decoder off before it could close the structure, which is exactly what `maxTokens: 400` did. The tier cascade's `JSON_VALIDATE_FAILED → downgrade to best-effort` strategy was treating a token-budget problem as a "this model can't follow the schema" problem.

### All three active models already support strict mode

| Model | `strict: true` supported? | Currently configured as |
|---|---|---|
| `openai/gpt-oss-20b` | ✅ yes | strict (Tier 1) |
| `openai/gpt-oss-120b` | ✅ yes | strict (Tier 2) **and** best-effort (Tier 3) |
| `qwen/qwen3.8-27b` | ✅ yes | best-effort (Tier 4) |

`groq-docs/structured-outputs.md`, Supported Models. Tiers 3 and 4 downgrade to best-effort on models that don't require it — the two tiers meant as the last line of defense are the ones giving up Groq's strongest guarantee.

### Rate limits are tight, and tracked per model

| Model | RPM | RPD | TPM | TPD | Max completion tokens |
|---|---|---|---|---|---|
| `openai/gpt-oss-20b` | 30 | 1,000 | 8,000 | 200,000 | 65,536 |
| `openai/gpt-oss-120b` | 30 | 1,000 | 8,000 | 200,000 | 65,536 |
| `qwen/qwen3.8-27b` | 30 | 1,000 | 8,000 | 200,000 | 16,384 |
| `groq/compound(-mini)` | 30 | 250 | 70,000 | — | — |

`groq-docs/rate-limits.md`, `models.md:23-24,54`. 8K TPM per model, base Developer plan. A single archetype prompt already ran ~1,500–2,000 input tokens in `logs.md`; a couple of concurrent requests on the same model can approach that ceiling — `RATE_LIMIT` is a routine condition here, not an edge case. Because limits are tracked per model ID independently, hopping to a different tier's model on a rate limit reaches a fresh bucket immediately; retrying the same model (current Tier-0 behavior) waits out a bucket you could have just sidestepped.

### Compound systems — not applicable

`groq/compound` and `compound-mini` add web search, code execution, and Wolfram Alpha for tasks that need to *act*, internally routing across multiple models to do it. This app's generation calls take already-computed numerology signals and produce archetype/narrative text — nothing to search for or execute. Compound's docs never mention structured-output support, custom tools aren't allowed inside it, and it isn't HIPAA-covered. Ruled out.

### Prefilling — minor, optional, not a fix

Prefilling the assistant turn (e.g. starting it with `` ```json ``) nudges format in plain-text or JSON-Object-mode calls. It adds nothing on top of `strict: true` json_schema, which already constrains at the token level. Worth keeping in mind only for a genuine best-effort/JSON-Object-mode last resort, not for the strict tiers.

### Custom tools — wrong endpoint for reliability, right endpoint for chat

`structured-outputs.md:113`: "Streaming and tool use are not currently supported with Structured Outputs." Tool-calling is mutually exclusive with the `strict: true` json_schema mechanism this document argues for leaning into harder — not a fit for `/api/analyze`. But `app/api/chat/route.ts:98-101` calls `generateWithFallback` with no `responseFormat` at all (plain text, `MODELS.PRIMARY`/`FALLBACK`), so tools are fully compatible there. Concrete opportunity: the chat model answers follow-ups purely from a JSON dump of precomputed archetypes/signals (`chat/route.ts:73-77`); any question needing a calculation outside that snapshot (a personal year in a future year, a hypothetical birthdate) forces the model to do numerology arithmetic in its head with nothing to check it against — while `lib/numerology/*.ts` already has deterministic, tested functions for exactly this. Exposing a couple as callable tools would let the model call real math instead of guessing, and `tool_calls` in the response becomes a free diagnostic for when it did.

---

## 07 · Proposed redesign

A structural sketch, not a diff — collapses the six-layer stack to three deliberate mechanisms that match what Groq's own docs describe as the production pattern.

### Tiers: 4 → 3, all strict

| Tier | Model | Strict | Rationale |
|---|---|---|---|
| 1 | `openai/gpt-oss-20b` | `true` | fast primary, unchanged |
| 2 | `openai/gpt-oss-120b` | `true` | larger, same guarantee — no reason to also run it best-effort |
| 3 | `qwen/qwen3.8-27b` | `true` | different family, same guarantee |

Best-effort mode stops being a scheduled middle step and becomes what the docs frame it as: the path for a model that genuinely doesn't support `strict: true`, or JSON Object Mode as an absolute last resort — paired with Groq's own recommended pattern for that case (a plain retry loop on validation failure, no adaptive per-error skip logic needed).

### Truncation becomes a named, structural error

```ts
// after parsing the SDK response
if (response.choices[0]?.finish_reason === 'length') {
  throw new TruncatedOutputError(model, maxTokens);
}
```

Checked before falling through to `JSON_VALIDATE_FAILED`'s substring matching. Paired with a generous-but-bounded token budget (headroom above real content needs, not maxed to the model's own ceiling — TPM is the tighter real constraint at 8K/model/minute) so a too-tight budget produces an immediate, unambiguous error instead of another round of log archaeology.

### Retry decisions read what Groq already tells you

- Disable the SDK's own `maxRetries` (set `0`) so the tier cascade is the sole, visible retry authority.
- On `RATE_LIMIT`, read `error.headers['retry-after']` and use it as the wait time; fall back to computed backoff only when absent.
- On `RATE_LIMIT`, hop to the next tier's model immediately rather than retrying the same one — different model, different 8K TPM bucket.
- Address tiers by name/enum, not array index, so `determineNextAction` can't silently retarget on reorder.

### Circuit breaker and outer retry get honest jobs

- **Circuit breaker:** remove, or move its state to something durable (Vercel KV / Upstash) if cross-request protection is ever shown to matter at your traffic volume — the in-memory version protects against nothing reliably today.
- **Outer retry wrapper:** once the SDK's own retry is disabled, this becomes genuinely useful again for real transport-level failures, matching its own doc comment's stated intent.

### Chat route: give it two or three real tools

Wrap `calculate_personal_year(dob, targetYear)` and similar pure functions from `lib/numerology/*.ts` as callable tools on the plain-text chat path (no `responseFormat` conflict there). Read Groq's tool-use docs first — not yet in `groq-docs/` — before writing the request shape.

### Process fixes, not just code

- Export `determineNextAction` and replace the 25 placeholder tests with real assertions against its output and a mocked `groq-sdk` response sequence.
- Wire `test-groq-fallback.ts` (already hits the real API) into a scheduled CI job so a deprecated model is caught before a user hits it — this is now the second dead model in this cascade.
- Move the tier→model mapping to config (env var / small JSON) so a swap doesn't need a full code review + deploy cycle.
- Add `.gitattributes` / fix `core.autocrlf` so real diffs stop hiding inside repo-wide line-ending churn.

---

## 08 · Prioritized action list

Ordered by leverage: cheapest, highest-impact first.

| # | Action | Effort | Addresses |
|---|---|---|---|
| 1 | Check `finish_reason === 'length'`, classify as truncation before JSON-validate logic | Small | §05 — the recurring root cause, 3× so far |
| 2 | Disable SDK `maxRetries`; read `retry-after` header for rate-limit waits | Small | §05 — hidden retry stacking |
| 3 | Address tiers by name/enum instead of raw index | Small | §04 finding 2 |
| 4 | Move Tiers 3–4 to `strict: true`, or collapse to the 3-tier all-strict design | Medium | §06 — unused strict-mode support |
| 5 | Remove or relocate the circuit breaker's state | Medium | §04 finding 1 |
| 6 | Export `determineNextAction`; replace 25 placeholder tests with real assertions | Medium | §04 finding 4 |
| 7 | Automate `test-groq-fallback.ts` as a scheduled CI canary | Medium | §07 — catch the next deprecated model early |
| 8 | Move tier→model mapping to config | Medium | §07 — faster hot-fix next time |
| 9 | Scope the repair layer to best-effort tiers only; give it its own tests | Small | §05 — sixth uncounted layer |
| 10 | Prototype 2–3 numerology tools on `/api/chat` | Medium | §06 — where tool-calling actually fits |
| 11 | Fix `.gitattributes` / `core.autocrlf` | Small | §05 — repo hygiene, not architecture |
| 12 | **Decouple grid rendering from the AI call — see §09** | **Small** | **highest end-user impact of anything in this document** |

---

## 09 · Frontend resilience: decoupling the grid from AI failures

### The problem, confirmed in code

`loshu.tsx` is the actual page component (`app/page.tsx` just renders `<LoShuApp />` from it — `NumerologyDashboard.tsx`'s own imports are otherwise unused by anything else in the tree). Its `calculate()` function does this today:

```ts
setError(""); setLoading(true); setResult(null);
try {
  const m1 = { ...mathLayer(p1.dob, p1.gender), name: p1.name };   // pure math, instant, no network
  const m2 = mode === "couple" ? { ...mathLayer(p2.dob, p2.gender), name: p2.name } : null;
  const prof1 = buildProfile(m1, m1.name);
  const prof2 = m2 ? buildProfile(m2, m2.name) : null;

  const analysis = await fetchNarrative(prof1, prof2, null, mode, lang);  // <-- the Groq call

  setResult({ m1, m2, narrative: analysis.narrative, mode, lang, prof1, prof2,
              signals: analysis.signals, archetypes: analysis.archetypes });
} catch (e) {
  setError(errorMsg);   // setResult() was NEVER called — result stays null
}
setLoading(false);
```

`m1`/`m2`/`prof1`/`prof2` — the Lo Shu grid, driver/conductor, planes, arrows, personal year, remedies, health profile, missing/repeated numbers — are all **pure arithmetic**, computed synchronously in `mathLayer()` and `buildProfile()`, with zero dependency on Groq. But `setResult(...)` — the only thing that unlocks rendering — is called *after* `await fetchNarrative(...)`, and only inside the `try` block. If that call throws for **any** reason (all 4 tiers exhausted, a rate limit, a network blip, a 500), the `catch` block sets an error string and `setResult` never runs. Since the entire dashboard is gated behind `{R && (...)}` in the render (`R` = `result`), a Groq failure currently blanks the whole page — including a grid the app finished computing milliseconds earlier — and shows only an error banner.

`NumerologyDashboard.tsx` itself is already well-behaved: it takes `profile` and an *optional* `narrative` prop, and only conditionally renders `<NarrativeCard>` when `narrative && narrative.sections` is truthy (`NumerologyDashboard.tsx`, Section 2). The bug isn't in the dashboard component — it's entirely in `loshu.tsx`'s sequencing, one `await` away from being fixed.

### The fix: two phases, two independent states

**Phase 1 — synchronous, cannot fail, renders immediately:**

```ts
const m1 = { ...mathLayer(p1.dob, p1.gender), name: p1.name };
const m2 = mode === "couple" ? { ...mathLayer(p2.dob, p2.gender), name: p2.name } : null;
const prof1 = buildProfile(m1, m1.name);
const prof2 = m2 ? buildProfile(m2, m2.name) : null;

setResult({ m1, m2, mode, lang, prof1, prof2, narrative: null, signals: null, archetypes: null });
setLoading(false);   // grid, driver/conductor, planes, arrows, remedies, personal year, health — all live now
```

**Phase 2 — async, may fail, must never un-render phase 1:**

```ts
setNarrativeLoading(true);
setNarrativeError(null);
try {
  const analysis = await fetchNarrative(prof1, prof2, null, mode, lang);
  setResult(prev => prev && ({ ...prev, narrative: analysis.narrative,
                                signals: analysis.signals, archetypes: analysis.archetypes }));
} catch (e) {
  setNarrativeError(friendlyMessage(e));   // scoped error, shown inline — page stays intact
} finally {
  setNarrativeLoading(false);
}
```

Two new pieces of state (`narrativeLoading`, `narrativeError`) replace the current single `error`/`loading` pair for anything AI-related; the original `error` stays reserved for real input validation (missing DOB, bad year range).

### What changes in the render

- `{R && <NumerologyDashboard ... />}` now fires the instant phase 1 completes — no waiting on Groq at all.
- Pass `narrativeLoading`/`narrativeError` down so `NarrativeCard`'s slot shows "✨ Generating AI insights…" or "AI insights are temporarily unavailable — your calculated chart above is unaffected," instead of the card silently never appearing.
- Gate `chatProps` on `R.archetypes` being truthy (not just on `mode === "single"`), since `/api/chat/route.ts` itself 400s without `chartContext.archetypes` — no point offering a chat box that can't work yet.

### Why this is the highest-leverage change in this document

Every fix in §07 reduces *how often* the Groq call fails. This change decides *what happens to the user* when it fails anyway — including failures no amount of tier-cascade tuning can prevent (Groq has an outage, the account hits a daily cap, a network partition). It converts "AI fully down" from a hard outage — blank screen, 0% of the product's value delivered — into graceful degradation: 100% of the deterministic chart still renders, and only the AI-authored narrative and chat layer visibly degrades. It's a frontend sequencing fix, not a backend reliability fix, and it's a small one — but it's the one that actually satisfies "don't let AI failures stop the grid from showing."
