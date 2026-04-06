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

type NarrativePayload = {
  narrative: { sections?: any[]; status?: string };
  signals: NumerologySignals | CoupleSignals;
  archetypes: SingleArchetypes | CoupleArchetypes;
};

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
  const [,mo,dy] = dob.split("-").map(Number);
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

PRIORITY FRAMEWORK: Driver-Conductor is the PRIMARY foundation. Planets rule numbers (Sun=1, Moon=2, Jupiter=3, Rahu=4, Mercury=5, Venus=6, Ketu=7, Saturn=8, Mars=9).

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

// Lo Shu personal grid
const GRID_POS = [[4,9,2],[3,5,7],[8,1,6]];
const LoShuGrid = memo(function LoShuGrid({ counts, color = "#7c3aed" }: { counts: any; color?: string }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,width:192,margin:"0 auto"}}>
      {flatten2D(GRID_POS).map(n=>{
        const c=counts[n]||0;
        return (
          <div key={n} style={{width:58,height:58,borderRadius:10,
            background:c>0?`${color}${Math.min(15+c*18,55).toString(16).padStart(2,"0")}`:"rgba(255,255,255,0.03)",
            border:`1.5px solid ${c>0?color+"88":"rgba(255,255,255,0.08)"}`,
            display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
            boxShadow:c>0?`0 0 10px ${color}44`:"none",transition:"all 0.3s"}}>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",marginBottom:1}}>{n}</div>
            <div style={{fontSize:c>2?11:15,fontWeight:"bold",letterSpacing:1,color:c>0?"#e2d9f3":"rgba(255,255,255,0.1)"}}>
              {c>0?Array(Math.min(c,4)).fill(n).join(""):"·"}
            </div>
          </div>
        );
      })}
    </div>
  );
});

// Complementary Numbers Support
const ComplementaryCard = memo(function ComplementaryCard({
  missing, present, label
}: {
  missing: number[];
  present: number[];
  label: string;
}) {
  const analysis = analyzeComplementary(missing, present);

  if (missing.length === 0) {
    return (
      <div style={{background:"rgba(74,222,128,0.1)",borderRadius:14,padding:13,textAlign:"center"}}>
        <div style={{fontSize:12,color:"#4ade80",fontWeight:"bold"}}>
          ✨ No Missing Numbers · {label}
        </div>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginTop:4}}>
          Complete Lo Shu Grid - all numbers present
        </div>
      </div>
    );
  }

  return (
    <div style={{background:"rgba(255,255,255,0.04)",borderRadius:14,padding:13}}>
      <div style={{fontSize:12,fontWeight:"bold",color:"#e2d9f3",marginBottom:4}}>
        🔄 Complementary Support · {label}
      </div>
      <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:8}}>
        Which present numbers can support missing ones
      </div>

      {analysis.map((item, idx) => {
        const supportColor = item.supportLevel === 'full' ? "#4ade80" :
                           item.supportLevel === 'partial' ? "#f59e0b" : "#f87171";

        return (
          <div key={idx} style={{
            marginBottom:8,
            padding:8,
            background:"rgba(255,255,255,0.03)",
            borderRadius:8,
            borderLeft:`3px solid ${supportColor}`
          }}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <div style={{
                width:28,
                height:28,
                borderRadius:6,
                background:"rgba(248,113,113,0.2)",
                border:"1px solid #f87171",
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                fontSize:13,
                fontWeight:"bold",
                color:"#f87171"
              }}>
                {item.missing}
              </div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>needs</div>
              <div style={{display:"flex",gap:4}}>
                {item.complementsNeeded.map(comp => (
                  <div key={comp} style={{
                    width:28,
                    height:28,
                    borderRadius:6,
                    background: item.complementsPresent.includes(comp) ?
                      "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${item.complementsPresent.includes(comp) ?
                      "#4ade80" : "rgba(255,255,255,0.1)"}`,
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center",
                    fontSize:13,
                    fontWeight:"bold",
                    color: item.complementsPresent.includes(comp) ? "#4ade80" : "rgba(255,255,255,0.3)"
                  }}>
                    {comp}
                  </div>
                ))}
              </div>
            </div>
            <div style={{fontSize:9,color:supportColor,marginLeft:36}}>
              {item.supportLevel === 'full' && "✓ Fully supported"}
              {item.supportLevel === 'partial' && "◐ Partially supported"}
              {item.supportLevel === 'none' && "✗ No support available"}
            </div>
          </div>
        );
      })}

      {present.includes(5) && (
        <div style={{
          marginTop:10,
          padding:8,
          background:"rgba(192,132,252,0.1)",
          borderRadius:8,
          fontSize:10,
          color:"#c084fc"
        }}>
          ✨ Number 5 present: Universal support for all numbers - guides towards will, success & prosperity
        </div>
      )}
    </div>
  );
});

// Planet Days & Colors
const PlanetDayCard = memo(function PlanetDayCard({
  driver, conductor, driverPlanet, conductorPlanet, label
}: {
  driver: number;
  conductor: number;
  driverPlanet: string;
  conductorPlanet: string;
  label: string;
}) {
  const driverDay = getPlanetDay(driver);
  const conductorDay = getPlanetDay(conductor);

  return (
    <div style={{background:"rgba(255,255,255,0.04)",borderRadius:14,padding:13}}>
      <div style={{fontSize:12,fontWeight:"bold",color:"#e2d9f3",marginBottom:8}}>
        📅 Favorable Days & Colors · {label}
      </div>

      <div style={{marginBottom:10,padding:10,background:"rgba(124,58,237,0.1)",borderRadius:10}}>
        <div style={{fontSize:11,color:"#c084fc",fontWeight:"bold",marginBottom:4}}>
          Driver {driver} ({driverPlanet}) — {driverDay.day}
        </div>
        <div style={{display:"flex",gap:8,fontSize:10}}>
          <div style={{flex:1}}>
            <span style={{color:"rgba(255,255,255,0.4)"}}>Use: </span>
            <span style={{color:"#4ade80"}}>{driverDay.colorsToUse.join(", ")}</span>
          </div>
          {driverDay.colorsToAvoid.length > 0 && (
            <div style={{flex:1}}>
              <span style={{color:"rgba(255,255,255,0.4)"}}>Avoid: </span>
              <span style={{color:"#f87171"}}>{driverDay.colorsToAvoid.join(", ")}</span>
            </div>
          )}
        </div>
      </div>

      <div style={{padding:10,background:"rgba(96,165,250,0.1)",borderRadius:10}}>
        <div style={{fontSize:11,color:"#60a5fa",fontWeight:"bold",marginBottom:4}}>
          Conductor {conductor} ({conductorPlanet}) — {conductorDay.day}
        </div>
        <div style={{display:"flex",gap:8,fontSize:10}}>
          <div style={{flex:1}}>
            <span style={{color:"rgba(255,255,255,0.4)"}}>Use: </span>
            <span style={{color:"#4ade80"}}>{conductorDay.colorsToUse.join(", ")}</span>
          </div>
          {conductorDay.colorsToAvoid.length > 0 && (
            <div style={{flex:1}}>
              <span style={{color:"rgba(255,255,255,0.4)"}}>Avoid: </span>
              <span style={{color:"#f87171"}}>{conductorDay.colorsToAvoid.join(", ")}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// Personal Year Effects
const PersonalYearCard = memo(function PersonalYearCard({
  personalYear, label
}: {
  personalYear: number;
  label: string;
}) {
  const pyEffect = getPersonalYearEffect(personalYear);
  const typeColors: Record<string, string> = {
    blessing: "#4ade80",
    testing: "#f59e0b",
    "no-risk": "#f87171",
    judgment: "#94a3b8",
    completion: "#c084fc"
  };
  const color = typeColors[pyEffect.type];

  return (
    <div style={{background:"rgba(255,255,255,0.04)",borderRadius:14,padding:13}}>
      <div style={{fontSize:12,fontWeight:"bold",color:"#e2d9f3",marginBottom:4}}>
        🔮 2026 Personal Year · {label}
      </div>

      <div style={{
        background:`${color}15`,
        border:`1.5px solid ${color}44`,
        borderRadius:12,
        padding:12,
        marginTop:8
      }}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
          <div style={{
            width:40,
            height:40,
            borderRadius:10,
            background:color,
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            fontSize:20,
            fontWeight:"bold",
            color:"#fff"
          }}>
            {personalYear}
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:"bold",color:color}}>
              {pyEffect.name}
            </div>
            {pyEffect.isBlessingYear && (
              <div style={{fontSize:9,color:"#4ade80",marginTop:2}}>✨ Blessing Year</div>
            )}
          </div>
        </div>

        <div style={{fontSize:11,color:"rgba(255,255,255,0.7)",marginBottom:6,lineHeight:1.5}}>
          {pyEffect.effects}
        </div>

        <div style={{fontSize:10,color:"rgba(255,255,255,0.5)",lineHeight:1.6,fontStyle:"italic"}}>
          💡 {pyEffect.guidance}
        </div>
      </div>
    </div>
  );
});

const ArrowsPanel = memo(function ArrowsPanel({ arrows }: { arrows: any }) {
  if (!arrows.present.length&&!arrows.absent.length) return null;
  return (
    <div style={{background:"rgba(255,255,255,0.04)",borderRadius:14,padding:13}}>
      <div style={{fontSize:12,fontWeight:"bold",color:"#e2d9f3",marginBottom:9}}>⚡ Pythagoras Arrows</div>
      {arrows.present.map((a,i)=>(
        <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:6}}>
          <span style={{fontSize:13,color:"#4ade80",marginTop:1}}>✦</span>
          <div><div style={{fontSize:11,fontWeight:"bold",color:"#4ade80"}}>{a.name}</div><div style={{fontSize:10,color:"rgba(255,255,255,0.45)"}}>{a.desc}</div></div>
        </div>
      ))}
      {arrows.absent.map((a,i)=>(
        <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:6}}>
          <span style={{fontSize:13,color:"#f87171",marginTop:1}}>✗</span>
          <div style={{fontSize:11,fontWeight:"bold",color:"#f87171"}}>{a.name}</div>
        </div>
      ))}
    </div>
  );
});

const PlaneBar = memo(function PlaneBar({ planes }: { planes: any }) {
  return (
    <div style={{background:"rgba(255,255,255,0.04)",borderRadius:14,padding:13}}>
      <div style={{fontSize:12,fontWeight:"bold",color:"#e2d9f3",marginBottom:9}}>🧩 Plane Balance</div>
      {[{k:"intellectual",label:"Thought",c:"#60a5fa"},{k:"emotional",label:"Emotion",c:"#f472b6"},{k:"practical",label:"Action",c:"#34d399"}].map(({k,label,c})=>(
        <div key={k} style={{marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
            <span style={{fontSize:10,color:"rgba(255,255,255,0.45)"}}>{label}</span>
            <span style={{fontSize:10,color:c,fontWeight:"bold"}}>{planes[k]} · {planes.pct[k]}%</span>
          </div>
          <div style={{height:5,borderRadius:5,background:"rgba(255,255,255,0.07)",overflow:"hidden"}}>
            <div style={{height:"100%",width:`${planes.pct[k]}%`,borderRadius:5,background:`linear-gradient(90deg,${c}88,${c})`,transition:"width 1s"}}/>
          </div>
        </div>
      ))}
      <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginTop:4}}>
        Dominant: <span style={{color:"#e2d9f3",fontWeight:"bold",textTransform:"capitalize"}}>{planes.dominant}</span>
      </div>
    </div>
  );
});


const NarrativeCard = memo(function NarrativeCard({ sections }: { sections: any[] }) {
  return (
    <div style={{background:"rgba(255,255,255,0.04)",borderRadius:16,padding:16}}>
      <div style={{fontSize:13,fontWeight:"bold",color:"#c084fc",marginBottom:12,letterSpacing:0.5}}>✨ AI Insights</div>
      {sections.map((s,i)=>(
        <div key={i} style={{marginBottom:i<sections.length-1?16:0}}>
          <div style={{fontSize:12,fontWeight:"bold",color:"#e2d9f3",marginBottom:5,borderLeft:"3px solid #7c3aed",paddingLeft:8}}>{s.title}</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.65)",lineHeight:1.8,paddingLeft:8}}>{s.body}</div>
        </div>
      ))}
    </div>
  );
});

const ChatPanel = memo(function ChatPanel({ chartContext, lang }: { chartContext: any; lang: string }) {
  const [msgs,setMsgs]=useState([]);
  const [input,setInput]=useState("");
  const [busy,setBusy]=useState(false);
  const bottomRef=useRef(null);
  const historyRef=useRef([]);
  useEffect(()=>{
    const el = bottomRef.current as any;
    if (!el || typeof el.scrollIntoView !== "function") return;

    try {
      el.scrollIntoView({ behavior:"smooth" });
    } catch {
      el.scrollIntoView();
    }
  },[msgs]);

  const send=async()=>{
    const q=input.trim(); if(!q||busy) return;
    setInput("");
    setMsgs(m=>[...m,{role:"user",text:q}]);
    setBusy(true);
    try {
      const answer=await fetchFollowUp(q,chartContext,lang,historyRef.current);
      // Cap history to last 6 messages (3 turns) to prevent unbounded prompt growth
      const updated=[...historyRef.current,{role:"user",content:q},{role:"assistant",content:answer}];
      historyRef.current=updated.slice(-6);
      setMsgs(m=>[...m,{role:"assistant",text:answer}]);
    } catch(e){
      const errorMsg = (e as Error).message;
      if (errorMsg.includes('Rate limit') || errorMsg.includes('high demand')) {
        setMsgs(m => [...m, { role: "assistant", text: "⏳ Chat service is experiencing high demand. Please wait 30 seconds and try again." }]);
      } else {
        setMsgs(m => [...m, { role: "assistant", text: "Something went wrong. Try again." }]);
      }
    }
    setBusy(false);
  };

  return (
    <div style={{background:"rgba(255,255,255,0.04)",borderRadius:16,overflow:"hidden"}}>
      <div style={{padding:"12px 14px",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
        <div style={{fontSize:12,fontWeight:"bold",color:"#c084fc"}}>💬 Ask About Your Chart</div>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginTop:2}}>Ask about your directions, flying stars, numbers, or year forecast</div>
      </div>
      <div style={{maxHeight:260,overflowY:"auto",padding:"12px 14px",display:"flex",flexDirection:"column",gap:10}}>
        {msgs.length===0&&(
          <div style={{fontSize:11,color:"rgba(255,255,255,0.2)",textAlign:"center",padding:"20px 0"}}>No questions yet.</div>
        )}
        {msgs.map((m,i)=>(
          <div key={i} style={{
            alignSelf:m.role==="user"?"flex-end":"flex-start", maxWidth:"85%",
            background:m.role==="user"?"rgba(124,58,237,0.35)":"rgba(255,255,255,0.07)",
            borderRadius:m.role==="user"?"12px 12px 2px 12px":"12px 12px 12px 2px",
            padding:"8px 12px",fontSize:12,color:"rgba(255,255,255,0.8)",lineHeight:1.6
          }}>{m.text}</div>
        ))}
        {busy&&<div style={{alignSelf:"flex-start",background:"rgba(255,255,255,0.07)",borderRadius:"12px 12px 12px 2px",padding:"8px 12px",fontSize:12,color:"rgba(255,255,255,0.4)"}}>✦ consulting the stars…</div>}
        <div ref={bottomRef}/>
      </div>
      <div style={{padding:"10px 12px",borderTop:"1px solid rgba(255,255,255,0.07)",display:"flex",gap:8}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
          placeholder={lang==="hi"?"अपना सवाल पूछें…":"Ask a follow-up question…"}
          style={{flex:1,background:"rgba(255,255,255,0.07)",border:"1.5px solid rgba(255,255,255,0.12)",
            borderRadius:9,color:"#fff",padding:"8px 11px",fontSize:12,outline:"none"}}/>
        <button onClick={send} disabled={busy||!input.trim()} style={{
          padding:"8px 14px",borderRadius:9,border:"none",cursor:busy||!input.trim()?"not-allowed":"pointer",
          background:busy||!input.trim()?"rgba(124,58,237,0.25)":"linear-gradient(135deg,#7c3aed,#a855f7)",
          color:"#fff",fontSize:12,fontWeight:"bold",
          boxShadow:busy?"none":"0 0 10px rgba(139,92,246,0.4)"
        }}>→</button>
      </div>
    </div>
  );
});


// Driver-Conductor Prominent Display
const DriverConductorCard = memo(function DriverConductorCard({ m, label, color }: { m: any; label: string; color: string }) {
  const strengthColor = m.dcProfile.strength >= 4 ? "#4ade80" : m.dcProfile.strength >= 3 ? "#60a5fa" : m.dcProfile.strength >= 2 ? "#f59e0b" : "#f87171";
  return (
    <div style={{background:`linear-gradient(135deg,${color}18,rgba(255,255,255,0.03))`,border:`1.5px solid ${color}44`,borderRadius:16,padding:14,marginBottom:12}}>
      <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginBottom:8,textAlign:"center"}}>{label}</div>

      {/* Driver and Conductor Numbers */}
      <div style={{display:"flex",gap:12,marginBottom:12}}>
        <div style={{flex:1,textAlign:"center"}}>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",marginBottom:4}}>DRIVER</div>
          <div style={{width:60,height:60,margin:"0 auto",borderRadius:12,background:`linear-gradient(135deg,${color},${color}88)`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:"bold",
            boxShadow:`0 0 16px ${color}55`,marginBottom:6}}>{m.driver}</div>
          <div style={{fontSize:11,color:color,fontWeight:"bold"}}>{m.rulingPlanet.name}</div>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.35)"}}>{m.rulingPlanet.title}</div>
        </div>

        <div style={{display:"flex",alignItems:"center",fontSize:20,color:"rgba(255,255,255,0.2)"}}>+</div>

        <div style={{flex:1,textAlign:"center"}}>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",marginBottom:4}}>CONDUCTOR</div>
          <div style={{width:60,height:60,margin:"0 auto",borderRadius:12,background:`linear-gradient(135deg,${color}77,${color}55)`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:"bold",
            border:`1.5px solid ${color}66`,marginBottom:6}}>{m.conductor}</div>
          <div style={{fontSize:11,color:color,fontWeight:"bold"}}>{m.conductorPlanet.name}</div>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.35)"}}>{m.conductorPlanet.title}</div>
        </div>
      </div>

      {/* DC Combination Details */}
      <div style={{background:"rgba(255,255,255,0.05)",borderRadius:10,padding:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <span style={{fontSize:11,color:"rgba(255,255,255,0.5)"}}>Combination Strength</span>
          <span style={{fontSize:14,fontWeight:"bold",color:strengthColor}}>{m.dcProfile.strength ? `${m.dcProfile.strength}/5` : "?"}</span>
        </div>
        <div style={{fontSize:12,color:"#e2d9f3",fontWeight:"bold",marginBottom:4}}>{m.dcProfile.affect}</div>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.45)"}}>Best for: {m.dcProfile.professions.slice(0,3).join(", ")}</div>
        {m.dcProfile.warnings && (
          <div style={{marginTop:6,padding:6,background:"rgba(248,113,113,0.1)",borderRadius:6,fontSize:9,color:"#fca5a5"}}>
            ⚠️ {m.dcProfile.warnings}
          </div>
        )}
      </div>

      {/* Master Number if present */}
      {m.masterNumber.isMaster && (
        <div style={{marginTop:10,padding:10,background:"rgba(192,132,252,0.15)",border:"1.5px solid #c084fc55",borderRadius:10}}>
          <div style={{fontSize:11,color:"#c084fc",fontWeight:"bold",marginBottom:3}}>
            ✨ Master Number {m.masterNumber.number} ({m.masterNumber.strength}% strength)
          </div>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.5)"}}>
            {m.masterNumber.number === 11 ? "Spiritual messenger - intuitive and inspiring" :
             m.masterNumber.number === 22 ? "Master builder - dreams into reality" :
             "Master teacher - ancient wisdom"}
          </div>
        </div>
      )}

      {/* Karmic Numbers if present */}
      {m.karmicNumbers.hasKarmic && (
        <div style={{marginTop:10,padding:10,background:"rgba(248,113,113,0.1)",border:"1.5px solid #f8717155",borderRadius:10}}>
          <div style={{fontSize:11,color:"#f87171",fontWeight:"bold",marginBottom:4}}>
            ⚡ Karmic Debt: {m.karmicNumbers.numbers.join(", ")}
          </div>
          {m.karmicNumbers.meanings.slice(0,1).map((meaning, i) => (
            <div key={i} style={{fontSize:9,color:"rgba(255,255,255,0.5)",lineHeight:1.4}}>{meaning}</div>
          ))}
        </div>
      )}
    </div>
  );
});

// Health Profile Component
const HealthCard = memo(function HealthCard({ health, age, label }: { health: HealthProfile; age: number; label: string }) {
  const governedBy = age < 40 ? "Driver" : "Conductor";
  return (
    <div style={{background:"rgba(255,255,255,0.04)",borderRadius:14,padding:13}}>
      <div style={{fontSize:12,fontWeight:"bold",color:"#e2d9f3",marginBottom:4}}>🏥 Health Profile · {label}</div>
      <div style={{fontSize:9,color:"rgba(255,255,255,0.35)",marginBottom:8}}>
        Age {age} — Governed by {governedBy} ({health.planet})
      </div>

      <div style={{marginBottom:8}}>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.5)",marginBottom:3}}>Likely Health Concerns:</div>
        {health.issues.slice(0,3).map((issue, i) => (
          <div key={i} style={{fontSize:10,color:"#f59e0b",marginBottom:2}}>• {issue}</div>
        ))}
      </div>

      <div style={{background:"rgba(74,222,128,0.08)",borderRadius:8,padding:8}}>
        <div style={{fontSize:9,color:"#4ade80",fontWeight:"bold",marginBottom:3}}>Lifestyle Advice:</div>
        <div style={{fontSize:9,color:"rgba(255,255,255,0.6)",lineHeight:1.5}}>{health.lifestyle.slice(0,150)}...</div>
      </div>
    </div>
  );
});

// Remedies Component
const RemediesCard = memo(function RemediesCard({ remedies, label }: { remedies: Remedy[]; label: string }) {
  const byFreq = {daily:[],weekly:[],monthly:[]};
  remedies.forEach(r => {
    if (r.frequency === 'daily' && byFreq.daily.length < 2) byFreq.daily.push(r);
    else if (r.frequency === 'weekly' && byFreq.weekly.length < 2) byFreq.weekly.push(r);
    else if (r.frequency === 'monthly' && byFreq.monthly.length < 1) byFreq.monthly.push(r);
  });

  return (
    <div style={{background:"rgba(255,255,255,0.04)",borderRadius:14,padding:13}}>
      <div style={{fontSize:12,fontWeight:"bold",color:"#e2d9f3",marginBottom:4}}>🙏 Top Remedies · {label}</div>
      <div style={{fontSize:9,color:"rgba(255,255,255,0.35)",marginBottom:8}}>Based on missing numbers</div>

      {Object.entries(byFreq).map(([freq, items]) => (
        items.length > 0 && (
          <div key={freq} style={{marginBottom:8}}>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",marginBottom:3,textTransform:"capitalize"}}>{freq}:</div>
            {items.map((remedy, i) => (
              <div key={i} style={{fontSize:10,color:"#60a5fa",marginBottom:2,paddingLeft:8}}>• {remedy.action}</div>
            ))}
          </div>
        )
      ))}
    </div>
  );
});

function PersonForm({ person, setter, label }) {
  const inp=f=>e=>setter(p=>({...p,[f]:e.target.value}));
  const fs={background:"rgba(255,255,255,0.07)",border:"1.5px solid rgba(255,255,255,0.12)",
    borderRadius:9,color:"#fff",padding:"7px 11px",fontSize:13,outline:"none",width:"100%",boxSizing:"border-box" as const};
  return (
    <div style={{flex:1,background:"rgba(255,255,255,0.04)",borderRadius:14,padding:13}}>
      <div style={{color:"rgba(255,255,255,0.45)",fontSize:11,marginBottom:7}}>{label}</div>
      <input placeholder="Name (optional)" value={person.name} onChange={inp("name")} style={{...fs,marginBottom:7}}/>
      <input type="date" value={person.dob} onChange={inp("dob")} style={{...fs,marginBottom:7}}/>
      <div style={{display:"flex",gap:6}}>
        {["M","F"].map(g=>(
          <button key={g} onClick={()=>setter(p=>({...p,gender:g}))} style={{
            flex:1,padding:"6px 0",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:"bold",
            background:person.gender===g?"linear-gradient(135deg,#7c3aed,#a855f7)":"rgba(255,255,255,0.07)",
            color:person.gender===g?"#fff":"rgba(255,255,255,0.4)",
            boxShadow:person.gender===g?"0 0 10px rgba(139,92,246,0.4)":"none"
          }}>{g==="M"?"♂ Male":"♀ Female"}</button>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [mode,setMode]=useState("single");
  const [lang,setLang]=useState("en");
  const [p1,setP1]=useState({dob:"",gender:"M",name:""});
  const [p2,setP2]=useState({dob:"",gender:"F",name:""});
  const [result,setResult]=useState<AnalysisResult | null>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  const calculate=async()=>{
    if (!p1.dob){setError("Please enter a date of birth.");return;}
    if (mode==="couple"&&!p2.dob){setError("Please enter both dates of birth.");return;}
    const y1=new Date(p1.dob).getFullYear();
    if (y1<1900||y1>2025){setError("Year of birth must be between 1900 and 2025.");return;}
    if (mode==="couple"){
      const y2=new Date(p2.dob).getFullYear();
      if (y2<1900||y2>2025){setError("Year of birth must be between 1900 and 2025.");return;}
    }
    setError("");setLoading(true);setResult(null);
    try {
      const m1={...mathLayer(p1.dob,p1.gender),name:p1.name};
      const m2=mode==="couple"?{...mathLayer(p2.dob,p2.gender),name:p2.name}:null;
      // Build profiles once — reused for analysis request payloads only
      const prof1=buildProfile(m1,m1.name);
      const prof2=m2?buildProfile(m2,m2.name):null;
      const analysis=await fetchNarrative(prof1,prof2,null,mode,lang);
      setResult({
        m1,
        m2,
        narrative:analysis.narrative,
        mode,
        lang,
        prof1,
        prof2,
        signals:analysis.signals,
        archetypes:analysis.archetypes,
      });
    } catch(e){
      // Enhanced error message handling
      const errorMsg = (e as Error).message;
      if (errorMsg.includes('Rate limit') || errorMsg.includes('high demand')) {
        setError("⏳ AI service is busy. Please wait 30 seconds and try again.");
      } else if (errorMsg.includes('formatting error')) {
        setError("⚠️ AI response error. Please try again.");
      } else {
        setError(errorMsg || "Something went wrong. Please try again.");
      }
      console.error(e);
    }
    setLoading(false);
  };

  const R=result;
  const k1c="#7c3aed";
  const k2c="#f59e0b";

  // Memoized — only recomputes when result changes, not on chat keystrokes
  const chartCtx=useMemo(()=>R?{
    mode:R.mode,
    signals:R.signals,
    archetypes:R.archetypes,
  }:null,[R]);

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f0720,#1a0a3d 50%,#0a1628)",
      fontFamily:"'Segoe UI',sans-serif",padding:"20px 16px",color:"#fff"}}>

      <div style={{textAlign:"center",marginBottom:18}}>
        <div style={{fontSize:30,marginBottom:3}}>☯</div>
        <h1 style={{margin:0,fontSize:20,fontWeight:900,
          background:"linear-gradient(90deg,#c084fc,#60a5fa,#f59e0b,#f87171)",
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
              background:mode===m?"linear-gradient(135deg,#7c3aed,#6d28d9)":"transparent",
              color:mode===m?"#fff":"rgba(255,255,255,0.35)",
              boxShadow:mode===m?"0 0 10px rgba(124,58,237,0.4)":"none",transition:"all 0.2s"
            }}>{m==="single"?"👤 Individual":"💑 Couple"}</button>
          ))}
        </div>
        <div style={{flex:1,display:"flex",gap:4,background:"rgba(255,255,255,0.04)",borderRadius:10,padding:3}}>
          {[{v:"en",l:"EN"},{v:"hi",l:"हिं"}].map(({v,l})=>(
            <button key={v} onClick={()=>setLang(v)} style={{
              flex:1,padding:"7px 0",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,fontWeight:"bold",
              background:lang===v?"linear-gradient(135deg,#0e7490,#0891b2)":"transparent",
              color:lang===v?"#fff":"rgba(255,255,255,0.35)",
              boxShadow:lang===v?"0 0 10px rgba(8,145,178,0.4)":"none",transition:"all 0.2s"
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
        background:loading?"rgba(124,58,237,0.4)":"linear-gradient(135deg,#7c3aed,#a855f7,#ec4899)",
        color:"#fff",fontSize:14,fontWeight:"bold",
        boxShadow:loading?"none":"0 4px 20px rgba(139,92,246,0.5)",marginBottom:20
      }}>{loading?"✨ Consulting the stars…":"✨ Reveal My Numbers"}</button>

      {R&&(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>

          {/* Driver-Conductor Cards — THE FOUNDATION */}
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:1}}>
              <DriverConductorCard m={R.m1} label={R.m1.name||"Person 1"} color={k1c}/>
            </div>
            {R.m2&&(
              <div style={{flex:1}}>
                <DriverConductorCard m={R.m2} label={R.m2.name||"Person 2"} color={k2c}/>
              </div>
            )}
          </div>

          {/* Personal Lo Shu Grids */}
          <div style={{display:"flex",gap:10}}>
            {[{m:R.m1,c:k1c,label:R.m1.name||"Person 1"},R.m2&&{m:R.m2,c:k2c,label:R.m2.name||"Person 2"}].filter(Boolean).map((p,i)=>(
              <div key={i} style={{flex:1,background:"rgba(255,255,255,0.04)",borderRadius:16,padding:13}}>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",textAlign:"center",marginBottom:8}}>{p.label} · Lo Shu</div>
                <LoShuGrid counts={p.m.counts} color={p.c}/>
                <div style={{display:"flex",justifyContent:"space-around",marginTop:9}}>
                  {[{l:"Missing",v:p.m.missing,c:"#f87171"},{l:"Strong",v:p.m.repeated,c:"#c084fc"}].map(({l,v,c})=>(
                    <div key={l} style={{textAlign:"center"}}>
                      <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",marginBottom:2}}>{l}</div>
                      <div style={{fontSize:11,color:c}}>{v.length?v.join(" "):"—"}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Complementary Support */}
          <div style={{display:"flex",gap:10}}>
            {[{m:R.m1,label:R.m1.name||"Person 1"},R.m2&&{m:R.m2,label:R.m2.name||"Person 2"}].filter(Boolean).map((p,i)=>(
              <div key={i} style={{flex:1}}>
                <ComplementaryCard missing={p.m.missing} present={p.m.present} label={p.label}/>
              </div>
            ))}
          </div>

          {/* Planet Days & Colors */}
          <div style={{display:"flex",gap:10}}>
            {[{m:R.m1,label:R.m1.name||"Person 1"},R.m2&&{m:R.m2,label:R.m2.name||"Person 2"}].filter(Boolean).map((p,i)=>(
              <div key={i} style={{flex:1}}>
                <PlanetDayCard
                  driver={p.m.driver}
                  conductor={p.m.conductor}
                  driverPlanet={p.m.rulingPlanet.name}
                  conductorPlanet={p.m.conductorPlanet.name}
                  label={p.label}
                />
              </div>
            ))}
          </div>

          {/* Personal Year 2026 */}
          <div style={{display:"flex",gap:10}}>
            {[{m:R.m1,label:R.m1.name||"Person 1"},R.m2&&{m:R.m2,label:R.m2.name||"Person 2"}].filter(Boolean).map((p,i)=>(
              <div key={i} style={{flex:1}}>
                <PersonalYearCard personalYear={p.m.personalYear} label={p.label}/>
              </div>
            ))}
          </div>

          {/* Planes + Arrows */}
          {[{m:R.m1,label:R.m1.name||"P1"},R.m2&&{m:R.m2,label:R.m2.name||"P2"}].filter(Boolean).map((p,i)=>(
            <div key={i} style={{display:"flex",gap:10}}>
              <div style={{flex:1}}><PlaneBar planes={p.m.planes}/></div>
              <div style={{flex:1}}><ArrowsPanel arrows={p.m.arrows}/></div>
            </div>
          ))}

          {/* Health Profiles */}
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:1}}>
              <HealthCard health={R.m1.healthProfile} age={R.m1.age} label={R.m1.name||"Person 1"}/>
            </div>
            {R.m2&&(
              <div style={{flex:1}}>
                <HealthCard health={R.m2.healthProfile} age={R.m2.age} label={R.m2.name||"Person 2"}/>
              </div>
            )}
          </div>

          {/* Remedies */}
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:1}}>
              <RemediesCard remedies={R.m1.remedies} label={R.m1.name||"Person 1"}/>
            </div>
            {R.m2&&(
              <div style={{flex:1}}>
                <RemediesCard remedies={R.m2.remedies} label={R.m2.name||"Person 2"}/>
              </div>
            )}
          </div>


          {/* AI Narrative */}
          {R.narrative?.sections&&<NarrativeCard sections={R.narrative.sections}/>}

          {/* Follow-up Chat */}
          <ChatPanel chartContext={chartCtx} lang={lang}/>

          <div style={{textAlign:"center",fontSize:10,color:"rgba(255,255,255,0.18)"}}>
            For entertainment · Classical Feng Shui, Lo Shu & Xuan Kong Fei Xing
          </div>
        </div>
      )}
    </div>
  );
}
