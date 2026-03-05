  The plan is comprehensive and ready for implementation. Let me exit plan mode.

● User approved Claude's plan
  ⎿  Plan saved to: C:\Users\sudar\.claude\plans\spicy-wibbling-toucan.md · /plan to edit
     Signal Extraction Layer Implementation Plan

     Objective

     Implement a Signal Extraction Layer with Archetype Synthesis to reduce tokens and improve AI reasoning consistency.

     Approach: Hybrid - Deterministic extraction + LLM-powered archetype synthesis + narrative generation
     Priority: Quick implementation with immediate token savings and enhanced psychological coherence

     ---
     Architecture Overview

     Current Flow

     Chart JSON (1,800 tokens) → LLM → Narrative

     New Flow (Two-Stage LLM Pipeline)

     Chart JSON → Deterministic Extraction → Compact Signals (120 tokens)
                → LLM Call 1: Psychological Signals + Archetype Synthesis
                → LLM Call 2: Narrative Generation (using signals + archetypes)

     Expected Token Reduction:
     - Analysis: 1,800 → 350 tokens total for both LLM calls (~80% reduction in input)
     - Chat: 800 → 150 tokens (~81% reduction in context)

     Key Benefits:
     - 70-80% token reduction
     - Higher reasoning consistency through archetypes
     - Less hallucination (grounded in psychological archetypes)
     - More personalized, psychologically coherent narratives

     ---
     Signal Categories

     Objective Signals (Deterministic - from existing data)

     1. missing_numbers: Already computed in m.missing
     2. dominant_numbers: Already computed in m.repeated
     3. present_numbers: Already computed in m.present
     4. arrows_present: Already computed in arrows.present
     5. arrows_absent: Already computed in arrows.absent
     6. kua_element: From kuaLayer.p1.element
     7. kua_group: From kuaLayer.p1.group (E/W)
     8. personal_year: From mathLayer.personalYear
     9. year_modifier: From kuaLayer.mod1.tone
     10. directional_energy: From kuaLayer.p1.baZhai
     11. feng_shui_alerts: From flying stars
     12. plane_distribution: From m.planes

     Archetype Synthesis (LLM - First Call)

     After extracting deterministic signals, we use an LLM to synthesize psychological archetypes that create a coherent personality framework:

     Three-Archetype Model:
     - Primary Archetype: Core identity and default behavior pattern
     - Secondary Archetype: Supporting strengths and complementary traits
     - Shadow Archetype: Hidden weaknesses and blind spots

     Example Archetypes:
     - Independent Builder, Strategic Achiever, Empathetic Connector
     - Visionary Idealist, Analytical Planner, Charismatic Leader
     - Isolated Perfectionist, Impulsive Rebel, Anxious Overthinker

     Why Archetypes?
     - Creates psychological coherence across all interpretations
     - Prevents contradictory traits in analysis
     - Makes narratives feel "shockingly accurate"
     - Provides framework for chat responses to remain consistent

     ---
     Archetype Synthesis Prompt

     The first LLM call will extract archetypes using this prompt structure:

     You are a psychological profiler analyzing numerology signals to synthesize personality archetypes.

     SIGNALS:
     {deterministic signals JSON}

     Task: Generate 3 personality archetypes that create a coherent psychological framework:

     1. PRIMARY ARCHETYPE - Core identity, default behavior pattern (name + 1-2 sentence description)
     2. SECONDARY ARCHETYPE - Supporting strengths, complementary traits (name + 1-2 sentence description)
     3. SHADOW ARCHETYPE - Hidden weaknesses, blind spots (name + 1-2 sentence description)

     Guidelines:
     - Use psychological language, not mystical
     - Archetypes should be internally consistent
     - Reference specific signals (numbers, arrows, elements, directions)
     - Be specific, not generic

     Return JSON only:
     {
       "archetypes": {
         "primary": { "name": "...", "description": "..." },
         "secondary": { "name": "...", "description": "..." },
         "shadow": { "name": "...", "description": "..." }
       }
     }

     Expected Output:
     {
       "archetypes": {
         "primary": {
           "name": "Independent Builder",
           "description": "Driven by practical results and self-reliance. Your missing 2 and dominant 1,8 create a pattern of solo achievement. The practical plane      
     dominance reinforces hands-on execution over emotional collaboration."
         },
         "secondary": {
           "name": "Strategic Achiever",
           "description": "Arrow of Determination (1-5-9) gives you goal-oriented focus. Wood element (Kua 3) fuels ambition and growth. You execute plans with
     precision."
         },
         "shadow": {
           "name": "Isolated Perfectionist",
           "description": "Missing arrows of emotional expression and low emotional plane (0) create blind spots in interpersonal dynamics. You may dismiss others' 
     feelings as irrelevant to the goal."
         }
       }
     }

     ---
     Implementation Plan

     PHASE 1: Create Signal Extractor Function

     File: New lib/signal-extractor.ts

     interface NumerologySignals {
       // Objective signals (from data)
       missing_numbers: number[];
       dominant_numbers: number[];
       present_numbers: number[];
       arrows_present: string[];
       arrows_absent: string[];
       kua_element: string;
       kua_group: string;
       kua_trait: string;
       personal_year: number;
       year_modifier: string;
       directional_energy: {
         lucky_primary: string;
         unlucky_primary: string;
       };
       feng_shui_alerts: string[];
       plane_distribution: {
         intellectual: number;
         emotional: number;
         practical: number;
         dominant: string;
       };
     }

     export function extractSignals(chartData: any): NumerologySignals {
       const { m, kua, mod } = chartData;

       return {
         missing_numbers: m.missing || [],
         dominant_numbers: m.repeated || [],
         present_numbers: m.present || [],
         arrows_present: m.arrows?.present || [],
         arrows_absent: m.arrows?.absent || [],
         kua_element: kua.element || '',
         kua_group: kua.group || '',
         kua_trait: kua.trait || '',
         personal_year: m.personalYear || 0,
         year_modifier: mod.tone || '',
         directional_energy: {
           lucky_primary: kua.baZhai?.lucky?.shengQi || '',
           unlucky_primary: kua.baZhai?.unlucky?.jueMing || '',
         },
         feng_shui_alerts: extractFengShuiAlerts(m.flyingStars),
         plane_distribution: {
           intellectual: m.planes?.intellectual || 0,
           emotional: m.planes?.emotional || 0,
           practical: m.planes?.practical || 0,
           dominant: m.planes?.dominant || '',
         },
       };
     }

     function extractFengShuiAlerts(flyingStars: any): string[] {
       const alerts: string[] = [];

       if (!flyingStars) return alerts;

       Object.entries(flyingStars).forEach(([palace, data]: [string, any]) => {
         if (data.danger) {
           alerts.push(`${palace}: ${data.danger}`);
         }
       });

       return alerts;
     }

     // For couple mode
     export function extractCoupleSignals(p1Data: any, p2Data: any, compatData: any) {
       return {
         person1: extractSignals(p1Data),
         person2: extractSignals(p2Data),
         compatibility: {
           element_relation: compatData.elementRel || '',
           shared_lucky_dirs: compatData.sharedLucky || [],
           shared_unlucky_dirs: compatData.sharedUnlucky || [],
           kua_harmony: compatData.sameGroup ? 'harmonious' : 'complementary',
         },
       };
     }

     ---
     PHASE 2: Update /api/analyze to Use Two-Stage LLM Pipeline

     File: app/api/analyze/route.ts

     Changes:
     1. Import signal extractor
     2. Extract deterministic signals from chart data
     3. LLM Call 1: Generate archetypes from signals
     4. LLM Call 2: Generate narrative using signals + archetypes
     5. Return narrative, signals, AND archetypes

     Implementation:

     import { NextRequest, NextResponse } from 'next/server';
     import { generateWithFallback } from '@/lib/groq-client';
     import { extractSignals, extractCoupleSignals } from '@/lib/signal-extractor';

     // ... existing withRetry function ...

     export async function POST(request: NextRequest) {
       try {
         const clientRequest = await request.json();
         const { system, messages } = clientRequest;

         const isHindi = system.includes('Hindi') || system.includes('Devanagari');

         // Parse the chart data from client
         const chartData = JSON.parse(messages[0].content);
         const mode = chartData.person2 ? 'couple' : 'single';

         // ✨ Step 1: Extract deterministic signals
         const signals = mode === 'single'
           ? extractSignals({
               m: chartData.person1,
               kua: chartData.kua?.p1,
               mod: chartData.kua?.mod1,
             })
           : extractCoupleSignals(
               { m: chartData.person1, kua: chartData.kua?.p1, mod: chartData.kua?.mod1 },
               { m: chartData.person2, kua: chartData.kua?.p2, mod: chartData.kua?.mod2 },
               chartData.compatibility
             );

         // ✨ Step 2: LLM Call 1 - Generate Archetypes
         const archetypePrompt = `You are a psychological profiler analyzing numerology signals to synthesize personality archetypes.

     SIGNALS:
     ${JSON.stringify(signals, null, 2)}

     Task: Generate 3 personality archetypes that create a coherent psychological framework:

     6. PRIMARY ARCHETYPE - Core identity, default behavior pattern (name + 1-2 sentence description)
     7. SECONDARY ARCHETYPE - Supporting strengths, complementary traits (name + 1-2 sentence description)
     8. SHADOW ARCHETYPE - Hidden weaknesses, blind spots (name + 1-2 sentence description)

     Guidelines:
     - Use psychological language, not mystical
     - Archetypes should be internally consistent
     - Reference specific signals (numbers, arrows, elements, directions)
     - Be specific, not generic

     Return JSON only:
     {
       "archetypes": {
         "primary": { "name": "...", "description": "..." },
         "secondary": { "name": "...", "description": "..." },
         "shadow": { "name": "...", "description": "..." }
       }
     }`;

         const archetypeResponseText = await withRetry(
           () => generateWithFallback(
             [{ role: 'user', content: archetypePrompt }],
             {
               temperature: 1,
               maxTokens: 400,
               responseFormat: { type: 'json_object' },
             }
           ),
           'archetype-extraction'
         );

         let archetypes;
         try {
           archetypes = JSON.parse(archetypeResponseText);
           if (!archetypes.archetypes) {
             throw new Error('Invalid archetype structure');
           }
         } catch (parseError) {
           console.error('Archetype parsing failed:', parseError);
           return NextResponse.json(
             {
               error: 'AI response formatting error',
               message: 'Failed to generate archetypes. Please try again.',
             },
             { status: 500 }
           );
         }

         // ✨ Step 3: LLM Call 2 - Generate Narrative using Signals + Archetypes
         const narrativePrompt = `You are a psychologically sharp Lo Shu numerology and Feng Shui analyst. ${
           isHindi
             ? 'Respond entirely in Hindi (Devanagari script). Mystical but clear Hindi.'
             : 'Respond in English.'
         }

     Generate a numerology analysis using these psychological archetypes as your framework.

     ARCHETYPES:
     ${JSON.stringify(archetypes.archetypes, null, 2)}

     SUPPORTING SIGNALS:
     ${JSON.stringify(signals, null, 2)}

     Guidelines:
     - Use the archetypes to create a coherent narrative
     - Reference specific signals (numbers, arrows, elements, directions) to support archetype claims
     - Use psychological framing, not mystical vagueness
     - Be insightful but grounded

     ${mode === 'single' ? `
     Analysis Format (5 sections):
     1. 🧠 Core Psychological Profile - Use PRIMARY archetype as foundation, reference plane distribution, Kua element, dominant numbers
     2. ⚡ Blind Spots & Weaknesses - Use SHADOW archetype, reference missing numbers and absent arrows
     3. 🔥 Innate Strengths - Use SECONDARY archetype, reference present arrows and Kua element synergy
     4. 🧭 Growth Directive - One sharp behavioral instruction based on shadow archetype and year modifier
     5. 📅 2026 Forecast - Weave personal year, year modifier, directional energy, and feng shui alerts through archetype lens
     ` : `
     Analysis Format (6 sections):
     6. 🧠 Individual Essences - Use each person's PRIMARY archetype
     7. 🔗 Core Alignment - How archetypes complement, reference element relationship and shared lucky directions
     8. ⚡ Primary Friction Areas - Where shadow archetypes clash, reference conflicting elements and number gaps
     9. 📅 Long-Term Outlook - Archetype compatibility momentum based on Kua harmony
     10. 🛠 Behavioral Advice - 2-3 specific actions based on archetypes
     11. 🔮 2026 Couples Forecast - Both personal years, modifiers, feng shui alerts through archetype lens
     `}

     Rules:
     - Use person names from signals
     - Honesty over comfort
     - 300-360 words total
     - Return valid JSON only: { sections:[{title,body}] }`;

         const responseText = await withRetry(
           () => generateWithFallback(
             [{ role: 'user', content: narrativePrompt }],
             {
               temperature: 1,
               maxTokens: 2048,
               responseFormat: { type: 'json_object' },
             }
           ),
           'analyze'
         );

         // Parse and validate JSON response
         let narrative;
         try {
           narrative = JSON.parse(responseText);

           // Validate structure
           if (!narrative.sections || !Array.isArray(narrative.sections)) {
             throw new Error('Invalid response structure');
           }

           // Ensure all sections have title and body
           for (const section of narrative.sections) {
             if (!section.title || !section.body) {
               throw new Error('Section missing title or body');
             }
           }
         } catch (parseError) {
           console.error('JSON parsing failed:', parseError);
           console.error('Response text:', responseText);

           return NextResponse.json(
             {
               error: 'AI response formatting error',
               message: 'The AI generated an invalid response. Please try again.',
               details: (parseError as Error).message,
             },
             { status: 500 }
           );
         }

         // ✨ NEW: Return narrative, signals, AND archetypes for chat reuse
         return NextResponse.json({ narrative, signals, archetypes: archetypes.archetypes });
       } catch (error) {
         console.error('Analysis error:', error);

         const errorMessage = (error as Error).message;

         // User-friendly error messages
         if (errorMessage.includes('Rate limit') || errorMessage.includes('high demand')) {
           return NextResponse.json(
             {
               error: 'Rate limit exceeded',
               message: errorMessage,
               userMessage: 'Our AI service is experiencing high demand. Please wait a moment and try again.',
             },
             { status: 429 }
           );
         }

         return NextResponse.json(
           {
             error: 'Internal server error',
             message: errorMessage,
             userMessage: 'Something went wrong while analyzing your chart. Please try again.',
           },
           { status: 500 }
         );
       }
     }

     ---
     PHASE 3: Update Client to Store Signals and Archetypes

     File: loshu.tsx

     Changes:
     1. Update result state to include signals and archetypes
     2. Update fetchNarrative to receive signals and archetypes
     3. Update chartCtx to use signals and archetypes instead of full profiles

     Implementation:

     // Line ~750: Update result state type
     const [result,setResult]=useState<{
       m1: any;
       m2: any | null;
       kua: any;
       narrative: any;
       signals: any; // ✨ NEW: Store signals
       archetypes: any; // ✨ NEW: Store archetypes
       mode: string;
       lang: string;
       prof1: any;
       prof2: any | null;
     } | null>(null);

     // Line ~745: Update fetchNarrative function
     async function fetchNarrative(prof1: any, prof2: any | null, compat: any, mode: string, lang: string) {
       // Prepare payload with chart data for signal extraction
       const payload = {
         mode,
         person1: prof1,
         ...(prof2 && {
           person2: prof2,
           compatibility: compat,
           kua: {
             p1: prof1.kua,
             p2: prof2.kua,
             mod1: prof1.yearElementModifier,
             mod2: prof2.yearElementModifier,
           }
         })
       };

       const resp = await fetch("/api/analyze", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           system: "Analyze numerology chart", // Simplified, real prompt is in API
           messages: [{ role: "user", content: JSON.stringify(payload) }],
         }),
       });

       if (!resp.ok) {
         const errData = await resp.json().catch(() => ({}));

         // Check for user-friendly message
         if (errData.userMessage) {
           throw new Error(errData.userMessage);
         }

         // Check for rate limit
         if (resp.status === 429) {
           throw new Error(errData.message || 'Rate limit exceeded. Please try again in a moment.');
         }

         throw new Error(errData.message || `HTTP ${resp.status}`);
       }

       const data = await resp.json();
       return { narrative: data.narrative, signals: data.signals, archetypes: data.archetypes }; // ✨ NEW: Return signals and archetypes
     }

     // Line ~770: Update calculate function to store signals and archetypes
     const calculate=async()=>{
       // ... validation ...

       setError("");setLoading(true);setResult(null);
       try {
         const m1={...mathLayer(p1.dob,p1.gender),name:p1.name};
         const m2=mode==="couple"?{...mathLayer(p2.dob,p2.gender),name:p2.name}:null;
         const kua=kuaLayer(m1,m2);
         const prof1=buildProfile(m1,kua.p1,kua.mod1,m1.name);
         const prof2=m2?buildProfile(m2,kua.p2,kua.mod2,m2.name):null;

         // ✨ NEW: Receive narrative, signals, and archetypes
         const { narrative, signals, archetypes } = await fetchNarrative(prof1,prof2,kua.compat,mode,lang);

         // ✨ NEW: Store signals and archetypes in result
         setResult({m1,m2,kua,narrative,signals,archetypes,mode,lang,prof1,prof2});
       } catch(e){
         // ... error handling ...
       }
       setLoading(false);
     };

     // Line ~795: Update chartCtx to use signals and archetypes
     const chartCtx=useMemo(()=>R?{
       mode:R.mode,
       signals:R.signals, // ✨ NEW: Use compact signals
       archetypes:R.archetypes, // ✨ NEW: Include archetypes for chat context
       // Remove: p1:R.prof1, flyingStars2026, p2, compat - all now in signals
     }:null,[R]);

     ---
     PHASE 4: Update Chat to Use Signals and Archetypes

     File: app/api/chat/route.ts

     Changes:
     4. Update to expect signals and archetypes instead of full chart context
     5. Update system instruction to reference signals and archetypes for consistent responses

     Implementation:

     export async function POST(request: NextRequest) {
       try {
         const clientRequest = await request.json();
         const { question, chartContext, lang, history } = clientRequest;

         const isHindi = lang === 'hi';

         // ✨ NEW: Updated system instruction for signals and archetypes
         const systemInstruction = `You are a Lo Shu numerology advisor.

     The chart has been analyzed and personality archetypes have been synthesized.

     Answer follow-up questions using the psychological archetypes and supporting signals.

     Guidelines:
     ${isHindi
       ? '- Answer in Hindi (Devanagari). Mystical but clear.'
       : '- Answer in English.'
     }
     - Frame responses through the archetype lens for consistency
     - Reference specific signals (numbers, directions, elements, arrows) to support claims
     - Do not recompute numerology
     - Be specific, not generic
     - Max 130 words`;

         const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
           {
             role: 'system',
             content: systemInstruction,
           }
         ];

         // Only send signals and archetypes on FIRST message (when history is empty)
         if (!history || history.length === 0) {
           messages.push({
             role: 'user',
             content: `ARCHETYPES:\n${JSON.stringify(chartContext.archetypes, null, 2)}\n\nSUPPORTING SIGNALS:\n${JSON.stringify(chartContext.signals, null, 2)}`, //    
      ✨ NEW: Use archetypes + signals
           });
         } else {
           // Subsequent messages: lightweight reminder
           messages.push({
             role: 'user',
             content: `[Referring to previously provided archetypes and interpretation signals]`,
           });
         }

         // Add conversation history
         if (history && history.length > 0) {
           history.forEach((msg: any) => {
             messages.push({
               role: msg.role === 'assistant' ? 'assistant' : 'user',
               content: msg.content,
             });
           });
         }

         // Add current question
         messages.push({
           role: 'user',
           content: question,
         });

         const answer = await withRetry(
           () => generateWithFallback(messages, {
             temperature: 1,
             maxTokens: 512,
           }),
           'chat'
         );

         if (!answer || answer.trim() === '') {
           throw new Error('Empty response from AI');
         }

         return NextResponse.json({ answer });
       } catch (error) {
         console.error('Chat error:', error);

         const errorMessage = (error as Error).message;

         // User-friendly error messages
         if (errorMessage.includes('Rate limit') || errorMessage.includes('high demand')) {
           return NextResponse.json(
             {
               error: 'Rate limit exceeded',
               message: errorMessage,
               answer: '⏳ Our AI is currently experiencing high demand. Please wait a moment and ask your question again.',
             },
             { status: 429 }
           );
         }

         return NextResponse.json(
           {
             error: 'Internal server error',
             message: errorMessage,
             answer: '❌ Something went wrong. Please try asking your question again.',
           },
           { status: 500 }
         );
       }
     }

     ---
     Expected Token Savings

     Analysis Request

     Before:
     - Input: ~1,800 tokens (full chart JSON)
     - Output: ~2,048 tokens
     - Total: 3,850 tokens

     After (Two-Call Approach):
     - Call 1 (Archetype Extraction):
       - Input: ~150 tokens (compact signals)
       - Output: ~200 tokens (3 archetypes)
       - Subtotal: 350 tokens
     - Call 2 (Narrative Generation):
       - Input: ~300 tokens (signals + archetypes)
       - Output: ~2,048 tokens (narrative)
       - Subtotal: 2,348 tokens
     - Total: 2,698 tokens ✅ 30% reduction
     - Trade-off: Slightly higher than single-call but dramatically better narrative quality

     Chat Request

     Before (with previous optimization):
     - First message: ~1,450 tokens
     - Follow-ups: ~650 tokens

     After (with signals + archetypes):
     - First message: ~400 tokens (signals + archetypes instead of full chart)
     - Follow-ups: ~150 tokens (reference to signals + archetypes)
     - Total 5-message conversation: 1,000 tokens vs 3,250 before ✅ 69% reduction

     Combined Savings

     5-message conversation (1 analysis + 5 chat turns):
     - Before signal layer: 10,300 tokens (after phase 1 optimization)
     - After signal + archetype layer: 3,698 tokens
     - Overall savings: 64% reduction 🎉

     Qualitative Gains:
     - ✅ More psychologically coherent narratives
     - ✅ Consistent personality framework across all responses
     - ✅ Chat responses feel more personalized and specific
     - ✅ Reduced hallucination (archetypes anchor interpretations)

     ---
     Implementation Checklist

     Phase 1: Signal Extractor (1 hour)

     - Create lib/signal-extractor.ts
     - Implement extractSignals() function
     - Implement extractCoupleSignals() function
     - Implement extractFengShuiAlerts() helper
     - Add TypeScript interfaces

     Phase 2: Update API Route (1.5 hours)

     - Update app/api/analyze/route.ts to extract signals
     - Implement LLM Call 1: Archetype synthesis from signals
     - Implement LLM Call 2: Narrative generation using signals + archetypes
     - Return narrative, signals, AND archetypes in response
     - Add error handling for archetype parsing
     - Test with sample data

     Phase 3: Update Client State (30 mins)

     - Update result state type in loshu.tsx to include archetypes
     - Update fetchNarrative() to receive signals and archetypes
     - Update calculate() to store signals and archetypes
     - Update chartCtx to use signals and archetypes

     Phase 4: Update Chat (30 mins)

     - Update app/api/chat/route.ts to use signals and archetypes
     - Update system instruction to reference archetypes
     - Send archetypes on first message for consistent chat responses
     - Test multi-turn conversations

     Phase 5: Testing (1 hour)

     - Test single person analysis with archetype synthesis
     - Test couple analysis with archetype synthesis
     - Test chat using signals and archetypes
     - Verify token reduction in console logs
     - Check response quality and archetype coherence
     - Verify archetypes are consistent across chat turns

     Total Time: ~4.5 hours

     ---
     Files to Create/Modify

     New Files

     1. ✅ lib/signal-extractor.ts - Deterministic signal extraction logic

     Modified Files

     2. ✅ app/api/analyze/route.ts - Two-stage LLM pipeline (archetypes + narrative), return signals and archetypes
     3. ✅ app/api/chat/route.ts - Use signals and archetypes from context
     4. ✅ loshu.tsx - Store signals and archetypes, update chartCtx

     Total: 1 new file, 3 modified files

     ---
     Couple Mode Considerations

     For couple analysis, archetypes should be generated for BOTH people:

     Archetype Extraction Prompt for Couples:
     You are a psychological profiler analyzing numerology signals to synthesize personality archetypes for TWO people.

     PERSON 1 SIGNALS:
     {person1 signals JSON}

     PERSON 2 SIGNALS:
     {person2 signals JSON}

     COMPATIBILITY SIGNALS:
     {compatibility signals JSON}

     Task: Generate 3 archetypes for EACH person:

     Return JSON only:
     {
       "person1_archetypes": {
         "primary": { "name": "...", "description": "..." },
         "secondary": { "name": "...", "description": "..." },
         "shadow": { "name": "...", "description": "..." }
       },
       "person2_archetypes": {
         "primary": { "name": "...", "description": "..." },
         "secondary": { "name": "...", "description": "..." },
         "shadow": { "name": "...", "description": "..." }
       }
     }

     The narrative generation should then use both sets of archetypes to explain compatibility dynamics.

     ---
     Testing Strategy

     Local Testing

     npm run dev

     Test Cases:
     5. Generate single person analysis
       - Verify signals are extracted correctly
       - Verify archetypes are generated (primary, secondary, shadow)
       - Check console for signal and archetype JSON
       - Verify narrative uses archetype language
       - Check that narrative sections reference specific signals
     6. Generate couple analysis
       - Verify couple signals include both people
       - Verify archetypes generated for BOTH people
       - Check compatibility signals
       - Verify narrative references both people's archetypes
       - Check that compatibility analysis uses archetype framework
     7. Ask follow-up questions
       - First message should send signals + archetypes (~150 tokens)
       - Follow-ups should send reference only (~50 tokens)
       - Verify responses maintain archetype consistency
       - Ask contradictory questions to test coherence
     8. Compare token usage
       - Log input tokens before/after for both LLM calls
       - Verify ~64% overall reduction
       - Check Groq dashboard for actual usage
       - Monitor archetype extraction cost (~150 tokens)
     9. Qualitative assessment
       - Read 3-5 generated analyses
       - Check if archetypes feel accurate and specific
       - Verify narrative doesn't have contradictory traits
       - Test if chat responses stay "in character" with archetypes

     Expected Behavior

     - ✅ Signal extraction completes in <100ms (deterministic)
     - ✅ Archetype synthesis completes in ~1-2 seconds (LLM)
     - ✅ Narrative quality improved (more psychologically coherent)
     - ✅ Chat responses consistent with archetype framework
     - ✅ Token usage reduced by ~64%
     - ✅ No increase in error rates
     - ✅ Archetypes reference specific signals (not generic)

     ---
     Risk Assessment

     | Change                  | Risk   | Mitigation                                 |
     |-------------------------|--------|--------------------------------------------|
     | Signal extraction logic | LOW    | Deterministic, testable, no LLM dependency |
     | Updated prompts         | MEDIUM | Test thoroughly, may need prompt tuning    |
     | State structure change  | LOW    | Additive only, doesn't break existing      |
     | Chat context change     | LOW    | Signals contain all necessary data         |

     Overall Risk: LOW-MEDIUM - Larger change than phase 1 but well-structured

     ---
     Rollback Plan

     If signal layer causes quality issues:

     1. Quick rollback: Comment out signal extraction, send full chart JSON again
     2. Partial rollback: Use signals for chat only, keep full chart for analysis
     3. Prompt tuning: Adjust prompt wording while keeping signal architecture

     The signal extraction function is pure and doesn't affect existing flow until used.

     ---
     Future Enhancements (Optional)

     Phase 6: Archetype Caching (Optional)

     After archetype synthesis works well, consider caching common archetypes:

     // lib/archetype-cache.ts
     const archetypeCache = new Map<string, any>();

     export function getCachedArchetype(signalsHash: string): any | null {
       return archetypeCache.get(signalsHash) || null;
     }

     export function cacheArchetype(signalsHash: string, archetypes: any): void {
       archetypeCache.set(signalsHash, archetypes);
     }

     This would save LLM Call 1 for repeat chart patterns (e.g., same birth date), reducing costs further.

     Phase 7: Archetype-Based Recommendations (Optional)

     Extend archetypes to include behavioral recommendations:

     {
       "primary": {
         "name": "Independent Builder",
         "description": "...",
         "growth_actions": [
           "Delegate one task per week to practice trust",
           "Schedule 30min weekly for emotional check-ins"
         ]
       }
     }

     This would make the Growth Directive section more actionable.

     ---
     Success Criteria

     ✅ 60-70% token reduction in analysis + chat flow
     ✅ Narrative quality improved (more psychologically coherent)
     ✅ Chat responses remain specific and consistent with archetypes
     ✅ Signal extraction completes instantly (<100ms)
     ✅ Archetype synthesis completes in 1-2 seconds
     ✅ No increase in error rates
     ✅ Groq API costs reduced by ~64%
     ✅ Archetypes reference specific signals (not generic)
     ✅ No contradictory traits in narratives
