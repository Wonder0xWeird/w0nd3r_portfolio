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

- `app/` routes: `/` (front door), `/writing`, `/writing/{dear-lambda,poems,musings}/[slug]`, `/writing/art`, `/cottage` (placeholder for the 3D cottage). Also (v2.7) `robots.ts`, `sitemap.ts` (every page), the icon set (`icon.svg`, `favicon.ico`, `apple-icon.png`) and `images/[...legacy]` (see Legacy URLs).
- `lib/meta.ts` (v2.7): `pageMeta()` gives every route its canonical URL, og:url, title and the `summary_large_image` share card; `personJsonLd` is the JSON-LD on `/` (current role from `content/experience.ts`). The card is `public/og.jpg`, a 1200x630 render of the real hero: re-run `node scripts/make-og.mjs` against `next start` (or dev) after a visible hero change and commit the image. `node scripts/make-icons.mjs` regenerates the raster icons from `app/icon.svg`.
- `content/*.ts` is all the copy: profile, experience, research, publications, projects. `content/writing/` holds the migrated legacy writing (poems and musings verbatim from the old site, Dear Lambda letters as markdown rendered at build time).
- `components/hero/` holds the hero stone. `lib/stone.ts` is the menhir's single source (geometry, camera, rune slots); `node scripts/stone-profile.mjs` regenerates `components/hero/stone-profile.ts`, the silhouette and rune strokes the SVG twin is drawn from, so run it after editing `lib/stone.ts`. `StoneFallback` (SVG) is the first paint and the reduced-motion / no-WebGL / Save-Data fallback; `StoneLight` holds the torch, halo, ground and motes that persist through the swap. `RuneStoneScene` (R3F) is fetched with `next/dynamic` (`ssr: false`) only when the stone is on screen and, on fine pointers, after load + LCP + idle, or on touch devices after the first interaction. It renders at DPR ≤ 1.5 and pauses its frame loop when offscreen. Its slate (albedo, bump and roughness maps; a riven face and bedded edges since v2.5) is generated on a canvas inside that lazy chunk, and `GROOVE` in `lib/stone.ts` holds the rune-cut values both renderers share (v2.2). From 861 px up the SVG twin's face is the WebGL stone itself, baked: run `node scripts/bake-stone.mjs` against `next dev` after changing the slate or `lib/stone.ts` (it writes `public/stone/face-{740,1480}.avif`).
- `DESIGN.md` is the design system (tokens, type, light, sigils, ban list, rubric, perf budget). Read it before any visual change.
- `scripts/shoot.mjs` is the screenshot + gate harness (fonts loaded, overflow, axe, console errors, and since v2.2 the desktop fold, sigil ignition and captions, band contrast and the stone's material and SVG/WebGL parity; since v2.3 the fold is checked line by line and `VIEWPORTS=` adds sizes; since v2.4 every line of the Proof title at 19 desktop sizes incl. MacBooks, the first painted frames of 5 cold loads, and the Proof harness diagram; since v2.5 the stone's pattern across the handoff (high-pass NCC, lamination on the edges, not the face), that phones never fetch the baked face, and `ONLY=` to run a subset of blocks; since v2.6 the sticky sigil rail (sticky, clear of the body and engaged mid-section on desktop; inline with the title on phones) and the title scale; since v2.7 every legacy URL, the résumé, robots, the sitemap, the share card, canonicals, JSON-LD, the icons and the 404 (`ONLY=meta`); shots go to the gitignored `shots/`). `scripts/make-grain.mjs` regenerates `public/textures/grain.png`; `scripts/crop-science.mjs` regenerates the research plates in `public/images/science/plates/` from the originals beside them.
- `app/fonts/` holds one self-hosted copy of Cormorant's latin woff2 (OFL), used only so the name can render with `font-display: block` (DESIGN.md "Type").
- `lib/runes.ts` has the Elder Futhark runes as hand-written stroke paths. SVG, CSS and WebGL all share them.

## Legacy URLs (v2.7)

Production ran the old Next 13 pages app (`main`) until v2.7. `lib/legacy-urls.json` lists every URL it served (its routes, the slugs from its `writing/**/*.md`, and every file in its `public/`) and where each lives now; `shoot.mjs` gates all 70. Unchanged paths answer 200. The mixed-case letter URLs and the old test page (`/writing/Art/Test` -> `/writing/art`) redirect in `middleware.ts`, which leaves files alone (the legacy `/writing/Musings/*.jpg` images are served as they were). The nine images renamed in v2.0 (spaces, an apostrophe) redirect once from `app/images/[...legacy]/route.ts`, which only sees `/images/*` paths that are not files. `/ww` (the old logo page) and `/index` redirect in `next.config.mjs`. `/api/getWritings` is retired (it answered 500 to every request). Never add a `next.config` redirect whose destination differs from its source only by case: Vercel matches them case-insensitively and it loops.

## Going live (v2.7)

Promoting `cottage` to `main` needs nothing in code: no environment variables, no hostnames, and nothing blocks indexing (Vercel adds `X-Robots-Tag: noindex` to previews only). In Vercel, check that the production branch is `main` and that the project's Build / Install Command overrides (if any) are not left from the old yarn app; the cottage previews build with the same settings, so a green preview means a green production build. After the switch, run `node scripts/shoot.mjs https://w0nd3r.rune.love shots/prod` (`ONLY=links,meta` for the URL and metadata gates alone) and, optionally, submit `https://w0nd3r.rune.love/sitemap.xml` in Google Search Console.

## TODO

- **Résumé PDF:** `public/resume.pdf` is a copy of the placeholder-free submission render (`career/resume/submit/Lars_Crawford_Resume.pdf`, v2.7). When a newer render lands, overwrite it **at the same path** (`/resume.pdf` is linked from the hero and from applications); check its text has no "[", "FILL" or "CHECK" first. `next.config.mjs` serves it inline as `Lars_Crawford_Resume.pdf`, and the hero's gold "Résumé (PDF)" button renders only while the file exists.
- Blockchain.com AI-transformation specifics: add them to `content/experience.ts` and `content/projects.ts` (proof card) once confirmed.
- `/cottage`: the explorable 3D scene (Track B2).
