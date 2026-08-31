---
name: Cosmic Numerology
colors:
  surface: "#050505"
  surface-dim: "#0a0a0f"
  surface-bright: "#0f0f0f"
  surface-container-lowest: "#050505"
  surface-container-low: "#0a0a0f"
  surface-container: "#0f0720"
  surface-container-high: "#1a0a3d"
  surface-container-highest: "#0a1628"
  on-surface: "#ffffff"
  on-surface-variant: "rgba(255,255,255,0.5)"
  inverse-surface: "#ffffff"
  inverse-on-surface: "#0a0a0f"
  outline: "rgba(255,255,255,0.1)"
  outline-variant: "rgba(255,255,255,0.2)"
  primary: "#a855f7"
  on-primary: "#ffffff"
  primary-container: "rgba(168,85,247,0.15)"
  on-primary-container: "#c084fc"
  secondary: "#f59e0b"
  on-secondary: "#ffffff"
  secondary-container: "rgba(245,158,11,0.15)"
  on-secondary-container: "#fbbf24"
  tertiary: "#10b981"
  on-tertiary: "#ffffff"
  tertiary-container: "rgba(16,185,129,0.15)"
  on-tertiary-container: "#34d399"
  error: "#f87171"
  on-error: "#ffffff"
  error-container: "rgba(248,113,113,0.1)"
  on-error-container: "#f87171"
  warning: "#fbbf24"
  on-warning: "#ffffff"
  success: "#34d399"
  on-success: "#ffffff"
  info: "#60a5fa"
  on-info: "#ffffff"
  background: "linear-gradient(135deg, #0f0720 0%, #1a0a3d 50%, #0a1628 100%)"
  on-background: "#ffffff"
  surface-variant: "#1a0a3d"
  text-primary: "rgba(255,255,255,0.9)"
  text-secondary: "rgba(255,255,255,0.7)"
  text-tertiary: "rgba(255,255,255,0.5)"
  text-muted: "rgba(255,255,255,0.4)"
  text-faint: "rgba(255,255,255,0.3)"
  text-ghost: "rgba(255,255,255,0.2)"
  text-dim: "rgba(255,255,255,0.1)"
  glow-primary: "rgba(168,85,247,0.5)"
  glow-secondary: "rgba(245,158,11,0.5)"
  glow-tertiary: "rgba(52,211,153,0.5)"
  glow-mystic: "rgba(241,91,181,0.5)"
typography:
  display:
    fontFamily: Orbitron
    fontSize: 30px
    fontWeight: "900"
    lineHeight: 36px
    letterSpacing: 0.02em
  headline-lg:
    fontFamily: Orbitron
    fontSize: 20px
    fontWeight: "700"
    lineHeight: 28px
    letterSpacing: 0.01em
  headline-md:
    fontFamily: Orbitron
    fontSize: 18px
    fontWeight: "700"
    lineHeight: 24px
    letterSpacing: 0.01em
  title-lg:
    fontFamily: Orbitron
    fontSize: 16px
    fontWeight: "600"
    lineHeight: 22px
    letterSpacing: 0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: "400"
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "600"
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: "600"
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: "600"
    lineHeight: 14px
    letterSpacing: 0.05em
  mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: "400"
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 0.75rem
  md: 1rem
  lg: 1.25rem
  xl: 1.5rem
  bio: 2rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  gutter: 16px
  margin: 24px
  card-padding: 14px
shadows:
  glow-primary: "0 0 20px rgba(168, 85, 247, 0.5)"
  glow-secondary: "0 0 20px rgba(245, 158, 11, 0.5)"
  glow-tertiary: "0 0 20px rgba(52, 211, 153, 0.5)"
  glow-mystic: "0 0 20px rgba(241, 91, 181, 0.5)"
  card-elevated: "0 4px 20px rgba(168, 85, 247, 0.5)"
  chat-bubble: "0 4px 15px rgba(139, 92, 246, 0.4)"
  soft-lg: "0 8px 32px rgba(0, 0, 0, 0.2)"
backdrop-blur:
  sm: 4px
  md: 12px
  lg: 20px
animation:
  pulse-slow: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite"
  float: "float 6s ease-in-out infinite"
  glow: "glow 2s ease-in-out infinite alternate"
  transition-fast: "all 0.2s ease"
  transition-base: "all 0.3s ease"
  transition-slow: "all 1s ease-out"
components:
  card-default:
    backgroundColor: "rgba(255, 255, 255, 0.04)"
    borderColor: "rgba(255, 255, 255, 0.1)"
    borderWidth: "1px"
    rounded: "{rounded.lg}"
    padding: "{spacing.card-padding}"
    backdropBlur: "{backdrop-blur.sm}"
    transition: "{animation.transition-base}"
  card-solar:
    backgroundColor: "rgba(245, 158, 11, 0.1)"
    borderColor: "rgba(245, 158, 11, 0.3)"
    rounded: "{rounded.lg}"
    padding: "{spacing.card-padding}"
  card-leaf:
    backgroundColor: "rgba(52, 211, 153, 0.1)"
    borderColor: "rgba(52, 211, 153, 0.3)"
    rounded: "{rounded.lg}"
    padding: "{spacing.card-padding}"
  card-mystic:
    backgroundColor: "rgba(168, 85, 247, 0.1)"
    borderColor: "rgba(168, 85, 247, 0.3)"
    rounded: "{rounded.lg}"
    padding: "{spacing.card-padding}"
  button-primary:
    backgroundColor: "linear-gradient(135deg, #a855f7, #f59e0b)"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.bio}"
    padding: "12px 0"
    shadow: "{shadows.glow-primary}"
    transition: "{animation.transition-base}"
  button-primary-hover:
    shadow: "0 4px 20px rgba(168, 85, 247, 0.6)"
    scale: "1.02"
  button-ghost:
    backgroundColor: "rgba(255, 255, 255, 0.1)"
    textColor: "{colors.on-surface}"
    borderColor: "rgba(255, 255, 255, 0.2)"
    rounded: "{rounded.bio}"
    padding: "8px 16px"
    transition: "{animation.transition-base}"
  button-ghost-hover:
    backgroundColor: "rgba(255, 255, 255, 0.15)"
  input-field:
    backgroundColor: "rgba(255, 255, 255, 0.05)"
    textColor: "{colors.on-surface}"
    borderColor: "rgba(255, 255, 255, 0.1)"
    borderWidth: "1.5px"
    rounded: "{rounded.DEFAULT}"
    padding: "7px 11px"
    fontSize: "13px"
    focusRing: "2px solid rgba(245, 158, 11, 0.5)"
    focusBorder: "rgba(245, 158, 11, 0.3)"
    transition: "{animation.transition-fast}"
  badge-success:
    backgroundColor: "rgba(52, 211, 153, 0.2)"
    textColor: "#34d399"
    borderColor: "rgba(52, 211, 153, 0.3)"
    rounded: "{rounded.full}"
    typography: "{typography.label-sm}"
  badge-warning:
    backgroundColor: "rgba(245, 158, 11, 0.2)"
    textColor: "#fbbf24"
    borderColor: "rgba(245, 158, 11, 0.3)"
    rounded: "{rounded.full}"
    typography: "{typography.label-sm}"
  badge-danger:
    backgroundColor: "rgba(248, 113, 113, 0.2)"
    textColor: "#f87171"
    borderColor: "rgba(248, 113, 113, 0.3)"
    rounded: "{rounded.full}"
    typography: "{typography.label-sm}"
  badge-info:
    backgroundColor: "rgba(168, 85, 247, 0.2)"
    textColor: "#c084fc"
    borderColor: "rgba(168, 85, 247, 0.3)"
    rounded: "{rounded.full}"
    typography: "{typography.label-sm}"
  chat-bubble-user:
    backgroundColor: "rgba(124, 58, 237, 0.35)"
    textColor: "{colors.on-surface}"
    rounded: "12px 12px 2px 12px"
    fontSize: "12px"
  chat-bubble-assistant:
    backgroundColor: "rgba(255, 255, 255, 0.05)"
    textColor: "{colors.on-surface}"
    borderColor: "rgba(255, 255, 255, 0.05)"
    borderWidth: "1px"
    rounded: "12px 12px 12px 2px"
    fontSize: "12px"
  grid-cell-present:
    borderWidth: "1px"
    borderStyle: "solid"
    backdropBlur: "{backdrop-blur.sm}"
    transition: "{animation.transition-base}"
  grid-cell-strong:
    borderWidth: "2px"
    borderStyle: "solid"
    backdropBlur: "{backdrop-blur.md}"
    shadow: "{shadows.glow-primary}"
    transition: "{animation.transition-base}"
  grid-cell-missing:
    backgroundColor: "rgba(0, 0, 0, 0.2)"
    borderStyle: "dashed"
    borderWidth: "1px"
    borderColor: "rgba(255, 255, 255, 0.2)"
    opacity: "0.6"
    transition: "{animation.transition-base}"
---

## Brand & Style

The design system evokes a **Cosmic Mystic** aesthetic—an interface that feels like peering into a starfield through frosted glass. The brand personality is spiritual yet precise, ancient yet futuristic. It draws from numerology's esoteric traditions and presents them through a lens of solarpunk-cyber mysticism: deep void backgrounds pierced by neon accents of purple, gold, and cyan.

The UI philosophy centers on **layered luminosity**. Every surface is translucent; nothing is fully opaque. Cards, panels, and controls float above an infinite cosmic gradient like holographic projections. The emotional response is meant to be awe mixed with clarity—complex mystical data made approachable through consistent glassmorphic containers and disciplined information hierarchy.

## Colors

The palette is anchored by an abyssal dark background that allows neon accents to radiate with maximum vibrancy.

- **Cosmic Void:** The canvas is a multi-stop gradient sweeping from `#0f0720` through `#1a0a3d` to `#0a1628`. Solid fallbacks include `#050505` and `#0a0a0f` for pure void areas.
- **Mystic Purple:** The primary spiritual accent (`#a855f7` family). Used for the main CTA, active states, Driver-Conductor highlights, and the floating chat orb. Glows at `rgba(168, 85, 247, 0.5)`.
- **Solar Gold:** The secondary warm accent (`#f59e0b` family). Used for selected toggles, strength indicators, year forecasts, and warning contexts. Glows at `rgba(245, 158, 11, 0.5)`.
- **Leaf Cyan:** The tertiary growth accent (`#10b981` family, extended to `#00f5d4`). Used for success states, favorable days, health advice, and supported states. Glows at `rgba(52, 211, 153, 0.5)`.
- **Terra Pink:** A surface-level romance accent (`#f472b6`, `#f15bb5`). Used sparingly for couple-mode highlights and mystic glow variants.
- **Semantic Palette:** Red (`#f87171`) for missing numbers, friction, and errors. Amber (`#fbbf24`) for warnings and partial support. Emerald (`#34d399`) for blessings and full support. Blue (`#60a5fa`) for thought/intellectual plane bars.
- **Text Luminance:** All text is white on the dark canvas, relying entirely on alpha modulation for hierarchy—`90%` for primary, `70%` for secondary, `50%` for tertiary, `40%` for muted labels, `30%` for faint metadata, `20%` for disabled/placeholder, and `10%` for decorative ghost numbers.

## Typography

The type system pairs a **sci-fi display face** with a **neutral humanist body face** to create tension between the mystical and the readable.

- **Display & Headlines:** `Orbitron` at weights 400–900. Used for the app title, section headers, dashboard labels, and large numerology numbers. Its geometric, spacecraft-like letterforms reinforce the cosmic theme. Tracking is set slightly wide (`0.01em`–`0.02em`) to let the letterforms breathe against the dark background.
- **Body & UI:** `Inter` at weights 300–700. Used for all paragraphs, card descriptions, form labels, and chat messages. Line heights are generous (`1.4`–`1.75`) to maintain readability on translucent cards where background gradients may show through.
- **Mono & Data:** `JetBrains Mono` at weights 400–600. Used exclusively for grid coordinates, small metadata tags, and technical labels (e.g., "DRIVER", "CONDUCTOR"). Its technical tone signals "computed data."
- **Scale Strategy:** The system operates at a relatively small scale (`9px`–`13px` for dense data cards, `16px`–`20px` for headlines) to fit the numerology dashboard's high information density. Font weight is increased by one notch on glass surfaces to counteract background visual noise.

## Layout & Spacing

The layout is **mobile-first and content-dense**, built for a single-scroll dashboard experience.

- **Grid:** CSS Grid with `1fr` to `2fr` asymmetric splits on desktop (`45% / 55%`), collapsing to a single column on mobile. The Lo Shu magic square sits in a `grid-cols-3` layout.
- **Rhythm:** A hybrid `4px` and `8px` base grid. Common gaps are `8px` (tight), `16px` (standard), `24px` (section), and `32px`–`48px` (major section breaks).
- **Containers:** No max-width outer shell; the cosmic background fills the viewport. Content clusters are centered with `max-w-6xl` and generous side margins (`px-4`).
- **Cards:** Internal padding is typically `14px` (`p-3.5`) for data-dense cards, `16px` (`p-4`) for narrative cards, and `24px` (`p-6`) for hero or interactive panels.
- **Floating Elements:** The chat panel is fixed to the bottom-right corner (`bottom-6 right-6`) with `z-50`, breaking the document flow as a persistent oracle-like companion.

## Elevation & Depth

Depth is achieved not through Material-style shadow steps, but through **light refraction, chromatic glow, and alpha layering** against the cosmic gradient.

- **Layer 0 (Void):** The background gradient itself. No blur, maximum depth.
- **Layer 1 (Standard Card):** `backdrop-filter: blur(4px–12px)` paired with `background: rgba(255, 255, 255, 0.04)`. A `1px` border at `rgba(255, 255, 255, 0.1)` defines the glass edge.
- **Layer 2 (Elevated/Hero):** `backdrop-filter: blur(12px–20px)` with `background: rgba(0, 0, 0, 0.2)` or `rgba(255, 255, 255, 0.05)`. These include the Partnership Score gauge and the Repetition Card.
- **Layer 3 (Interactive Focus):** Solid gradient fills (`linear-gradient(135deg, #7c3aed, #a855f7)`) for primary buttons and selected states. These sit at the top of the stack and emit chromatic glows (`box-shadow: 0 0 20px rgba(168, 85, 247, 0.5)`).
- **Glow System:** Every accent color has a corresponding glow shadow. When a state is active (selected toggle, filled grid cell, chat orb), the element emits a soft colored aura rather than lifting via a dark drop shadow.
- **Inner Light:** Selected gender toggles and active language switches use `box-shadow: 0 0 10px rgba(color, 0.4)` to feel backlit.

## Shapes

The shape language is **organic-futuristic**—soft enough to feel approachable, geometric enough to feel calculated.

- **Cards:** `1.25rem` (`rounded-organic` / 20px) is the default card radius. It is large enough to feel friendly but not so circular that it loses structural authority.
- **Buttons:** `2rem` (`rounded-bio` / 32px) for pill-shaped CTAs. The extreme rounding makes primary actions feel tactile and distinct.
- **Inputs:** `0.75rem` (12px) for form fields—slightly more restrained than cards to signal containment.
- **Grid Cells:** `0.75rem` (12px) for the 3×3 Lo Shu square cells, creating a cohesive tile pattern.
- **Chat Orb:** `9999px` (full circle) for the floating action button, making it instantly recognizable as an interactive beacon.
- **Badges:** `9999px` (full circle/pill) for status chips, keeping them compact and modern.
- **Asymmetric Chat Bubbles:** User messages use `12px 12px 2px 12px`; assistant messages use `12px 12px 12px 2px`. This subtle tail asymmetry creates conversational direction without traditional arrow tails.

## Components

### Glass Cards
The fundamental building block. Every data panel uses `bg-white/[0.04]`, `backdrop-blur-sm`, a `1px` border at `white/10`, and `rounded-organic` (`1.25rem`). Variants exist for Solar (gold tint), Leaf (cyan tint), and Mystic (purple tint), each shifting the background to `accent/10` and the border to `accent/30`. On hover, cards scale subtly (`hover:scale-[1.01]`) with a `300ms` transition.

### Buttons
Primary actions use a `135deg` gradient from Mystic Purple to Solar Gold, `rounded-bio`, and a purple glow shadow. Disabled states drop to `40%` opacity with `cursor: not-allowed`. Ghost buttons use `bg-white/10` with a `white/20` border and brighten to `bg-white/15` on hover. Loading states replace the gradient with a flat `accent/40` and remove shadows.

### Inputs & Forms
Text inputs use `bg-white/[0.05]`, `border-white/10`, and `rounded-lg`. On focus, a `2px` ring in Solar Gold at `50%` opacity appears. The Person Form container itself is a glass card with internal fields stacked at `7px` vertical gaps. Gender toggles are split-pill buttons inside the form, using the primary gradient when selected and `bg-white/[0.07]` when idle.

### Lo Shu Grid
The 3×3 numerology grid is the visual centerpiece. Each cell is `90px`–`110px` square. Missing cells are `bg-black/20` with dashed `white/20` borders at `60%` opacity. Present cells receive a tinted background at an alpha derived from occurrence count (`15`–`60` hex alpha). Strong cells (count > 1) gain a `2px` solid border in the theme color, `backdrop-blur-md`, and a colored glow shadow. The entire grid has a gentle `float` animation (`6s ease-in-out infinite`) so it hovers like a holographic artifact.

### Chat Panel
A fixed-position collapsible panel. Closed state: a `56px` circular purple-gradient orb with a chat icon. Open state: a `350px` wide glass container with `backdrop-blur-md`, `rounded-2xl` to `rounded-[32px]`, and a `shadow-2xl`. Message bubbles use asymmetric radii and distinct background tints (purple for user, near-transparent for assistant). The input field at the bottom mirrors the global input style but with a purple-gradient send button.

### Score Gauge
The Partnership Score uses a `192px` circular gauge with a `6px` track at `white/5`. The progress arc is a `6px` border-t/border-l in a semantic color (emerald, amber, or red) rotated by `score * 3.6 - 135` degrees. The percentage is displayed at `text-5xl` with a color-matched class and `drop-shadow-lg`.

### Narrative & Insight Cards
AI-generated insights are organized into titled sections with a `3px` left border in Mystic Purple and `pl-2` indentation. Each section title uses `font-bold` at `12px` in `white/90`. Body text is `12px` at `white/65` with `leading-relaxed`. The entire card uses the standard glass treatment.

### Status & Feedback
Error messages are centered text in `red-400` (`#f87171`). Inline insight strips use `bg-indigo-50/50` in light mode and `bg-indigo-900/20` in dark mode, with centered `font-medium` text. Loading states use `animate-pulse` with the text "✨ Consulting the stars…"
