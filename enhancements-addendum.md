# Addendum — Task 10–15: UX Enhancements (append to `2026-09-05-ui-refactor-couple-mode.md`)

Builds on Tasks 1–9 (token consolidation + CoupleComparison/PersonTabs). Do these after Task 9 lands.

---

### Task 10: Summary strip in single mode

**Files:** Modify `components/numerology/NumerologyDashboard.tsx`

- [ ] Add a strip above the Hero section (before the LoShu grid grid-row), reusing the same Missing/Strong/Personal Year values already computed on `profile`:
```tsx
<div className="flex gap-6 flex-wrap items-baseline rounded-lg border border-white/10 px-5 py-4 mb-2">
  <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-newsreader)' }}>{label}'s Numbers</span>
  <span className="text-xs opacity-50">Missing <b style={{ color: 'var(--color-danger)' }}>{profile.missingNumbers?.join(' ') || '—'}</b></span>
  <span className="text-xs opacity-50">Strong <b style={{ color }}>{profile.strongNumbers?.join(' ') || '—'}</b></span>
  <span className="text-xs opacity-50">Personal Year <b style={{ color: 'var(--color-success)' }}>{profile.personalYear ?? '—'}</b></span>
</div>
```
Place it as the first child inside the `<section>` that currently starts with the hero heading, before the grid-template-columns wrapper.
- [ ] `npx tsc --noEmit`; commit: `feat(NumerologyDashboard): add early missing/strong/year summary strip`

---

### Task 11: Loading skeleton between submit and results

**Files:** Create `components/numerology/DashboardSkeleton.tsx`; modify `loshu.tsx`

- [ ] Create the skeleton component (shimmer via a `.om-skel` utility class added to `globals.css`):
```css
/* globals.css, @layer utilities */
.om-skel {
  background: linear-gradient(90deg, rgba(255,248,235,0.05) 25%, rgba(255,248,235,0.1) 37%, rgba(255,248,235,0.05) 63%);
  background-size: 400px 100%;
  animation: shimmer 1.4s ease infinite;
}
@keyframes shimmer { 0% { background-position: -200px 0; } 100% { background-position: 200px 0; } }
```
```tsx
// components/numerology/DashboardSkeleton.tsx
export default function DashboardSkeleton() {
  return (
    <div className="rounded-lg border border-white/10 p-5">
      <div className="om-skel h-4 w-32 rounded mb-4" />
      <div className="grid grid-cols-3 gap-1 mb-4" style={{ width: 150 }}>
        {Array.from({ length: 9 }).map((_, i) => <div key={i} className="om-skel h-11 w-11 rounded" />)}
      </div>
      <div className="om-skel h-3 w-4/5 rounded mb-2" />
      <div className="om-skel h-3 w-3/5 rounded" />
    </div>
  );
}
```
- [ ] In `loshu.tsx`, render it while `loading` is true and `result` is null (currently nothing renders in that gap):
```tsx
{loading && !R && <DashboardSkeleton />}
```
- [ ] Commit: `feat: add loading skeleton between submit and results`

---

### Task 12: Responsive score gauge

**Files:** Modify `components/numerology/PartnershipScoreCard.tsx`

- [ ] The gauge is currently a fixed `w-48 h-48` (192px) `<div>` with inline border widths. Replace the fixed size with a responsive Tailwind size + matching border width:
```tsx
<div className="w-28 h-28 md:w-42 md:h-42 rounded-full border-4 md:border-6 border-white/5 relative">
  <div className="absolute inset-0 rounded-full border-t-4 md:border-t-6 border-l-4 md:border-l-6 opacity-80"
    style={{ borderColor: scoreColor, transform: `rotate(${comp.score * 3.6 - 135}deg)` }} />
  <div className="text-2xl md:text-4xl font-bold" style={{ fontFamily: 'var(--font-newsreader)', color: scoreColor }}>{comp.score}%</div>
</div>
```
(Tailwind has no `w-42`/`border-6` by default — either add them to `tailwind.config.js` `theme.extend.spacing`/`borderWidth`, or use arbitrary values `w-[168px] md:w-[108px]` sized the other way — confirm which direction reads better against Task 3's config before committing.)
- [ ] Commit: `fix(PartnershipScoreCard): responsive gauge size, was fixed 192px`

---

### Task 13: AI Insights retry affordance

**Files:** Modify `components/numerology/NarrativeCard.tsx`; check the `onGenerate`/error prop wiring in `loshu.tsx`

- [ ] `NarrativeCard` already accepts `errorMessage` and shows static text on error. Add a retry button reusing the existing `onGenerate` prop:
```tsx
{errorMessage ? (
  <div className="text-center">
    <p className="text-sm opacity-50 mb-3">AI insights temporarily unavailable. Your chart above is unaffected.</p>
    <button onClick={onGenerate} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ backgroundColor: 'var(--color-gold-500)', color: '#1a1408' }}>
      Retry
    </button>
  </div>
) : ( /* existing generate / sections branches unchanged */ )}
```
- [ ] In `loshu.tsx`, `onGenerate` is currently a no-op (`console.log`). Wire it to actually re-invoke `fetchNarrative` with the same `prof1`/`prof2`/`mode`/`lang` args used in `calculate()` — extract that block into a small `regenerateNarrative()` function so both the initial call and retry share it.
- [ ] Commit: `feat(NarrativeCard): add retry button on generation failure; wire real retry handler`

---

### Task 14: LoShu grid entrance animation

**Files:** Modify `components/numerology/LoShuGrid.tsx`, `app/globals.css`

- [ ] Add keyframes to `globals.css`:
```css
@keyframes cellIn { from { opacity: 0; transform: translateY(6px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
```
- [ ] In `LoShuGrid.tsx`, give each cell a staggered delay based on its index in the flattened grid (`GRID_POS` flatten order, 9 cells):
```tsx
style={{
  ...existingStyle,
  animation: `cellIn 0.4s ease ${idx * 0.04}s both`,
}}
```
Requires switching the `.map` callback to receive `(n, idx)` instead of just `(n)`.
- [ ] Commit: `feat(LoShuGrid): stagger-fade cells in on mount`

---

### Task 15: Number/icon badges on Personal Year & Health cards

**Files:** Modify `components/numerology/PersonalYearCard.tsx`, `components/numerology/HealthCard.tsx`

- [ ] `PersonalYearCard`: wrap the existing title row with a leading badge showing the year number itself:
```tsx
<div className="flex gap-3 items-start">
  <div className="flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center text-xl font-bold"
    style={{ fontFamily: 'var(--font-newsreader)', backgroundColor: `${color}18`, border: `1px solid ${color}40`, color }}>
    {personalYear}
  </div>
  <div>{/* existing title + theme text */}</div>
</div>
```
- [ ] `HealthCard`: same pattern with a `🏥` emoji badge instead of a number (matches the mockup — keep it to the one emoji already used in the card's own title, don't introduce new icon styles elsewhere).
- [ ] Commit: `feat: add leading number/icon badges to PersonalYearCard and HealthCard`

---

## Self-Review

| Enhancement (mockup #) | Task |
|---|---|
| 01 Summary strip | 10 |
| 02 Loading skeleton | 11 |
| 03 Responsive gauge | 12 |
| 04 Retry affordance | 13 |
| 05 Entrance animation | 14 |
| 06 Icon badges | 15 |

All six reference the token names already established in Tasks 1–4 (`var(--color-*)`, `var(--font-newsreader)`, `PERSON_COLORS`) rather than reintroducing hardcoded hex — keeps the consolidation from Task 1–4 intact.
