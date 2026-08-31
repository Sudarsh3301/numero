# Testing the Groq Fallback Fix

This document explains how to test the new 4-tier fallback implementation locally.

## Prerequisites

1. **Groq API Key**: You need a valid Groq API key
2. **Environment Setup**: Set the `GROQ_API_KEY` environment variable

## Quick Start

### 1. Ensure API Key is in .env File

The test script automatically loads your `GROQ_API_KEY` from the `.env` file.

**Verify your `.env` file contains:**
```
GROQ_API_KEY="gsk_..."
```

✅ **No need to manually set environment variables!** The test script uses `dotenv` to load them automatically.

### 2. Run the Test Suite

```bash
npm run test:groq
```

## What the Tests Do

The test suite (`test-groq-fallback.ts`) performs 4 tests:

### Test 1: Error Categorization ✅
Tests the new error detection system without making API calls:
- JSON validation failures
- Model not found errors
- Rate limit errors

### Test 2: Simple Generation 🔄
Tests basic text generation (non-structured output):
- Uses simple primary → fallback logic
- Verifies basic Groq API connectivity

### Test 3: Structured Generation 🏗️
Tests structured JSON output with the new tier cascade:
- Attempts Tier 1 (strict mode)
- Falls back through Tier 2/3/4 if needed
- Validates JSON schema compliance

### Test 4: Archetype Generation 🎭
Tests with the actual production schema (archetype generation):
- Same schema used in `/api/analyze` route
- Tests complex nested objects
- Verifies all required fields present

## Expected Output

### All Tests Pass ✅

```
═══════════════════════════════════════════════════════════
  🧪 Groq Fallback Architecture - Local Test Suite
═══════════════════════════════════════════════════════════

✅ GROQ_API_KEY found
   Key: gsk_abc123...

🔍 Testing Error Categorization...

  ✅ JSON Validation Failure: json_validate_failed
  ✅ Model Not Found: model_not_found
  ✅ Rate Limit: rate_limit

📝 Testing Simple Generation (Non-Structured)...

  [Groq] Generating with model: llama-3.1-8b-instant, temp: 0.5
  [Groq] Response format: text, strict: N/A
  [Groq] Success: 15 characters generated
  ✅ Simple generation succeeded
  Response: Hello from Groq!

🏗️  Testing Structured Output (Tier Cascade)...

  [Groq] Attempting Tier 1: Fast primary (strict mode)
  [Groq] Generating with model: openai/gpt-oss-20b, temp: 0.3
  [Groq] Response format: json_schema, strict: true
  [Groq] Success: 234 characters generated
  [Groq] JSON validation: PASSED
  [Groq] Success on Tier 1: Fast primary (strict mode)
  ✅ Structured generation succeeded
  Title: Inception
  Score: 9/10
  Description: A mind-bending thriller about dreams within dreams...

🎭 Testing Archetype Generation (Production Schema)...

  [Groq] Attempting Tier 1: Fast primary (strict mode)
  [Groq] Generating with model: openai/gpt-oss-20b, temp: 0.3
  [Groq] Success: 387 characters generated
  [Groq] JSON validation: PASSED
  ✅ Archetype generation succeeded
  Primary: The Sovereign Leader
  Secondary: The Wise Counselor
  Shadow: The Disconnected Wanderer

═══════════════════════════════════════════════════════════
  📊 Test Summary
═══════════════════════════════════════════════════════════

  Error Categorization:     ✅ PASSED
  Simple Generation:        ✅ PASSED
  Structured Generation:    ✅ PASSED
  Archetype Generation:     ✅ PASSED

  Total: 4/4 tests passed

  🎉 All tests passed! The fix is working correctly.
```

### Tier Cascade in Action 🎯

If Tier 1 fails, you'll see the cascade:

```
🎭 Testing Archetype Generation (Production Schema)...

  [Groq] Attempting Tier 1: Fast primary (strict mode)
  [Groq] Generating with model: openai/gpt-oss-20b, temp: 0.3
  [Groq] Generation failed: json_validate_failed (HTTP 400)
  [Groq] Error message: Failed to validate JSON
  [Groq] Tier 1 failed: json_validate_failed
  [Groq] Waiting 300ms before retry

  [Groq] Attempting Tier 3: Best-effort mode (same large model)
  [Groq] Generating with model: openai/gpt-oss-120b, temp: 0.3
  [Groq] Response format: json_schema, strict: false
  [Groq] Success: 412 characters generated
  [Groq] JSON validation: PASSED
  [Groq] Success on Tier 3: Best-effort mode
  ✅ Archetype generation succeeded
```

**Notice:**
- Tier 1 failed with `json_validate_failed`
- **Skipped Tier 2** (error-adaptive strategy)
- Jumped directly to **Tier 3** (best-effort mode)
- Success on Tier 3 ✅

## Interpreting Results

### ✅ Success Indicators

1. **All 4 tests pass** - Fix is working correctly
2. **Tier 1 success rate high** - Most requests use fast path
3. **No `model_not_found` errors** - Broken model replaced
4. **Tier cascade working** - Falls back correctly on errors

### ⚠️ Warning Signs

1. **High Tier 2/3 usage (>20%)** - Tier 1 struggling, may need schema tuning
2. **Timeouts** - Network issues or API performance problems
3. **Rate limits** - Need to increase API quota

### ❌ Failure Scenarios

1. **Test 1 fails** - Error categorization logic broken
2. **Test 2 fails** - Basic Groq API connectivity issue (check API key)
3. **Test 3 fails** - Structured output issue (check schema)
4. **Test 4 fails** - Production schema issue (check archetype schema)

## Comparing to Production Logs

Your production logs showed:

```
[Groq] Model openai/gpt-oss-20b failed: 400 json_validate_failed
[Groq] Primary model failed, attempting fallback: moonshotai/kimi-k2-instruct-0905  ← Broken!
[Groq] Fallback model also failed: 404 model_not_found  ← 404 Error!
[archetypes] All attempts failed  ← Complete failure!
```

**After the fix**, you should see:

```
[Groq] Attempting Tier 1: Fast primary (strict mode)
[Groq] Model openai/gpt-oss-20b failed: 400 json_validate_failed
[Groq] Tier 1 failed: json_validate_failed
[Groq] Waiting 300ms before retry
[Groq] Attempting Tier 3: Best-effort mode  ← Skip to best-effort!
[Groq] Generating with model: openai/gpt-oss-120b  ← Valid model!
[Groq] Success: 387 characters generated  ← Success!
[Groq] JSON validation: PASSED
[Groq] Success on Tier 3
```

**Key Differences:**
- ❌ Old: Tries broken `moonshotai/kimi-k2-instruct-0905` → 404
- ✅ New: Uses valid `openai/gpt-oss-120b` → Success
- ❌ Old: Complete failure
- ✅ New: Success on Tier 3

## Troubleshooting

### "GROQ_API_KEY environment variable not set"

**Solution:** Set your API key (see step 1 above)

### "401 Unauthorized"

**Cause:** Invalid or expired API key

**Solution:**
1. Check your key at https://console.groq.com/keys
2. Generate a new key if needed
3. Update the environment variable

### "429 Rate Limit"

**Cause:** API quota exceeded

**Solution:**
1. Wait a few minutes
2. Check your quota at https://console.groq.com/
3. Upgrade plan if needed

### All Tests Fail

**Cause:** Groq API might be down or network issues

**Solution:**
1. Check Groq status: https://status.groq.com/
2. Check your internet connection
3. Try again in a few minutes

## Next Steps After Testing

### If Tests Pass ✅

1. **Deploy to staging** - Test with real traffic
2. **Monitor logs** - Watch for tier distribution
3. **Verify success rate** - Should be >99.5%
4. **Gradual production rollout** - 10% → 50% → 100%

### If Tests Fail ❌

1. **Check API key** - Verify it's valid and has quota
2. **Check logs** - Look for specific error messages
3. **Try simple test first** - Test 2 (simple generation) should always work
4. **Report issue** - If persistent, may be API issue

## Manual Testing

You can also test manually by calling the API:

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "system": "English",
    "messages": [{
      "content": "{\"person1\":{\"dob\":\"1990-05-15\",\"driver\":6,\"conductor\":3}}"
    }]
  }'
```

Watch the server logs for tier cascade behavior.

## Additional Resources

- **Architecture Documentation**: `GROQ_FALLBACK_ARCHITECTURE.md`
- **Test Suite**: `lib/groq-client.test.ts` (unit tests)
- **Integration Test**: `test-groq-fallback.ts` (this script)
- **Groq Docs**: `groq-structured-outputs.md`
