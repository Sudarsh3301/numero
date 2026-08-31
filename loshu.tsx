'use client';

import { useState, useRef, useEffect, useMemo, memo } from "react";
import type { CoupleArchetypes, CoupleSignals, NumerologySignals, SingleArchetypes } from "@/lib/signal-extractor";
import { calculateDriver, calculateConductor, calculateAge, detectMasterNumber, detectKarmicNumber } from "@/lib/numerology/core";
import { getDriverConductorProfile } from "@/lib/numerology/driver-conductor/combinations";
import { getPlanetAssociation } from "@/lib/numerology/planets";
import { getCurrentHealthProfile } from "@/lib/numerology/health";
import { getRemediesForMissing, getTopRemedies } from "@/lib/numerology/remedies";
import { getRepetitionEffects } from "@/lib/numerology/repetition";
import { getMissingEffects } from "@/lib/numerology/missing";
import { getPlanetDay } from "@/lib/numerology/planet-days";
import { getPersonalYearEffect } from "@/lib/numerology/personal-year";
import { analyzeComplementary } from "@/lib/numerology/complementary";
import type { DCCombination, HealthProfile, Remedy } from "@/lib/numerology/types";

import { PersonForm } from '@/components/forms/PersonForm';
import { NumerologyDashboard } from '@/components/numerology/NumerologyDashboard';
import { PartnershipScoreCard } from '@/components/numerology/PartnershipScoreCard';

type NarrativePayload = {
  narrative: { sections?: any[]; status?: string };
  signals: NumerologySignals | CoupleSignals;
  archetypes: SingleArchetypes | CoupleArchetypes;
};

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

// ─── LAYER 1: PURE MATH ──────────────────────────────────────────────────────
function sumReduce(n) {
  while (n > 9) n = String(n).split("").reduce((a,b) => a + Number(b), 0);
  return n;
}
function flatten2D(arr) {
  return [].concat(...arr);
}
function buildCounts(digits) {
  const c = {}; for (let i=1;i<=9;i++) c[i]=0;
  digits.filter(d=>d>0).forEach(d=>c[d]++); return c;
}
function getMissing(c) { return Object.keys(c).map(Number).filter(n=>c[n]===0); }
function getRepeated(c) { return Object.keys(c).map(Number).filter(n=>c[n]>1); }
function getPresent(c) { return Object.keys(c).map(Number).filter(n=>c[n]===1); }

function planeScore(counts) {
  const s = { intellectual:0, emotional:0, practical:0 };
  [1,2,3].forEach(n=>s.intellectual+=counts[n]);
  [4,5,6].forEach(n=>s.emotional+=counts[n]);
  [7,8,9].forEach(n=>s.practical+=counts[n]);
  const total = s.intellectual+s.emotional+s.practical||1;
  return { ...s, dominant:Object.entries(s).sort((a,b)=>b[1]-a[1])[0][0],
    pct:{ intellectual:Math.round(s.intellectual/total*100), emotional:Math.round(s.emotional/total*100), practical:Math.round(s.practical/total*100) } };
}

const ARROWS = [
  {id:"thought",   name:"Arrow of the Intellect", nums:[3,5,7], desc:"Sharp analytical mind, strong planning"},
  {id:"will",      name:"Staff of Will",           nums:[1,5,9], desc:"Intense determination, visionary drive"},
  {id:"activity",  name:"Arrow of Activity",       nums:[2,5,8], desc:"High practical energy, action-oriented"},
  {id:"compassion",name:"Arrow of Compassion",     nums:[4,5,6], desc:"Deep empathy, emotional intelligence"},
  {id:"memory",    name:"Arrow of Poor Memory",    nums:[3,6,9], desc:"Strong expression but may lack follow-through"},
  {id:"emotion",   name:"Arrow of Emotion",        nums:[7,8,9], desc:"Emotionally driven, needs grounding"},
  {id:"top_row",   name:"Arrow of Heaven",         nums:[2,9,4], desc:"Spiritual vision, abstract thinking"},
  {id:"bot_row",   name:"Arrow of Earth",          nums:[8,1,6], desc:"Material focus, physical stamina"},
  {id:"left_col",  name:"Arrow of Left Pillar",    nums:[4,3,8], desc:"Creative persistence, steady effort"},
  {id:"right_col", name:"Arrow of Right Pillar",   nums:[2,7,6], desc:"Communicative strength, social ease"},
];
const INDECISION_ARROWS = [
  {id:"no_thought",   name:"Arrow of Poor Thinking", nums:[3,5,7]},
  {id:"no_will",      name:"Arrow of Hesitation",    nums:[1,5,9]},
  {id:"no_activity",  name:"Arrow of Inertia",       nums:[2,5,8]},
  {id:"no_compassion",name:"Arrow of Insensitivity", nums:[4,5,6]},
];
function detectArrows(counts) {
  return {
    present: ARROWS.filter(a=>a.nums.every(n=>counts[n]>0)),
    absent:  INDECISION_ARROWS.filter(a=>a.nums.every(n=>counts[n]===0))
  };
}



function calcPersonalYear(dob) {
  const parts = dob.split("-").map(Number);
  const dy = parts[0] > 1000 ? parts[2] : parts[0];
  const mo = parts[1];
  return sumReduce(dy + mo + sumReduce(2026));
}


function mathLayer(dob, gender) {
  const digits = dob.replace(/-/g,"").split("").map(Number);
  const counts = buildCounts(digits);
  const py     = calcPersonalYear(dob);
  const planes = planeScore(counts);
  const arrows = detectArrows(counts);

  // Indian Numerology
  const driver = calculateDriver(dob);
  const conductor = calculateConductor(dob);
  const age = calculateAge(dob);
  const dcProfile = getDriverConductorProfile(driver, conductor);
  const rulingPlanet = getPlanetAssociation(driver);
  const conductorPlanet = getPlanetAssociation(conductor);
  const masterNumber = detectMasterNumber(dob);
  const karmicNumbers = detectKarmicNumber(dob);
  const healthProfile = getCurrentHealthProfile(driver, conductor, age);
  const missing = getMissing(counts);
  const repeated = getRepeated(counts);
  const remedies = getTopRemedies(getRemediesForMissing(missing, driver), 5);
  const repetitionEffects = getRepetitionEffects(counts);
  const missingEffects = getMissingEffects(missing);

  return {
    digits, counts, personalYear:py, planes, arrows,
    missing, repeated, present:getPresent(counts),
    digitSum:sumReduce(digits.reduce((a,b)=>a+b,0)),
    // Indian Numerology
    driver, conductor, age, dcProfile, rulingPlanet, conductorPlanet,
    masterNumber, karmicNumbers, healthProfile, remedies,
    repetitionEffects, missingEffects,
  };
}

// ─── LAYER 2: CLASSICAL INDIAN NUMEROLOGY ────────────────────────────────────

const NUM_ARCHETYPE = {
  1:"Water / Wisdom / Communication", 2:"Earth / Nurturing / Support",
  3:"Wood / Growth / Initiative",     4:"Wood / Intellect / Planning",
  5:"Center / Balance / Transformation", 6:"Metal / Authority / Leadership",
  7:"Metal / Joy / Expression",       8:"Earth / Stability / Endurance",
  9:"Fire / Vision / Recognition"
};

const PY_THEMES = {
  1:"New beginnings, independence — initiate", 2:"Patience, partnerships — cooperate",
  3:"Expression, creativity — communicate",    4:"Hard work, foundations — consolidate",
  5:"Change, upheaval — adapt or break",       6:"Responsibility, home — commit",
  7:"Reflection, inner truth — go inward",     8:"Power, ambition — harvest or lose",
  9:"Completion, release — clear the old"
};

// ─── LAYER 3: AI ─────────────────────────────────────────────────────────────
function buildProfile(m, name) {
  return {
    name:name||"Person",
    missing:m.missing, repeated:m.repeated, present:m.present,
    personalYear:m.personalYear, pyTheme:PY_THEMES[m.personalYear],
    planes:m.planes,
    arrows:{present:m.arrows.present.map(a=>a.name), absent:m.arrows.absent.map(a=>a.name)},
    archetypes:m.present.concat(m.repeated).map(n=>NUM_ARCHETYPE[n]),
    // Indian Numerology
    driver:m.driver,
    conductor:m.conductor,
    age:m.age,
    rulingPlanet:m.rulingPlanet.name,
    conductorPlanet:m.conductorPlanet.name,
    dcStrength:m.dcProfile.strength,
    dcAffect:m.dcProfile.affect,
    dcProfessions:m.dcProfile.professions,
    masterNumber:m.masterNumber.isMaster ? m.masterNumber.number : null,
    masterStrength:m.masterNumber.strength,
    karmicNumbers:m.karmicNumbers.hasKarmic ? m.karmicNumbers.numbers : [],
    healthGoverned:m.age < 40 ? "Driver" : "Conductor",
    healthPlanet:m.healthProfile.planet,
    healthIssues:m.healthProfile.issues,
    topRemedies:m.remedies.slice(0,3).map(r=>r.action),
  };
}

function buildSystemPrompt(mode, lang, p1, p2, compat) {
  const li = lang==="hi"
    ? "Respond entirely in Hindi (Devanagari script). Mystical but clear Hindi."
    : "Respond in English.";
  return `You are a direct, psychologically sharp Indian Numerology analyst. ${li}
You receive pre-computed data from multiple layers. Never recompute anything.

PRIORITY FRAMEWORK: Driver-Conductor is the PRIMARY foundation. Planets rule numbers (Surya=1, Chandra=2, Guru=3, Rahu=4, Budh=5, Shukra=6, Ketu=7, Shani=8, Mangal=9).

SINGLE MODE — 5 sections:
1. "🌟 Driver-Conductor Profile" — Start with Driver ${p1?.driver} (${p1?.rulingPlanet}) + Conductor ${p1?.conductor} (${p1?.conductorPlanet}). Combination strength ${p1?.dcStrength}/5. Explain ${p1?.dcAffect}. ${p1?.masterNumber ? `MASTER NUMBER ${p1.masterNumber} detected (${p1.masterStrength}% strength).` : ""} ${p1?.karmicNumbers?.length > 0 ? `KARMIC DEBT: ${p1.karmicNumbers.join(", ")}.` : ""}
2. "⚡ Blind Spots & Weaknesses" — Missing numbers: ${p1?.missing?.join(", ")}. Explain planetary voids. Absent arrows as psychological gaps. No softening.
3. "🔥 Innate Strengths" — Repeated numbers, present arrows, planetary friendships.
4. "🏥 Health & Remedies" — Age ${p1?.age}, governed by ${p1?.healthGoverned} (${p1?.healthPlanet}). Issues: ${p1?.healthIssues?.join(", ")}. Top remedies: ${p1?.topRemedies?.join(", ")}.
5. "📅 2026 Forecast" — Personal year ${p1?.personalYear} (${p1?.pyTheme}). Use planetary relationships and driver-conductor dynamics for specific predictions.

COUPLE MODE — 6 sections:
1. "🌟 Individual Drivers" — Each person's Driver-Conductor, ruling planets, master/karmic numbers.
2. "🔗 Core Alignment" — Planet friendship (${p1?.rulingPlanet} vs ${p2?.rulingPlanet}), number exchanges, shared strengths.
3. "⚡ Primary Friction" — Planetary conflicts, missing number gaps, control dynamics.
4. "📅 Long-Term Outlook" — Natural flow or constant work? What sustains vs. breaks.
5. "🛠 Behavioral Advice" — 2–3 specific actions from their data.
6. "🔮 2026 Couples Forecast" — Both personal years (${p1?.personalYear}, ${p2?.personalYear}). Use planetary dynamics for predictions. Together or apart?

Rules: Use names. Honesty over comfort. 300–360 words total. Return valid JSON only: { sections:[{title,body}] }`;
}

// Accepts pre-built profiles (computed once in calculate()) so buildProfile is not duplicated
async function fetchNarrative(p1, p2, compat, mode, lang) {
  const payload = { mode, person1: p1, ...(p2 && { person2: p2, compatibility: compat }) };
  const resp = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system: buildSystemPrompt(mode, lang, p1, p2, compat),
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
  return {
    narrative: data.narrative,
    signals: data.signals,
    archetypes: data.archetypes,
  } as NarrativePayload;
}

async function fetchFollowUp(question, chartContext, lang, history) {
  // Route expects { question, chartContext, lang, history } — no Claude API wrapper
  const resp = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, chartContext, lang, history }),
  });

  const raw = await resp.text();
  let data: any = {};

  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    if (resp.ok) {
      throw new Error("Invalid response from chat service.");
    }
  }

  if (!resp.ok) {
    if (resp.status === 429) {
      throw new Error(data.message || data.answer || 'Rate limit exceeded. Please try again in a moment.');
    }

    throw new Error(data.message || data.answer || `HTTP ${resp.status}`);
  }

  if (typeof data.answer !== "string" || !data.answer.trim()) {
    throw new Error("Invalid response from chat service.");
  }

  return data.answer;
}

// ─── UI COMPONENTS ────────────────────────────────────────────────────────────

// Note: All UI components have been extracted to @/components/numerology/* and @/components/forms/*


// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [mode,setMode]=useState("single");
  const [lang,setLang]=useState("en");
  const [p1,setP1]=useState({dob:"",gender:"M",name:""});
  const [p2,setP2]=useState({dob:"",gender:"F",name:""});
  const [result,setResult]=useState<AnalysisResult | null>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [narrativeLoading,setNarrativeLoading]=useState(false);
  const [narrativeError,setNarrativeError]=useState<string|null>(null);

  const calculate=async()=>{
    if (!p1.dob){setError("Please enter a date of birth.");return;}
    if (mode==="couple"&&!p2.dob){setError("Please enter both dates of birth.");return;}
    const y1=new Date(p1.dob).getFullYear();
    if (y1<1900||y1>2025){setError("Year of birth must be between 1900 and 2025.");return;}
    if (mode==="couple"){
      const y2=new Date(p2.dob).getFullYear();
      if (y2<1900||y2>2025){setError("Year of birth must be between 1900 and 2025.");return;}
    }
    setError("");setLoading(true);setResult(null);setNarrativeError(null);

    // Phase 1 — synchronous math, cannot fail
    const m1={...mathLayer(p1.dob,p1.gender),name:p1.name};
    const m2=mode==="couple"?{...mathLayer(p2.dob,p2.gender),name:p2.name}:null;
    const prof1=buildProfile(m1,m1.name);
    const prof2=m2?buildProfile(m2,m2.name):null;
    setResult({m1,m2,mode,lang,prof1,prof2,narrative:null,signals:null,archetypes:null});
    setLoading(false);

    // Phase 2 — async Groq narrative, scoped failure; never un-renders the grid
    setNarrativeLoading(true);
    try {
      const analysis=await fetchNarrative(prof1,prof2,null,mode,lang);
      setResult(prev=>prev?({...prev,narrative:analysis.narrative,signals:analysis.signals,archetypes:analysis.archetypes}):prev);
    } catch(e){
      setNarrativeError((e as Error).message);
      console.error(e);
    } finally {
      setNarrativeLoading(false);
    }
  };

  const R=result;
  const k1c="var(--color-mystic-500)";  // #a855f7 - Solarpunk mystic purple
  const k2c="var(--color-solar-500)";   // #f59e0b - Solarpunk solar gold

  // Memoized — only recomputes when result changes, not on chat keystrokes
  const chartCtx=useMemo(()=>R?{
    mode:R.mode,
    signals:R.signals,
    archetypes:R.archetypes,
  }:null,[R]);

  return (
    <div style={{minHeight:"100vh",background:"var(--gradient-cosmic)",
      fontFamily:"'Segoe UI',sans-serif",padding:"20px 16px",color:"#fff"}}>

      <div style={{textAlign:"center",marginBottom:18}}>
        <div style={{fontSize:30,marginBottom:3}}>☯</div>
        <h1 style={{margin:0,fontSize:20,fontWeight:900,
          background:"linear-gradient(90deg,var(--color-mystic-400),var(--color-leaf-400),var(--color-solar-500))",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
          Pure Math Based Numerology
        </h1>
        <p style={{color:"rgba(255,255,255,0.3)",fontSize:10,margin:"3px 0 0"}}>
          Pure Math → AI to Summarize it
        </p>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <div style={{flex:2,display:"flex",gap:4,background:"rgba(255,255,255,0.04)",borderRadius:10,padding:3}}>
          {["single","couple"].map(m=>(
            <button key={m} onClick={()=>{setMode(m);setResult(null);}} style={{
              flex:1,padding:"7px 0",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:"bold",
              background:mode===m?"linear-gradient(135deg,var(--color-mystic-500),var(--color-mystic-600))":"transparent",
              color:mode===m?"#fff":"rgba(255,255,255,0.35)",
              boxShadow:mode===m?"0 0 10px rgba(168,85,247,0.4)":"none",transition:"all 0.2s"
            }}>{m==="single"?"👤 Individual":"💑 Couple"}</button>
          ))}
        </div>
        <div style={{flex:1,display:"flex",gap:4,background:"rgba(255,255,255,0.04)",borderRadius:10,padding:3}}>
          {[{v:"en",l:"EN"},{v:"hi",l:"हिं"}].map(({v,l})=>(
            <button key={v} onClick={()=>setLang(v)} style={{
              flex:1,padding:"7px 0",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,fontWeight:"bold",
              background:lang===v?"linear-gradient(135deg,var(--color-leaf-500),var(--color-leaf-600))":"transparent",
              color:lang===v?"#fff":"rgba(255,255,255,0.35)",
              boxShadow:lang===v?"0 0 10px rgba(52,211,153,0.4)":"none",transition:"all 0.2s"
            }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:11}}>
        <PersonForm person={p1} setter={setP1} label={mode==="couple"?"Person 1":"Your Details"}/>
        {mode==="couple"&&<PersonForm person={p2} setter={setP2} label="Person 2"/>}
      </div>

      {error&&<div style={{color:"#f87171",fontSize:12,marginBottom:8,textAlign:"center"}}>{error}</div>}

      <button onClick={calculate} disabled={loading} style={{
        width:"100%",padding:"12px 0",borderRadius:12,border:"none",cursor:loading?"not-allowed":"pointer",
        background:loading?"rgba(168,85,247,0.4)":"linear-gradient(135deg,var(--color-mystic-500),var(--color-solar-500))",
        color:"#fff",fontSize:14,fontWeight:"bold",
        boxShadow:loading?"none":"0 4px 20px rgba(168,85,247,0.5)",marginBottom:20
      }}>{loading?"✨ Consulting the stars…":"✨ Reveal My Numbers"}</button>

      {R&&(
        <div style={{ display: "flex", flexDirection: "column", gap: 32, width: "100%", alignItems: "center" }}>
          
          {mode === "couple" && R.m2 && (
            <PartnershipScoreCard m1={R.m1} m2={R.m2} />
          )}

          <NumerologyDashboard
            profile={R.m1}
            label={R.m1.name || "Person 1"}
            color={k1c}
            narrative={mode === "single" ? R.narrative : null}
            chatProps={mode === "single" && R.archetypes ? { chartContext: chartCtx, lang, fetchFollowUp } : undefined}
            isSingle={mode === "single"}
            narrativeLoading={narrativeLoading}
            narrativeError={narrativeError ?? undefined}
          />

          {R.m2 && (
            <NumerologyDashboard
              profile={R.m2}
              label={R.m2.name || "Person 2"}
              color={k2c}
              narrative={mode === "couple" ? R.narrative : null}
              chatProps={mode === "couple" && R.archetypes ? { chartContext: chartCtx, lang, fetchFollowUp } : undefined}
              isSingle={false}
              narrativeLoading={narrativeLoading}
              narrativeError={narrativeError ?? undefined}
            />
          )}

          <div style={{textAlign:"center",fontSize:10,color:"rgba(255,255,255,0.18)",marginTop:24}}>
            For entertainment · Classical Feng Shui, Lo Shu & Xuan Kong Fei Xing
          </div>
        </div>
      )}
    </div>
  );
}
