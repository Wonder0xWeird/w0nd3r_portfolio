# DESIGN.md: w0nd3r.rune.love

Read this before any visual change. It holds the durable taste of the site: direction, tokens, type, light,
layout, motion, the perf budget, the **ban list** and the **rubric**. It was seeded (v2.0, 2026-10-12) from the
career repo's `research/SITE_DESIGN_PLAYBOOK.md` (§B.2, §B.3, §D.1–D.5, §D.7), which stays the research
record; this file evolves with the site. Tokens live in `app/globals.css` `:root`; this file explains them.

Process for every increment: tokens and a 10-line plan first, critique the plan against the ban list, build,
run `node scripts/shoot.mjs <url> shots/<version>`, read the crops, fix, then a separate critic scores the
screenshots against the rubric below. Log any new default the model reached for in the ban list.

---

## Direction: "night-lit slate, rune-fire gold"

The page is a slab of slate at night, lit by the rune stone. **Gold is light, not paint** (glows, links, one
primary button, ignited runes, never large fills). **Slate is material, not background** (grain, carved
edges, stone mid-tones). Cool moonlight provides the rim. The one bold thing is the stone and its light;
everything else is quiet, editorial and exact. Alignment: left-aligned text throughout. Centred only for the
play manifesto.

Phasing: v2.0 fonts + tokens + type + light + chrome cleanup + 3D gating (this seed). v2.1 hero recomposition
+ load sequence + mobile hero order (shipped with the one-menhir handoff, light below the hero and the
disclosure pass that brought mobile under 9,000 px). v2.2 sigil rail + proof/experience recomposition. v2.3 research band +
projects shelf + writing + play + threshold. v2.4 motion polish + perf/a11y hardening.

---

## Type (§D.1)

- **Display: Cormorant** (Google Fonts, variable wght 300–700, with italics), via `next/font` as
  `--font-display` (roman, preloaded) and `--font-display-italic` (italic, not preloaded; both share the
  family name, so `font-style: italic` on display text picks the real italic).
  - Use 300–400 at ≥ 3 rem and 500 at ≤ 2 rem. **Never 700 at display sizes**; Cormorant's bold is clumsy.
  - Tracking: −0.02 em at ≥ 6 rem, −0.01 em at 3–6 rem.
  - Its high contrast reads as carved inscription. Old-style figures for the *one* big figure.
- **Text/UI: Mona Sans** (variable wght 200–900), `--font-text`.
  - **The wdth axis is deliberately not loaded (v2.0):** it grows the latin woff2 from 40 kB to 98 kB and cost
    ~0.3 s of Lighthouse-mobile LCP. Meta is set apart by size, weight and `--text-3` instead. Revisit only
    if the perf budget has room.
  - `font-variant-numeric: tabular-nums` for dates and figures in meta.
- **No monospace labels.** If code ever appears, JetBrains Mono inside the code only.
- **Loading:** `next/font/google`, `display: swap`, adjusted fallbacks (default). Preload only Cormorant roman
  and Mona Sans. Budget ≤ 150 kB woff2 on first load.
- **Never** redefine the `--font-*` variables in CSS (the v1 bug). `scripts/shoot.mjs` asserts the computed
  h1/body families and that both faces report `loaded`.

| Token | Size (fluid, 390 → 1440) | Face / weight | Line-height | Use |
|---|---|---|---|---|
| `--step-display` | `clamp(3.75rem, 2rem + 8.5vw, 9.5rem)` | Cormorant 300 | 0.9 | Name only |
| `--step-5` | `clamp(2.5rem, 1.6rem + 3.6vw, 5rem)` | Cormorant 400 | 1.0 | Section titles, play manifesto |
| `--step-figure` | `clamp(3rem, 1.6rem + 4.2vw, 5.75rem)` | Cormorant 300, old-style figures, `--gold-200` | 0.95 | The one big figure ("2,416 of 2,593"). *Added in v2.0.* |
| `--step-4` | `clamp(1.9rem, 1.4rem + 1.6vw, 3rem)` | Cormorant 500 | 1.05 | Feature titles, pull quotes |
| `--step-3` | `1.75rem` | Cormorant 500 | 1.15 | Org/lab names, project names |
| `--step-2` | `1.375rem` | Cormorant 500 | 1.2 | List titles (writing, archive shelf). *Added in v2.0.* |
| `--step-2t` | `clamp(1.25rem, 1.05rem + 0.6vw, 1.5rem)` | Mona Sans 500 | 1.32, ≤ 23em | The hero lede: the middle step of 152 → 24 → 15 px. *Added in v2.1* |
| `--step-1` | `1.125rem` | Mona Sans 600 | 1.35 | Role titles |
| `--step-0` | `1.0625rem` (17 px) | Mona Sans 400 | 1.6, ≤ 66ch | Body |
| `--step--1` | `0.9375rem` (15 px) | Mona Sans 450, tabular | 1.45 | Meta (dates, places): two short lines, no "·" |

Display-to-body ratio ≈ 9× at 1440 and ≈ 3.5× at 390. `--step--1` is 15 px, not the playbook's 14 px: the
10-12 specimen found 14 px too faint.

---

## Color (§D.2)

Contrast computed (WCAG) against `--slate-950/900/850/800`. All text tokens are ≥ 4.5:1 on every surface;
`--gold-700` is for lines and decoration only.

```css
/* slate: the stone (cool blue-grey, hue ≈ 215–250) */
--slate-1000:#0b0e12; /* vignette / deepest shadow only */
--slate-950:#10141a;  /* page base ("night") */
--slate-900:#161b22;  /* sunken band */
--slate-850:#1d232c;  /* slab */
--slate-800:#252c37;  /* raised slab */
--slate-700:#323b48;  /* strong line, carved edge */
--slate-600:#46505e;  /* stone mid (2.3:1 vs base) */
--slate-500:#5d6876;  /* stone face, matches the 3D stone (3.3:1 vs base) */
/* ink: parchment text (warm) */
--ink-1:#efe9dc;      /* 15.3:1 on base */
--ink-2:#c9c4b8;      /* 10.6:1 */
--ink-3:#959ba5;      /*  6.6:1 (5.0:1 on slate-800) */
/* gold: rune-fire (light, not paint) */
--gold-50:#fff4d6;    /* hot core of glows */
--gold-200:#f7d98c;   /* ignited text, hover, focus ring (13.4:1) */
--gold-400:#e4b65a;   /* links, primary accent (9.8:1) */
--gold-500:#cf9c3f;   /* primary button fill (text #1a140a = 7.4:1) */
--gold-700:#8f6a2a;   /* rules, incised strokes; decorative only (3.75:1) */
--gold-900:#3d2d12;   /* glow shadow tint */
/* moonlight: cool rim */
--moon-300:#a9bdd6;   /* rim highlights, cool captions (9.6:1) */
--moon-500:#7f95b8;   /* rim light, matches the 3D fill light */
/* semantic */
--bg:var(--slate-950); --band:var(--slate-900); --slab:var(--slate-850); --slab-raised:var(--slate-800);
--line:rgb(169 189 214 / .12); --line-strong:var(--slate-700);
--text:var(--ink-1); --text-2:var(--ink-2); --text-3:var(--ink-3);
--accent:var(--gold-400); --accent-hot:var(--gold-200); --focus:var(--gold-200);
```

Usage rules:
- Gold ≤ ~8 % of the pixels of any viewport. Exactly one gold-filled button per viewport.
- Moonlight only on edges, rims and cool gradients.
- Never use pure #000 or #fff.
- `--slate-950` is a deliberate hued stone-at-night, not a tinted near-black stand-in. Lighting must visibly
  modulate it.

Other tokens (globals.css): radii `--r-btn: 2px`, `--r-slab: 6px`; spacing `--space-1…9`
(4 8 12 16 24 32 48 72 112 px); `--maxw: 1280px` content, `--gutter: clamp(16px, 4vw, 32px)`,
`--measure: 66ch`.

---

## Surfaces and light (§D.3)

1. **Page light**: one fixed layer behind the content (`.atmos` in `app/layout.tsx`, `z-index:-1`):
   **moonlight** wash from the top-left (`radial-gradient(50vmax 40vmax at 8% -6%, rgb(127 149 184 / .11),
   transparent 60%)`), an edge **vignette** toward `--slate-1000`, and, on pages without the stone, a torch
   spilling in from off-canvas.
   - **On `/` the torch belongs to the stone** (v2.1): `.stone__torch`, a 125×92 vmax radial (gold .20 at the
     centre, .11 at 32 %, .055 at 62 %) centred on the rune column. It is `position:absolute; z-index:-1`
     inside the hero, so it scrolls away with the stone (v2.0's viewport-pinned torch was light without a
     source below the hero). No ancestor of it may create a stacking context; `.hero` clips it horizontally
     with `overflow-x: clip` (never `hidden`).
   - **Below the hero every section has its own light** (v2.1): each sigil holds an ember (a faint gold
     drop-shadow) and casts a warm pool on the slate around its title (`.sectionHead::before`, static), and
     Research and Writing sit on a sunken `--band` slab with grain and inset edges (night / band / night).
2. **Grain**: one pre-rendered 128×128 tile (`public/textures/grain.png`, ~5.7 kB, generated by
   `scripts/make-grain.mjs`), fixed, `opacity ≈ .06`, `mix-blend-mode: overlay`, *under* the text. Slabs carry
   the grain at a slightly higher opacity so stone reads as stone.
3. **Slate slab** (replaces cards; radius 6 px; not every section gets one):
   ```css
   .slab{background:linear-gradient(180deg,rgb(255 255 255/.035),transparent 38%),var(--slab);
     border-radius:6px; border:1px solid var(--line);
     box-shadow:inset 0 1px 0 rgb(169 189 214/.16), inset 0 -1px 0 rgb(0 0 0/.45),
                0 1px 2px rgb(0 0 0/.35), 0 28px 56px -28px rgb(0 0 0/.75);}
   ```
4. **Pointer torchlight** (only `@media (hover:hover) and (pointer:fine)`): `.slab::before`
   `radial-gradient(320px circle at var(--mx) var(--my), rgb(228 182 90/.16), transparent 70%)` (v2.1; .10 at
   260 px was imperceptible), opacity 0 → 1
   on hover. One shared `pointermove` listener with rAF (`components/SlabLight.tsx`) writes `--mx/--my` on the
   hovered slab only.
5. **The stone** (v2.1). One menhir for both renderers: `lib/stone.ts` holds its deformation (asymmetric
   crown with a long chipped slope, slight lean, rough surface), camera, start yaw and rune slots;
   `scripts/stone-profile.mjs` projects that mesh and writes `components/hero/stone-profile.ts` (silhouette,
   facets, LARS strokes on the curved face), from which the SVG twin is drawn. Re-run it after any change
   to `lib/stone.ts`. Lit the same way in both: cool moonlight key from the upper left, rune-fire from the
   carving, the right flank in shadow; WebGL uses Neutral tone mapping so slate mid-tones keep their sRGB
   value. The halo, contact shadow, mist and motes are persistent layers outside the swapped body.
   **Handoff gate:** median face luminance SVG vs WebGL within ±12 % (`shoot.mjs`; v2.1: −0.5 % at 1440).
6. **Incised vs ignited runes.**
   - **Incised** (resting): `--gold-700` stroke with `filter: drop-shadow(0 1px 0 rgb(255 255 255/.06))
     drop-shadow(0 -1px 0 rgb(0 0 0/.6))`.
   - **Ignited** (in view, hover): `--gold-200` stroke with `drop-shadow(0 0 4px rgb(247 217 140/.7))
     drop-shadow(0 0 18px rgb(207 156 63/.35))`.
7. **Buttons.**
   - Primary: rectangular, 2 px radius, `--gold-500` fill, `inset 0 1px 0 var(--gold-200)` on top,
     `inset 0 -2px 0 #8f6a2a` on the bottom ("gilt"). Hover ignites the outer glow.
   - Secondary: a text link with a 1 px gold underline that thickens to 2 px and shifts offset on hover.
   - No pills anywhere. Chamfered variant (`clip-path` octagon) allowed on ≤ 2 elements.
   - Gold gradients and glows interpolate `in oklch` so they don't grey out midway.
8. **Imagery.** Duotone at rest (slate shadows → gold highlights) via CSS
   `filter: grayscale(1) sepia(.35) hue-rotate(-10deg) saturate(1.4) brightness(.85)`; full colour on
   hover/focus for project art; 6 px radius with an inner 1 px light border.

Test: "would it still feel premium with every decorative shadow removed?" Depth must come from the value
ladder and motivated light, not from shadows or washes.

---

## Sigils (one rune per section, with meaning)

Section sigils are incised (`components/CarvedRune.tsx`: dark cut, moonlit lower lip, `--gold-700` inlay)
and hang left of the section title. v2.2 enlarges them into the sticky sigil rail with captions.

| Where | Rune | Meaning |
|---|---|---|
| Brand, header | ᛚ Laguz | the L of LARS |
| Hero stone | ᛚᚨᚱᛊ | "LARS" |
| Hero motes (drifting off the stone) | ᛜ Ingwaz, ᚢ Uruz, ᛒ Berkano | seed, strength, growth |
| Proof | ᛖ Ehwaz | the horse: partnership and trust (the human-and-agent team in the feature). *v2.1, replacing Sowilo* |
| Experience | ᚱ Raidho | the journey |
| Research | ᛞ Dagaz | dawn: breakthrough |
| Projects | ᚠ Fehu | wealth: things made |
| Writing | ᚨ Ansuz | the word |
| Play (the one *ignited* rune below the hero) | ᚹ Wunjo | joy |
| Cottage door | ᛟ Othala | home |
| /writing: Dear Lambda, Poems, Musings, Art | ᚨ Ansuz, ᛚ Laguz, ᛉ Algiz, ᛟ Othala | word, flow, protection, home |

**Do not use Tiwaz (ᛏ, reads as "↑"), Kenaz (ᚲ, reads as "<") or Gebo (ᚷ, reads as "✕") as standalone
sigils:** in v2.0 they read as UI arrows/chevrons/close icons at every size and placement tried (inline,
large at the row end, faint behind the title, inside a small standing stone). The playbook's suggested map
(Tiwaz/Kenaz/Gebo) was changed for that reason. They are fine *inside* a word of runes (e.g. on the stone).

**Sowilo (ᛋ) appears only inside LARS** (it is the S), never as a standalone sigil or mote (v2.1): alone it
reads as a lightning bolt, and for some readers as the "sig" rune. Jera (ᛃ) was considered for Proof and
rejected untested: its two offset chevrons risk the same "<" reading that failed Kenaz.

---

## Layout (§D.4, target; later increments implement it)

12-col grid, 1280 px content, 24–32 px gutters.
- **Header.** Transparent over the hero, solidifying after 80 px of scroll (v2.4; v2.0 ships the solid
  fallback: `--slate-950` at 80 % + blur + bottom line). Brand = laguz rune + "Lars Crawford" in Cormorant
  500. The name stays visible at 390 (it hides only below 360 px, where it cannot fit); "Cottage" leaves the
  nav below 420 px. Nav links separated by spacing
  only.
- **Hero, "the stone"** (v2.1). ≤ 40 visible words. Name at `--step-display` on two lines, no suffix (the
  accessible name is "Lars Crawford"). One-sentence lede at `--step-2t`, then place as two meta lines. CTAs:
  **Résumé** (gold primary, shown only once `public/resume.pdf` exists; otherwise "Email me" is the primary),
  LinkedIn and GitHub as text links, and the address itself as visible text with a Copy button.
  **1440:** 6fr/6fr; the stone stage is `min(50vw, 740px)` (~670 px of menhir), bleeds up to 160 px past the
  container and rises toward the header; primary CTA bottom ≤ 700 px. **390:** the stone is a half-lit
  (.55), masked backdrop beside the name with its crown under the header; the lede starts below the last
  rune so no text crosses LARS; primary CTA bottom ≤ 600 px and the address in the fold.
- **Proof** (ᛖ Ehwaz). Asymmetric: one feature slab (Immortal Kinematics, the one big figure) + two slim
  slabs. 390: feature first.
- **Experience** (ᚱ Raidho). Org in Cormorant `--step-3`, meta in two quiet lines, stack as one `--text-3`
  comma line. v2.2: sticky rail, gold fuse, ≤ 2 bullets + `<details>`.
- **Research** (ᛞ Dagaz). Duotone micrographs; bibliography with a year column, no pills. v2.3: full-bleed
  specimen band, thesis pull quote.
- **Projects** (ᚠ Fehu). Featured pair as editorial columns, legacy work as a de-boxed archive shelf with
  duotone tiles. v2.3: alternating rows with video loops.
- **Writing** (ᚨ Ansuz). A typographic library, no cards, no garnish runes on its columns.
- **Length** (v2.1): ≤ 9,000 px at 390 and ≤ 8,500 at 1440 (`shoot.mjs` gates it). Disclose, never delete:
  the rest of a list goes behind a `<details>` whose summary names what and how many; elements hidden
  below 760 px must exist elsewhere on the page or on /writing.
- **Play.** Full-bleed band, the one centred section; `--step-5`, all one colour.
- **Threshold.** Contact + a quiet door-shaped (arched) cottage slab. The door is an object, so its plaque
  is centred: the one exception to left alignment besides play. Footer: LARS runes, links spaced, © line.

---

## Motion (§D.5)

Everything lives inside `@media (prefers-reduced-motion: no-preference)`; scroll-driven items also inside
`@supports (animation-timeline: view())`. **Default state = final state.**

| Moment | Technique | Timing | Reduced-motion / unsupported |
|---|---|---|---|
| Hero load (the one orchestrated moment, v2.1) | On the SVG stone: L-A-R-S strokes draw (`stroke-dashoffset`, 4 × 110 ms) then ignite (bloom); torch, halo and face firelight rise .35 → 1; the name rises 8 px (*transform only*); CTAs follow | ≤ 1.2 s, `cubic-bezier(.2,.7,.2,1)` | Static ignited runes. **h1 and lede never start at opacity 0** |
| SVG → WebGL handoff (v2.1) | Ready after 2 rendered frames at the SVG's pose; the canvas fades in over the still-opaque SVG; then the SVG retires | 350 ms | Never loads (SVG stays) |
| Stone sway (v2.1) | After the handoff: yaw ±0.3 rad around the start pose, 15 s period, eased in over 2.5 s (LARS always faces the visitor) | `useFrame` | Static stone |
| Stone ↔ scroll / pointer (later) | Yaw from scroll progress; runes brighten with proximity | rAF-coalesced | Static stone |
| Header solidify (v2.4) | `animation-timeline: scroll(root)` | 0–80 px | Solid header |
| Torch dims on scroll (v2.0; pages without the stone) | `animation-timeline: scroll(root)` on `.atmos__torch` opacity | 0–110vh | Static |
| Section sigils ignite (v2.2) | `animation-timeline: view()` incised → ignited | scroll-linked | Rendered incised |
| Experience fuse (v2.2) | `scaleY` on the rail rule | scroll-linked | Static gold-700 rule |
| Slab torchlight (v2.0) | `--mx/--my` pointer gradient (fine pointers only) | 150 ms fade | None |
| Links/buttons (v2.0) | Underline 1 → 2 px + offset; primary glow | 160 ms ease-out | Colour change only |
| Disclosure (v2.0) | `<details>` + `interpolate-size: allow-keywords` | 220 ms | Instant |

Never: fade-slide-up on every section, hover lift on every card, custom cursors, Lenis on `/`, GSAP (unless
budgeted). UI motion < 300 ms; long durations only for the one hero moment.

---

## Performance budget and loading policy (§D.7, gate)

| Budget | Target |
|---|---|
| First-load JS on `/` (gz) | **≤ 180 kB** |
| Lazy 3D chunk (gz) | ≤ 260 kB. Loaded only after LCP + idle **and** hero visible **and** not `saveData` **and** not reduced motion **and** WebGL. On coarse pointers / mobile UAs: only on first interaction (pointerdown/touch/key/wheel/scroll). The SVG stone (`StoneFallback`) is the designed first impression and the permanent fallback |
| Fonts | ≤ 3 preloaded woff2, ≤ 150 kB (Cormorant roman 35 kB + Mona Sans 40 kB preloaded). **Text on / stays inside the latin subset** (v2.1): a single ę/ą/Ṯ on the page pulls a 30 kB latin-ext file into the mobile critical path at VeryHigh priority, so / lists only latin-subset titles (the rest are on /writing). Note: `next build` on Windows emits no font preloads (Next 15.5 matches `/next-font-loader/` with forward slashes only), so local Lighthouse runs are slightly pessimistic; Vercel (Linux) builds preload correctly |
| Images | AVIF/WebP via `next/image`; no `unoptimized` GIFs (→ MP4/WebM, v2.3); below-fold lazy |
| LCP / TBT / CLS (Lighthouse mobile) | ≤ 2.0 s / ≤ 150 ms / ≤ 0.05 |
| Lighthouse mobile | Perf ≥ 90, A11y ≥ 95, BP ≥ 95 |
| Runtime | Animate only transform/opacity/filter on small layers; one rAF-coalesced pointer listener; canvas DPR ≤ 1.5, paused offscreen; never write custom properties on `<html>` at runtime (it restyles the whole document: the torch vars live on `.atmos`); never create a WebGL context before the 3D gate opens (the probe alone cost ~300 ms TBT). `content-visibility: auto` on sections was tried in v2.0 (+1 perf) and dropped: Lighthouse/axe hit-testing then saw the 1400 px placeholders overlap real content (false `target-size` failure, a11y 96) |

---

## Ban list (§B.2; extend whenever a new default shows up)

The site must not use:
- Inter/Roboto/Arial/system-ui/Space Grotesk as text faces.
- Georgia/Fraunces/Playfair as the display serif.
- Cream or off-white backgrounds.
- Purple/indigo gradients.
- Decorative gradient washes (all light must be motivated).
- Tracked ALL-CAPS eyebrows above every heading.
- "A · B · C" middle-dot meta strings.
- "→ ↗ ↓" glyphs on links and buttons. Use one external-link icon (`components/External.tsx`), only for
  off-site links.
- Italic accent words or a single coloured accent word in headlines.
- Numbered 01/02/03 labels (unless it is a real sequence).
- Monospace data labels.
- Pill-shaped buttons and pill tag clouds.
- Identical rounded cards with one radius and the same soft shadow (the "SaaS-card kit").
- Cards in the hero.
- A big-number + small-label stats row in the hero.
- Fade-and-slide-up on every section.
- Hover transitions on every card.
- Emoji icons.
- Smooth-scroll hijacking on `/`.

Added by this repo:
- "← back" / "next →" arrows in pagers and breadcrumbs: use "Previous" / "Next" labels.
- Repeating the same small rune as garnish (eyebrows, card corners, rules). One sigil per section, with
  meaning.

---

## Rubric (§B.3; score 1–5; 3 = competent, 4 = distinctive, 5 = award-level)

| # | Axis | 1 (fail) | 3 (competent) | 5 (award-level) |
|---|---|---|---|---|
| 1 | **First read** (5-second test at 1440 and 390) | Can't tell who/what; CTA hidden | Name, role and CTA findable | Who, what-now and the next action land in < 5 s at both widths; the hero is unmistakably *this* person |
| 2 | **Typography** | Fallback or default faces; flat scale | Intentional faces, sane scale | Type *is* the image: 3×+ jumps, deliberate weights, perfect measure and rhythm; faces verified loaded |
| 3 | **Color & light** (depth) | Value-flat; colour as paint | Coherent palette, some layering | Surfaces read as lit material; two-temperature light; gold behaves as light; no unmotivated gradients |
| 4 | **Composition** | One template rhythm repeated | Clear grid, consistent spacing | Asymmetry, scale contrast, full-bleed moments, varied section rhythm; mobile composed, not just stacked |
| 5 | **Identity & originality** | Template / AI defaults (count ban-list hits) | Some custom choices | A signature system (runes/slate/gold) used with meaning; zero ban-list hits; memorable tomorrow |
| 6 | **Motion & interaction** | None, or gratuitous | Tasteful hovers and focus | One orchestrated moment + meaningful scroll/hover response; full reduced-motion parity |
| 7 | **Content & credibility** (recruiter) | Walls of text, dead links | Skimmable, accurate | Headline-scannable story; evidence (numbers, papers, links) one glance deep; résumé ≤ 1 click, above the fold |
| 8 | **Craft & polish** | Misalignment, overflow, FOUT, broken states | Clean | Pixel-tight alignment, consistent spacing tokens, treated imagery, designed empty/fallback states |
| — | **Gate** (pass/fail) | — | — | Lighthouse mobile perf ≥ 90, a11y ≥ 95, BP ≥ 95; axe 0 serious/critical; first-load JS ≤ 180 kB gz on `/`; CLS ≤ 0.05; fonts verified loaded; no console errors; no 404s from CTAs |

**Ship threshold:** gate passes, mean ≥ 4.0, no axis < 3. **Award-level target:** mean ≥ 4.5 with
Typography, Color & light and Identity at 5. Weight Identity and Color & light ×1.5 when choosing between
variants.

---

## Gates: how to run them

```bash
node node_modules/next/dist/bin/next dev . -p 3200
node scripts/shoot.mjs http://localhost:3200 shots/<version>     # fonts, overflow, axe, console, shots
npm run build                                                     # first-load JS for /
node node_modules/next/dist/bin/next start -p 3201
CHROME_PATH="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" \
  npx -y lighthouse@12.8.2 http://localhost:3201 --chrome-flags="--headless=new" --output=json   # ×3, median
```

`scripts/shoot.mjs` exits non-zero on any gate failure and writes `report.json` next to the shots. On `/` it
also gates the primary-CTA bottom (≤ 600 px at 390, ≤ 700 at 1440), the hero's visible words (≤ 40), the page
height (≤ 9,000 / 8,500), SVG-vs-WebGL face luminance (±12 %), and that every internal link answers 200 with no
redirect (legacy mixed-case letter URLs: one 308); it saves real viewport frames (`-scroll-NN`) and the handoff
frames (`-handoff-1-svg/2-mid/3-webgl`). Its
`three=` field shows whether three.js was parsed before any interaction (it must be `false` on the 390
runs). `ROUTES=/,/writing node scripts/shoot.mjs …` limits the routes (in Git Bash prefix
`MSYS_NO_PATHCONV=1`, or "/" becomes a Windows path). `scripts/make-grain.mjs` regenerates the grain tile.
