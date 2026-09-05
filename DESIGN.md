Design System Audit · Read-only findings
Numero — Design System Audit
No redesign proposed. This documents what exists today, with file references, so decisions can be made deliberately.
Headline finding: there are three parallel design systems in this codebase, and the one actually rendered to users (loshu.tsx + components/numerology/*) uses none of the other two consistently. A documented spec (DESIGN.md) and a Tailwind token layer (tailwind.config.js + globals.css) both exist, but most components bypass both and hardcode raw hex values and pixel numbers inline.
0. What's actually running
app/page.tsx renders loshu.tsx's default export directly — that 429-line file is the entire app shell (mode/language toggles, both person forms, calculate button, results). It imports and composes components from components/numerology/* and components/forms/PersonForm.tsx.

Separately, components/ui/ (Card, Button, Badge, Input) is a small Tailwind-variant component kit — but it's used in exactly one place in the whole app: DriverConductorCard.tsx imports Card but never renders it (dead import — the component builds its own <div> instead). PersonForm.tsx imports Input and Button but also never uses them — it hand-rolls its own <input>/<button> with inline styles instead. So the ui/ kit is effectively unused dead code today.

Third, DESIGN.md at the repo root is a detailed, well-written token spec (colors, type scale, spacing, shadows, component recipes) — but it reads as aspirational documentation, not a build artifact: its "Cosmic Void" gradient (#0f0720 → #1a0a3d → #0a1628) matches globals.css's --gradient-cosmic, but almost none of its other tokens (e.g. secondary: #f59e0b named "warning," font sizes, the card-padding: 14px unit) are referenced by class name or variable anywhere in the components read.

1. Colors
Not centralized. Three independent color definitions exist and disagree with each other:

tailwind.config.js — solar-500: #a855f7(!) is actually purple, mislabeled "solar," while leaf-500: #00f5d4 is cyan, not green. terra-500/600 are pink (#f472b6/#f15bb5).
globals.css CSS variables — a different palette: --color-solar-500: #f59e0b (actually gold, as the name implies), --color-leaf-500: #10b981 (actually green), --color-terra-500: #bfa094 (an earth tone, not pink). These variables are what loshu.tsx actually consumes (var(--color-mystic-500), etc.).
DESIGN.md — a third set again (secondary: #f59e0b, tertiary: #10b981), roughly matching globals.css but with different naming (primary/secondary/tertiary vs. solar/leaf/mystic).
So bg-solar-500 (Tailwind class, resolves purple) and var(--color-solar-500) (CSS variable, resolves gold) are both live in the codebase and mean opposite colors depending on which system a component happens to reach for.

On top of that, most components skip both systems and hardcode hex literally in JS. Observed inline hex values, by rough semantic role:

Purple/mystic: #a855f7, #7c3aed, #c084fc — used interchangeably as "the purple" across LoShuGrid.tsx:17, NumerologyDashboard.tsx:35, PersonForm.tsx:56, ChatPanel.tsx:58,125, NarrativeCard.tsx:32, PersonalYearCard.tsx:19. Near-duplicates of the same brand purple, never referencing one token.
Green/success: #4ade80 (DriverConductorCard.tsx:17, PersonalYearCard.tsx:15) vs. #34d399 (PartnershipScoreCard.tsx:96, PlaneBar.tsx:21) — two different greens used for the same "positive/success" meaning, never reconciled.
Amber/warning: #f59e0b (PersonalYearCard.tsx:16) vs. #fbbf24 (PartnershipScoreCard.tsx:96) — same ambiguity.
Red/error: #f87171 appears consistently (DriverConductorCard.tsx:19, PartnershipScoreCard.tsx:96, PersonalYearCard.tsx:17) — the one color that's actually stable across files.
Blue: #60a5fa (DriverConductorCard.tsx:18, PlaneBar.tsx:19).
One-offs with no reuse: #94a3b8 and #c084fc (both only in PersonalYearCard.tsx), #f472b6 (only in PlaneBar.tsx:20).
Additionally, alpha-suffixed template strings like ${color}18, ${color}44, ${color}55, ${color}66, ${color}77, ${color}88 appear directly in DriverConductorCard.tsx and LoShuGrid.tsx — opacity values chosen ad hoc per call site rather than as a defined alpha scale, even though DESIGN.md documents a clean text-alpha scale (90/70/50/40/30/20/10%) that isn't actually followed for anything but body text.

Recommendation flag (no action taken): pick one naming system, one hex per role, and delete the other two before any visual work — right now "solar" and "leaf" are landmines because their meaning flips between files.

2. Spacing
DESIGN.md documents a real 4px-based scale (4/8/16/24/32/48, plus a card-padding: 14px exception). In practice, components mix Tailwind's default spacing scale with arbitrary bracket values freely. Distinct spacing values actually observed in the components read:

2px  ·  3px  ·  4px (gap-1)  ·  6px (p-1.5)  ·  7px  ·  8px (gap-2 / p-2)  ·  10px (p-2.5)  ·  11px  ·  12px  ·  14px (p-3.5, "card-padding")  ·  16px (p-4 / gap-4)  ·  20px  ·  24px (p-6 / gap-6)  ·  32px (p-8 / gap-8)  ·  40px (mb-10 equivalents in gaps)  ·  48px (gap-12)

The dense info cards (PlaneBar, PlanetDayCard, RemediesCard, HealthCard, DriverConductorCard) consistently use Tailwind's p-3.5 (14px) as the outer card padding — this one convention actually holds across ~5 files. But nested spacing inside those same cards is inconsistent: mb-1, mb-1.5, mb-2, mb-2.5, mb-3 all appear as "space below a label," with no visible rule for which one applies where (e.g. DriverConductorCard.tsx uses mb-1, mb-1.5, and mb-2.5 for what look like the same kind of label-to-content gap in different spots).

The app shell in loshu.tsx is 100% inline style={{}} objects with raw px numbers (padding:"20px 16px", marginBottom:18, gap:8, borderRadius:10) — it doesn't touch Tailwind spacing utilities at all, so the "4/8/16" rhythm documented in DESIGN.md is being applied by eye there, not by scale.

3. Typography
Google Fonts are loaded twice — once via next/font/google in layout.tsx (Orbitron, Inter, JetBrains Mono, exposed as CSS variables) and again via an @import URL in globals.css:5 pulling the same three families from the Google Fonts CDN. Redundant, and the two loading paths could resolve to slightly different weight subsets.

DESIGN.md defines a clean 10-step type scale (display/headline-lg/md/title-lg/body-lg/md/sm/label-lg/md/sm/mono). None of the components read use these names. Instead, every text size is a raw Tailwind bracket value or inline px number, and the same visual "role" is styled differently depending on which file you're in:

Card micro-labels ("DRIVER", "Missing", section eyebrows) appear at 9px, 10px, and 11px across DriverConductorCard.tsx, NumerologyDashboard.tsx, PlaneBar.tsx, and PlanetDayCard.tsx — no single size for this repeated role.
Card titlestext-[12px] font-bold text-white/90 across PlaneBar, PlanetDayCard, RemediesCard, HealthCard — this one role is actually consistent.
Section headings vary widely: NumerologyDashboard.tsx:60 uses text-xl font-bold for a person-label heading, PartnershipScoreCard.tsx:102 uses text-2xl font-bold for its card title, and the app's own <h1> in loshu.tsx is set inline at fontSize:20,fontWeight:900 — three different sizes for what all read as top-level headings in their respective contexts.
Body/insight text ranges from text-[9px] (health advice, remedies detail) to text-sm/text-base (the dashboard's "inline insight strip") with many intermediate stops (10px, 11px, 12px, 13px) and no evident rule for which content gets which size.
The unused components/ui/ kit does reference the documented type roles somewhat (CardTitle uses font-retro text-lg font-bold) — but since that kit isn't rendered anywhere, it doesn't help.

4. Radii & shadows
Radii: rounded-organic (1.25rem/20px, defined once in tailwind.config.js) is the one radius token that's genuinely reused — it appears in PlaneBar, PlanetDayCard, RemediesCard, HealthCard, DriverConductorCard, NarrativeCard, PersonForm. That's a real win. But it coexists with untokenized arbitrary radii on nearby elements in the same files: rounded-xl (12px), rounded-2xl/rounded-3xl (16/24px), and bracket values like rounded-[32px] in ChatPanel.tsx:69 and md:rounded-[32px] — a one-off that duplicates the already-defined rounded-bio (2rem/32px) token instead of using it.

Shadows: tailwind.config.js defines three named glow shadows (glow-solar, glow-leaf, glow-mystic), each hardcoding its own rgba rather than deriving from a color variable, and DESIGN.md separately lists five (glow-primary, glow-secondary, glow-tertiary, glow-mystic, plus card-elevated, chat-bubble, soft-lg) with different rgba values again. In the components actually rendered, glow shadows are almost never referenced by class — they're written inline per component: 0 0 20px rgba(139,92,246,0.5) (PersonForm.tsx/ChatPanel.tsx, purple), 0 0 10px rgba(168,85,247,0.4) (loshu.tsx mode toggle), 0 0 16px ${color}55 (DriverConductorCard.tsx, parameterized). Same visual effect ("glowing purple halo"), at least four different literal rgba/alpha combinations.

5. Grid / layout
There's a genuine, consistently-applied layout idea in NumerologyDashboard.tsx: a 45%/55% desktop split (md:grid-cols-[45%_55%]) collapsing to one column on mobile, with numbered comment blocks marking five sections (Hero, Insights, Action, Timeline, Interactive) — this is the closest thing to a documented layout system in the codebase and it's followed within that one file.

Outside that file, layout logic is ad hoc per component:

PartnershipScoreCard.tsx uses its own flex-col md:flex-row + a separate grid-cols-1 md:grid-cols-2 nested grid for its breakdown/synergy panels — a different column convention than the dashboard's 45/55 split it sits above.
ComplementaryCard.tsx:50 introduces a three-step responsive grid (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3) not used anywhere else — the only place sm:/lg: grid breakpoints appear together in one rule.
The app shell (loshu.tsx) uses plain flexbox with inline gap values for its toggle rows and form row, unrelated to any grid system below it.
Section ordering within the dashboard (Hero → Insights → Action → Timeline → floating Chat) is fixed and doesn't vary by mode (single vs. couple) except for the Partnership card being prepended in couple mode — that part is consistent.

6. Responsive behavior
Breakpoints used: only Tailwind's default sm (640px), md (768px), and lg (1024px) — no custom breakpoints defined in tailwind.config.js. Usage is inconsistent in which breakpoint a given component chooses to switch at:

LoShuGrid.tsx:45 scales cell size at md: (90px → 110px).
ChatPanel.tsx:69 switches its own width at sm: (full-width-minus-margin → fixed 350px) — a different breakpoint than the grid uses for its own size change, even though both are "does this get bigger on a wider screen" decisions.
ComplementaryCard.tsx:50 uses all three (sm, then lg) in a single grid rule, skipping md entirely — a step pattern not seen elsewhere.
NumerologyDashboard.tsx standardizes on md: for every column/direction change in that one file (grid split, flex-row, order/col-start rules) — internally consistent, but again a different single breakpoint than ChatPanel's sm:.
Likely mobile issues (from reading, not measured in a live viewport):

ChatPanel.tsx is fixed bottom-6 right-6 with z-50, permanently floating over content — on a small phone viewport with the dashboard's own content also using bottom padding via section gaps, there's no reserved safe-area at the bottom, so the last dashboard section (Timeline: PersonalYearCard/HealthCard) can end up partially covered by the open 350px-tall chat panel with no scroll-margin accounting for it.
PartnershipScoreCard.tsx's circular score gauge is a fixed w-48 h-48 (192px) with no responsive size step at all — on narrow phones this is a large fixed-size circle next to text that does wrap, so the gauge doesn't scale down like LoShuGrid's cells do.
DriverConductorCard.tsx's Driver/Conductor number tiles are fixed w-[60px] h-[60px] with no md: variant, unlike the Lo Shu grid cells right next to them in the same dashboard column, which do get a mobile→desktop size step — an inconsistency in whether "number tile" sizing responds to viewport.
The app shell's top toggle row (mode + language pills) in loshu.tsx is a flat display:flex with inline flex:2/flex:1 ratios and no breakpoint logic — it will always keep both pill groups side by side, even at very narrow widths, since it's plain inline flex rather than a Tailwind responsive class.
Summary table
Area	Centralized?	Notes
Colors	No	3 conflicting palettes (Tailwind config, CSS vars, DESIGN.md); most usage is raw inline hex
Spacing	Partial	14px card padding holds; internal gaps (1–3) inconsistent; app shell is all raw inline px
Typography	No	Documented 10-step scale in DESIGN.md unused; same roles sized differently per file
Radii	Partial	rounded-organic genuinely reused; several one-off arbitrary radii alongside it
Shadows	No	Named tokens exist twice (Tailwind + DESIGN.md); real usage is inline rgba, 4+ variants for "purple glow" alone
Grid/layout	Partial	Dashboard's 45/55 split is a real, followed system; other components layout independently
Responsive	Partial	Only default sm/md/lg used, but which breakpoint gates what varies per component; a few fixed-size elements don't respond at all
Scope: read tailwind.config.js, globals.css, layout.tsx, DESIGN.md, loshu.tsx, components/ui/* (Card, Button, Input, Badge), components/forms/PersonForm.tsx, and 10 of 12 files in components/numerology/ (LoShuGrid, NumerologyDashboard, PartnershipScoreCard, ChatPanel, DriverConductorCard, PlaneBar, PlanetDayCard, RemediesCard, HealthCard; ComplementaryCard and NarrativeCard read partially via grep). Not read: ArrowsPanel.tsx, PersonalYearCard.tsx (grepped only), RepetitionCard.tsx, lib/numerology/* (pure logic, no styling). No changes were made to any source file.