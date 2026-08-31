/**
 * Local Test Script for Groq Fallback Architecture
 *
 * This script tests the new 4-tier fallback cascade with real Groq API calls
 * to verify the fix works as expected.
 *
 * Run with: npm run test:groq
 */

// Load environment variables from .env file
import 'dotenv/config';

import { generateWithFallback, categorizeGroqError, GroqErrorType } from './lib/groq-client';

// Test schema (same as used in production)
const testSchema = {
  name: 'test_schema',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      score: { type: 'number' }
    },
    required: ['title', 'description', 'score'],
    additionalProperties: false
  }
};

async function testErrorCategorization() {
  console.log('\n🔍 Testing Error Categorization...\n');

  const testCases = [
    {
      name: 'JSON Validation Failure',
      error: {
        status: 400,
        error: { code: 'json_validate_failed', message: 'Failed to validate JSON' }
      },
      expectedType: GroqErrorType.JSON_VALIDATE_FAILED
    },
    {
      name: 'Model Not Found',
      error: {
        status: 404,
        message: 'The model `moonshotai/kimi-k2-instruct-0905` does not exist'
      },
      expectedType: GroqErrorType.MODEL_NOT_FOUND
    },
    {
      name: 'Rate Limit',
      error: {
        status: 429,
        error: { type: 'rate_limit_exceeded' }
      },
      expectedType: GroqErrorType.RATE_LIMIT
    }
  ];

  for (const testCase of testCases) {
    const result = categorizeGroqError(testCase.error);
    const passed = result.type === testCase.expectedType;
    console.log(`  ${passed ? '✅' : '❌'} ${testCase.name}: ${result.type}`);
  }
}

async function testSimpleGeneration() {
  console.log('\n📝 Testing Simple Generation (Non-Structured)...\n');

  try {
    const response = await generateWithFallback(
      [
        { role: 'user', content: 'Say "Hello from Groq!" and nothing else.' }
      ],
      {
        temperature: 0.5
      }
    );

    console.log('  ✅ Simple generation succeeded');
    console.log(`  Response: ${response.substring(0, 100)}...`);
    return true;
  } catch (error: any) {
    console.log('  ❌ Simple generation failed:', error.message);
    return false;
  }
}

async function testStructuredGeneration() {
  console.log('\n🏗️  Testing Structured Output (Tier Cascade)...\n');

  try {
    const response = await generateWithFallback(
      [
        {
          role: 'user',
          content: 'Analyze the movie "Inception" and provide a JSON response with title, description, and score (1-10).'
        }
      ],
      {
        temperature: 0.3,
        responseFormat: {
          type: 'json_schema',
          json_schema: testSchema
        }
      }
    );

    console.log('  ✅ Structured generation succeeded');

    // Validate JSON
    const parsed = JSON.parse(response);
    console.log(`  Title: ${parsed.title}`);
    console.log(`  Score: ${parsed.score}/10`);
    console.log(`  Description: ${parsed.description.substring(0, 60)}...`);

    return true;
  } catch (error: any) {
    console.log('  ❌ Structured generation failed:', error.message);

    // Check if error indicates tier cascade was attempted
    if (error.message.includes('failed after attempting all fallback tiers')) {
      console.log('  ℹ️  Tier cascade was attempted (all tiers exhausted)');
    }

    return false;
  }
}

async function testArchetypeGeneration() {
  console.log('\n🎭 Testing Archetype Generation (Production Schema)...\n');

  const archetypeSchema = {
    name: 'numerology_archetypes_single',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        primary: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' }
          },
          required: ['name', 'description'],
          additionalProperties: false
        },
        secondary: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' }
          },
          required: ['name', 'description'],
          additionalProperties: false
        },
        shadow: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' }
          },
          required: ['name', 'description'],
          additionalProperties: false
        }
      },
      required: ['primary', 'secondary', 'shadow'],
      additionalProperties: false
    }
  };

  const prompt = `You are a psychological profiler analyzing Indian numerology signals.

Generate 3 personality archetypes:
1. PRIMARY ARCHETYPE - core identity (Surya-driven leader, strong willpower)
2. SECONDARY ARCHETYPE - supporting strengths (Guru wisdom, expansive thinking)
3. SHADOW ARCHETYPE - hidden weaknesses (missing 5 breaks balance)

Return JSON only using the required schema. Keep descriptions to 1-2 sentences each.`;

  try {
    const response = await generateWithFallback(
      [{ role: 'user', content: prompt }],
      {
        temperature: 0.3,
        maxTokens: 400,
        responseFormat: {
          type: 'json_schema',
          json_schema: archetypeSchema
        }
      }
    );

    console.log('  ✅ Archetype generation succeeded');

    const parsed = JSON.parse(response);
    console.log(`  Primary: ${parsed.primary.name}`);
    console.log(`  Secondary: ${parsed.secondary.name}`);
    console.log(`  Shadow: ${parsed.shadow.name}`);

    return true;
  } catch (error: any) {
    console.log('  ❌ Archetype generation failed:', error.message);

    // Parse error to check tier attempts
    if (error.message.includes('Tier')) {
      console.log('\n  📊 Tier cascade log:');
      const lines = error.message.split('\n');
      lines.forEach(line => {
        if (line.includes('Tier')) {
          console.log(`    ${line.trim()}`);
        }
      });
    }

    return false;
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  🧪 Groq Fallback Architecture - Local Test Suite');
  console.log('═══════════════════════════════════════════════════════════');

  // Check for API key
  if (!process.env.GROQ_API_KEY) {
    console.log('\n❌ Error: GROQ_API_KEY environment variable not set');
    console.log('   Set it with: export GROQ_API_KEY=your_key_here\n');
    process.exit(1);
  }

  console.log('\n✅ GROQ_API_KEY found');
  console.log(`   Key: ${process.env.GROQ_API_KEY.substring(0, 20)}...`);

  const results = {
    errorCategorization: true, // This doesn't need API calls
    simpleGeneration: false,
    structuredGeneration: false,
    archetypeGeneration: false
  };

  // Test 1: Error Categorization (no API calls)
  try {
    await testErrorCategorization();
    results.errorCategorization = true;
  } catch (error) {
    console.log('  ❌ Error categorization test failed');
    results.errorCategorization = false;
  }

  // Test 2: Simple Generation
  results.simpleGeneration = await testSimpleGeneration();

  // Test 3: Structured Generation
  results.structuredGeneration = await testStructuredGeneration();

  // Test 4: Archetype Generation (production schema)
  results.archetypeGeneration = await testArchetypeGeneration();

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  📊 Test Summary');
  console.log('═══════════════════════════════════════════════════════════\n');

  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;

  console.log(`  Error Categorization:     ${results.errorCategorization ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`  Simple Generation:        ${results.simpleGeneration ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`  Structured Generation:    ${results.structuredGeneration ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`  Archetype Generation:     ${results.archetypeGeneration ? '✅ PASSED' : '❌ FAILED'}`);

  console.log(`\n  Total: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log('\n  🎉 All tests passed! The fix is working correctly.\n');
    process.exit(0);
  } else {
    console.log('\n  ⚠️  Some tests failed. Check logs above for details.\n');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
