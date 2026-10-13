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
- `components/hero/` holds the hero stone. `lib/stone.ts` is the menhir's single source (geometry, camera, rune slots); `node scripts/stone-profile.mjs` regenerates `components/hero/stone-profile.ts`, the silhouette and rune strokes the SVG twin is drawn from, so run it after editing `lib/stone.ts`. `StoneFallback` (SVG) is the first paint and the reduced-motion / no-WebGL / Save-Data fallback; `StoneLight` holds the torch, halo, ground and motes that persist through the swap. `RuneStoneScene` (R3F) is fetched with `next/dynamic` (`ssr: false`) only when the stone is on screen and, on fine pointers, after load + LCP + idle, or on touch devices after the first interaction. It renders at DPR ≤ 1.5 and pauses its frame loop when offscreen. Its slate (albedo, bump and roughness maps; a riven face and bedded edges since v2.5) is generated on a canvas inside that lazy chunk, and `GROOVE` in `lib/stone.ts` holds the rune-cut values both renderers share (v2.2). From 861 px up the SVG twin's face is the WebGL stone itself, baked: run `node scripts/bake-stone.mjs` against `next dev` after changing the slate or `lib/stone.ts` (it writes `public/stone/face-{740,1480}.avif`).
- `DESIGN.md` is the design system (tokens, type, light, sigils, ban list, rubric, perf budget). Read it before any visual change.
- `scripts/shoot.mjs` is the screenshot + gate harness (fonts loaded, overflow, axe, console errors, and since v2.2 the desktop fold, sigil ignition and captions, band contrast and the stone's material and SVG/WebGL parity; since v2.3 the fold is checked line by line and `VIEWPORTS=` adds sizes; since v2.4 every line of the Proof title at 19 desktop sizes incl. MacBooks, the first painted frames of 5 cold loads, and the Proof harness diagram; since v2.5 the stone's pattern across the handoff (high-pass NCC, lamination on the edges, not the face), that phones never fetch the baked face, and `ONLY=` to run a subset of blocks; since v2.6 the sticky sigil rail (sticky, clear of the body and engaged mid-section on desktop; inline with the title on phones) and the title scale; shots go to the gitignored `shots/`). `scripts/make-grain.mjs` regenerates `public/textures/grain.png`; `scripts/crop-science.mjs` regenerates the research plates in `public/images/science/plates/` from the originals beside them.
- `app/fonts/` holds one self-hosted copy of Cormorant's latin woff2 (OFL), used only so the name can render with `font-display: block` (DESIGN.md "Type").
- `lib/runes.ts` has the Elder Futhark runes as hand-written stroke paths. SVG, CSS and WebGL all share them.

## TODO

- **Résumé PDF:** `public/resume.pdf` is a copy of the placeholder-free submission render (`career/resume/submit/Lars_Crawford_Resume.pdf`, v2.7). When a newer render lands, overwrite it **at the same path** (`/resume.pdf` is linked from the hero and from applications); check its text has no "[", "FILL" or "CHECK" first. `next.config.mjs` serves it inline as `Lars_Crawford_Resume.pdf`, and the hero's gold "Résumé (PDF)" button renders only while the file exists.
- Blockchain.com AI-transformation specifics: add them to `content/experience.ts` and `content/projects.ts` (proof card) once confirmed.
- `/cottage`: the explorable 3D scene (Track B2).
