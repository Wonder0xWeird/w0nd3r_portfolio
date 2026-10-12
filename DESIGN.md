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
the agent-harness diagram with the slim slabs retired. Still to come: the stone as one material in both
renderers (critique fix 2), the sticky sigil rail and type/rhythm system; research band + projects shelf
+ writing + play + threshold; motion polish + perf/a11y hardening.

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
   - **Material (v2.3): night-lit riven slate.** v2.1 read as blue plastic; v2.2's neutral #7b7c7e with 900
     uniform pits and white-noise relief read as studio-lit cast concrete. Now (all generated on a 512 px
     canvas in the lazy chunk, no image assets):
     - albedo #5f6469 (blue-grey, hue ≈ 210) in bedding bands (anisotropic fbm 256×24 + 64×10 px) with a
       faint blue-grey/green-grey drift and each split layer a shade apart; the bands are generated
       axis-aligned and turned 8° (descending right) by the textures' UV rotation, so the tile still repeats;
     - relief (`bumpMap`, `bumpScale` 1.6): cleavage ledges that run along a bed and die out, hairline
       lamination **in patches** (everywhere at once it read as wood grain), short grit drawn out along the
       bed, 220 power-law pits (70 % strung along 12 bedding lines); white noise only ×2;
     - light: hemisphere 0.6 (sky #b9c2cc, warm-dark ground), the moon key at [-2.6, 3.2, 2.4] so the face
       grades top-left → bottom-right, a weak rim (#a2a8b0), the rune-fire point light inside the group;
       vertex colours sink the foot into its shadow below y −0.45 (to 0.62). Linear tone mapping, exposure 1.27.
   - **Runes are cut, not neon (v2.2, both renderers):** a moonlit lower lip offset down-right, a wider dark
     cut offset up-left, then a narrower fire with a softer glow, a thin .55 core and a .62 bloom (`GROOVE`
     in `lib/stone.ts` holds the shared widths and alphas).
   - **SVG twin palette (v2.3)**, matched to the lit 3D stone: face #6b7076 → #53575d → #3d4147 (more
     vertical than v2.2's), flank #30353a → #1b1e22, crown #4a4f55 → #33373c, a foot shadow from 60 % of
     the stage, a shoulder shade where the 3D face curves away, and the fire (.35) centred where the 3D fire
     light sits. Bedding is `feTurbulence` (beds + short lamination flecks, overlay .25, turned 8°), inside
     the clipped group so the overlay blends with the face (v2.2's grain overlay blended with nothing), and
     only in the stone's box. It is rasterised before the first paint (~+100 ms observed FCP in headless
     Edge), so it is **not drawn below 861 px**, where the stone is a half-lit backdrop.
   - The crown eases into the flank (`smooth(0.48, 1, h)`, segments 28×56×8): no shoulder seam in the sway.
   **Gates (`shoot.mjs`, desktop handoff frames):** median face luminance SVG vs WebGL within ±12 % and mean
   |difference| ≤ 5 (v2.3: −0.1 %, 4.7–4.9; v2.2 measured 7.0); WebGL face away from the runes hue 200–225,
   saturation .03–.07, L* 36–41 (v2.3: 219, .038, 38.8); hue 25–45° near them; flank saturation ≤ .12;
   face:flank ≥ 1.8:1; face vs page ≥ 2.3:1; key fall-off, upper-left / lower-right face ≥ 1.40 (1.48;
   v2.2 1.30); foot ≥ 28 % darker than mid-face (32 %; v2.2 23 %); high-pass σ 3–6 WebGL (3.9) and
   SVG/WebGL 0.75–1.3 (0.8); rune glow mean and p90 within ±3 % across the handoff.
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
and hang left of the section title, in a fixed `--sigil-w` column so every title starts on the same line.
**Captioned (v2.2; one line each since v2.3):** the rune's name sits under it, and from 1280 px its meaning
too (`SIGIL_MEANING` in `lib/runes.ts`; Mona Sans 450, 13 px, 11 px below 861 px, `--text-3`,
`aria-hidden` like the rune), so Ehwaz never reads as a Latin "M". Captions never wrap; `justify-self:
safe center` keeps a wide one inside the container (it overhangs toward the title only, ≥ 13 px short of
it). Phones left-align the name under the sigil, inside the 16 px margin. Proof's Ehwaz ignites later
than the others (see Motion), so in the desktop fold it is an ember, not a lit drop cap.
Play's Wunjo carries the same caption in place of the old "My massive transformative purpose" kicker.
The sticky sigil rail is still to come.

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
  500. The name stays visible at 390 (it hides only below 360 px, where it cannot fit); "Cottage" leaves the
  nav below 420 px. Nav links separated by spacing
  only.
- **Hero, "the stone"** (v2.1). ≤ 40 visible words. Name at `--step-display` on two lines, no suffix (the
  accessible name is "Lars Crawford"). One-sentence lede at `--step-2t`, then place as two meta lines. CTAs:
  **Résumé** (gold primary, shown only once `public/resume.pdf` exists; otherwise "Email me" is the primary),
  LinkedIn and GitHub as text links, and the address itself as visible text with a Copy button.
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
- **Experience** (ᚱ Raidho). Org in Cormorant `--step-3`, meta in two quiet lines, stack as one `--text-3`
  comma line. Org/role columns 3fr/9fr (v2.3; 4fr/8fr left a ~260 px dead gutter): roles start at x 463 at
  1440. Still to come: sticky rail, gold fuse, ≤ 2 bullets + `<details>`.
- **Research** (ᛞ Dagaz). Duotone micrographs; bibliography with a year column, no pills. The plates (v2.3)
  are square crops in `public/images/science/plates/` made by `scripts/crop-science.mjs` from the untouched
  originals: no SEM info bars, no "Mins" header or labels, no Blender axes or 3D cursor; the SEM's 1 mm
  bar is redrawn as a clean overlay (`.scaleBar`, shown where the tile is ≥ 150 px). Later: full-bleed
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
| Section sigils ignite (v2.2, shipped) | Named `view-timeline: --head` on each `.sectionHead`; inlay `stroke` gold-700 → gold-200, sigil `filter` ember → `--ignited`, pool `opacity` .35 → 1; `animation-range: entry 15% cover 40%`, linear. Proof (v2.3): `entry 60% cover 45%`, so its Ehwaz enters the desktop fold as an ember | scroll-linked | **Rendered ignited** (the default rule is the final state) |
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
| LCP / TBT / CLS (Lighthouse mobile) | ≤ 2.0 s / ≤ 150 ms / ≤ 0.05. Local Windows builds measure ~2.65 s (no font preloads, see Fonts); v2.3 is level with v2.2 in an interleaved A/B (2.65 vs 2.66 s). Watch the simulated critical path: when the hero SVG stopped referencing `/textures/grain.png`, its CSS-initiated request cost ~60 ms of simulated LCP, so the layout preloads it. `experimental.inlineCss` was tried in v2.3 and dropped (no local gain: 2.73 s). v2.4 is level with v2.3 locally (interleaved ×3: 2.65 vs 2.65 s, Perf 96 vs 96); first-load JS +0.45 kB gz (the diagram's draw trigger) |
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
quadrant). `scripts/make-grain.mjs` regenerates the grain tile;
`scripts/crop-science.mjs` regenerates the research plates.
