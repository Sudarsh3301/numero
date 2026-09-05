# Unified Enhancement Plan — Couples Mode + Design System

Single entry point tying together the couples-mode refactor, the color-token consolidation, and the 6 UX polish items. Read this first; each section links to the file with full implementation detail.

## 1. Scope

- **Color/font token consolidation** — collapse the 3 conflicting color systems (Tailwind config, CSS vars, DESIGN.md) into one.
- **Couples mode restructure** — replace the two stacked full dashboards with a side-by-side comparison section + tabbed per-person detail.
- **6 UX enhancements** — summary strip, loading skeleton, responsive gauge, AI retry, grid entrance animation, icon badges.

## 2. Supporting files

| File | What it contains | Use it for |
|---|---|---|
| `unified-color-tokens.md` | Ready-to-paste replacement code for `globals.css` `:root`, `tailwind.config.js` colors/fonts/radii, `layout.tsx` font import, new `lib/theme.ts`, and the `DESIGN.md` rewrite | Task 1–4 below |
| `2026-09-05-ui-refactor-couple-mode.md` *(in your repo's `docs/superpowers/plans/`)* | Tasks 1–9, step-by-step: token swap, `LoShuGrid`/`PlaneBar` prop additions, new `CoupleComparison`/`PersonTabs` components, `loshu.tsx` wiring, `ChatPanel` enable | Task 5–9 below |
| `enhancements-addendum.md` | Tasks 10–15: the 6 UX enhancements, written to append after Task 9 in the plan above | Task 10–15 below |
| `Couples Mode Redesign.dc.html` | Live visual reference for the target couples-mode layout (Warm Gold Midnight theme) | Visual sign-off before/during Task 7–9 |
| `UX Enhancements Mockup.dc.html` | Live, interactive reference for all 6 enhancements (toggle skeleton, retry state, replay animation) | Visual sign-off before/during Task 10–15 |
| `Design System Audit.dc.html` | Original findings this whole plan responds to — file:line references for every inconsistency being fixed | Background / "why" reference |

## 3. Build order

1. **Tokens first** (`unified-color-tokens.md` → Plan Tasks 1–4). Nothing downstream should introduce a new hardcoded hex once this lands.
2. **Component primitives** (Plan Tasks 5–6): `LoShuGrid` `cellSize` prop, `PlaneBar` dual-bar props. Needed by both the comparison view and two of the six enhancements.
3. **Couples structure** (Plan Tasks 7–9): `CoupleComparison`, `PersonTabs`, wire into `loshu.tsx`, enable `ChatPanel` for couple mode.
4. **UX enhancements** (Addendum Tasks 10–15): can land in any order, independent of each other, but all assume Task 1–4's tokens exist.

## 4. Full task index

| # | Task | Source doc |
|---|---|---|
| 1 | Swap font + color vars in `globals.css` | unified-color-tokens.md → Plan Task 1 |
| 2 | Update `tailwind.config.js` colors/fonts/radii | unified-color-tokens.md → Plan Task 2 |
| 3 | Swap `Orbitron`→`Newsreader` in `layout.tsx` | unified-color-tokens.md → Plan Task 3 |
| 4 | Create `lib/theme.ts` (`PERSON_COLORS`) | unified-color-tokens.md → Plan Task 4 |
| 5 | `LoShuGrid.tsx`: add `cellSize` prop | Plan Task 5 |
| 6 | `PlaneBar.tsx`: add `planes2`/`color2` | Plan Task 6 |
| 7 | Create `CoupleComparison.tsx` | Plan Task 7 |
| 8 | Create `PersonTabs.tsx` | Plan Task 8 |
| 9 | Wire into `loshu.tsx`; enable `ChatPanel` for couples | Plan Task 9 |
| 10 | Single-mode summary strip | enhancements-addendum.md |
| 11 | Loading skeleton | enhancements-addendum.md |
| 12 | Responsive score gauge | enhancements-addendum.md |
| 13 | AI Insights retry | enhancements-addendum.md |
| 14 | Lo Shu grid entrance animation | enhancements-addendum.md |
| 15 | Number/icon badges on Personal Year & Health cards | enhancements-addendum.md |

## 5. Verification checklist (after all tasks)

- [ ] `grep -rn "Orbitron\|solar-\|leaf-\|terra-\|mystic-\|cosmic" .` in the repo returns nothing outside `node_modules`.
- [ ] `npx tsc --noEmit` clean.
- [ ] Couples mode: score card → comparison grid → tabs → single chat, no duplicate full-length dashboards.
- [ ] Single mode: summary strip visible above the fold, skeleton shows during calculation, gauge/animations/badges present.
- [ ] Visual spot-check against `Couples Mode Redesign.dc.html` and `UX Enhancements Mockup.dc.html`.
