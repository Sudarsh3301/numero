# UI Refactor — Couple Mode & Theme Tokens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify the colour/font tokens, add `lib/theme.ts` as single colour source, build `CoupleComparison` and `PersonTabs` components, wire them into the couple branch of `loshu.tsx`, and enable `ChatPanel` for couple mode.

**Architecture:** Token consolidation first (globals.css → tailwind.config.js → layout.tsx → lib/theme.ts), then component primitives (LoShuGrid cellSize, PlaneBar dual-bar), then new composite components (CoupleComparison, PersonTabs), then loshu.tsx wiring.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, React functional components with hooks.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `app/globals.css` | Swap font URL; replace `--color-*` vars with new palette |
| Modify | `tailwind.config.js` | Update `fontFamily.retro`; rename solar/leaf/terra aliases |
| Modify | `app/layout.tsx` | Swap Orbitron import → Newsreader |
| Create | `lib/theme.ts` | Single source of PERSON_COLORS |
| Modify | `components/numerology/LoShuGrid.tsx` | Add `cellSize` prop |
| Modify | `components/numerology/PlaneBar.tsx` | Add `planes2`/`color2` for dual-bar compare |
| Create | `components/numerology/CoupleComparison.tsx` | 4-card side-by-side comparison |
| Create | `components/numerology/PersonTabs.tsx` | Tab switcher for p1/p2 detail sections |
| Modify | `loshu.tsx` | Replace second NumerologyDashboard with CoupleComparison + PersonTabs; enable ChatPanel for couple |

---

### Task 1: Swap Font & Colour Tokens in globals.css

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Open the file and locate the @import line (line 5) and the `:root` block**

Current import to find:
```css
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
```

- [ ] **Step 2: Replace the @import with Newsreader**

```css
@import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
```

- [ ] **Step 3: Replace --color-* vars inside `:root` with the new palette**

Remove all existing `--color-solar-*`, `--color-leaf-*`, `--color-terra-*`, `--color-mystic-*`, `--color-cosmic-*`, `--color-deep-space`, `--color-nebula-dark`, `--color-starfield`, and gradient vars. Replace with:

```css
:root {
  --color-gold-400: #d4b06a;
  --color-gold-500: #c9a24b;
  --color-gold-600: #a8842e;
  --color-slate-blue-400: #7aadc8;
  --color-slate-blue-500: #5f8fae;
  --color-slate-blue-600: #456e8a;
  --color-success: #6fae7c;
  --color-warning: #d9a45c;
  --color-danger: #c97b6a;
}
```

- [ ] **Step 4: Verify the file looks right — no Orbitron mention, no old palette vars**

```bash
grep -n "Orbitron\|solar-\|leaf-\|terra-\|mystic-\|cosmic" app/globals.css
```
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css
git commit -m "style: swap Orbitron→Newsreader font, replace palette vars with gold/slate-blue tokens"
```

---

### Task 2: Update tailwind.config.js

**Files:**
- Modify: `tailwind.config.js`

- [ ] **Step 1: Update fontFamily.retro**

Find:
```js
'retro': ['Orbitron', 'sans-serif'],
```
Replace with:
```js
'retro': ['Newsreader', 'serif'],
```

- [ ] **Step 2: Add/rename colour aliases to match new palette**

In `theme.extend.colors`, add or replace the person aliases so they point to the new hex values:

```js
personA: {
  400: '#d4b06a',
  500: '#c9a24b',
  600: '#a8842e',
},
personB: {
  400: '#7aadc8',
  500: '#5f8fae',
  600: '#456e8a',
},
success: '#6fae7c',
warning: '#d9a45c',
danger:  '#c97b6a',
```

If the existing config has `solar`, `leaf`, `terra`, `mystic` keys, **remove them** so they don't shadow the new tokens.

- [ ] **Step 3: Verify no Orbitron or old key names remain**

```bash
grep -n "Orbitron\|solar\|leaf\|terra\|mystic" tailwind.config.js
```
Expected: no output (or only in comments you intentionally kept).

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.js
git commit -m "style: update Tailwind fontFamily retro→Newsreader; add personA/personB colour tokens"
```

---

### Task 3: Swap Font Import in layout.tsx

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Find the Orbitron import**

```ts
import { Orbitron, Inter, JetBrains_Mono } from 'next/font/google';
```

- [ ] **Step 2: Replace with Newsreader**

```ts
import { Newsreader, Inter, JetBrains_Mono } from 'next/font/google';
```

- [ ] **Step 3: Update the font instantiation**

Find:
```ts
const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  weight: ['400', '600', '700', '900'],
});
```
Replace with:
```ts
const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  style: ['normal', 'italic'],
  weight: ['300', '400', '500', '600', '700'],
});
```

- [ ] **Step 4: Update the body className reference**

Find every occurrence of `orbitron.variable` and replace with `newsreader.variable`. Find every occurrence of `--font-orbitron` in this file and replace with `--font-newsreader`.

- [ ] **Step 5: Update tailwind.config.js fontFamily.retro to use CSS variable**

In `tailwind.config.js`, change:
```js
'retro': ['Newsreader', 'serif'],
```
to:
```js
'retro': ['var(--font-newsreader)', 'serif'],
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors related to font imports.

- [ ] **Step 7: Commit**

```bash
git add app/layout.tsx tailwind.config.js
git commit -m "style: wire Newsreader next/font variable into layout and Tailwind config"
```

---

### Task 4: Create lib/theme.ts

**Files:**
- Create: `lib/theme.ts`

- [ ] **Step 1: Create the file**

```ts
export const PERSON_COLORS = {
  p1: '#c9a24b',
  p2: '#5f8fae',
} as const;

export type PersonKey = keyof typeof PERSON_COLORS;
```

- [ ] **Step 2: Update loshu.tsx to import from theme**

In `loshu.tsx`, find:
```ts
const k1c = "var(--color-mystic-500)";
const k2c = "var(--color-solar-500)";
```
Replace with:
```ts
import { PERSON_COLORS } from '../lib/theme';
// ...
const k1c = PERSON_COLORS.p1;
const k2c = PERSON_COLORS.p2;
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/theme.ts loshu.tsx
git commit -m "feat: add lib/theme.ts PERSON_COLORS; import in loshu.tsx replacing inline hex"
```

---

### Task 5: Add cellSize prop to LoShuGrid

**Files:**
- Modify: `components/numerology/LoShuGrid.tsx`

- [ ] **Step 1: Update the props interface**

Find:
```ts
interface LoShuGridProps {
  counts: Record<number, number>;
  color?: string;
  variant?: 'solar' | 'mystic' | 'leaf';
  onCellHover?: (num: number | null) => void;
  onCellClick?: (num: number) => void;
}
```
Replace with:
```ts
interface LoShuGridProps {
  counts: Record<number, number>;
  color?: string;
  variant?: 'solar' | 'mystic' | 'leaf';
  cellSize?: number;
  onCellHover?: (num: number | null) => void;
  onCellClick?: (num: number) => void;
}
```

- [ ] **Step 2: Destructure cellSize with default**

In the component function signature, add `cellSize = 90` to destructuring:
```ts
function LoShuGrid({ counts, color = "#a855f7", variant = 'mystic', cellSize = 90, onCellHover, onCellClick }: LoShuGridProps) {
```

- [ ] **Step 3: Replace hardcoded cell class with inline style**

Find the cell element that has:
```tsx
className="w-[90px] h-[90px] md:w-[110px] md:h-[110px] ..."
```
Replace the width/height part with an inline style:
```tsx
style={{ width: cellSize, height: cellSize, minWidth: cellSize }}
```
Keep all other classes (border, flex, text, animation, etc.) in the className.

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add components/numerology/LoShuGrid.tsx
git commit -m "feat(LoShuGrid): add cellSize prop, default 90; replaces hardcoded w-[90px]"
```

---

### Task 6: Add dual-bar support to PlaneBar

**Files:**
- Modify: `components/numerology/PlaneBar.tsx`

- [ ] **Step 1: Define the planes shape as a type alias (top of file)**

```ts
type PlanesData = {
  intellectual: number;
  emotional: number;
  practical: number;
  dominant: string;
  pct: {
    intellectual: number;
    emotional: number;
    practical: number;
  };
};
```

- [ ] **Step 2: Extend the props interface**

```ts
interface PlaneBarProps {
  planes: PlanesData;
  color?: string;
  planes2?: PlanesData;
  color2?: string;
}
```

- [ ] **Step 3: Update the component to accept the new props**

```ts
function PlaneBar({ planes, color = '#60a5fa', planes2, color2 = '#f59e0b' }: PlaneBarProps) {
```

- [ ] **Step 4: In the JSX, for each plane row render a second bar when planes2 is provided**

Each row currently renders one `<div>` bar. Add a second one conditionally:

```tsx
{(['intellectual', 'emotional', 'practical'] as const).map((plane) => (
  <div key={plane} className="flex flex-col gap-1 mb-2">
    <span className="text-xs capitalize opacity-70">{plane}</span>
    {/* Primary bar */}
    <div className="w-full bg-white/10 rounded-full h-2">
      <div
        className="h-2 rounded-full transition-all"
        style={{ width: `${planes.pct[plane]}%`, backgroundColor: color }}
      />
    </div>
    {/* Comparison bar */}
    {planes2 && (
      <div className="w-full bg-white/10 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all"
          style={{ width: `${planes2.pct[plane]}%`, backgroundColor: color2 }}
        />
      </div>
    )}
  </div>
))}
```

Note: Match this structure to whatever the existing JSX already does for bars — the key change is the conditional second bar and the `color`/`color2` props instead of hardcoded hex.

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add components/numerology/PlaneBar.tsx
git commit -m "feat(PlaneBar): add planes2/color2 props for side-by-side comparison bars"
```

---

### Task 7: Create CoupleComparison component

**Files:**
- Create: `components/numerology/CoupleComparison.tsx`

The component renders 4 cards side by side: Lo Shu grids, Missing/Strong numbers, Plane Balance dual-bars, Personal Year.

- [ ] **Step 1: Identify the profile shape by reading NumerologyDashboard**

The `profile` prop of `NumerologyDashboard` comes from `R.m1`/`R.m2`. Check `loshu.tsx` for the type of `R` (the calculate result). It should be something like `NumerologyProfile`. Note the exact type name and import path.

- [ ] **Step 2: Create the file**

```tsx
// components/numerology/CoupleComparison.tsx
import React from 'react';
import { PERSON_COLORS } from '../../lib/theme';
import LoShuGrid from './LoShuGrid';
import PlaneBar from './PlaneBar';

// Replace NumerologyProfile with the actual type from your codebase
// (check what type R.m1 is in loshu.tsx)
type Profile = Parameters<typeof import('./NumerologyDashboard').default>[0]['profile'];

interface CoupleComparisonProps {
  m1: Profile;
  m2: Profile;
  label1?: string;
  label2?: string;
}

export default function CoupleComparison({ m1, m2, label1 = 'Person 1', label2 = 'Person 2' }: CoupleComparisonProps) {
  return (
    <div className="w-full space-y-6">
      {/* Lo Shu Grids */}
      <section className="flex flex-col md:flex-row gap-6 justify-center items-start">
        <div className="flex-1 text-center">
          <h3 className="text-sm font-semibold mb-2" style={{ color: PERSON_COLORS.p1 }}>{label1}</h3>
          <LoShuGrid counts={m1.loShuCounts} color={PERSON_COLORS.p1} cellSize={44} />
        </div>
        <div className="flex-1 text-center">
          <h3 className="text-sm font-semibold mb-2" style={{ color: PERSON_COLORS.p2 }}>{label2}</h3>
          <LoShuGrid counts={m2.loShuCounts} color={PERSON_COLORS.p2} cellSize={44} />
        </div>
      </section>

      {/* Missing / Strong Numbers */}
      <section className="flex flex-col md:flex-row gap-6">
        {[{ profile: m1, color: PERSON_COLORS.p1, label: label1 }, { profile: m2, color: PERSON_COLORS.p2, label: label2 }].map(({ profile, color, label }) => (
          <div key={label} className="flex-1 rounded-lg border border-white/10 p-4">
            <h4 className="text-xs font-semibold mb-2" style={{ color }}>{label} — Missing/Strong</h4>
            <p className="text-xs opacity-70">Missing: {profile.missingNumbers?.join(', ') || '—'}</p>
            <p className="text-xs opacity-70">Strong: {profile.strongNumbers?.join(', ') || '—'}</p>
          </div>
        ))}
      </section>

      {/* Plane Balance */}
      <section className="rounded-lg border border-white/10 p-4">
        <h4 className="text-xs font-semibold mb-3 opacity-70">Plane Balance</h4>
        <PlaneBar
          planes={m1.planes}
          color={PERSON_COLORS.p1}
          planes2={m2.planes}
          color2={PERSON_COLORS.p2}
        />
        <div className="flex gap-4 mt-2 text-xs opacity-60">
          <span style={{ color: PERSON_COLORS.p1 }}>■ {label1}</span>
          <span style={{ color: PERSON_COLORS.p2 }}>■ {label2}</span>
        </div>
      </section>

      {/* Personal Year */}
      <section className="flex flex-col md:flex-row gap-6">
        {[{ profile: m1, color: PERSON_COLORS.p1, label: label1 }, { profile: m2, color: PERSON_COLORS.p2, label: label2 }].map(({ profile, color, label }) => (
          <div key={label} className="flex-1 rounded-lg border border-white/10 p-4 text-center">
            <h4 className="text-xs font-semibold mb-1" style={{ color }}>{label}</h4>
            <p className="text-xs opacity-60">Personal Year</p>
            <p className="text-3xl font-bold mt-1" style={{ color }}>{profile.personalYear ?? '—'}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
```

**Important:** The field names `loShuCounts`, `missingNumbers`, `strongNumbers`, `planes`, `personalYear` are guesses based on typical numerology profile shapes. Before saving, check the actual profile type (from `loshu.tsx` or the numerology engine) and use the correct field names.

- [ ] **Step 3: Verify the actual field names**

```bash
grep -n "loShu\|missing\|strong\|planes\|personalYear\|personalYearNum" loshu.tsx types.ts lib/numerology*.ts 2>/dev/null | head -40
```

Adjust field names in `CoupleComparison.tsx` to match what the real profile object contains.

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add components/numerology/CoupleComparison.tsx
git commit -m "feat: add CoupleComparison component — 4-card side-by-side Lo Shu/planes/year"
```

---

### Task 8: Create PersonTabs component

**Files:**
- Create: `components/numerology/PersonTabs.tsx`

PersonTabs renders a p1/p2 tab toggle. When a tab is selected, it shows the per-person detail cards (DriverConductorCard, ArrowsPanel, PlanetDayCard, RemediesCard, HealthCard, NarrativeCard) for that person.

- [ ] **Step 1: Check the existing props for the cards we'll render**

```bash
grep -n "^interface\|^type\|^function\|^export default" \
  components/numerology/DriverConductorCard.tsx \
  components/numerology/ArrowsPanel.tsx \
  components/numerology/PlanetDayCard.tsx \
  components/numerology/RemediesCard.tsx \
  components/numerology/HealthCard.tsx \
  components/numerology/NarrativeCard.tsx
```

Note the prop names for each card.

- [ ] **Step 2: Create the file**

Adapt prop names below to match what you found in Step 1. The example uses `profile` for all — verify each card.

```tsx
// components/numerology/PersonTabs.tsx
'use client';
import React, { useState } from 'react';
import { PERSON_COLORS } from '../../lib/theme';
import DriverConductorCard from './DriverConductorCard';
import ArrowsPanel from './ArrowsPanel';
import PlanetDayCard from './PlanetDayCard';
import RemediesCard from './RemediesCard';
import HealthCard from './HealthCard';
import NarrativeCard from './NarrativeCard';

// Use the same Profile type trick as CoupleComparison
type Profile = Parameters<typeof import('./NumerologyDashboard').default>[0]['profile'];

interface PersonTabsProps {
  m1: Profile;
  m2: Profile;
  label1?: string;
  label2?: string;
  lang?: string;
  narrative1?: string | null;
  narrative2?: string | null;
  narrativeLoading?: boolean;
  narrativeError?: string;
}

export default function PersonTabs({
  m1, m2,
  label1 = 'Person 1', label2 = 'Person 2',
  lang = 'en',
  narrative1, narrative2,
  narrativeLoading, narrativeError,
}: PersonTabsProps) {
  const [active, setActive] = useState<'p1' | 'p2'>('p1');
  const profile = active === 'p1' ? m1 : m2;
  const narrative = active === 'p1' ? narrative1 : narrative2;
  const color = active === 'p1' ? PERSON_COLORS.p1 : PERSON_COLORS.p2;
  const label = active === 'p1' ? label1 : label2;

  return (
    <div className="w-full">
      {/* Tab bar */}
      <div className="flex gap-2 mb-6">
        {(['p1', 'p2'] as const).map((key) => {
          const lbl = key === 'p1' ? label1 : label2;
          const clr = PERSON_COLORS[key];
          return (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                active === key
                  ? 'border-transparent text-white'
                  : 'border-white/20 text-white/50 hover:text-white/80'
              }`}
              style={active === key ? { backgroundColor: clr } : {}}
            >
              {lbl}
            </button>
          );
        })}
      </div>

      {/* Detail cards for active person */}
      <div className="space-y-4">
        <DriverConductorCard profile={profile} color={color} />
        <ArrowsPanel profile={profile} color={color} />
        <PlanetDayCard profile={profile} color={color} />
        <RemediesCard profile={profile} color={color} />
        <HealthCard profile={profile} color={color} />
        <NarrativeCard
          narrative={narrative ?? null}
          loading={narrativeLoading}
          error={narrativeError}
          color={color}
          lang={lang}
          label={label}
        />
      </div>
    </div>
  );
}
```

**Important:** After Step 1, adjust every card's prop names to what they actually accept. If a card does not accept `profile` + `color`, look at its actual interface and pass the correct fields.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Fix any prop-name mismatches found in Step 1.

- [ ] **Step 4: Commit**

```bash
git add components/numerology/PersonTabs.tsx
git commit -m "feat: add PersonTabs component — p1/p2 tab toggle for detail cards"
```

---

### Task 9: Wire CoupleComparison + PersonTabs into loshu.tsx; enable ChatPanel for couple mode

**Files:**
- Modify: `loshu.tsx`

- [ ] **Step 1: Add imports at the top of loshu.tsx**

```ts
import CoupleComparison from './components/numerology/CoupleComparison';
import PersonTabs from './components/numerology/PersonTabs';
```

- [ ] **Step 2: Find the couple branch — the second NumerologyDashboard render**

Look for a block that looks like:
```tsx
{R.m2 && (
  <NumerologyDashboard profile={R.m2} ... />
)}
```

- [ ] **Step 3: Replace it**

```tsx
{R.m2 && (
  <>
    <CoupleComparison
      m1={R.m1}
      m2={R.m2}
      label1={R.m1.name || 'Person 1'}
      label2={R.m2.name || 'Person 2'}
    />
    <PersonTabs
      m1={R.m1}
      m2={R.m2}
      label1={R.m1.name || 'Person 1'}
      label2={R.m2.name || 'Person 2'}
      lang={lang}
      narrative1={mode === 'couple' ? R.narrative : null}
      narrative2={null}
      narrativeLoading={narrativeLoading}
      narrativeError={narrativeError ?? undefined}
    />
  </>
)}
```

- [ ] **Step 4: Enable ChatPanel for couple mode**

Find the `chatProps` assignment. Currently it is gated on `mode === 'single'`:
```ts
chatProps={mode === "single" && R.archetypes ? { chartContext: chartCtx, lang, fetchFollowUp } : undefined}
```

Change to:
```ts
chatProps={R.archetypes ? { chartContext: chartCtx, lang, fetchFollowUp } : undefined}
```

This passes `chatProps` to the first `NumerologyDashboard` (Person 1) in both single and couple modes, so the ChatPanel floats for both.

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add loshu.tsx
git commit -m "feat: wire CoupleComparison+PersonTabs into couple branch; enable ChatPanel for couple mode"
```

---

## Self-Review

**Spec coverage check:**

| Spec item | Covered by |
|-----------|------------|
| globals.css: swap font URL (Newsreader, drop Orbitron) | Task 1 |
| globals.css: replace --color-* vars with new palette | Task 1 |
| tailwind.config.js: fontFamily.retro → Newsreader | Task 2 |
| tailwind.config.js: rename solar/leaf/terra | Task 2 |
| layout.tsx: swap Orbitron → Newsreader next/font | Task 3 |
| lib/theme.ts: PERSON_COLORS | Task 4 |
| CoupleComparison.tsx: Lo Shu grids, Missing/Strong, Plane Balance dual-bar, Personal Year | Task 7 |
| PersonTabs.tsx: tab state + per-person detail cards | Task 8 |
| LoShuGrid.tsx: cellSize prop | Task 5 |
| PlaneBar.tsx: planes2/color2 | Task 6 |
| loshu.tsx couple branch: replace second NumerologyDashboard | Task 9 |
| ChatPanel: fire for couple mode too | Task 9 |

**Placeholder scan:** Tasks 7 and 8 flag that profile field names must be verified with a grep before saving — explicit instructions are given. No TBD/TODO placeholders remain.

**Type consistency:** `PERSON_COLORS` from `lib/theme.ts` used consistently across Tasks 4, 7, 8. `Profile` type alias used identically in both CoupleComparison and PersonTabs. `cellSize` prop added in Task 5 and consumed in Task 7. `planes2`/`color2` added in Task 6 and consumed in Task 7.
