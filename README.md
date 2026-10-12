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
- `components/hero/` holds the hero stone. `StoneFallback` (SVG) is the first paint and the reduced-motion / no-WebGL fallback. `RuneStoneScene` (R3F) is fetched with `next/dynamic` (`ssr: false`) once the page is idle, renders at DPR ≤ 1.5, and pauses its frame loop when offscreen.
- `lib/runes.ts` has the Elder Futhark runes as hand-written stroke paths. SVG, CSS and WebGL all share them.

## TODO

- **Résumé PDF:** the site links to `/resume.pdf`, which does not exist yet. Drop the final, placeholder-free PDF at `public/resume.pdf`. The current draft still contains [FILL]/[CHECK] slots, so don't use it.
- Blockchain.com AI-transformation specifics: add them to `content/experience.ts` and `content/projects.ts` (proof card) once confirmed.
- `/cottage`: the explorable 3D scene (Track B2).
