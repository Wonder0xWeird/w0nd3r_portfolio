#!/usr/bin/env node
/**
 * Bakes the 3D stone into the SVG twin's desktop face (v2.5, the v2.3 critique's fix 2: "one material in
 * both renderers").
 *
 *   node node_modules/next/dist/bin/next dev . -p 3210      # a development server (bake mode is dev-only)
 *   node scripts/bake-stone.mjs [baseUrl]                    # default http://localhost:3210
 *
 * Opens `/?bake=1` at 1920 x 1080 (the stage at its 740 px maximum) and device scale 2. In that mode
 * (components/hero/HeroStone.tsx, development builds only) the WebGL stone loads at once and holds the
 * handoff pose (START_YAW) with its runes and rune-fire light off, rendered at DPR 2 into a readable
 * buffer. The canvas's own pixels (RGBA, transparent around the stone, so its alpha is the silhouette)
 * are read with toDataURL and written with sharp as:
 *   public/stone/face-1480.avif   1480 x 1776, for 2x screens
 *   public/stone/face-740.avif     740 x  888, for 1x screens
 * StoneFallback lays them under its runes and fire from 861 px up (globals.css .stone__baked), so the
 * first paint and the WebGL stone are one material. Re-run after any change to the slate
 * (components/hero/RuneStoneScene.tsx) or to lib/stone.ts, then `node scripts/shoot.mjs` (the handoff
 * block gates the pattern: high-pass NCC >= 0.6). The raw PNG goes to shots/bake/ (gitignored).
 */
import { chromium } from "playwright-core"
import sharp from "sharp"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const base = (process.argv[2] || "http://localhost:3210").replace(/\/$/, "")
const OUT = path.join(root, "public/stone")
const RAW = path.join(root, "shots/bake")
const STAGE = { w: 740, h: 888 } // .heroArt at >= 1480 px: min(50vw, 740px), 5:6
const QUALITY = 60

async function launch() {
	if (process.env.BROWSER_PATH) return chromium.launch({ executablePath: process.env.BROWSER_PATH })
	const channels = process.env.BROWSER_CHANNEL ? [process.env.BROWSER_CHANNEL] : ["msedge", "chrome"]
	let last
	for (const channel of channels) {
		try {
			return await chromium.launch({ channel })
		} catch (e) {
			last = e
		}
	}
	throw last
}

const browser = await launch()
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 })
const page = await ctx.newPage()
const errors = []
page.on("pageerror", (e) => errors.push(e.message))
page.on("console", (m) => m.type() === "error" && errors.push(m.text()))
await page.goto(`${base}/?bake=1`, { waitUntil: "load" })
await page.waitForSelector(".hero-stone[data-bake][data-ready]", { timeout: 30000 })
await page.waitForTimeout(500) // a few more frames at the pose
const shot = await page.evaluate(() => {
	const c = document.querySelector(".hero-stone .stone__canvas canvas")
	const r = c.getBoundingClientRect()
	return { url: c.toDataURL("image/png"), w: c.width, h: c.height, cssW: r.width, cssH: r.height }
})
await browser.close()
if (errors.length) console.warn(`page errors:\n  ${errors.join("\n  ")}`)
if (Math.round(shot.cssW) !== STAGE.w || Math.round(shot.cssH) !== STAGE.h) throw new Error(`stage is ${shot.cssW} x ${shot.cssH} CSS px, expected ${STAGE.w} x ${STAGE.h}`)
if (shot.w !== STAGE.w * 2 || shot.h !== STAGE.h * 2) throw new Error(`canvas is ${shot.w} x ${shot.h}, expected ${STAGE.w * 2} x ${STAGE.h * 2} (bake mode renders at DPR 2)`)

const png = Buffer.from(shot.url.split(",")[1], "base64")
await mkdir(RAW, { recursive: true })
await writeFile(path.join(RAW, "face-raw.png"), png)
await mkdir(OUT, { recursive: true })
for (const scale of [2, 1]) {
	const file = path.join(OUT, `face-${STAGE.w * scale}.avif`)
	const info = await sharp(png)
		.resize(STAGE.w * scale, STAGE.h * scale, { kernel: "lanczos3" })
		.avif({ quality: QUALITY, effort: 9, chromaSubsampling: "4:4:4" })
		.toFile(file)
	console.log(`${path.relative(root, file)}: ${info.width} x ${info.height}, ${(info.size / 1024).toFixed(1)} kB`)
}
