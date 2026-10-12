# w0nd3r.rune.love

Lars Crawford's personal site. Next.js 15 (App Router) + TypeScript, plain CSS (global + CSS modules), and a single lazy-loaded React Three Fiber element in the hero.

## Run it

```bash
npm install
npm run dev          # http://localhost:3200
npm run build        # production build (type-checks)
npm start            # serve the production build
```

Deploys on Vercel from the repo root with zero config (framework preset: Next.js).

## Layout

- `app/` routes: `/` (front door), `/writing`, `/writing/{dear-lambda,poems,musings}/[slug]`, `/writing/art`, `/cottage` (placeholder for the 3D cottage).
- `content/*.ts` is all the copy: profile, experience, research, publications, projects. `content/writing/` holds the migrated legacy writing (poems and musings verbatim from the old site, Dear Lambda letters as markdown rendered at build time).
- `components/hero/` holds the hero stone. `lib/stone.ts` is the menhir's single source (geometry, camera, rune slots); `node scripts/stone-profile.mjs` regenerates `components/hero/stone-profile.ts`, the silhouette and rune strokes the SVG twin is drawn from, so run it after editing `lib/stone.ts`. `StoneFallback` (SVG) is the first paint and the reduced-motion / no-WebGL / Save-Data fallback; `StoneLight` holds the torch, halo, ground and motes that persist through the swap. `RuneStoneScene` (R3F) is fetched with `next/dynamic` (`ssr: false`) only when the stone is on screen and, on fine pointers, after load + LCP + idle, or on touch devices after the first interaction. It renders at DPR ≤ 1.5 and pauses its frame loop when offscreen. Its slate (albedo, bump and roughness maps) is generated on a canvas inside that lazy chunk, and `GROOVE` in `lib/stone.ts` holds the rune-cut values both renderers share (v2.2).
- `DESIGN.md` is the design system (tokens, type, light, sigils, ban list, rubric, perf budget). Read it before any visual change.
- `scripts/shoot.mjs` is the screenshot + gate harness (fonts loaded, overflow, axe, console errors, and since v2.2 the desktop fold, sigil ignition and captions, band contrast and the stone's material and SVG/WebGL parity; since v2.3 the fold is checked line by line and `VIEWPORTS=` adds sizes; shots go to the gitignored `shots/`). `scripts/make-grain.mjs` regenerates `public/textures/grain.png`; `scripts/crop-science.mjs` regenerates the research plates in `public/images/science/plates/` from the originals beside them.
- `app/fonts/` holds one self-hosted copy of Cormorant's latin woff2 (OFL), used only so the name can render with `font-display: block` (DESIGN.md "Type").
- `lib/runes.ts` has the Elder Futhark runes as hand-written stroke paths. SVG, CSS and WebGL all share them.

## TODO

- **Résumé PDF:** the site links to `/resume.pdf`, which does not exist yet. Drop the final, placeholder-free PDF at `public/resume.pdf`. The current draft still contains [FILL]/[CHECK] slots, so don't use it.
- Blockchain.com AI-transformation specifics: add them to `content/experience.ts` and `content/projects.ts` (proof card) once confirmed.
- `/cottage`: the explorable 3D scene (Track B2).
