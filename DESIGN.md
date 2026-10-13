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
disclosure pass that brought mobile under 9,000 px). v2.2 (shipped on `feat/front-door-v2-2`, the v2.1 critique's top three
fixes): a composed desktop fold, sections lit by their sigils (ignite on scroll, captioned; bands that read), and
the stone as neutral slate with real texture and incised runes; plus a craft sweep. v2.3 (shipped on
`feat/front-door-v2-3`, the v2.2 critique's top three): no headline sliced by any desktop fold, the stone
as night-lit riven slate with a quiet handoff, and craft sweep 2 (no h1 font flash, clean research plates,
one-line sigil captions). v2.4 (on `feat/front-door-v2-4`, the v2.3 critique's fixes 1 and 3): the fold
never slices the Proof title (one line on desktop, gated line by line at 19 sizes incl. MacBooks), the
brand and Proof title share the name's block face (gated on 5 cold loads), and the Proof feature carries
the agent-harness diagram with the slim slabs retired. v2.5 (on `feat/front-door-v2-5`, the v2.3 critique's
fix 2): the stone is one material in both renderers (a riven cleavage face, bedding on the edges only, and
the SVG twin's desktop face baked from the WebGL stone). v2.6 (on `feat/front-door-v2-6`, the v2.3
critique's §7 #4): the type/rhythm system. The sticky sigil rail breaks the seven identical section
headers, and Writing flows into Play as one band. v2.7 (on `feat/front-door-v2-7`): go-live readiness, not a
redesign: the résumé ships (the hero's primary becomes the gold "Résumé (PDF)"), GitHub leaves the hero,
every legacy URL answers, the site gets its metadata and share card (README "Legacy URLs", `lib/meta.ts`),
and the phone header fits every width (see Layout, "Header"). Still to come: research specimen band + projects media
+ threshold light; motion polish + perf/a11y hardening.

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
- **The name is the exception (v2.3):** `.name` uses `--font-display-name`, Cormorant with `display: block`,
  so the first frames never paint "Lars Crawford" in the heavier fallback and swap it mid-rise. It is
  `next/font/local` on `app/fonts/cormorant-latin-wght.woff2`, a byte-identical copy of the Google latin
  file, so it resolves to the same `/_next/static/media` URL (one download) under its own family name
  (`cormorantName`). Do **not** add a second `next/font/google` Cormorant instance for this: Next 15.5 names
  every instance "Cormorant", and the later `@font-face` (block) would win for all Cormorant text. Checked
  with frames every ~100 ms over 8 cold loads (5 plain, 3 throttled): 0 fallback frames (v2.2: 7 of 8).
- **So are the fold's other display words (v2.4):** the header brand and the Proof title use
  `--font-display-name` too (same face, no extra download), so the first frames show them in Cormorant
  or not at all; v2.3 painted them in the fallback serif and swapped them at ~400 ms. Titles below the
  fold stay on swap. `shoot.mjs` gates it (see Gates).
- **Never** redefine the `--font-*` variables in CSS (the v1 bug). `scripts/shoot.mjs` asserts the computed
  h1/body families and that both faces report `loaded`.

| Token | Size (fluid, 390 → 1440) | Face / weight | Line-height | Use |
|---|---|---|---|---|
| `--step-display` | `clamp(3.75rem, min(2rem + 8.5vw, 2rem + 13svh), 11rem)` | Cormorant 300 | 0.9 | Name only. Grows with height too (v2.2): 149 at 1440×900, 172 at 1920×1080, 65 at 390. Desktops ≤ 899 px tall use `11svh` (v2.3): 111 px at 1280×720, 116 at 1366×768, 120 at 1280×800, 127 at 1536×864 |
| `--step-5` | `clamp(2.5rem, 1.6rem + 3.6vw, 5rem)` | Cormorant 400 | 1.0 | Play manifesto, Contact; Proof's title on phones. *Since v2.6 no longer every section title* |
| `--step-figure` | `clamp(3rem, 1.6rem + 4.2vw, 5.75rem)` | Cormorant 300, old-style figures, `--gold-200` | 0.95 | The one big figure ("2,416 of 2,593"). *Added in v2.0.* |
| `--step-4` | `clamp(1.9rem, 1.4rem + 1.6vw, 3rem)` | Cormorant 500 (400 for section titles) | 1.05 | Feature titles, pull quotes; Proof's title on desktop (v2.4); the four rail-section titles (v2.6, max 15em) |
| `--step-3` | `1.75rem` | Cormorant 500 | 1.15 | Org/lab names, project names |
| `--step-2` | `1.375rem` | Cormorant 500 | 1.2 | List titles (writing, archive shelf). *Added in v2.0.* |
| `--step-2t` | `clamp(1.25rem, 1.05rem + 0.6vw, 1.5rem)` | Mona Sans 500 | 1.32, ≤ 23em | The hero lede: the middle step of 152 → 24 → 15 px. *Added in v2.1* |
| `--step-1` | `1.125rem` | Mona Sans 600 | 1.35 | Role titles |
| `--step-0` | `1.0625rem` (17 px) | Mona Sans 400 | 1.6, ≤ 66ch | Body |
| `--step--1` | `0.9375rem` (15 px) | Mona Sans 450, tabular | 1.45 | Meta (dates, places): two short lines, no "·" |

Display-to-body ratio ≈ 9× at 1440 and ≈ 3.5× at 390. `--step--1` is 15 px, not the playbook's 14 px: the
10-12 specimen found 14 px too faint.

**Section-title ladder (v2.6).** v2.5 set every section title at 77 px beside a 68 px sigil (the critique's
"header template ×7"). Now, at 1440: the name 149 px → Play and Contact 77 px (`--step-5`) → Proof and the
four rail sections 45 px (`--step-4`) → org/project names 28 px (`--step-3`) → body 17 px. In the rail
sections the scale moves to the rune: a 101 px incised sigil over a 45 px title (`shoot.mjs` gates rail
titles ≤ 0.7× Play's and rail sigils ≥ 1.5× their title). At 390: Proof, Play and Contact 40 px, rail
titles 30 px.

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
--bg:var(--slate-950); --band:#1a2029; /* v2.2: 1.13:1 on the base (slate-900 was 1.07:1, invisible) */ --slab:var(--slate-850); --slab-raised:var(--slate-800);
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
     centre, .08 at 32 %, .035 at 62 %; quieter in v2.2, now the stone's face carries its own warm spill)
     centred on the rune column. It is `position:absolute; z-index:-1`
     inside the hero, so it scrolls away with the stone (v2.0's viewport-pinned torch was light without a
     source below the hero). No ancestor of it may create a stacking context; `.hero` clips it horizontally
     with `overflow-x: clip` (never `hidden`).
   - **Below the hero every section has its own light** (v2.1, lit in v2.2): each sigil is the source.
     As its header scrolls into view the inlay ignites (gold-700 → gold-200, ember → `--ignited`) and the
     warm pool it casts on the slate around the title rises (`.sectionHead::before`, opacity .35 → 1;
     centre alpha .17, .06 at 48 %). Research, Writing and Play sit on a sunken `--band` slab (#1a2029,
     measured 1.14:1 against the night beside it) with grain at .14 and a .12 moonlit top edge
     (night / band / night).
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
   to `lib/stone.ts`. Lit the same way in both: moonlight key from the upper left, rune-fire from the
   carving, the right flank in shadow. The halo, contact shadow, mist and motes are persistent layers
   outside the swapped body.
   - **Material (v2.3): night-lit riven slate; v2.5: one material in both renderers.** v2.1 read as blue
     plastic; v2.2's neutral #7b7c7e with 900 uniform pits and white-noise relief read as studio-lit cast
     concrete; v2.3's hairlines over the whole face read as laminate or timber at 2x, ringing the crown.
     Now (all generated on a 512 px canvas in the lazy chunk):
     - albedo #5f6469 (blue-grey, hue ≈ 210) in bedding bands (anisotropic fbm 256×24 + 64×10 px) with a
       faint blue-grey/green-grey drift and each split layer a shade apart; the bands are generated
       axis-aligned and turned 8° (descending right) by the textures' UV rotation, so the tile still repeats;
     - **the face is the cleavage plane (v2.5):** relief (`bumpMap`, `bumpScale` 2.1) of five cleavage
       ledges on a slow field, each a sharp riser and a thinning plate that runs ~⅓ of its length and dies
       out by widening (masking it drew the mask's outline); hairline lamination at a fifth of v2.3's height
       and only in patches (~18 % of the tile); short grit along the bed; 220 power-law pits; satin roughness
       .62–.80. A riven ripple along the bed (two swells, 0.17 world units apart, wandering phase) lives in
       the **normals** of the front face: an 8-bit bump map cannot draw a 120–180 px swell (it tilts the
       normal by the height step per screen pixel), and displaced vertices made LARS wobble 2 px;
     - **bedding on the edges only (v2.5):** the sides and crown have a second material with full-strength
       lamination, drawn into the albedo too, rougher (.74–.96). Every face is mapped by deformed world
       position (`uv1`): the front's beds run straight at 8° and the crown cuts them; the crown's lines run
       straight across the top. Phones (< 861 px) get no lamination, no ripple and a third of the relief,
       so the stone that loads on the first touch is as smooth as the backdrop it replaces;
     - light: hemisphere 0.6 (sky #b9c2cc, warm-dark ground), the moon key at [-2.6, 3.2, 2.4] so the face
       grades top-left → bottom-right, a weak rim (#a2a8b0), the rune-fire point light inside the group;
       vertex colours sink the foot into its shadow below y −0.45 (to 0.62). Linear tone mapping, exposure 1.27.
   - **Runes are cut, not neon (v2.2, both renderers):** a moonlit lower lip offset down-right, a wider dark
     cut offset up-left, then a narrower fire with a softer glow, a thin .55 core and a .62 bloom (`GROOVE`
     in `lib/stone.ts` holds the shared widths and alphas).
   - **SVG twin (v2.5): the 3D stone, baked, from 861 px up.** `scripts/bake-stone.mjs` opens `/?bake=1`
     (development builds only) at 1920×1080, DPR 2, where the WebGL stone holds the handoff pose with its
     runes and fire light off, reads the canvas (its alpha is the silhouette) and writes
     `public/stone/face-1480.avif` (30 kB) and `face-740.avif` (13 kB), q60 4:4:4. Re-run it after any
     change to the slate or `lib/stone.ts`. `StoneFallback` has three layers: the drawn gradient face; the
     bake (`.stone__baked`, a CSS `image-set()` background inside `@media (min-width: 861px)`, so phones
     never request it; no preload, since React's hint rode Next's prefetch of / onto every desktop page);
     then the fire (.35, where the 3D fire light sits), the incised runes and the ignition. Over the bake
     the drawn foot, shoulder, flanks and rim (`.sf-drawn`) give way to the baked ones. Below 861 px the
     twin keeps its v2.3 palette (face #6b7076 → #53575d → #3d4147, flank #30353a → #1b1e22, crown #4a4f55
     → #33373c, foot shadow from 60 %, shoulder shade) and no texture. v2.3's `feTurbulence` bedding read
     as brushed metal and is gone. On desktop the bake is the LCP element, 150 ms after TTFB (the name
     was 195 ms).
   - The crown eases into the flank (`smooth(0.48, 1, h)`, segments 28×56×8): no shoulder seam in the sway.
   **Gates (`shoot.mjs`, desktop handoff frames):** median face luminance SVG vs WebGL within ±12 % and mean
   |difference| ≤ 5 (v2.3: −0.1 %, 4.7–4.9; v2.2 measured 7.0); WebGL face away from the runes hue 200–225,
   saturation .03–.07, L* 36–41 (v2.3: 219, .038, 38.8); hue 25–45° near them; flank saturation ≤ .12;
   face:flank ≥ 1.8:1; face vs page ≥ 2.3:1; key fall-off, upper-left / lower-right face ≥ 1.40 (1.48;
   v2.2 1.30); foot ≥ 28 % darker than mid-face (32 %; v2.2 23 %); high-pass σ 3–6 WebGL (3.9) and
   SVG/WebGL 0.75–1.3 (0.8); rune glow mean and p90 within ±3 % across the handoff. **v2.5 adds the
   pattern:** high-pass NCC of the SVG and WebGL face bands either side of LARS ≥ 0.6 (v2.4: 0.007; now
   0.86–0.90 at 1280/1366/1440/1920) and the face's lamination energy (line contrast along the bed over mean
   luminance) ≤ 0.6× the right flank's (v2.4: 1.25–1.65; now 0.46–0.53); a phone never requests the bake.
   v2.5 measures: MAD 2.7–3.1, hue 218, sat .038, L* 39.3, fall-off 1.50, foot 34 %, high-pass σ 3.1–3.5.
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
and hang left of the section title, in a fixed `--sigil-w` column (Proof, and every rail section on phones),
or stand in the sticky rail beside the body (Experience, Research, Projects, Writing from 861 px; v2.6, below).
**Captioned (v2.2; one line each since v2.3):** the rune's name sits under it, and from 1280 px its meaning
too (in the rail from 861 px) (`SIGIL_MEANING` in `lib/runes.ts`; Mona Sans 450, 13 px, 11 px below 861 px, `--text-3`,
`aria-hidden` like the rune), so Ehwaz never reads as a Latin "M". Captions never wrap; `justify-self:
safe center` keeps a wide one inside the container (it overhangs toward the title only, ≥ 13 px short of
it). Phones left-align the name under the sigil, inside the 16 px margin. Proof's Ehwaz ignites later
than the others (see Motion), so in the desktop fold it is an ember, not a lit drop cap.
Play's Wunjo carries the same caption in place of the old "My massive transformative purpose" kicker.

**The sticky sigil rail (v2.6).** Experience, Research, Projects and Writing no longer hang the sigil beside
the title: it stands in a rail beside the section's body (`SigilRail` in `app/page.tsx`, `.rail*` in
`home.module.css`). The rune is drawn from `lib/runes.ts` strokes (`CarvedRune fit`: the box is cropped to
the rune's width, so the rune and its left-aligned name-and-meaning caption share one left edge), 64–112 px
tall (`--rail-sigil: clamp(64px, 7vw, 112px)`, 101 px at 1440). From 861 px the rail is `position: sticky`
(top: header + `clamp(24px, 5svh, 48px)`) inside its own grid area, so it never crosses into the next
section: through a long section (Experience, Research) the sigil stays beside the reader and hands over to
the next sigil at the section's end. **Its light travels with it:** the warm pool that v2.2 hung behind the
title now hangs on the rail, so it lights the lines beside the rune as they pass. The rail sits at
`z-index: -1` (a sticky box is a stacking context painted above in-flow content, so at `auto` its pool
tinted the text); it holds no links. Below 861 px there is no rail: the sigil sits inline, left of the
title, as in Proof's header. Proof keeps its inline sigil (the fold gates fix its title) and Play its
centred Wunjo.

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
| Play (always ignited: the band's light comes from it) | ᚹ Wunjo | joy |
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
  500. The name stays visible at 390 (it hides only below 360 px, where it cannot fit); "Cottage" leaves the nav below 468 px. **Phones (v2.7, measured):**
  brand and links always fit between the gutters and the rune is never squeezed (until v2.7 flex-shrink drew
  it 0-9 px wide at 360-389 and 420-479 px, and at 420-429 px the nav overflowed the page); at 360-389 px the
  rune steps out so the name and three links fit, and at 360-371 px the header's gaps are 12 px. `shoot.mjs`
  gates every width from 320 to 440. Nav links separated by spacing
  only.
- **Hero, "the stone"** (v2.1). ≤ 40 visible words. Name at `--step-display` on two lines, no suffix (the
  accessible name is "Lars Crawford"). One-sentence lede at `--step-2t`, then place as two meta lines. CTAs:
  **Résumé** (gold primary, shown only once `public/resume.pdf` exists; otherwise "Email me" is the primary),
  LinkedIn as a text link (GitHub left the hero in v2.7, matching the résumé), and the address itself as visible text with a Copy button.
  **1440:** 6fr/6fr; the stone stage is `min(50vw, 740px)` (~670 px of menhir), bleeds up to 160 px past the
  container and rises toward the header; primary CTA bottom ≤ 700 px. **Composed fold (v2.2, ≥ 861 px):** the
  copy, not the stone or a min-height, sets the hero's height (no bottom padding); the stage's foot overlaps
  Proof's top padding (`margin-bottom: -clamp(120px, 16vw, 240px)`), Proof sits above the stone's light
  (`z-index: 1`, no background) with `padding-top: clamp(40px, 7svh, 80px)`. **The Proof title is one line
  on desktop (v2.4):** `--step-4` (43–48 px) from 861 px, its box hugging the words (`justify-self:
  start`), so it ends left of the stone's foot and every fold shows all of it or none of it (v2.3's
  two 77 px lines in an 8.6em box left line 2 sliced at 1440×900). The copy is unchanged; "Now, and
  before" (one line at `--step-5`) is proposed and awaits Lars. **Short desktops (v2.3):** ≤ 899 px tall the
  hero tightens by height (top padding `clamp(16px, 4svh, 40px)`, name on 11svh, stage ≤ 0.92 × the
  viewport below the header, foot `min(16vw, 240px, 26svh)`, CTA row by svh, Proof padding `clamp(40px,
  5svh, 48px)` so the email row ends ≥ 32 px above the title); ≤ 760 px
  the copy's own margins tighten; below 690 px the hero fills the fold so the title starts just below it.
  1440×900 and taller are unchanged. **Gate (`shoot.mjs`, every line since v2.4)** at 1280×720/800,
  1366×768/657, 1440×900, 1470×956/832, 1512×982/858, 1536×730/864, 1600×900, 1680×925, 1920×950/970/1080:
  every line box of the Proof title is whole in the fold with ≥ 16 px to spare, or the first is wholly
  below it; the empty fold below the email row is ≤ 140 px and the row ends ≥ 32 px above the title.
  (v2.2's "top ≤ height − 48" passed a first line cut in half; v2.3's line-1 gate passed line 2 sliced.) **390:** the stone is a half-lit
  (.55), masked backdrop beside the name with its crown under the header; the lede starts below the last
  rune so no text crosses LARS; primary CTA bottom ≤ 600 px and the address in the fold.
- **Proof** (ᛖ Ehwaz). One feature slab, standing alone (v2.4; the two slims restated Experience and
  Research and were the last SaaS-card partial): Immortal Kinematics, its harness diagram and the one big
  figure. **The harness diagram** (`components/HarnessDiagram.tsx`): an inline SVG drawn 1:1 (480 × 156,
  Mona Sans 13 px labels) of the real harness: lead (cold start) → briefs → three Opus subagents (own
  worktree) → diffs → verify gate (one command) → ship. Gold-700 1.5 px lines on carved nodes (a darker
  recess, 2 px radius); the verify gate is the one lit node. Facts only, from `content/projects.ts`; no
  numbers. `role="img"`, named by a visually hidden figcaption. ≥ 1200 px it fills the slab's top right
  with the figure under it (no top rule); 961–1199 px it follows the body in the left column; 600–960 px
  it stacks under the body; < 600 px it is hidden (it would shrink below ~11 px; the sentence above it
  says the same).
- **Section rhythm (v2.6).** Night: hero, Proof (inline sigil, one feature slab, full container width),
  Experience (rail). Band: Research (rail). Night: Projects (rail beside the featured pair; the archive
  shelf breaks out to the full container width, so the section changes width half-way). Band: Writing
  (rail) flowing into Play (centred, full-bleed, `--step-5`) as one band. Night: Contact. No two neighbours
  share a header: inline sigil + one-line title, rail + `--step-4`, centred rune + `--step-5`, portrait +
  `--step-5`.
- **The rail grid** (≥ 861 px): `--rail-w: clamp(112px, 12vw, 192px)` + `--rail-gap: clamp(24px, 3.5vw,
  56px)` (173 + 50 px at 1440), then the body (`minmax(0, 1fr)`: 1,057 px at 1440, 1,018 at 1280, 655 at
  861). The title sits at the top of the body column (x 303 at 1440), the rune's top on its cap height.
  **< 861 px:** the body's wrapper is `display: contents`; the sigil (36 px at 390, in a square box, name
  under it) takes column 1 of the title's row, the title column 2, and everything after the title spans
  both (the Writing lede hangs under its title). Gated: sticky, ≥ 16 px clear of the body, inside its
  section, engaged mid-section where the section is taller than the viewport; phones: not sticky, inline.
- **Experience** (ᚱ Raidho). Org in Cormorant `--step-3`, meta in two quiet lines, stack as one `--text-3`
  comma line. Org/role columns 3fr/9fr (v2.3; 4fr/8fr left a ~260 px dead gutter); beside the rail (v2.6)
  orgs start at x 344 and roles at x 630 at 1440. Still to come: gold fuse, ≤ 2 bullets + `<details>`.
- **Research** (ᛞ Dagaz). Duotone micrographs; bibliography with a year column, no pills. Beside the rail
  (v2.6) the columns are 1.5fr/1fr (1.75fr at full width left the papers ~190 px short of Honors; now
  ~170 px) and collapse to one column below 1101 px (was 961), where the plates form one row of four. The plates (v2.3)
  are square crops in `public/images/science/plates/` made by `scripts/crop-science.mjs` from the untouched
  originals: no SEM info bars, no "Mins" header or labels, no Blender axes or 3D cursor; the SEM's 1 mm
  bar is redrawn as a clean overlay (`.scaleBar`, shown where the tile is ≥ 150 px). Later: full-bleed
  specimen band, thesis pull quote.
- **Projects** (ᚠ Fehu). Featured pair as editorial columns beside the rail, legacy work as a de-boxed
  archive shelf with duotone tiles at the full container width (v2.6). Later: poster or loop media.
- **Writing** (ᚨ Ansuz). A typographic library beside the rail, no cards, no garnish runes on its columns;
  four columns from 1101 px, two below (was 961).
- **Length** (v2.1): ≤ 9,000 px at 390 and ≤ 8,500 at 1440 (`shoot.mjs` gates it). Disclose, never delete:
  the rest of a list goes behind a `<details>` whose summary names what and how many; elements hidden
  below 760 px must exist elsewhere on the page or on /writing.
- **Play.** Full-bleed band, the one centred section; `--step-5`, all one colour. **Joined to Writing
  (v2.6):** Writing's band loses its bottom edge and most of its bottom padding, Play its top margin, edge
  and inset shadow (v2.5 left a ~130 px strip of night between the two bands). Joined, Play's light is
  centred on Wunjo and spills up into Writing's last margin (centred on the band's top edge, with no edge
  to start on, it read as a lit rectangle).
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
| Section sigils ignite (v2.2, shipped) | Named `view-timeline: --head` on each `.sectionHead`; inlay `stroke` gold-700 → gold-200, sigil `filter` ember → `--ignited`, pool `opacity` .35 → 1; `animation-range: entry 15% cover 40%`, linear. Proof (v2.3): `entry 60% cover 45%`, so its Ehwaz enters the desktop fold as an ember. **Rail sections (v2.6):** the title's header (`.railHead`) declares `--head` and the grid hoists it (`timeline-scope`), so the rail, which is not its descendant, ignites on the same range | scroll-linked | **Rendered ignited** (the default rule is the final state; no `timeline-scope` support also leaves it lit) |
| Sigil rail (v2.6) | `position: sticky`: the sigil and its pool stay beside a long section and hand over at its end. Layout, not animation, so it is the same under reduced motion | scroll position | Same (sticky) |
| Experience fuse (v2.2) | `scaleY` on the rail rule | scroll-linked | Static gold-700 rule |
| Proof diagram (v2.4) | `components/DrawOnView.tsx` arms it after hydration if it is below the fold; when 40 % is in view (IntersectionObserver, once) the edges draw in sequence (`stroke-dashoffset`, `pathLength=1`): lead stem, briefs branching, diffs merging, into the gate; the gate lights gold-700 → gold-200, then the line to Ship | 820 ms, linear per stage | **Fully drawn, gate lit** (server render, no JS, already in view at hydration) |
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
| LCP / TBT / CLS (Lighthouse mobile) | ≤ 2.0 s / ≤ 150 ms / ≤ 0.05. Local Windows builds measure ~2.65 s (no font preloads, see Fonts); v2.3 is level with v2.2 in an interleaved A/B (2.65 vs 2.66 s). Watch the simulated critical path: when the hero SVG stopped referencing `/textures/grain.png`, its CSS-initiated request cost ~60 ms of simulated LCP, so the layout preloads it. `experimental.inlineCss` was tried in v2.3 and dropped (no local gain: 2.73 s). v2.4 is level with v2.3 locally (interleaved ×3: 2.65 vs 2.65 s, Perf 96 vs 96); first-load JS +0.45 kB gz (the diagram's draw trigger). v2.6 (the rail) adds no JS: first-load JS on / 117 kB, unchanged (the route chunk 5.52 → 5.6 kB); the home CSS grows 27.3 → 30.1 kB raw, 6.47 → 6.91 kB gz. Interleaved with v2.5 ×5 (local): Perf 96 vs 96, LCP 2.63 vs 2.66 s, TBT 8–14 ms, CLS 0. v2.7 (go-live) adds no client JS either: first-load JS on / 117 kB (route 5.59 → 5.6 kB); the document grows 0.9 kB gz (metadata, JSON-LD). Interleaved with v2.6 ×7 (local): Perf 96 vs 96, LCP 2.64 vs 2.64 s, TBT 18 vs 13 ms, CLS 0, A11y/BP/SEO 100. **No web manifest:** Lighthouse fetches a linked one before LCP and its simulation charged it ~30 ms of LCP (2.66 vs 2.63 s ×5), so v2.7 dropped it; home-screen installs are not worth that |
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
- One section-header template repeated down the page (v2.5: sigil + 77 px title ×7). Neighbouring
  sections differ in the scale or the position of their header (see Layout, "Section rhythm").

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

`scripts/shoot.mjs` exits non-zero on any gate failure and writes `report.json` next to the shots.
`VIEWPORTS="1440x900,1366x768,1280x720,1920x1080,390x844"` adds main-run sizes (default: 1440 and 390). On `/` it
also gates the primary-CTA bottom (≤ 600 px on phones, ≤ 700 at 1440×900 and 7/9 of the height on other
desktops), the hero's visible words (≤ 40), the page height (≤ 9,000 / 8,500), SVG-vs-WebGL face luminance (±12 %), and that every internal link answers 200 with no
redirect (legacy mixed-case letter URLs: one 308); it saves real viewport frames (`-scroll-NN`) and the handoff
frames (`-handoff-1-svg/2-mid/3-webgl`). v2.2 adds the critique's acceptance checks as gates: the desktop
folds (`home-fold-WxH.png`: since v2.3 the Proof title's first line whole in the fold or wholly below it,
≤ 140 px of empty fold below the email row, never under the stone's ground), the sigils (each inlay ignited once in view, normal and reduced motion; captions visible and clear
of the title; band ≥ 1.12:1) and the stone's material (see "Surfaces and light" 5). Its
`three=` field shows whether three.js was parsed before any interaction (it must be `false` on the 390
runs). `ROUTES=/,/writing node scripts/shoot.mjs …` limits the routes (in Git Bash prefix
`MSYS_NO_PATHCONV=1`, or "/" becomes a Windows path; and give the output directory as a Windows path).
v2.4 adds: **first paint** (5 cold loads at 1440×900 recorded with a CDP screencast: from the first painted
frame until the name has ink, the brand and Proof title are blank or already final, never the fallback
serif; at the name's first frame they match +1.5 s, mean |Δ| ≤ 3; the name lags the lede ≤ 150 ms;
`first-paint-1-*.png` keeps load 1's frames; `FIRST_PAINT_LOADS` overrides the count) and **the Proof
diagram** (accessible name; drawn 1.2 s after scrolling in with nothing running; never armed under reduced
motion; ≥ 1200 px: ≥ 24 px clear of the figure and the slab's edges, ≥ 15 % ink in the slab's top-right
quadrant). v2.5 adds **the stone's pattern** to the handoff block (high-pass NCC ≥ 0.6, face lamination
≤ 0.6× the flank's, a `-handoff-face-2x-{svg,webgl}.png` crop per desktop size), a gate that phones never
request `/stone/face-*.avif` (desktop: exactly once), and `ONLY=main,narrow,folds,firstpaint,handoff,links`
to run a subset. v2.6 adds **the sigil rail** (every viewport on /: desktop rails sticky, ≥ 16 px clear of
the body, inside their section, engaged mid-section where the section is taller than the viewport, titles
≤ 0.7× Play's, sigils ≥ 1.5× their title; phones: not sticky, sigil inline with the title; frames in
`<label>-rail-<id>.png`); the sigil gate finds rail sigils as well as header ones. `scripts/bake-stone.mjs` re-bakes the SVG twin's desktop face (against `next dev`);
v2.7 adds the **go-live** gates. `links` now walks every URL the legacy site served
(`lib/legacy-urls.json`: 8 pages, 9 renamed files, 52 unchanged assets, 1 retired API): same path = 200 with no
redirect, moved = exactly one redirect to the new path and then 200, retired = 404. A new `meta` block (`ONLY=meta`)
gates `/resume.pdf` (200, `application/pdf`, inline as `Lars_Crawford_Resume.pdf`, a real PDF), `robots.txt`
(allows /, names the sitemap), `sitemap.xml` (every URL in it answers 200), the share card (`og:image` =
`twitter:image`, decoded 1200 x 630, ≤ 300 kB, `summary_large_image`), each route's canonical and og:url on
the production origin, the JSON-LD Person, the icon set and a styled 404. `narrow` sweeps every 10 px from 320
to 440 (plus 375, 393, 414, 467, 468; 320 alone before): no overflow, the header nav inside its gutters, the
brand rune whole or hidden. Point it at production after the
switch (`ONLY=links,meta node scripts/shoot.mjs https://w0nd3r.rune.love shots/prod`). `scripts/make-grain.mjs` regenerates the grain tile; `scripts/crop-science.mjs` regenerates the research plates. `scripts/make-og.mjs` re-renders the share card from the hero (against a running server); `scripts/make-icons.mjs` the raster icons.
