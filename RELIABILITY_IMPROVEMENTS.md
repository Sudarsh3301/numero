# AI Analysis API Reliability Improvements

## Summary

Comprehensive fixes implemented to improve the reliability of the `/api/analyze` endpoint that uses Groq structured outputs.

## Problems Identified

### 1. **Fallback Only Triggered on Rate Limits**
- Primary model failures (400 JSON validation, schema violations, timeouts) did NOT trigger fallback
- System would fail immediately on non-rate-limit errors

### 2. **Schema Allowed Partial Arrays**
- Array-based schema didn't enforce minimum length
- Groq strict mode validates structure/types but NOT array length
- Model could return 3 sections when 5 were expected

### 3. **Overly Strict Validation**
- Backend rejected ANY response with fewer than expected sections
- Valid partial responses were discarded entirely

### 4. **Ineffective Retry Logic**
- Retries repeated the same request with same parameters
- No variation in conditions to improve success rate

### 5. **No Response Recovery**
- Partial responses were completely discarded
- No attempt to regenerate only missing sections

---

## Fixes Implemented

### ✅ FIX 1: Expanded Fallback Logic (`lib/groq-client.ts`)

**Before:**
```typescript
if (isRateLimitError(primaryError)) {
  // Try fallback only for rate limits
}
throw new Error(); // Fail immediately for other errors
```

**After:**
```typescript
// ALWAYS try fallback on ANY primary model error
const fallbackModel = isStructuredOutput ? MODELS.STRUCTURED_FALLBACK : MODELS.FALLBACK;
try {
  // Attempt fallback with best-effort mode
} catch (fallbackError) {
  // Include both errors in message
}
```

**Impact:** Handles JSON validation errors, schema violations, timeouts, and provider errors gracefully.

---

### ✅ FIX 2: Fixed Object Schema (`app/api/analyze/route.ts`)

**Before:**
```typescript
schema: {
  sections: {
    type: 'array',
    items: {...}  // No length enforcement
  }
}
```

**After:**
```typescript
schema: {
  psychological_profile: { type: 'object', required: ['title', 'body'] },
  blind_spots: { type: 'object', required: ['title', 'body'] },
  strengths: { type: 'object', required: ['title', 'body'] },
  growth_directive: { type: 'object', required: ['title', 'body'] },
  forecast_2026: { type: 'object', required: ['title', 'body'] }
},
required: ['psychological_profile', 'blind_spots', 'strengths', 'growth_directive', 'forecast_2026']
```

**Impact:** Strict mode now FORCES the model to generate all required sections.

---

### ✅ FIX 3: Graceful Degradation

**Before:**
```typescript
if (sections.length !== expectedSections) {
  throw new Error(); // Reject partial responses
}
```

**After:**
```typescript
const minRequiredSections = 3;
if (sections.length >= minRequiredSections) {
  // Accept partial response
  responseStatus = sections.length < expectedSections ? 'partial' : 'complete';
}
```

**Impact:** Accepts responses with at least 3 sections, returns status indicator.

---

### ✅ FIX 4: Improved Retry Strategy

**Before:**
```typescript
for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
  return await fn(); // Same function, same parameters
}
```

**After:**
```typescript
// Attempt 1: Primary model (strict mode)
// Attempt 2: Fallback model (best-effort mode) - handled by generateWithFallback
// Attempt 3: Final retry with primary
```

**Impact:** Varies conditions across attempts to improve success rate.

---

### ✅ FIX 5: Response Repair Layer

**New Feature:**
```typescript
if (missingSections.length > 0 && missingSections.length <= 2) {
  // Generate ONLY the missing sections
  const repairPrompt = buildRepairPrompt(missingSections, existingSections);
  const repairedSections = await generateWithFallback(repairPrompt);
  sections.push(...repairedSections);
  responseStatus = 'repaired';
}
```

**Impact:** Salvages partial responses by regenerating only missing sections instead of discarding everything.

---

## Expected Outcomes

### Before Fixes
```
Request → Primary Model → 400 Error → Retry (same model) → 3 sections → Validation fails → 500 Error ❌
```

### After Fixes
```
Request → Primary Model → 400 Error → Fallback Model → 5 sections → Success ✅

OR

Request → Primary Model → 3 sections → Repair Layer → 5 sections → Success (repaired) ✅

OR

Request → Primary Model → 3 sections → Accept Partial → Success (partial) ✅
```

---

## Response Status Indicators

- `complete`: All sections generated successfully
- `repaired`: Some sections were regenerated via repair layer
- `partial`: Fewer than expected sections (but >= 3)

---

## Testing Recommendations

1. Test with primary model failures (simulate 400 errors)
2. Test with partial responses (3-4 sections)
3. Test repair layer with 1-2 missing sections
4. Verify fallback triggers on non-rate-limit errors
5. Monitor logs for repair success rates

