2026-08-31 14:17:09.676 [error] [Groq] Generation failed: json_validate_failed (HTTP 400)
2026-08-31 14:17:09.676 [error] [Groq] Error message: 400 {"error":{"message":"Failed to validate JSON. Please adjust your prompt. See 'failed_generation' for more details.","type":"invalid_request_error","code":"json_validate_failed","failed_generation":""}}
2026-08-31 14:17:09.677 [error] [Groq] Model: openai/gpt-oss-20b, Temp: 0.3
2026-08-31 14:17:09.677 [error] [Groq] Groq API error details: {
  "error": {
    "message": "Failed to validate JSON. Please adjust your prompt. See 'failed_generation' for more details.",
    "type": "invalid_request_error",
    "code": "json_validate_failed",
    "failed_generation": ""
  }
}
2026-08-31 14:17:09.677 [warn] [Groq] Tier 1: Fast primary (strict mode) failed: json_validate_failed - 400 {"error":{"message":"Failed to validate JSON. Please adjust your prompt. See 'failed_generation' for more details.","type":"invalid_request_error","code":"json_validate_failed","failed_generation":""}}
2026-08-31 14:17:09.677 [info] [Groq] Waiting 300ms before retry
2026-08-31 14:17:08.723 [info] [archetypes] Attempt 1/2
2026-08-31 14:17:08.723 [info] [Groq] Attempting Tier 1: Fast primary (strict mode)
2026-08-31 14:17:08.724 [info] [Groq] Generating with model: openai/gpt-oss-20b, temp: 0.3
2026-08-31 14:17:08.724 [info] [Groq] Response format: json_schema, strict: true
2026-08-31 14:17:08.725 [info] [Groq] Prompt length: 6201 chars
2026-08-31 14:17:08.741 [error] (node:4) [DEP0169] DeprecationWarning: `url.parse()` behavior is not standardized and prone to errors that have security implications. Use the WHATWG URL API instead. CVEs are not issued for `url.parse()` vulnerabilities.
(Use `node --trace-deprecation ...` to show where the warning was created)
2026-08-31 14:17:09.977 [info] [Groq] Attempting Tier 3: Best-effort mode (same large model)
2026-08-31 14:17:09.977 [info] [Groq] Generating with model: openai/gpt-oss-120b, temp: 0.3
2026-08-31 14:17:09.977 [info] [Groq] Response format: json_schema, strict: false
2026-08-31 14:17:09.977 [info] [Groq] Prompt length: 6201 chars
2026-08-31 14:17:11.337 [error] [Groq] Generation failed: json_validate_failed (HTTP 400)
2026-08-31 14:17:11.337 [error] [Groq] Error message: 400 {"error":{"message":"Failed to validate JSON. Please adjust your prompt. See 'failed_generation' for more details.","type":"invalid_request_error","code":"json_validate_failed","failed_generation":""}}
2026-08-31 14:17:11.337 [error] [Groq] Model: openai/gpt-oss-120b, Temp: 0.3
2026-08-31 14:17:11.337 [error] [Groq] Groq API error details: {
  "error": {
    "message": "Failed to validate JSON. Please adjust your prompt. See 'failed_generation' for more details.",
    "type": "invalid_request_error",
    "code": "json_validate_failed",
    "failed_generation": ""
  }
}
2026-08-31 14:17:11.337 [warn] [Groq] Tier 3: Best-effort mode (same large model) failed: json_validate_failed - 400 {"error":{"message":"Failed to validate JSON. Please adjust your prompt. See 'failed_generation' for more details.","type":"invalid_request_error","code":"json_validate_failed","failed_generation":""}}
2026-08-31 14:17:11.337 [info] [Groq] Waiting 300ms before retry
2026-08-31 14:17:11.638 [info] [Groq] Attempting Tier 4: Different model family (best-effort)
2026-08-31 14:17:11.638 [info] [Groq] Generating with model: meta-llama/llama-4-scout-17b-16e-instruct, temp: 0.3
2026-08-31 14:17:11.638 [info] [Groq] Response format: json_schema, strict: false
2026-08-31 14:17:11.638 [info] [Groq] Prompt length: 6201 chars
2026-08-31 14:17:11.738 [error] [Groq] Generation failed: model_not_found (HTTP 404)
2026-08-31 14:17:11.738 [error] [Groq] Error message: 404 {"error":{"message":"The model `meta-llama/llama-4-scout-17b-16e-instruct` does not exist or you do not have access to it.","type":"invalid_request_error","code":"model_not_found"}}
2026-08-31 14:17:11.738 [error] [Groq] Model: meta-llama/llama-4-scout-17b-16e-instruct, Temp: 0.3
2026-08-31 14:17:11.738 [error] [Groq] Groq API error details: {
  "error": {
    "message": "The model `meta-llama/llama-4-scout-17b-16e-instruct` does not exist or you do not have access to it.",
    "type": "invalid_request_error",
    "code": "model_not_found"
  }
}
2026-08-31 14:17:11.738 [warn] [Groq] Tier 4: Different model family (best-effort) failed: model_not_found - 404 {"error":{"message":"The model `meta-llama/llama-4-scout-17b-16e-instruct` does not exist or you do not have access to it.","type":"invalid_request_error","code":"model_not_found"}}
2026-08-31 14:17:11.738 [warn] [archetypes] Attempt 1 failed: AI service failed after attempting all fallback tiers:
Tier 1 (openai/gpt-oss-20b): json_validate_failed - 400 {"error":{"message":"Failed to validate JSON. Please adjust your prompt. See 'failed_generation' for more details.","type":"invalid_request_error","code":"json_validate_failed","failed_generation":""}}
Tier 3 (openai/gpt-oss-120b): json_validate_failed - 400 {"error":{"message":"Failed to validate JSON. Please adjust your prompt. See 'failed_generation' for more details.","type":"invalid_request_error","code":"json_validate_failed","failed_generation":""}}
Tier 4 (meta-llama/llama-4-scout-17b-16e-instruct): model_not_found - 404 {"error":{"message":"The model `meta-llama/llama-4-scout-17b-16e-instruct` does not exist or you do not have access to it.","type":"invalid_request_error","code":"model_not_found"}}
2026-08-31 14:17:11.738 [error] [archetypes] All tiers exhausted, not retrying
2026-08-31 14:17:11.739 [error] Analysis error: Error: AI service failed after attempting all fallback tiers:
Tier 1 (openai/gpt-oss-20b): json_validate_failed - 400 {"error":{"message":"Failed to validate JSON. Please adjust your prompt. See 'failed_generation' for more details.","type":"invalid_request_error","code":"json_validate_failed","failed_generation":""}}
Tier 3 (openai/gpt-oss-120b): json_validate_failed - 400 {"error":{"message":"Failed to validate JSON. Please adjust your prompt. See 'failed_generation' for more details.","type":"invalid_request_error","code":"json_validate_failed","failed_generation":""}}
Tier 4 (meta-llama/llama-4-scout-17b-16e-instruct): model_not_found - 404 {"error":{"message":"The model `meta-llama/llama-4-scout-17b-16e-instruct` does not exist or you do not have access to it.","type":"invalid_request_error","code":"model_not_found"}}
    at /var/task/.next/server/app/api/analyze/route.js:42:16967
    at g (/var/task/.next/server/app/api/analyze/route.js:43:8)
    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
    at async y (/var/task/.next/server/app/api/analyze/route.js:43:229)
    at async g (/var/task/.next/server/app/api/analyze/route.js:1:7290)
    at async _ (/var/task/.next/server/app/api/analyze/route.js:42:2278)
    at async /var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:34801
    at async eS.execute (/var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:25910)
    at async eS.handle (/var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36055)
    at async ei (/var/task/node_modules/next/dist/compiled/next-server/server.runtime.prod.js:16:25466)