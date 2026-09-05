here's the exact change list to hand to your codebase:

1. Tokens

globals.css: swap the @import font URL to add Newsreader, drop Orbitron; replace the --color-* vars with the new palette (gold #c9a24b, slate-blue #5f8fae, success #6fae7c, warning #d9a45c, danger #c97b6a).
tailwind.config.js: update fontFamily.retro → Newsreader; consider renaming solar/leaf/terra to something literal (personA/personB) since those names currently lie about their own hex values (per the audit).
layout.tsx: swap the Orbitron next/font/google import for Newsreader.
New file lib/theme.ts exporting PERSON_COLORS = { p1: '#c9a24b', p2: '#5f8fae' } — every component currently hardcodes its own purple/gold hex; import this instead so there's one source.
2. New components

components/numerology/CoupleComparison.tsx — takes m1, m2; renders the 4 side-by-side cards (Lo Shu grids, Missing/Strong, Plane Balance dual-bars, Personal Year). This replaces the second full NumerologyDashboard render.
components/numerology/PersonTabs.tsx — tab state (p1/p2) + renders the existing DriverConductorCard, ArrowsPanel, PlanetDayCard, RemediesCard, HealthCard, NarrativeCard for whichever person is selected (same components, just swap props instead of duplicating both dashboards).
3. Existing component tweaks

LoShuGrid.tsx: add a cellSize prop (default 90/110, pass 44 from CoupleComparison) instead of hardcoded w-[90px].
PlaneBar.tsx: add optional planes2/color2 props to draw the second bar per row, or split into PlaneBarCompare.tsx.
loshu.tsx: in the couple branch, replace the second <NumerologyDashboard profile={R.m2} .../> call with <CoupleComparison m1={R.m1} m2={R.m2} /> followed by <PersonTabs m1={R.m1} m2={R.m2} ... />.
ChatPanel.tsx mount condition in loshu.tsx: currently only fires when mode==="single" — change to fire for couple mode too, with chartCtx covering both profiles