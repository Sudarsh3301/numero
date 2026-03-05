'use client';

import { useState, useRef, useEffect, useMemo, memo } from "react";

// ─── LAYER 1: PURE MATH ──────────────────────────────────────────────────────
function sumReduce(n) {
  while (n > 9) n = String(n).split("").reduce((a,b) => a + Number(b), 0);
  return n;
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

// ─── FLYING STAR (XUAN KONG FEI XING) ────────────────────────────────────────
// Annual center star sequence counts BACKWARD: ...2025=2, 2026=1, 2027=9, 2028=8...
// Formula: centerStar = ((3 - (year - 2024)) % 9 + 9) % 9 || 9  [2024 baseline=3, then -1/yr]
// 2026 verified: center = 1 (Water / Kan)

function getAnnualCenterStar(year) {
  // 2024 = center 3, each year decrements by 1, wraps 1→9
  const raw = ((3 - (year - 2024)) % 9 + 9) % 9;
  return raw === 0 ? 9 : raw;
}

// Lo Shu walk order (the path stars travel): Centre, NW, W, NE, S, N, SW, E, SE
// Natal permanent numbers for each palace in this walk order:
const PALACE_ORDER    = ["Centre","NW","W","NE","S","N","SW","E","SE"];
const NATAL_WALK_NUMS = [5, 6, 7, 8, 9, 1, 2, 3, 4];

// Annual visiting star for each palace:
// Walk position i has natal number NATAL_WALK_NUMS[i].
// Annual star at position i = natal_num + (centerStar - 5), reduced mod9 in range 1-9
function calcFlyingStars(year) {
  const centerStar = getAnnualCenterStar(year);
  const offset = centerStar - 5; // how much the annual chart shifts vs natal
  const result: Record<string, any> = {};
  PALACE_ORDER.forEach((palace, i) => {
    const natal   = NATAL_WALK_NUMS[i];
    const annual  = ((natal - 1 + offset + 90) % 9) + 1;
    const nEl     = STAR_ELEMENT[natal];
    const aEl     = STAR_ELEMENT[annual];
    // Five-element activation classification
    let activation;
    if (annual === natal)                    activation = "doubled";   // same star — amplified
    else if (SUPPORTS[nEl] === aEl)          activation = "activated"; // annual feeds natal
    else if (SUPPORTS[aEl] === nEl)          activation = "draining";  // natal feeds annual
    else if (CONTROLS[nEl] === aEl)          activation = "empowered"; // natal controls annual
    else if (CONTROLS[aEl] === nEl)          activation = "challenged";// annual controls natal
    else                                     activation = "neutral";
    // Danger flags
    const danger = annual === 5 ? "high_alert"
                 : annual === 2 ? "health_warning"
                 : annual === 3 ? "conflict_warning"
                 : annual === 7 ? "betrayal_warning"
                 : null;
    result[palace] = { natal, annual, activation, danger };
  });
  result._centerStar = centerStar;
  return result;
}

// Element for each Lo Shu star number
const STAR_ELEMENT = {
  1:"Water", 2:"Earth", 3:"Wood", 4:"Wood",
  5:"Earth", 6:"Metal", 7:"Metal", 8:"Earth", 9:"Fire"
};

const FLYING_STAR_INFO = {
  1: { name:"White",     element:"Water", nature:"auspicious",  theme:"Career & Intelligence",      advice:"Activate — good for study, career moves" },
  2: { name:"Black",     element:"Earth", nature:"afflicted",   theme:"Illness & Obstacles",        advice:"Suppress with metal (6-rod windchime, metal bowl)" },
  3: { name:"Jade",      element:"Wood",  nature:"afflicted",   theme:"Conflict & Legal Disputes",  advice:"Suppress with red/fire element objects" },
  4: { name:"Green",     element:"Wood",  nature:"auspicious",  theme:"Romance & Academic Luck",    advice:"Activate — good for study, relationships" },
  5: { name:"Yellow",    element:"Earth", nature:"dangerous",   theme:"Misfortune & Disaster",      advice:"Most dangerous — suppress urgently with metal" },
  6: { name:"White",     element:"Metal", nature:"auspicious",  theme:"Authority & Windfall",       advice:"Activate — good for leadership and finances" },
  7: { name:"Red",       element:"Metal", nature:"afflicted",   theme:"Betrayal & Robbery",         advice:"Suppress with water element" },
  8: { name:"White",     element:"Earth", nature:"auspicious",  theme:"Prosperity & Wealth",        advice:"Activate — most powerful wealth star in Period 9" },
  9: { name:"Purple",    element:"Fire",  nature:"auspicious",  theme:"Future Prosperity & Joy",    advice:"Activate — multiplies whatever it touches" },
};

// Grid layout for the 3x3 Lo Shu display
// Row/Col mapping: [NW,N,NE] [W,Centre,E] [SW,S,SE]
const GRID_PALACE_LAYOUT = [
  ["NW","N","NE"],
  ["W","Centre","E"],
  ["SW","S","SE"]
];

// Natal numbers in same grid layout
const GRID_NATAL = [[6,1,8],[7,5,3],[2,9,4]];

function calcPersonalYear(dob) {
  const [,mo,dy] = dob.split("-").map(Number);
  return sumReduce(dy + mo + sumReduce(2026));
}

function calcKuaRaw(dob, gender) {
  const [yRaw,mo,dy] = dob.split("-").map(Number);
  const liChun = (mo===1)||(mo===2&&dy<=3);
  const y = liChun ? yRaw-1 : yRaw;
  const reduced = sumReduce(String(y).split("").reduce((a,b)=>a+Number(b),0));
  const post2000 = y>=2000;
  let kua;
  if (gender==="M") kua = post2000 ? sumReduce(9-reduced) : sumReduce(10-reduced);
  else              kua = post2000 ? sumReduce(reduced+6) : sumReduce(reduced+5);
  if (kua===5) kua = gender==="M" ? 2 : 8;
  if (kua<=0)  kua = 9;
  return kua;
}

function mathLayer(dob, gender) {
  const digits = dob.replace(/-/g,"").split("").map(Number);
  const counts = buildCounts(digits);
  const kua    = calcKuaRaw(dob, gender);
  const py     = calcPersonalYear(dob);
  const planes = planeScore(counts);
  const arrows = detectArrows(counts);
  const flyingStars = FLYING_STARS_2026;
  return {
    digits, counts, kua, personalYear:py, planes, arrows, flyingStars,
    missing:getMissing(counts), repeated:getRepeated(counts), present:getPresent(counts),
    digitSum:sumReduce(digits.reduce((a,b)=>a+b,0)),
  };
}

// ─── LAYER 2: KUA + CLASSICAL ────────────────────────────────────────────────
const SUPPORTS = {Wood:"Fire",Fire:"Earth",Earth:"Metal",Metal:"Water",Water:"Wood"};
const CONTROLS = {Wood:"Earth",Earth:"Water",Water:"Fire",Fire:"Metal",Metal:"Wood"};
const BAZHAI_LUCKY_LABELS   = {shengQi:"Prosperity 生氣",tianYi:"Health 天醫",yanNian:"Relationships 延年",fuWei:"Stability 伏位"};
const BAZHAI_UNLUCKY_LABELS = {jueMing:"Total Loss 絕命",liuSha:"Six Killings 六煞",wuGui:"Five Ghosts 五鬼",huoHai:"Mishaps 禍害"};

// Pre-computed once at module load — 2026 flying stars never change at runtime
const FLYING_STARS_2026 = calcFlyingStars(2026);

const KUA_DATA = {
  1:{element:"Water",trigram:"Kan",group:"E",color:"#60a5fa",trait:"Wisdom & Flow",
     lucky:{shengQi:"SE",tianYi:"E", yanNian:"S", fuWei:"N" },
     unlucky:{jueMing:"W", liuSha:"NE",wuGui:"NW",huoHai:"SW"}},
  2:{element:"Earth",trigram:"Kun",group:"W",color:"#d97706",trait:"Nurture & Stability",
     lucky:{shengQi:"NE",tianYi:"W", yanNian:"NW",fuWei:"SW"},
     unlucky:{jueMing:"E", liuSha:"SE",wuGui:"S", huoHai:"N" }},
  3:{element:"Wood", trigram:"Zhen",group:"E",color:"#34d399",trait:"Growth & Action",
     lucky:{shengQi:"S", tianYi:"N", yanNian:"SE",fuWei:"E" },
     unlucky:{jueMing:"W", liuSha:"SW",wuGui:"NE",huoHai:"NW"}},
  4:{element:"Wood", trigram:"Xun", group:"E",color:"#4ade80",trait:"Creativity & Intuition",
     lucky:{shengQi:"N", tianYi:"S", yanNian:"E", fuWei:"SE"},
     unlucky:{jueMing:"W", liuSha:"NW",wuGui:"SW",huoHai:"NE"}},
  6:{element:"Metal",trigram:"Qian",group:"W",color:"#c084fc",trait:"Leadership & Authority",
     lucky:{shengQi:"W", tianYi:"NE",yanNian:"SW",fuWei:"NW"},
     unlucky:{jueMing:"E", liuSha:"N", wuGui:"SE",huoHai:"S" }},
  7:{element:"Metal",trigram:"Dui", group:"W",color:"#f472b6",trait:"Joy & Expression",
     lucky:{shengQi:"NW",tianYi:"SW",yanNian:"NE",fuWei:"W" },
     unlucky:{jueMing:"E", liuSha:"S", wuGui:"N", huoHai:"SE"}},
  8:{element:"Earth",trigram:"Gen", group:"W",color:"#fb923c",trait:"Groundedness & Reliability",
     lucky:{shengQi:"SW",tianYi:"NW",yanNian:"W", fuWei:"NE"},
     unlucky:{jueMing:"E", liuSha:"N", wuGui:"SE",huoHai:"S" }},
  9:{element:"Fire", trigram:"Li",  group:"E",color:"#f87171",trait:"Brilliance & Passion",
     lucky:{shengQi:"E", tianYi:"SE",yanNian:"N", fuWei:"S" },
     unlucky:{jueMing:"W", liuSha:"SW",wuGui:"NE",huoHai:"NW"}},
};

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

const YEAR_ELEMENT = "Fire";
const YEAR_LABEL   = "2026 · Bing Wu · Fire Horse";

function elementYearModifier(el) {
  if (SUPPORTS[el]===YEAR_ELEMENT) return {rel:`${el} feeds Fire year`,tone:"draining",  advice:"Guard energy — you give more than you receive this year."};
  if (SUPPORTS[YEAR_ELEMENT]===el) return {rel:`Fire year feeds ${el}`,tone:"supported", advice:"Ride the year's momentum — external support is strong."};
  if (CONTROLS[el]===YEAR_ELEMENT) return {rel:`${el} controls Fire year`,tone:"empowered",advice:"You can harness 2026's energy — take bold initiative."};
  if (CONTROLS[YEAR_ELEMENT]===el) return {rel:`Fire year controls ${el}`,tone:"challenged",advice:"Year energy works against you — be strategic, not reactive."};
  return {rel:`Neutral with Fire year`,tone:"neutral",advice:"Steady year — no strong push or pull from annual energy."};
}

const luckyArr   = k => Object.values(k.lucky);
const unluckyArr = k => Object.values(k.unlucky);

function kuaLayer(m1, m2=null) {
  const k1=KUA_DATA[m1.kua], mod1=elementYearModifier(k1.element);
  let result: Record<string, any> = {p1:k1,mod1};
  if (m2) {
    const k2=KUA_DATA[m2.kua], mod2=elementYearModifier(k2.element);
    const e1=k1.element,e2=k2.element;
    const supports=SUPPORTS[e1]===e2||SUPPORTS[e2]===e1;
    const controls=CONTROLS[e1]===e2||CONTROLS[e2]===e1;
    result.p2=k2; result.mod2=mod2;
    result.compat={
      sameGroup:k1.group===k2.group, supports, controls,
      elementRelation:supports?"Supporting":controls?"Controlling":"Neutral",
      sharedLucky:luckyArr(k1).filter(d=>luckyArr(k2).includes(d)),
      sharedUnlucky:unluckyArr(k1).filter(d=>unluckyArr(k2).includes(d)),
      score:k1.group===k2.group?(supports?95:88):(supports?75:controls?55:65)
    };
  }
  return result;
}

// ─── LAYER 3: AI ─────────────────────────────────────────────────────────────
function buildProfile(m, k, mod, name) {
  // Cross-reference personal Kua lucky/unlucky dirs with flying star activations
  const fs = m.flyingStars;
  const luckyDirs   = Object.values(k.lucky);
  const unluckyDirs = Object.values(k.unlucky);
  const fsAlerts = [];
  Object.entries(fs).forEach(([palace, starData]) => {
    if (palace === '_centerStar') return; // Skip the metadata field
    const annual = (starData as any).annual;
    if (!annual) return; // Skip if no annual star data
    const info = FLYING_STAR_INFO[annual];
    if (!info) return; // Skip if no info for this star
    if (info.nature==="dangerous" && luckyDirs.includes(palace))
      fsAlerts.push(`⚠️ Star 5 (misfortune) lands in your ${palace} lucky direction in 2026`);
    if (info.nature==="afflicted" && annual===2 && unluckyDirs.includes(palace))
      fsAlerts.push(`Star 2 (illness) reinforces your ${palace} unlucky direction in 2026`);
    if (info.nature==="auspicious" && annual===8 && luckyDirs.includes(palace))
      fsAlerts.push(`✨ Star 8 (wealth) activates your ${palace} lucky direction in 2026`);
    if (info.nature==="auspicious" && annual===9 && luckyDirs.includes(palace))
      fsAlerts.push(`✨ Star 9 (future luck) activates your ${palace} lucky direction in 2026`);
  });

  return {
    name:name||"Person", kua:m.kua, element:k.element, trigram:k.trigram, group:k.group, trait:k.trait,
    missing:m.missing, repeated:m.repeated, present:m.present,
    personalYear:m.personalYear, pyTheme:PY_THEMES[m.personalYear],
    yearElementModifier:mod,
    planes:m.planes,
    arrows:{present:m.arrows.present.map(a=>a.name), absent:m.arrows.absent.map(a=>a.name)},
    baZhai:{lucky:k.lucky, unlucky:k.unlucky},
    flyingStarAlerts: fsAlerts,
    archetypes:m.present.concat(m.repeated).map(n=>NUM_ARCHETYPE[n]),
  };
}

function buildSystemPrompt(mode, lang, p1, p2, compat) {
  const li = lang==="hi"
    ? "Respond entirely in Hindi (Devanagari script). Mystical but clear Hindi."
    : "Respond in English.";
  return `You are a direct, psychologically sharp Feng Shui and Lo Shu numerology analyst. ${li}
You receive pre-computed data from three layers. Never recompute anything.

SINGLE MODE — 5 sections:
1. "🧠 Core Psychological Profile" — personality from planes and number archetypes. Shadow side included.
2. "⚡ Blind Spots & Weaknesses" — missing numbers and absent arrows as concrete psychological gaps. No softening.
3. "🔥 Innate Strengths" — present arrows, Kua element, trigram energy.
4. "🧭 Growth Directive" — one sharp behavioral instruction.
5. "📅 2026 Forecast" — weave personal year ${p1?.personalYear} theme, elemental modifier (${p1?.yearElementModifier?.tone}), Ba Zhai directions AND flying star alerts: ${JSON.stringify(p1?.flyingStarAlerts)}. Name specific life domains, risks, opportunities. Unlucky dirs to avoid: Jue Ming ${p1?.baZhai?.unlucky?.jueMing}, Liu Sha ${p1?.baZhai?.unlucky?.liuSha}. Be concrete.

COUPLE MODE — 6 sections:
1. "🧠 Individual Essences" — psychological type per person, dominant weakness in partnership.
2. "🔗 Core Alignment" — elemental dynamic, shared lucky directions, complementary strengths.
3. "⚡ Primary Friction Areas" — control dynamics, number gaps, shared unlucky directions ${JSON.stringify(compat?.sharedUnlucky)}.
4. "📅 Long-Term Outlook" — natural momentum or constant work? What breaks vs. sustains.
5. "🛠 Behavioral Advice" — 2–3 specific actions from their actual data.
6. "🔮 2026 Couples Forecast" — both personal years, both elemental modifiers, flying star alerts for each. Will 2026 pull them together or apart?

Rules: Use names. Honesty over comfort. 300–360 words total. Return valid JSON only: { sections:[{title,body}] }`;
}

// Accepts pre-built profiles (computed once in calculate()) so buildProfile is not duplicated
async function fetchNarrative(p1, p2, compat, mode, lang) {
  const payload = { mode, p1, ...(p2 && { p2, compatibility: compat }) };
  const resp = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system: buildSystemPrompt(mode, lang, p1, p2, compat),
      messages: [{ role: "user", content: JSON.stringify(payload) }],
    }),
  });
  const data = await resp.json();
  return data.narrative;
}

async function fetchFollowUp(question, chartContext, lang, history) {
  // Route expects { question, chartContext, lang, history } — no Claude API wrapper
  const resp = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, chartContext, lang, history }),
  });
  const data = await resp.json();
  return data.answer;
}

// ─── UI COMPONENTS ────────────────────────────────────────────────────────────
const ELEMS = {Wood:"🌿",Fire:"🔥",Earth:"🌍",Metal:"⚙️",Water:"💧"};

// Flying Star Grid — the centrepiece of this update
const FlyingStarGrid = memo(function FlyingStarGrid({ flyingStars }: { flyingStars: any }) {
  const natureColor = { auspicious:"#4ade80", afflicted:"#f59e0b", dangerous:"#f87171" };
  return (
    <div style={{background:"rgba(255,255,255,0.04)",borderRadius:16,padding:14}}>
      <div style={{marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:"bold",color:"#e2d9f3"}}>⭐ 2026 Annual Flying Stars</div>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginTop:2}}>
          Reigning Star {flyingStars._centerStar} · {YEAR_LABEL} — visiting stars overlaid on natal Lo Shu
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,maxWidth:270,margin:"0 auto"}}>
        {GRID_PALACE_LAYOUT.flat().map((palace,i)=>{
          const row=Math.floor(i/3), col=i%3;
          const natal=GRID_NATAL[row][col];
          const starData = flyingStars[palace] || { annual: natal };
          const annual = starData.annual || natal;
          const info=FLYING_STAR_INFO[annual];
          const col_=natureColor[info.nature];
          const isDangerous=info.nature==="dangerous";
          const isAusp=info.nature==="auspicious";
          return (
            <div key={palace} style={{
              borderRadius:11,padding:"8px 6px",
              background:isDangerous?"rgba(248,113,113,0.12)":isAusp?"rgba(74,222,128,0.07)":"rgba(245,158,11,0.08)",
              border:`1.5px solid ${col_}${isDangerous?"88":"44"}`,
              boxShadow:isDangerous?`0 0 12px rgba(248,113,113,0.25)`:"none",
              position:"relative"
            }}>
              {/* Danger badge */}
              {isDangerous&&<div style={{position:"absolute",top:4,right:4,fontSize:9,background:"#f87171",color:"#fff",borderRadius:4,padding:"1px 4px",fontWeight:"bold"}}>!</div>}
              <div style={{fontSize:9,color:"rgba(255,255,255,0.35)",textAlign:"center",marginBottom:3}}>{palace}</div>
              {/* Natal / Annual split */}
              <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:4,marginBottom:4}}>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:9,color:"rgba(255,255,255,0.3)"}}>natal</div>
                  <div style={{fontSize:17,fontWeight:"bold",color:"rgba(255,255,255,0.3)",lineHeight:1}}>{natal}</div>
                </div>
                <div style={{fontSize:9,color:"rgba(255,255,255,0.2)"}}>↗</div>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:9,color:col_}}>2026</div>
                  <div style={{fontSize:22,fontWeight:"bold",color:col_,lineHeight:1,
                    textShadow:isDangerous?`0 0 8px #f87171`:"none"}}>{annual}</div>
                </div>
              </div>
              <div style={{fontSize:9,color:col_,textAlign:"center",fontWeight:"bold",lineHeight:1.3}}>{info.theme}</div>
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div style={{display:"flex",justifyContent:"center",gap:14,marginTop:10,fontSize:10}}>
        <span style={{color:"#4ade80"}}>● Auspicious</span>
        <span style={{color:"#f59e0b"}}>● Afflicted</span>
        <span style={{color:"#f87171"}}>● Dangerous</span>
      </div>
      {/* Key afflictions callout */}
      <div style={{marginTop:10,display:"flex",gap:6,flexWrap:"wrap"}}>
        {[{star:5,label:"Star 5 · Misfortune",palace:"S",col:"#f87171"},{star:2,label:"Star 2 · Illness",palace:"W",col:"#f59e0b"},{star:3,label:"Star 3 · Conflict",palace:"Centre",col:"#f59e0b"}].map(({label,palace,col})=>(
          <div key={label} style={{background:`${col}18`,border:`1px solid ${col}44`,borderRadius:7,padding:"4px 8px",fontSize:10,color:col}}>
            {label} → {palace}
          </div>
        ))}
      </div>
      {/* Activations callout */}
      <div style={{marginTop:6,display:"flex",gap:6,flexWrap:"wrap"}}>
        {[{star:8,label:"Star 8 · Wealth",palace:"NE",col:"#4ade80"},{star:9,label:"Star 9 · Future Luck",palace:"NW",col:"#c084fc"},{star:1,label:"Star 1 · Career",palace:"SW",col:"#60a5fa"}].map(({label,palace,col})=>(
          <div key={label} style={{background:`${col}18`,border:`1px solid ${col}44`,borderRadius:7,padding:"4px 8px",fontSize:10,color:col}}>
            {label} → {palace}
          </div>
        ))}
      </div>
      {/* Remedy note */}
      <div style={{marginTop:10,background:"rgba(248,113,113,0.08)",borderRadius:8,padding:"8px 10px",fontSize:10,color:"rgba(255,255,255,0.5)",lineHeight:1.6}}>
        <span style={{color:"#f87171",fontWeight:"bold"}}>Remedies:</span> Suppress Star 5 (South) and Star 2 (West) with 6-rod metal windchimes or metal bowls. Activate Star 8 (NE) and Star 9 (NW) with lights, activity, or crystals.
      </div>
    </div>
  );
});

// Personal flying star cross-reference
const PersonFSCrossRef = memo(function PersonFSCrossRef({ kua, flyingStars, name, color }: { kua: any; flyingStars: any; name: string; color: string }) {
  const luckyDirs   = Object.values(kua.lucky);
  const unluckyDirs = Object.values(kua.unlucky);
  const alerts = [];

  Object.entries(flyingStars).forEach(([palace, starData])=>{
    if (palace === '_centerStar') return; // Skip metadata
    const annual = (starData as any).annual;
    if (!annual) return;
    const info = FLYING_STAR_INFO[annual];
    if (!info) return;
    if (info.nature==="dangerous" && luckyDirs.includes(palace))
      alerts.push({type:"warn",msg:`Star 5 hits your ${palace} lucky dir — avoid activating it this year`});
    if (info.nature==="auspicious" && [8,9,1].includes(annual) && luckyDirs.includes(palace))
      alerts.push({type:"good",msg:`Star ${annual} (${info.theme}) boosts your ${palace} lucky dir ✨`});
    if (info.nature==="afflicted" && annual===2 && unluckyDirs.includes(palace))
      alerts.push({type:"warn",msg:`Star 2 (illness) doubles your ${palace} unlucky dir — high-risk area`});
  });

  if (!alerts.length) return null;
  return (
    <div style={{marginTop:8}}>
      <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginBottom:5}}>{name} · Personal Star Crossings</div>
      {alerts.map((a,i)=>(
        <div key={i} style={{display:"flex",gap:6,alignItems:"flex-start",marginBottom:4,
          background:a.type==="good"?"rgba(74,222,128,0.07)":"rgba(248,113,113,0.07)",
          borderRadius:7,padding:"5px 8px"}}>
          <span style={{fontSize:11,marginTop:1}}>{a.type==="good"?"✦":"⚠"}</span>
          <span style={{fontSize:10,color:a.type==="good"?"#4ade80":"#fca5a5",lineHeight:1.5}}>{a.msg}</span>
        </div>
      ))}
    </div>
  );
});

// Lo Shu personal grid
const GRID_POS = [[4,9,2],[3,5,7],[8,1,6]];
const LoShuGrid = memo(function LoShuGrid({ counts, color = "#7c3aed" }: { counts: any; color?: string }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,width:192,margin:"0 auto"}}>
      {GRID_POS.flat().map(n=>{
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

const DIR_ANGLES={N:0,NE:45,E:90,SE:135,S:180,SW:225,W:270,NW:315};
const Compass = memo(function Compass({ lucky1 = {}, unlucky1 = {}, lucky2 = {}, unlucky2 = {} }: { lucky1?: any; unlucky1?: any; lucky2?: any; unlucky2?: any }) {
  const l1=new Set(Object.values(lucky1)),u1=new Set(Object.values(unlucky1));
  const l2=new Set(Object.values(lucky2)),u2=new Set(Object.values(unlucky2));
  // Flying star danger zones for 2026
  const fs2026Danger=new Set(["S","W"]);
  return (
    <div style={{position:"relative",width:210,height:210,margin:"0 auto"}}>
      <div style={{position:"absolute",inset:0,borderRadius:"50%",
        border:"1.5px solid rgba(255,255,255,0.08)",
        background:"radial-gradient(circle,rgba(139,92,246,0.08),rgba(0,0,0,0.4))"}}/>
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
        width:10,height:10,borderRadius:"50%",background:"#f59e0b",boxShadow:"0 0 10px #f59e0b"}}/>
      {Object.keys(DIR_ANGLES).map(d=>{
        const a=DIR_ANGLES[d]*Math.PI/180,r=80,x=105+r*Math.sin(a),y=105-r*Math.cos(a);
        const inL1=l1.has(d),inL2=l2.has(d),inU1=u1.has(d),inU2=u2.has(d),isDanger=fs2026Danger.has(d);
        const both=inL1&&inL2;
        const col=isDanger?"#f87171":both?"#4ade80":inL1?"#60a5fa":inL2?"#f59e0b":
                  (inU1||inU2)?"#f8717166":"rgba(255,255,255,0.12)";
        return (
          <div key={d} style={{position:"absolute",left:x-19,top:y-19,width:38,height:38,borderRadius:8,
            background:(inL1||inL2||isDanger)?`${col}22`:"transparent",
            border:`1.5px solid ${col}`,
            boxShadow:(inL1||inL2||isDanger)?`0 0 8px ${col}55`:"none",
            display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <div style={{fontSize:10,color:col,fontWeight:"bold"}}>{d}</div>
            {isDanger&&<div style={{fontSize:7,color:"#f87171",lineHeight:1}}>⭐5/2</div>}
          </div>
        );
      })}
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
          <div><div style={{fontSize:11,fontWeight:"bold",color:"#4ade80"}}>{a.name}</div><div style={{fontSize:10,color:"rgba(255,255,255,0.45)"}}>{ARROWS.find(x=>x.name===a)?.desc||""}</div></div>
        </div>
      ))}
      {arrows.absent.map((a,i)=>(
        <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:6}}>
          <span style={{fontSize:13,color:"#f87171",marginTop:1}}>✗</span>
          <div style={{fontSize:11,fontWeight:"bold",color:"#f87171"}}>{a}</div>
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

const YearModBadge = memo(function YearModBadge({ mod, element, name }: { mod: any; element: string; name: string }) {
  const toneColor={supported:"#4ade80",draining:"#f59e0b",empowered:"#c084fc",challenged:"#f87171",neutral:"#94a3b8"};
  const col=toneColor[mod.tone]||"#94a3b8";
  return (
    <div style={{flex:1,background:`${col}12`,border:`1.5px solid ${col}44`,borderRadius:12,padding:"10px 12px"}}>
      <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginBottom:4}}>{name} · {YEAR_LABEL}</div>
      <div style={{fontSize:11,color:col,fontWeight:"bold",marginBottom:4,textTransform:"capitalize"}}>{mod.tone} · {ELEMS[element]} {element} meets 🔥 Fire</div>
      <div style={{fontSize:11,color:"rgba(255,255,255,0.6)",lineHeight:1.5}}>{mod.advice}</div>
    </div>
  );
});

const BaZhaiTable = memo(function BaZhaiTable({ lucky, unlucky }: { lucky: any; unlucky: any }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4,marginTop:8}}>
      {Object.entries(lucky).map(([k,dir])=>(
        <div key={k} style={{display:"flex",justifyContent:"space-between",background:"rgba(74,222,128,0.07)",borderRadius:6,padding:"4px 8px"}}>
          <span style={{fontSize:9,color:"rgba(255,255,255,0.4)"}}>{(BAZHAI_LUCKY_LABELS as any)[k]}</span>
          <span style={{fontSize:9,color:"#4ade80",fontWeight:"bold"}}>{dir as string}</span>
        </div>
      ))}
      {Object.entries(unlucky).map(([k,dir])=>(
        <div key={k} style={{display:"flex",justifyContent:"space-between",background:"rgba(248,113,113,0.07)",borderRadius:6,padding:"4px 8px"}}>
          <span style={{fontSize:9,color:"rgba(255,255,255,0.4)"}}>{(BAZHAI_UNLUCKY_LABELS as any)[k]}</span>
          <span style={{fontSize:9,color:"#f87171",fontWeight:"bold"}}>{dir as string}</span>
        </div>
      ))}
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
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs]);

  const send=async()=>{
    const q=input.trim(); if(!q||busy) return;
    setInput("");
    setMsgs(m=>[...m,{role:"user",text:q}]);
    setBusy(true);
    try {
      const answer=await fetchFollowUp(q,chartContext,lang,historyRef.current);
      // Cap history to last 10 messages to prevent unbounded prompt growth
      const updated=[...historyRef.current,{role:"user",content:q},{role:"assistant",content:answer}];
      historyRef.current=updated.slice(-10);
      setMsgs(m=>[...m,{role:"assistant",text:answer}]);
    } catch(e){ setMsgs(m=>[...m,{role:"assistant",text:"Something went wrong. Try again."}]); }
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

const ElementRelation = memo(function ElementRelation({ e1, e2 }: { e1: string; e2: string }) {
  const sup=SUPPORTS[e1]===e2,ctrl=CONTROLS[e1]===e2,sup2=SUPPORTS[e2]===e1,ctrl2=CONTROLS[e2]===e1;
  let rel,col,desc;
  if(sup||sup2){rel="Supporting ✨";col="#4ade80";desc=sup?`${e1} feeds ${e2}`:`${e2} feeds ${e1}`;}
  else if(ctrl||ctrl2){rel="Controlling ⚡";col="#f59e0b";desc=ctrl?`${e1} controls ${e2}`:`${e2} controls ${e1}`;}
  else{rel="Neutral ~";col="#94a3b8";desc="Independent energies";}
  return (
    <div style={{display:"flex",alignItems:"center",gap:12,background:"rgba(255,255,255,0.05)",borderRadius:12,padding:12}}>
      <div style={{textAlign:"center"}}><div style={{fontSize:20}}>{ELEMS[e1]}</div><div style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>{e1}</div></div>
      <div style={{flex:1,textAlign:"center"}}>
        <div style={{color:col,fontWeight:"bold",fontSize:13}}>{rel}</div>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginTop:2}}>{desc}</div>
      </div>
      <div style={{textAlign:"center"}}><div style={{fontSize:20}}>{ELEMS[e2]}</div><div style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>{e2}</div></div>
    </div>
  );
});

const ScoreBar = memo(function ScoreBar({ score }: { score: number }) {
  const col=score>=85?"#4ade80":score>=70?"#60a5fa":score>=55?"#f59e0b":"#f87171";
  return (
    <div style={{marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
        <span style={{fontSize:12,color:"rgba(255,255,255,0.5)"}}>Compatibility Score</span>
        <span style={{fontWeight:"bold",color:col,fontSize:16}}>{score}%</span>
      </div>
      <div style={{height:8,borderRadius:8,background:"rgba(255,255,255,0.08)",overflow:"hidden"}}>
        <div style={{height:"100%",width:`${score}%`,borderRadius:8,background:`linear-gradient(90deg,${col}88,${col})`,transition:"width 1.2s ease"}}/>
      </div>
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
  const [result,setResult]=useState(null);
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
      const kua=kuaLayer(m1,m2);
      // Build profiles once — reused for AI narrative and chartCtx (no second buildProfile call)
      const prof1=buildProfile(m1,kua.p1,kua.mod1,m1.name);
      const prof2=m2?buildProfile(m2,kua.p2,kua.mod2,m2.name):null;
      const narrative=await fetchNarrative(prof1,prof2,kua.compat,mode,lang);
      setResult({m1,m2,kua,narrative,mode,lang,prof1,prof2});
    } catch(e){setError("Something went wrong. Please try again.");console.error(e);}
    setLoading(false);
  };

  const R=result;
  const k1c=R?KUA_DATA[R.m1.kua].color:"#7c3aed";
  const k2c=R&&R.m2?KUA_DATA[R.m2.kua].color:"#f59e0b";

  // Memoized — only recomputes when result changes, not on chat keystrokes
  const chartCtx=useMemo(()=>R?{
    mode:R.mode,
    p1:R.prof1,
    flyingStars2026:R.m1.flyingStars,
    ...(R.m2&&{p2:R.prof2,compat:R.kua.compat})
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

          {/* Flying Star Grid — shared for everyone, calculated once */}
          <FlyingStarGrid flyingStars={R.m1.flyingStars}/>

          {/* Personal Star Cross-Reference per person */}
          <div style={{background:"rgba(255,255,255,0.04)",borderRadius:16,padding:14}}>
            <div style={{fontSize:12,fontWeight:"bold",color:"#e2d9f3",marginBottom:4}}>🔀 Personal Star Crossings</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:8}}>How 2026 flying stars interact with your Ba Zhai directions</div>
            {[{m:R.m1,k:R.kua.p1,label:R.m1.name||"Person 1"},R.m2&&{m:R.m2,k:R.kua.p2,label:R.m2.name||"Person 2"}].filter(Boolean).map((p,i)=>(
              <PersonFSCrossRef key={i} kua={p.k} flyingStars={p.m.flyingStars} name={p.label} color={i===0?k1c:k2c}/>
            ))}
          </div>

          {/* Kua + Ba Zhai */}
          <div style={{display:"flex",gap:10}}>
            {[{m:R.m1,k:R.kua.p1,label:R.m1.name||"Person 1"},R.m2&&{m:R.m2,k:R.kua.p2,label:R.m2.name||"Person 2"}].filter(Boolean).map((p,i)=>(
              <div key={i} style={{flex:1,background:`linear-gradient(135deg,${p.k.color}18,rgba(255,255,255,0.03))`,
                border:`1.5px solid ${p.k.color}44`,borderRadius:16,padding:12}}>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginBottom:5}}>{p.label}</div>
                <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:6}}>
                  <div style={{width:40,height:40,borderRadius:9,background:`linear-gradient(135deg,${p.k.color},${p.k.color}88)`,
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,fontWeight:"bold",
                    boxShadow:`0 0 14px ${p.k.color}55`}}>{p.m.kua}</div>
                  <div>
                    <div style={{fontWeight:"bold",fontSize:13}}>Kua {p.m.kua} · {p.k.trigram}</div>
                    <div style={{fontSize:10,color:p.k.color}}>{ELEMS[p.k.element]} {p.k.element} · {p.k.group==="E"?"East":"West"}</div>
                  </div>
                </div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.45)",fontStyle:"italic",marginBottom:6}}>"{p.k.trait}"</div>
                <BaZhaiTable lucky={p.k.lucky} unlucky={p.k.unlucky}/>
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

          {/* Year Modifiers */}
          <div style={{display:"flex",gap:10}}>
            <YearModBadge mod={R.kua.mod1} element={R.kua.p1.element} name={R.m1.name||"Person 1"}/>
            {R.m2&&<YearModBadge mod={R.kua.mod2} element={R.kua.p2.element} name={R.m2.name||"Person 2"}/>}
          </div>

          {/* Elemental compat (couple) */}
          {R.m2&&(
            <div style={{background:"rgba(255,255,255,0.04)",borderRadius:16,padding:13}}>
              <div style={{fontSize:12,fontWeight:"bold",color:"#e2d9f3",marginBottom:10}}>⚗️ Elemental Relationship</div>
              <ElementRelation e1={R.kua.p1.element} e2={R.kua.p2.element}/>
              <div style={{marginTop:11}}>
                <ScoreBar score={R.kua.compat.score}/>
                <div style={{display:"flex",gap:10,flexWrap:"wrap",fontSize:10,color:"rgba(255,255,255,0.4)"}}>
                  <span>Group: <span style={{color:R.kua.compat.sameGroup?"#4ade80":"#f59e0b"}}>{R.kua.compat.sameGroup?"Same ✓":"Different"}</span></span>
                  {R.kua.compat.sharedLucky.length>0&&<span>Shared lucky: <span style={{color:"#4ade80"}}>{R.kua.compat.sharedLucky.join(" ")}</span></span>}
                  {R.kua.compat.sharedUnlucky.length>0&&<span>Shared avoid: <span style={{color:"#f87171"}}>{R.kua.compat.sharedUnlucky.join(" ")}</span></span>}
                </div>
              </div>
            </div>
          )}

          {/* Compass — flying star danger zones marked */}
          <div style={{background:"rgba(255,255,255,0.04)",borderRadius:16,padding:13}}>
            <div style={{fontSize:12,fontWeight:"bold",color:"#e2d9f3",marginBottom:4,textAlign:"center"}}>🧭 Ba Zhai + Flying Star Map</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",textAlign:"center",marginBottom:11}}>S and W marked ⭐ for 2026 afflicted stars</div>
            <Compass lucky1={R.kua.p1.lucky} unlucky1={R.kua.p1.unlucky}
                     lucky2={R.m2?R.kua.p2.lucky:{}} unlucky2={R.m2?R.kua.p2.unlucky:{}}/>
            <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:9,fontSize:10,flexWrap:"wrap"}}>
              <span style={{color:"#60a5fa"}}>● {R.m1.name||"P1"} lucky</span>
              {R.m2&&<span style={{color:"#f59e0b"}}>● {R.m2.name||"P2"} lucky</span>}
              {R.m2&&<span style={{color:"#4ade80"}}>● Shared lucky</span>}
              <span style={{color:"#f87171"}}>● Avoid / ⭐ Star affliction</span>
            </div>
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
