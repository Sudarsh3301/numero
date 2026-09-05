# Unified color tokens — replaces the 3 conflicting systems

One palette, one name per hex, used everywhere. Paste these into the repo.

## `app/globals.css` — replace the `:root` block

```css
:root {
  /* surfaces */
  --color-void: #0b0a08;
  --color-surface: rgba(255,248,235,0.03);
  --color-surface-hover: rgba(255,248,235,0.06);
  --color-border: rgba(255,248,235,0.1);

  /* person accents (the only two "brand" colors) */
  --color-person-a: #c9a24b;   /* gold */
  --color-person-b: #5f8fae;   /* slate blue */

  /* semantic (one hex per meaning, no duplicates) */
  --color-success: #6fae7c;
  --color-warning: #d9a45c;
  --color-danger: #c97b6a;
  --color-info: #5f8fae;       /* reuses person-b hue, not a new color */

  /* text (alpha steps on one off-white, not a new color per level) */
  --color-text: #f2ede0;

  --gradient-void: linear-gradient(160deg, #100d09 0%, #181310 55%, #0b0a08 100%);
}
```

Delete the old `--color-cosmic-void`, `--color-deep-space`, `--color-nebula-dark`, `--color-starfield`, `--color-solar-*`, `--color-leaf-*`, `--color-terra-*`, `--color-mystic-*` and the 4 `--gradient-*` vars — nothing should reference them after migration.

## `tailwind.config.js` — replace `theme.extend.colors`

```js
colors: {
  void: '#0b0a08',
  'person-a': { DEFAULT: '#c9a24b', dim: 'rgba(201,162,75,0.13)', mid: 'rgba(201,162,75,0.28)' },
  'person-b': { DEFAULT: '#5f8fae', dim: 'rgba(95,143,174,0.13)', mid: 'rgba(95,143,174,0.28)' },
  success: '#6fae7c',
  warning: '#d9a45c',
  danger: '#c97b6a',
},
fontFamily: {
  display: ['Newsreader', 'serif'],
  body: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'],
},
borderRadius: {
  card: '14px',
  chip: '8px',
},
```

Delete `solar`, `leaf`, `terra`, `mystic-purple`, the `gradient-*` backgroundImage entries, `rounded-organic`/`rounded-bio`, and the `glow-*` boxShadows — replace any usage with the `-mid`/`-dim` alpha variants above (a soft `box-shadow: 0 0 16px var(--color-person-a)` inline where a glow is actually wanted, not a named token per accent).

## `app/layout.tsx`
Swap the `Orbitron` `next/font/google` import for `Newsreader` (weights 500/600/700/800), keep `Inter` and `JetBrains_Mono` as-is.

## New: `lib/theme.ts`
```ts
export const PERSON_COLORS = { p1: '#c9a24b', p2: '#5f8fae' } as const;
export const SEMANTIC = { success: '#6fae7c', warning: '#d9a45c', danger: '#c97b6a' } as const;
```
Import this in every component that currently hardcodes `#a855f7`, `#f59e0b`, `#f87171`, `#34d399`, `#fbbf24`, `#4ade80`, etc. (`LoShuGrid`, `DriverConductorCard`, `PlaneBar`, `PersonalYearCard`, `PartnershipScoreCard`, `PersonForm`, `ChatPanel`, `NarrativeCard` — the full list is in the earlier audit).

## `DESIGN.md`
Rewrite the front-matter `colors:` block to match the CSS vars above 1:1 (same hex, same names) so the doc stops being aspirational and starts being the actual source of truth. Delete `secondary`/`tertiary` naming in favor of `person-a`/`person-b`/`success`/`warning`/`danger`.
