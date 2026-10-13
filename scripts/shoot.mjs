#!/usr/bin/env node
/**
 * Screenshot + gate harness (DESIGN.md "Gates").
 *
 *   node scripts/shoot.mjs [baseUrl] [outDir]
 *   node scripts/shoot.mjs http://localhost:3200 shots/v2.0
 *
 * Uses the locally installed Edge (or Chrome) through playwright-core, so no
 * browser download is needed. Override with BROWSER_CHANNEL=chrome or
 * BROWSER_PATH=<exe>.
 *
 * For / at 1440x900 and 390x844, in normal and reduced motion, it:
 *   - waits for document.fonts.ready and asserts the display (Cormorant) and
 *     text (Mona Sans) faces are the computed families AND actually loaded;
 *   - asserts no horizontal overflow (also at every 10 px from 320 to 440 since v2.7, with the header
 *     nav inside its gutters);
 *   - saves the fold and one crop per `main > section` at device scale
 *     factor 2, and the full page at 1x (Chromium breaks taller captures);
 *   - captures hover states for the first slab and the primary button;
 *   - records console errors, page errors, failed requests, JS bytes and
 *     whether three.js was parsed (window.__THREE__);
 *   - runs axe (serious/critical count);
 *   - on /: asserts the primary CTA's bottom edge (<= 600 px at 390, <= 700 at
 *     1440x900 and 7/9 of the height on other desktops), the hero's visible word
 *     count (<= 40) and the page height (<= 9000 px on phones, <= 8500 on
 *     desktops), records the LCP element,
 *     and saves real viewport frames, one per screen (section crops repaint the
 *     fixed light layer in tiles and show a fake seam).
 * Handoff (/, every viewport): the median luminance of the stone's face as SVG
 * (reduced motion) vs WebGL (after the swap) must agree within ±12 % and their
 * mean per-pixel |difference| must be <= 5 (v2.3; 8 before); saves the SVG /
 * mid-fade / WebGL frames of the stone. On desktop the same frames gate the
 * stone's material (v2.3, night-lit slate): blue-grey away from the runes (WebGL
 * hue 200-225, saturation .03-.07, L* 36-41), rune-fire warmth near them (hue
 * 25-45), flank saturation <= .12, face:flank >= 1.8:1, face vs page >= 2.3:1,
 * key fall-off (upper-left / lower-right face >= 1.40), a foot >= 28 % darker
 * than mid-face, texture (high-pass sigma 3-6 WebGL, SVG/WebGL 0.75-1.3) and an
 * unchanged rune glow (mean and p90 of the LARS column within ±3 %).
 * Sigils (/, desktop, normal and reduced motion): each section header scrolled
 * to 30 % of the viewport has an ignited inlay (median luminance >= 170) and a
 * visible caption clear of its h2; the sunken band reads (>= 1.12:1).
 * Sigil rail (/, every viewport; v2.6): on desktop each rail is sticky, clear of the body, inside its
 * section and engaged mid-section where the section is taller than the viewport; rail titles <= 0.7x
 * Play's, sigils >= 1.5x their title; on phones the rail is not sticky and the sigil sits inline with
 * its title.
 * Desktop folds (/, 1280x720 to 1920x1080 incl. browser-chrome and MacBook sizes, reduced
 * motion): every line of the Proof title is whole in the fold (bottom <= height - 16) or the
 * first is wholly below it (top >= height), never sliced (every line since v2.4; v2.3 gated
 * line 1 only); the empty fold below the hero's email row is <= 140 px and the row ends >= 32 px
 * above the title; the stone's ground shadow never overlaps it (also at 900, 1024).
 * First paint (/, 1440x900, 5 cold loads, CDP screencast; v2.4): from the first painted frame
 * until the name has ink, the brand and the Proof title are blank or already final (never the
 * fallback serif); at the name's first frame they match +1.5 s (mean |d| <= 3); the name lags
 * the lede by <= 150 ms.
 * Proof diagram (/, desktop, normal and reduced motion; v2.4): an accessible name; fully drawn
 * 1.2 s after scrolling in, nothing left running, never armed under reduced motion; from 1200 px,
 * >= 24 px clear of the figure and the slab's edges, and >= 15 % ink in the slab's top-right quadrant.
 * Links: every internal href on / and /writing must answer 200 without a
 * redirect. Legacy URLs (v2.7; every URL the old site served, from lib/legacy-urls.json): pages and
 * assets that kept their path answer 200 with no redirect; moved ones redirect exactly once to their
 * new path, which answers 200; retired ones 404.
 * Meta (v2.7, go-live): /resume.pdf is 200 application/pdf, inline as Lars_Crawford_Resume.pdf, and
 * a real PDF; robots.txt allows / and names the sitemap; sitemap.xml is 200 and every URL in it
 * answers 200; og:image and twitter:image are the same 1200x630 JPEG/PNG of <= 300 kB (decoded, so
 * the dimensions are the file's own); summary_large_image; each route has its canonical and og:url
 * on the production origin; the JSON-LD Person carries the current role; the favicon set answers 200;
 * an unknown URL is a styled 404.
 * Other routes get fold + full page + the same font/overflow checks.
 * Writes <outDir>/report.json and exits 1 if any gate fails.
 */
import { chromium } from "playwright-core"
import AxeBuilder from "@axe-core/playwright"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const base = (process.argv[2] || "http://localhost:3200").replace(/\/$/, "")
const outDir = path.resolve(process.argv[3] || "shots/latest")
const ROUTES = (process.env.ROUTES || "/,/writing,/writing/poems/imagine,/cottage").split(",")
// VIEWPORTS="1440x900,1366x768,1280x720,1920x1080,390x844" adds sizes (default: the rubric's two).
// 1440x900 and 390x844 keep their short names ("home-1440", "home-390"); < 861 px wide is a touch phone.
const VIEWPORTS = (process.env.VIEWPORTS || "1440x900,390x844").split(",").map((s) => {
	const [width, height] = s.split("x").map(Number)
	const name = s === "1440x900" ? "1440" : s === "390x844" ? "390" : s
	return { name, width, height, touch: width < 861 }
})
// Primary CTA bottom: <= 600 px on phones; <= 700 px at 1440x900, i.e. 7/9 of the height on other desktops.
const ctaMax = (vp) => (vp.touch ? 600 : Math.round((vp.height * 700) / 900))
const HERO_WORDS_MAX = 40
const HEIGHT_MAX = { desktop: 8500, phone: 9000 } // critique change 3: disclose, never delete
const kind = (vp) => (vp.touch ? "phone" : "desktop")
const PARITY = 0.12
const PARITY_MAD = 5 // mean |luminance difference| per pixel of the face, SVG vs WebGL (v2.3; 8 in v2.2, which measured 7.0)
// Every URL the legacy site served and where it lives now (v2.7; README "Legacy URLs").
const LEGACY = JSON.parse(await readFile(path.join(path.dirname(fileURLToPath(import.meta.url)), "../lib/legacy-urls.json"), "utf8"))
const SITE = "https://w0nd3r.rune.love" // the production origin canonical and og: URLs must use
const OG_MAX_BYTES = 300 * 1024
const DISPLAY = /Cormorant/i
const TEXT = /Mona[ _]?Sans/i
// ONLY=handoff (or a comma list of main,narrow,folds,firstpaint,handoff,links,meta) runs just those blocks
// (v2.5; meta since v2.7; for iterating on one gate). The default runs everything.
const ONLY = process.env.ONLY ? process.env.ONLY.split(",") : null
const runs = (block) => !ONLY || ONLY.includes(block)
// The stone's generated right facet (stage units), for the flank's lamination energy (v2.5); the stage is
// 400 x 480 units (lib/stone.ts STAGE).
const [STAGE_W, STAGE_H] = [400, 480]
const FACET_RIGHT = (await readFile(path.join(path.dirname(fileURLToPath(import.meta.url)), "../components/hero/stone-profile.ts"), "utf8")).match(/"right":\s*"([^"]+)"/)?.[1] ?? null

await mkdir(outDir, { recursive: true })

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
const report = { base, when: new Date().toISOString(), runs: [], failures: [] }
const fail = (msg) => {
	report.failures.push(msg)
	console.error(`  FAIL ${msg}`)
}
const slug = (route) => (route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "_"))

async function fontProbe(page) {
	return page.evaluate(async () => {
		await document.fonts.ready
		const h1 = document.querySelector("h1")
		const h1Family = h1 ? getComputedStyle(h1).fontFamily : ""
		const bodyFamily = getComputedStyle(document.body).fontFamily
		const first = (f) => f.split(",")[0].trim()
		const faces = []
		document.fonts.forEach((f) => faces.push({ family: f.family, weight: f.weight, style: f.style, status: f.status }))
		return {
			h1Family,
			bodyFamily,
			h1Check: h1 ? document.fonts.check(`300 64px ${first(h1Family)}`) : false,
			bodyCheck: document.fonts.check(`400 16px ${first(bodyFamily)}`),
			faces,
		}
	})
}

// ---------- pixel measurements (v2.2 critique gates) ----------
const relLum = (rgb) => {
	const f = (c) => {
		c /= 255
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
	}
	return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2])
}
const contrast = (a, b) => {
	const [hi, lo] = [relLum(a), relLum(b)].sort((p, q) => q - p)
	return (hi + 0.05) / (lo + 0.05)
}
const BASE_RGB = [16, 20, 26] // --slate-950, the page base

/**
 * Decodes a PNG in a scratch page and measures it. Per region ({x, y, w, h} in image px): the mean
 * colour, its HSL hue and saturation, the median luminance and the high-pass sigma (luminance minus
 * a 13 x 13 box blur, i.e. "a 6 px blur" at device scale 2, as the v2.1 critique measured texture).
 * Per point list ([[x, y]] in image px): the median luminance at those points.
 */
async function imageStats(png, { regions = {}, points = {} } = {}) {
	const ctx = await browser.newContext()
	const page = await ctx.newPage()
	const res = await page.evaluate(
		async ([b64, regions, points]) => {
			const img = new Image()
			img.src = "data:image/png;base64," + b64
			await img.decode()
			const c = document.createElement("canvas")
			c.width = img.width
			c.height = img.height
			const g = c.getContext("2d")
			g.drawImage(img, 0, 0)
			const { data, width, height } = g.getImageData(0, 0, c.width, c.height)
			const Y = (i) => 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
			const median = (v) => v.sort((a, b) => a - b)[v.length >> 1]
			const out = { regions: {}, points: {} }
			for (const [k, r] of Object.entries(regions)) {
				const x0 = Math.max(0, Math.round(r.x))
				const y0 = Math.max(0, Math.round(r.y))
				const w = Math.min(width, Math.round(r.x + r.w)) - x0
				const h = Math.min(height, Math.round(r.y + r.h)) - y0
				if (w < 16 || h < 16) continue
				let R = 0, G = 0, B = 0
				const lum = new Float64Array(w * h)
				for (let y = 0; y < h; y++)
					for (let x = 0; x < w; x++) {
						const i = ((y0 + y) * width + x0 + x) * 4
						R += data[i]
						G += data[i + 1]
						B += data[i + 2]
						lum[y * w + x] = Y(i)
					}
				const n = w * h
				const [r_, g_, b_] = [R / n / 255, G / n / 255, B / n / 255]
				const mx = Math.max(r_, g_, b_), mn = Math.min(r_, g_, b_), d = mx - mn, l = (mx + mn) / 2
				const sat = d ? d / (1 - Math.abs(2 * l - 1)) : 0
				let hue = 0
				if (d) hue = (((mx === r_ ? ((g_ - b_) / d) % 6 : mx === g_ ? (b_ - r_) / d + 2 : (r_ - g_) / d + 4) * 60) + 360) % 360
				const rad = 6
				const W1 = w + 1
				const I = new Float64Array(W1 * (h + 1))
				for (let y = 0; y < h; y++) {
					let row = 0
					for (let x = 0; x < w; x++) {
						row += lum[y * w + x]
						I[(y + 1) * W1 + x + 1] = I[y * W1 + x + 1] + row
					}
				}
				let s1 = 0, s2 = 0, m = 0
				for (let y = rad + 2; y < h - rad - 2; y++)
					for (let x = rad + 2; x < w - rad - 2; x++) {
						const box = I[(y + rad + 1) * W1 + x + rad + 1] - I[(y - rad) * W1 + x + rad + 1] - I[(y + rad + 1) * W1 + x - rad] + I[(y - rad) * W1 + x - rad]
						const v = lum[y * w + x] - box / (2 * rad + 1) ** 2
						s1 += v
						s2 += v * v
						m++
					}
				const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
				const yy = 0.2126 * lin(r_) + 0.7152 * lin(g_) + 0.0722 * lin(b_)
				const sorted = Array.from(lum).sort((a, b) => a - b)
				out.regions[k] = {
					rgb: [R / n, G / n, B / n].map(Math.round),
					hue: Math.round(hue),
					sat: +sat.toFixed(3),
					lstar: +(yy > 0.008856 ? 116 * Math.cbrt(yy) - 16 : 903.3 * yy).toFixed(1),
					lum: +sorted[n >> 1].toFixed(1),
					mean: +(sorted.reduce((a, b) => a + b, 0) / n).toFixed(1),
					p90: +sorted[Math.floor(n * 0.9)].toFixed(1),
					highPass: m ? +Math.sqrt(s2 / m - (s1 / m) ** 2).toFixed(2) : null,
				}
			}
			for (const [k, pts] of Object.entries(points)) {
				const v = pts.filter(([x, y]) => x >= 0 && y >= 0 && x < width && y < height).map(([x, y]) => Y((Math.round(y) * width + Math.round(x)) * 4))
				out.points[k] = v.length ? +median(v).toFixed(1) : null
			}
			return out
		},
		[png.toString("base64"), regions, points]
	)
	await ctx.close()
	return res
}

/**
 * Section sigils (v2.2 critique fix 2), at desktop widths. Each section header is scrolled to 30 % of
 * the viewport (past the end of its ignition range); its inlay's median luminance must be >= 170
 * (normal and reduced motion alike: the final state is ignited), its caption must be visible and
 * clear of its h2, and the sunken band must read against the night beside it (>= 1.12:1).
 */
async function sigilGate(page, label, vp) {
	// Every section with an incised sigil: in its header (Proof) or in the sticky rail beside it (v2.6).
	const heads = await page.$$eval("main section", (els) => els.filter((e) => e.querySelector(".sigil__inlay")).map((e) => e.querySelector("h2").id))
	const sigils = []
	for (const id of heads) {
		const m = await page.evaluate(async (id) => {
			const h2 = document.getElementById(id)
			const head = h2.closest("section")
			window.scrollTo({ top: h2.getBoundingClientRect().top + scrollY - innerHeight * 0.3, behavior: "instant" })
			await new Promise((r) => setTimeout(r, 150))
			const inlay = head.querySelector(".sigil__inlay")
			const L = inlay.getTotalLength()
			const ctm = inlay.getScreenCTM()
			const pts = []
			for (let k = 0; k <= 48; k++) {
				const p = inlay.getPointAtLength((L * k) / 48)
				const s = new DOMPoint(p.x, p.y).matrixTransform(ctm)
				pts.push([s.x * devicePixelRatio, s.y * devicePixelRatio])
			}
			const cap = inlay.ownerSVGElement.nextElementSibling
			const cb = cap?.getBoundingClientRect()
			const hb = h2.getBoundingClientRect()
			const capVisible = !!cb && cb.width > 0 && getComputedStyle(cap).display !== "none"
			const capHit = capVisible && !(cb.right <= hb.left || hb.right <= cb.left || cb.bottom <= hb.top || hb.bottom <= cb.top)
			return { pts, capVisible, capHit, caption: cap?.textContent ?? null }
		}, id)
		const st = await imageStats(await page.screenshot(), { points: { inlay: m.pts } })
		sigils.push({ id, inlayLum: st.points.inlay, caption: m.caption, capVisible: m.capVisible, capHit: m.capHit })
		if (!(st.points.inlay >= 170)) fail(`${label}: sigil ${id} inlay median luminance ${st.points.inlay} < 170 once in view`)
		if (vp.width >= 861 && !m.capVisible) fail(`${label}: sigil ${id} has no visible caption`)
		if (m.capHit) fail(`${label}: sigil ${id} caption overlaps its title`)
	}
	// The band vs the night above it: two empty 100 x 100 px regions right of centre, either side of the
	// Research band's top edge, below its inset shadow (the margin above is empty; the title ends left of them).
	const band = await page.evaluate(async () => {
		const el = document.getElementById("research")
		window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 300, behavior: "instant" })
		await new Promise((r) => setTimeout(r, 150))
		const top = el.getBoundingClientRect().top
		return { top, x: innerWidth * 0.5 + 280, dpr: devicePixelRatio }
	})
	const k = band.dpr
	const bs = await imageStats(await page.screenshot(), {
		regions: {
			night: { x: band.x * k, y: (band.top - 110) * k, w: 100 * k, h: 100 * k },
			band: { x: band.x * k, y: (band.top + 50) * k, w: 100 * k, h: 100 * k },
		},
	})
	const bandContrast = bs.regions.band && bs.regions.night ? +contrast(bs.regions.band.rgb, bs.regions.night.rgb).toFixed(3) : null
	if (!(bandContrast >= 1.12)) fail(`${label}: sunken band vs night ${bandContrast}:1 < 1.12:1`)
	return { sigils, bandContrast, bandRgb: bs.regions.band?.rgb, nightRgb: bs.regions.night?.rgb }
}

/**
 * The sticky sigil rail (v2.6, the type/rhythm system that replaced v2.5's seven identical headers).
 * Desktop (>= 861 px), for each section with a rail, its grid's middle scrolled to the viewport's middle:
 * the rail is sticky, >= 16 px clear of the body column and inside its own grid (it never crosses into
 * the next section); where the grid is taller than the viewport the rail is engaged (its top at the
 * sticky offset, below the header, the sigil wholly in view). Scale: each rail title is <= 0.7x Play's
 * and its sigil is >= 1.5x the title's font size. Phones (< 861 px): no rail: it is not sticky and its
 * sigil shares the title's row, left of it. Saves <label>-rail-<id>.png at that scroll position.
 */
async function railGate(page, label, vp) {
	const ids = await page.$$eval("main section", (els) => els.filter((e) => e.querySelector("[data-rail]")).map((e) => e.id))
	const out = []
	for (const id of ids) {
		const m = await page.evaluate(async (id) => {
			const sec = document.getElementById(id)
			const rail = sec.querySelector("[data-rail]")
			const body = sec.querySelector("[data-rail-body]")
			const h2 = sec.querySelector("h2")
			const grid = rail.parentElement
			const g0 = grid.getBoundingClientRect()
			window.scrollTo({ top: g0.top + scrollY + g0.height / 2 - innerHeight / 2, behavior: "instant" })
			await new Promise((r) => setTimeout(r, 200))
			const r = (el) => {
				const b = el.getBoundingClientRect()
				return { x: b.left, y: b.top, r: b.right, b: b.bottom, h: b.height }
			}
			const play = document.getElementById("play-title")
			const header = document.querySelector(".site-header")
			const cs = getComputedStyle(rail)
			return {
				position: cs.position,
				stickyTop: parseFloat(cs.top),
				rail: r(rail),
				sigil: r(rail.querySelector("svg")),
				body: r(body),
				grid: r(grid),
				h2: r(h2),
				headerBottom: header ? header.getBoundingClientRect().bottom : 0,
				h2Size: parseFloat(getComputedStyle(h2).fontSize),
				playSize: play ? parseFloat(getComputedStyle(play).fontSize) : null,
				vh: innerHeight,
			}
		}, id)
		const o = { id, position: m.position, h2px: m.h2Size, sigilPx: Math.round(m.sigil.h) }
		if (vp.width >= 861) {
			o.clearBody = Math.round(m.body.x - m.rail.r)
			o.engaged = null
			if (m.position !== "sticky") fail(`${label}: rail ${id} is ${m.position}, not sticky`)
			if (o.clearBody < 16) fail(`${label}: rail ${id} is ${o.clearBody} px from the body column (< 16)`)
			if (m.rail.y < m.grid.y - 1 || m.rail.b > m.grid.b + 1) fail(`${label}: rail ${id} leaves its section (${Math.round(m.rail.y)}-${Math.round(m.rail.b)} vs grid ${Math.round(m.grid.y)}-${Math.round(m.grid.b)})`)
			if (m.grid.h > m.vh) {
				o.engaged = Math.abs(m.rail.y - m.stickyTop) <= 2 && m.rail.y >= m.headerBottom && m.sigil.b <= m.vh
				if (!o.engaged) fail(`${label}: rail ${id} is not engaged mid-section (top ${Math.round(m.rail.y)}, sticky ${m.stickyTop}, header ${Math.round(m.headerBottom)}, sigil bottom ${Math.round(m.sigil.b)})`)
			}
			if (m.playSize && m.h2Size > 0.7 * m.playSize) fail(`${label}: rail title ${id} is ${m.h2Size} px, > 0.7x Play's ${m.playSize} px`)
			if (m.sigil.h < 1.5 * m.h2Size) fail(`${label}: rail sigil ${id} is ${Math.round(m.sigil.h)} px, < 1.5x its ${m.h2Size} px title`)
		} else {
			o.inline = m.sigil.y < m.h2.b && m.h2.y < m.sigil.b && m.sigil.r <= m.h2.x
			if (m.position === "sticky") fail(`${label}: rail ${id} is sticky on a phone`)
			if (!o.inline) fail(`${label}: sigil ${id} is not inline with its title on a phone`)
		}
		await page.screenshot({ path: path.join(outDir, `${label}-rail-${id}.png`), scale: "css" })
		out.push(o)
	}
	return out
}

/**
 * The Proof harness diagram (v2.4, v2.3 critique fix 3), at desktop widths. It has an accessible name;
 * from 1200 px (where it sits in the slab's top right) it is >= 24 px clear of the figure and of the
 * slab's edges, and the slab's top-right quadrant is no longer empty: >= 15 % of its pixels differ from
 * the slab's median luminance by >= 10 (v2.3's empty quadrant: 0.6 %; the grain stays under 10).
 * Scrolled into view it is fully drawn within 1.2 s with no animation left running; under reduced
 * motion it is never armed and nothing runs.
 */
async function diagramGate(page, label, vp, reduced) {
	const m = await page.evaluate(async () => {
		const fig = document.querySelector("#work figure")
		if (!fig) return null
		const svg = fig.querySelector("svg")
		const slab = fig.closest("article")
		window.scrollTo({ top: slab.getBoundingClientRect().top + scrollY - 120, behavior: "instant" })
		await new Promise((r) => setTimeout(r, 1200))
		const r = (el) => {
			const b = el.getBoundingClientRect()
			return { x: b.left, y: b.top, r: b.right, b: b.bottom }
		}
		const figure = slab.querySelector(":scope > p:not(.meta):has(> span + span)")
		const name = (svg.getAttribute("aria-labelledby") || "").split(" ").map((id) => document.getElementById(id)?.textContent.trim() ?? "").join(" ")
		return {
			svg: r(svg),
			slab: r(slab),
			figure: figure ? r(figure) : null,
			role: svg.getAttribute("role"),
			name,
			draw: fig.dataset.draw ?? null,
			running: fig.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length,
			undrawn: [...svg.querySelectorAll("path")].filter((p) => parseFloat(getComputedStyle(p).strokeDashoffset) > 0.001).length,
			dpr: devicePixelRatio,
		}
	})
	if (!m) {
		fail(`${label}: no harness diagram in the Proof slab`)
		return null
	}
	const out = { name: m.name.slice(0, 60), draw: m.draw, running: m.running, undrawn: m.undrawn }
	if (m.role !== "img" || m.name.length < 40) fail(`${label}: the harness diagram has no accessible name (role ${m.role}, "${m.name}")`)
	if (m.undrawn || m.running) fail(`${label}: the harness diagram is not fully drawn 1.2 s after scrolling in (${m.undrawn} edges undrawn, ${m.running} animations running)`)
	if (reduced && m.draw) fail(`${label}: the harness diagram is armed under reduced motion (data-draw="${m.draw}")`)
	if (vp.width >= 1200) {
		out.clearFigure = Math.round(m.figure.y - m.svg.b)
		out.clearRight = Math.round(m.slab.r - m.svg.r)
		out.clearTop = Math.round(m.svg.y - m.slab.y)
		if (Math.min(out.clearFigure, out.clearRight, out.clearTop) < 24) fail(`${label}: the harness diagram is < 24 px from the figure or the slab's edge (${out.clearFigure}/${out.clearRight}/${out.clearTop})`)
		// the slab's top-right quadrant, inset 2 px from the slab's border
		const k = m.dpr
		const q = { x: ((m.slab.x + m.slab.r) / 2) * k, y: (m.slab.y + 2) * k, w: ((m.slab.r - m.slab.x) / 2 - 2) * k, h: ((m.slab.b - m.slab.y) / 2 - 2) * k }
		await page.mouse.move(2, 2) // no pointer torchlight on the slab
		await page.waitForTimeout(200)
		const shot = await page.screenshot()
		const ctx = await browser.newContext()
		const scratch = await ctx.newPage()
		out.inkPct = await scratch.evaluate(
			async ([b64, q]) => {
				const img = new Image()
				img.src = "data:image/png;base64," + b64
				await img.decode()
				const c = document.createElement("canvas")
				c.width = img.width
				c.height = img.height
				const g = c.getContext("2d")
				g.drawImage(img, 0, 0)
				const d = g.getImageData(Math.round(q.x), Math.round(q.y), Math.round(q.w), Math.round(q.h)).data
				const L = new Float32Array(d.length / 4)
				for (let i = 0, j = 0; i < d.length; i += 4, j++) L[j] = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]
				const med = Float32Array.from(L).sort()[L.length >> 1]
				let ink = 0
				for (const v of L) if (Math.abs(v - med) >= 10) ink++
				return +((ink / L.length) * 100).toFixed(1)
			},
			[shot.toString("base64"), q]
		)
		await ctx.close()
		if (!(out.inkPct >= 15)) fail(`${label}: the Proof slab's top-right quadrant is ${out.inkPct} % ink (< 15 %)`)
	}
	return out
}

for (const route of runs("main") ? ROUTES : []) {
	for (const vp of VIEWPORTS) {
		for (const reduced of [false, true]) {
			if (route !== "/" && reduced) continue
			const label = `${slug(route)}-${vp.name}${reduced ? "-reduced" : ""}`
			console.log(`> ${label}`)
			const ctx = await browser.newContext({
				viewport: { width: vp.width, height: vp.height },
				deviceScaleFactor: 2,
				hasTouch: vp.touch,
				isMobile: vp.touch,
				reducedMotion: reduced ? "reduce" : "no-preference",
			})
			const page = await ctx.newPage()
			const consoleErrors = []
			const failedRequests = []
			page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()))
			page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${e.message}`))
			page.on("response", (r) => r.status() >= 400 && failedRequests.push(`${r.status()} ${r.url()}`))
			// The baked stone face (v2.5) is desktop-only: a phone must never request it.
			const bakedFace = []
			page.on("request", (r) => /\/stone\/face-\d+\.avif/.test(r.url()) && bakedFace.push(new URL(r.url()).pathname))
			await page.addInitScript(() => {
				window.__lcp = []
				try {
					new PerformanceObserver((list) => {
						for (const e of list.getEntries()) {
							const el = e.element
							window.__lcp.push({ t: Math.round(e.startTime), tag: el ? el.tagName.toLowerCase() : null, id: el?.id || null, text: el?.textContent?.trim().slice(0, 40) || null })
						}
					}).observe({ type: "largest-contentful-paint", buffered: true })
				} catch {}
			})
			await page.goto(base + route, { waitUntil: "load" })
			// Hide the Next dev-mode indicator so dev shots match production.
			await page.addStyleTag({ content: "nextjs-portal{display:none!important}" })
			// Give the deferred work (idle callbacks, the gated 3D import) a chance to run.
			await page.waitForTimeout(reduced ? 600 : 3500)

			const fonts = await fontProbe(page)
			const run = { label, route, viewport: vp.name, reduced, fonts: { ...fonts, faces: undefined } }
			// Real faces only: next/font also declares local() "… Fallback" faces that always load.
			const loaded = (re) => fonts.faces.filter((f) => re.test(f.family) && !/Fallback/i.test(f.family) && f.status === "loaded")
			run.fonts.loadedDisplay = loaded(DISPLAY).map((f) => `${f.family} ${f.weight} ${f.style}`)
			run.fonts.loadedText = loaded(TEXT).map((f) => `${f.family} ${f.weight} ${f.style}`)
			if (!DISPLAY.test(fonts.h1Family)) fail(`${label}: h1 font-family is "${fonts.h1Family}", expected Cormorant`)
			if (!TEXT.test(fonts.bodyFamily)) fail(`${label}: body font-family is "${fonts.bodyFamily}", expected Mona Sans`)
			if (!fonts.h1Check || !run.fonts.loadedDisplay.length) fail(`${label}: Cormorant not loaded`)
			if (!fonts.bodyCheck || !run.fonts.loadedText.length) fail(`${label}: Mona Sans not loaded`)

			const dims = await page.evaluate(() => ({
				scrollWidth: document.documentElement.scrollWidth,
				innerWidth: window.innerWidth,
				pageHeight: document.documentElement.scrollHeight,
				three: typeof window.__THREE__ !== "undefined", // before any scroll/interaction
				js: performance
					.getEntriesByType("resource")
					.filter((r) => r.initiatorType === "script" || /\.js(\?|$)/.test(r.name))
					.map((r) => ({ name: r.name.split("/").pop(), transfer: r.transferSize, encoded: r.encodedBodySize })),
				resumeTop: (() => {
					const a = document.querySelector('a[href$="resume.pdf"]')
					return a ? Math.round(a.getBoundingClientRect().top + window.scrollY) : null
				})(),
				primaryBottom: (() => {
					const a = document.querySelector("main .btn--primary")
					return a ? Math.round(a.getBoundingClientRect().bottom + window.scrollY) : null
				})(),
				// Visible words in the hero (not visually-hidden, aria-hidden or SVG text).
				heroWords: (() => {
					const hero = document.querySelector("main > section")
					if (!hero) return null
					const walker = document.createTreeWalker(hero, NodeFilter.SHOW_TEXT)
					let n = 0
					for (let t = walker.nextNode(); t; t = walker.nextNode()) {
						const el = t.parentElement
						if (!el || el.closest(".visually-hidden,[aria-hidden='true'],svg")) continue
						const cs = getComputedStyle(el)
						if (cs.display === "none" || cs.visibility === "hidden") continue
						n += t.textContent.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length
					}
					return n
				})(),
				lcp: window.__lcp?.at(-1) ?? null,
			}))
			Object.assign(run, dims)
			run.jsEncodedKB = Math.round(dims.js.reduce((n, r) => n + (r.encoded || 0), 0) / 1024)
			delete run.js
			// Compare with the emulated width: on mobile, wide content silently grows the layout viewport.
			if (dims.scrollWidth > vp.width || dims.innerWidth > vp.width) fail(`${label}: horizontal overflow ${dims.scrollWidth} > ${vp.width}`)
			if (route === "/") {
				if (dims.primaryBottom == null || dims.primaryBottom > ctaMax(vp)) fail(`${label}: primary CTA bottom ${dims.primaryBottom} > ${ctaMax(vp)}`)
				if (dims.heroWords == null || dims.heroWords > HERO_WORDS_MAX) fail(`${label}: hero has ${dims.heroWords} visible words > ${HERO_WORDS_MAX}`)
			}

			const base_ = path.join(outDir, label)
			// The fold is the untouched first impression (no scroll, so touch devices still show the SVG stone).
			await page.screenshot({ path: `${base_}-fold.png` })
			// Then walk the page so lazy images load before the full-page and section shots.
			// (On touch contexts this scroll counts as a first interaction and may load the 3D stone.)
			await page.evaluate(async () => {
				for (let y = 0; y < document.documentElement.scrollHeight; y += Math.round(innerHeight * 0.7)) {
					window.scrollTo(0, y)
					await new Promise((r) => setTimeout(r, 140))
				}
				window.scrollTo(0, 0)
			})
			await page.waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 15000 }).catch(() => {})
			await page.waitForTimeout(400)
			// Real height once content-visibility sections have rendered.
			run.pageHeight = await page.evaluate(() => document.documentElement.scrollHeight)
			if (route === "/" && run.pageHeight > HEIGHT_MAX[kind(vp)]) fail(`${label}: page is ${run.pageHeight} px tall > ${HEIGHT_MAX[kind(vp)]}`)
			// Full page at 1 image px per CSS px: Chromium tiles/duplicates captures taller than 16384 device px.
			await page.screenshot({ path: `${base_}-full.png`, fullPage: true, scale: "css" })

			if (route === "/" && !reduced) {
				// Real viewport frames, one per screen: what a visitor sees (no fixed-layer tiling seam).
				const total = await page.evaluate(() => document.documentElement.scrollHeight)
				for (let i = 0, y = 0; y < total; i++, y += vp.height) {
					await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y)
					await page.waitForTimeout(160)
					await page.screenshot({ path: `${base_}-scroll-${String(i).padStart(2, "0")}.png`, scale: "css" })
				}
				await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }))
				// Un-stick the header so stitched section crops don't show it mid-section.
				const unstick = await page.addStyleTag({ content: ".site-header{position:relative!important}" })
				const sections = await page.$$("main > section")
				for (let i = 0; i < sections.length; i++) {
					const id = (await sections[i].getAttribute("id")) || (await sections[i].getAttribute("aria-labelledby")) || `s${i}`
					await sections[i].screenshot({ path: `${base_}-section-${String(i).padStart(2, "0")}-${id}.png` })
				}
				await unstick.evaluate((el) => el.remove())
				if (!vp.touch) {
					for (const [sel, name] of [
						[".slab", "hover-slab"],
						[".btn--primary", "hover-button"],
					]) {
						const el = await page.$(sel)
						if (!el) continue
						await el.scrollIntoViewIfNeeded()
						const box = await el.boundingBox()
						await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.4)
						await page.waitForTimeout(400)
						const pad = 24
						await page.screenshot({
							path: `${base_}-${name}.png`,
							clip: { x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad), width: box.width + pad * 2, height: box.height + pad * 2 },
						})
					}
				}
				const axe = await new AxeBuilder({ page }).analyze()
				run.axe = axe.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }))
				const bad = axe.violations.filter((v) => v.impact === "serious" || v.impact === "critical")
				if (bad.length) fail(`${label}: axe ${bad.map((v) => `${v.id}(${v.impact})`).join(", ")}`)
			}

			if (route === "/" && !vp.touch) {
				run.sigils = await sigilGate(page, label, vp)
				console.log(`  sigils ${run.sigils.sigils.map((x) => `${x.id.replace("-title", "")}=${x.inlayLum}`).join(" ")} band=${run.sigils.bandContrast}:1`)
				run.diagram = await diagramGate(page, label, vp, reduced)
				console.log(`  diagram ${JSON.stringify(run.diagram)}`)
			}
			if (route === "/") {
				run.rail = await railGate(page, label, vp)
				console.log(`  rail ${run.rail.map((x) => `${x.id}:${x.position}/${x.h2px}px/sigil ${x.sigilPx}${x.engaged != null ? `/engaged=${x.engaged}` : ""}${x.inline != null ? `/inline=${x.inline}` : ""}`).join(" ")}`)
			}

			run.consoleErrors = consoleErrors
			run.failedRequests = failedRequests
			run.bakedFace = bakedFace
			if (route === "/" && vp.width < 861 && bakedFace.length) fail(`${label}: a phone requested the baked stone face (${bakedFace.join(", ")})`)
			if (route === "/" && vp.width >= 861 && bakedFace.length !== 1) fail(`${label}: the baked stone face was requested ${bakedFace.length} times (${bakedFace.join(", ")}), expected once`)
			if (consoleErrors.length) fail(`${label}: console errors: ${consoleErrors.join(" | ")}`)
			if (failedRequests.length) fail(`${label}: failed requests: ${failedRequests.join(" | ")}`)
			report.runs.push(run)
			console.log(
				`  fonts h1="${fonts.h1Family.slice(0, 40)}" loaded=${run.fonts.loadedDisplay.length}/${run.fonts.loadedText.length}` +
					` overflow=${dims.scrollWidth}/${dims.innerWidth} height=${run.pageHeight} three=${dims.three} js=${run.jsEncodedKB}kB` +
					(route === "/" ? ` primaryBottom=${dims.primaryBottom} heroWords=${dims.heroWords} lcp=${dims.lcp?.tag}#${dims.lcp?.id ?? ""}@${dims.lcp?.t}ms bakedFace=[${bakedFace.join(",")}]` : "")
			)
			await ctx.close()
		}
	}
}

// Phone widths (v2.7: every 10 px from 320 to 440, plus 375/393/414; 320 alone before): no horizontal
// overflow, the header's brand + nav stay inside the gutters and its rune is never squeezed (until v2.7, at
// 420 px "Cottage" re-entered the nav and overflowed the page by 9 px, and flex-shrink drew the rune 0-9 px
// wide on 360-389 and 420-479 px phones).
const NARROW = [...Array.from({ length: 13 }, (_, i) => 320 + i * 10), 375, 393, 414, 467, 468].sort((a, b) => a - b)
for (const route of runs("narrow") ? ROUTES : []) {
	const ctx = await browser.newContext({ viewport: { width: 320, height: 640 }, hasTouch: true, isMobile: true })
	const page = await ctx.newPage()
	const worst = []
	for (const w of NARROW) {
		await page.setViewportSize({ width: w, height: 640 })
		await page.goto(base + route, { waitUntil: "load" })
		await page.evaluate(() => document.fonts.ready)
		await page.waitForTimeout(150)
		const d = await page.evaluate((w) => {
			const wide = [...document.querySelectorAll("body *")]
				.filter((el) => el.getBoundingClientRect().right > w + 0.5 && getComputedStyle(el).position !== "fixed")
				.slice(0, 5)
				.map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)} right=${Math.round(el.getBoundingClientRect().right)}`)
			const inner = document.querySelector(".site-header__inner")
			const nav = document.querySelector(".site-header nav")
			let headerOver = 0
			if (inner && nav) {
				const limit = inner.getBoundingClientRect().right - parseFloat(getComputedStyle(inner).paddingRight)
				headerOver = Math.round((nav.getBoundingClientRect().right - limit) * 10) / 10
			}
			// The brand rune is either hidden on purpose or drawn whole (18 px), never squeezed by flex-shrink.
			const rune = document.querySelector(".brand svg")
			const runeW = rune && getComputedStyle(rune).display !== "none" ? Math.round(rune.getBoundingClientRect().width * 10) / 10 : null
			return { sw: document.documentElement.scrollWidth, iw: window.innerWidth, wide, headerOver, runeW }
		}, w)
		const label = `${slug(route)}-${w}`
		report.runs.push({ label, route, viewport: String(w), scrollWidth: d.sw, innerWidth: d.iw, headerOver: d.headerOver, runeW: d.runeW, widest: d.wide })
		if (d.sw > w || d.iw > w) fail(`${label}: horizontal overflow ${d.sw} > ${w} (${d.wide.join("; ")})`)
		if (d.headerOver > 0.5) fail(`${label}: the header nav runs ${d.headerOver} px into the right gutter`)
		if (d.runeW != null && d.runeW < 17.5) fail(`${label}: the brand rune is squeezed to ${d.runeW} px`)
		worst.push(d.sw - w)
	}
	console.log(`> ${slug(route)}-${NARROW[0]}..${NARROW.at(-1)} (${NARROW.length} widths) max overflow=${Math.max(...worst)}`)
	await ctx.close()
}

// ---------- desktop folds (v2.2 fix 1, line-level since v2.3, every line since v2.4): no headline is sliced ----------
// Reduced motion, so the SVG stone and the final layout are measured. The Proof h2's line boxes (from
// Range.getClientRects(), merged by top) must ALL be whole inside the fold with >= 16 px to spare
// (bottom <= height - 16), or the FIRST must be wholly below it (top >= height). v2.3 gated line 1 only
// and passed a second line sliced through its x-height at 1440x900 (28 px of ascenders showing).
// The empty fold between the hero's email row and min(line 1 top, fold) is <= 140 px, and the email row
// ends >= 32 px above line 1 (v2.4: at 20-24 px the hero and Proof read as one block). The stone's
// ground shadow never overlaps the h2's box (also at 900 and 1024 wide). Sizes include common browser
// viewports (screen minus chrome) and MacBook screens (v2.4: Air 13"/15", Pro 14", full screen and
// with Chrome's ~124 px of chrome).
if (ROUTES.includes("/") && runs("folds")) {
	const FOLDS = [
		[1280, 720, true],
		[1280, 800, true],
		[1366, 768, true],
		[1366, 657, true], // a 1366x768 laptop with browser chrome
		[1440, 900, true],
		[1470, 956, true], // MacBook Air 15", full screen
		[1470, 832, true], // ... in Chrome
		[1512, 982, true], // MacBook Pro 14", full screen
		[1512, 858, true], // ... in Chrome
		[1536, 730, true],
		[1536, 864, true],
		[1600, 900, true],
		[1680, 925, true], // a 1680x1050 screen in a browser
		[1920, 950, true],
		[1920, 970, true],
		[1920, 1080, true],
		[900, 800, false], // ground-overlap check only
		[1024, 768, false],
	]
	const EMAIL_GAP_MIN = 32
	for (const [w, h, foldGate] of FOLDS) {
		const label = `home-fold-${w}x${h}`
		const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: "reduce" })
		const page = await ctx.newPage()
		await page.goto(base + "/", { waitUntil: "load" })
		await page.addStyleTag({ content: "nextjs-portal{display:none!important}" })
		await page.evaluate(() => document.fonts.ready)
		await page.waitForTimeout(300)
		const m = await page.evaluate(() => {
			const box = (sel) => {
				const el = document.querySelector(sel)
				if (!el) return null
				const b = el.getBoundingClientRect()
				return { x: b.left, y: b.top, r: b.right, b: b.bottom }
			}
			// the h2's line boxes: client rects of its contents, merged by top
			const range = document.createRange()
			range.selectNodeContents(document.querySelector("#work h2"))
			const lines = []
			for (const r of range.getClientRects()) {
				const l = lines.find((x) => Math.abs(x.t - r.top) < 4)
				if (l) l.b = Math.max(l.b, r.bottom)
				else lines.push({ t: r.top, b: r.bottom })
			}
			lines.sort((a, b) => a.t - b.t)
			return { h2: box("#work h2"), lines, email: box("main .copy-email"), ground: box(".stone__ground") }
		})
		const lines = m.lines.map((l) => ({ t: Math.round(l.t), b: Math.round(l.b) }))
		const first = lines[0]
		const last = lines.at(-1)
		const state = first.t >= h ? "below" : lines.every((l) => l.b <= h - 16) ? "in" : "cut"
		const gap = Math.round(Math.min(m.lines[0].t, h) - m.email.b)
		const emailGap = Math.round(m.lines[0].t - m.email.b)
		const hit = !!m.ground && m.ground.r > m.ground.x && !(m.ground.r <= m.h2.x || m.h2.r <= m.ground.x || m.ground.b <= m.h2.y || m.h2.b <= m.ground.y)
		report.runs.push({ label, lines, titleState: state, clearance: h - last.b, emailBottom: Math.round(m.email.b), gap, emailGap, groundHitsH2: hit })
		console.log(`> ${label} lines=${lines.map((l) => `${l.t}-${l.b}`).join(",")} (${state}; fold ${h}, clearance ${h - last.b}) gap=${gap} (max 140) emailGap=${emailGap} (min ${EMAIL_GAP_MIN}) groundHitsH2=${hit}`)
		if (foldGate && state === "cut") {
			const cut = lines.find((l) => l.b > h - 16)
			fail(`${label}: the fold at ${h} cuts the Proof title (line ${cut.t}-${cut.b}; every line needs bottom <= ${h - 16}, or line 1 top >= ${h})`)
		}
		if (foldGate && gap > 140) fail(`${label}: ${gap} px of empty fold below the email row (> 140)`)
		if (foldGate && emailGap < EMAIL_GAP_MIN) fail(`${label}: the email row ends ${emailGap} px above the Proof title (< ${EMAIL_GAP_MIN}); hero and Proof run together`)
		if (hit) fail(`${label}: the stone's ground shadow overlaps the Proof title`)
		await page.screenshot({ path: path.join(outDir, `${label}.png`) })
		await ctx.close()
	}
}

// ---------- first paint (v2.4): one face timing in the fold ----------
// 5 cold loads at 1440x900 (fresh context = empty cache, unthrottled), each recorded with a CDP
// screencast (PNG, every frame). The name, the header brand and the Proof title share one block-display
// Cormorant face, so the first frame in which the h1 has ink must already show the brand and the title
// as they look 1.5 s later: mean |luminance difference| <= 3 in both regions (v2.3 painted them in the
// fallback serif and swapped them at ~400 ms). Nor may any earlier frame, from the first paint on, show
// them with ink that differs from +1.5 s by more than 3 (blank is allowed, the fallback is not: on a
// local server the swap is over by the name's first frame, so this is what catches it there). And the h1
// may not lag the lede (Mona Sans, swap) by more than 150 ms: a hero with its lede but no name. A region only counts as inked on the dark page (its
// median luminance < 80), so about:blank never does. Load 1's first painted frame, first h1-ink frame and
// +1.5 s frame are saved as first-paint-1-*.png.
async function frameLab() {
	const ctx = await browser.newContext()
	const page = await ctx.newPage()
	await page.evaluate(() => {
		window.__store = []
		window.__measure = async (b64, regions, inkY) => {
			const img = new Image()
			img.src = "data:image/png;base64," + b64
			await img.decode()
			const c = document.createElement("canvas")
			c.width = img.width
			c.height = img.height
			const g = c.getContext("2d")
			g.drawImage(img, 0, 0)
			const out = { i: window.__store.length, regions: {} }
			const keep = {}
			for (const [k, r] of Object.entries(regions)) {
				const x0 = Math.max(0, Math.round(r.x))
				const y0 = Math.max(0, Math.round(r.y))
				const w = Math.min(c.width, Math.round(r.x + r.w)) - x0
				const h = Math.min(c.height, Math.round(r.y + r.h)) - y0
				if (w < 4 || h < 4) continue
				const d = g.getImageData(x0, y0, w, h).data
				const lum = new Float32Array(w * h)
				let ink = 0
				for (let p = 0, q = 0; p < d.length; p += 4, q++) {
					lum[q] = 0.2126 * d[p] + 0.7152 * d[p + 1] + 0.0722 * d[p + 2]
					if (lum[q] >= inkY) ink++
				}
				const median = Float32Array.from(lum).sort()[lum.length >> 1]
				keep[k] = lum
				out.regions[k] = { median: Math.round(median), ink: ink / lum.length }
			}
			window.__store.push(keep)
			return out
		}
		window.__delta = (i, j, k) => {
			const a = window.__store[i]?.[k]
			const b = window.__store[j]?.[k]
			if (!a || !b || a.length !== b.length) return null
			let s = 0
			for (let q = 0; q < a.length; q++) s += Math.abs(a[q] - b[q])
			return s / a.length
		}
	})
	return { ctx, page }
}

if (ROUTES.includes("/") && runs("firstpaint")) {
	const LOADS = Number(process.env.FIRST_PAINT_LOADS || 5)
	const [W, H] = [1440, 900]
	const INK_Y = 110 // text is ink-1 (luminance ~233) on the night page (~15-50 under the torch)
	const INK_FRAC = 0.003
	const DARK = 80
	const DELTA_MAX = 3
	const LAG_MAX = 0.15 // s
	const lab = await frameLab()
	for (let k = 1; k <= LOADS; k++) {
		const label = `first-paint-${k}`
		const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })
		const page = await ctx.newPage()
		const cdp = await ctx.newCDPSession(page)
		const frames = []
		cdp.on("Page.screencastFrame", ({ data, metadata, sessionId }) => {
			frames.push({ t: metadata.timestamp, data })
			cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {})
		})
		await cdp.send("Page.startScreencast", { format: "png", maxWidth: W, maxHeight: H, everyNthFrame: 1 })
		await page.goto(base + "/", { waitUntil: "load" })
		await page.waitForTimeout(2400)
		await cdp.send("Page.stopScreencast")
		// Final-layout regions: the name (padded for its 8 px rise), the lede, the brand's words, the Proof title.
		const regions = await page.evaluate(() => {
			const r = (el, pad = 4) => {
				const b = el.getBoundingClientRect()
				return { x: b.left - pad, y: b.top - pad, w: b.width + 2 * pad, h: b.height + 2 * pad }
			}
			const h1 = document.querySelector("#hero-title")
			return {
				h1: r(h1, 12),
				lede: r(h1.parentElement.querySelector("p")),
				brand: r(document.querySelector(".brand span")),
				title: r(document.querySelector("#work h2")),
			}
		})
		await ctx.close()
		// Walk the frames in order until the name and the lede both have ink, then find the frame at +1.5 s.
		let firstDark = null
		let h1At = null
		let ledeAt = null
		let h1Frame = null
		const measured = new Map()
		const measure = async (idx) => {
			if (!measured.has(idx)) measured.set(idx, await lab.page.evaluate(([b64, rg, inkY]) => window.__measure(b64, rg, inkY), [frames[idx].data, regions, INK_Y]))
			return measured.get(idx)
		}
		const inked = (m, key) => !!m.regions[key] && m.regions[key].median < DARK && m.regions[key].ink >= INK_FRAC
		for (let i = 0; i < frames.length && (h1At == null || ledeAt == null); i++) {
			const m = await measure(i)
			if (firstDark == null && m.regions.h1?.median < DARK) firstDark = i
			if (ledeAt == null && inked(m, "lede")) ledeAt = frames[i].t
			if (h1At == null && inked(m, "h1")) {
				h1At = frames[i].t
				h1Frame = i
			}
		}
		const run = { label, frames: frames.length, regions }
		if (h1Frame == null) {
			fail(`${label}: the name never painted in ${frames.length} screencast frames`)
			report.runs.push(run)
			continue
		}
		let later = h1Frame
		for (let i = h1Frame; i < frames.length && frames[i].t <= h1At + 1.5; i++) later = i
		const a = await measure(h1Frame)
		const b = await measure(later)
		const dBrand = await lab.page.evaluate(([i, j]) => window.__delta(i, j, "brand"), [a.i, b.i])
		const dTitle = await lab.page.evaluate(([i, j]) => window.__delta(i, j, "title"), [a.i, b.i])
		// Every frame from the first paint up to the name's: the brand and title are blank or final.
		let fallbackFrames = 0
		for (let i = firstDark ?? 0; i < h1Frame; i++) {
			const m = await measure(i)
			for (const key of ["brand", "title"]) {
				if (!(m.regions[key]?.ink >= INK_FRAC)) continue
				const d = await lab.page.evaluate(([x, y, kk]) => window.__delta(x, y, kk), [m.i, b.i, key])
				if (d > DELTA_MAX) {
					fallbackFrames++
					break
				}
			}
		}
		const t0 = frames[firstDark ?? 0].t
		Object.assign(run, {
			fallbackFrames,
			firstPaintToName: Math.round((h1At - t0) * 1000),
			nameLagsLede: ledeAt == null ? null : Math.round((h1At - ledeAt) * 1000),
			comparedAfter: Math.round((frames[later].t - h1At) * 1000),
			brandDelta: dBrand == null ? null : +dBrand.toFixed(2),
			titleDelta: dTitle == null ? null : +dTitle.toFixed(2),
			brandInkAtName: +(a.regions.brand?.ink ?? 0).toFixed(4),
			titleInkAtName: +(a.regions.title?.ink ?? 0).toFixed(4),
		})
		report.runs.push(run)
		console.log(
			`> ${label} frames=${frames.length} name inked ${run.firstPaintToName} ms after first paint, lags lede by ${run.nameLagsLede} ms;` +
				` brand |d|=${run.brandDelta} title |d|=${run.titleDelta} (vs +${run.comparedAfter} ms); fallback frames before it=${fallbackFrames}`
		)
		if (run.nameLagsLede != null && run.nameLagsLede > LAG_MAX * 1000) fail(`${label}: the lede has ink ${run.nameLagsLede} ms before the name (> ${LAG_MAX * 1000} ms)`)
		if (dBrand == null || dBrand > DELTA_MAX) fail(`${label}: the brand changes by mean |d| ${dBrand} between the name's first frame and +1.5 s (> ${DELTA_MAX}; a font swap)`)
		if (dTitle == null || dTitle > DELTA_MAX) fail(`${label}: the Proof title changes by mean |d| ${dTitle} between the name's first frame and +1.5 s (> ${DELTA_MAX}; a font swap)`)
		if (fallbackFrames) fail(`${label}: ${fallbackFrames} frame(s) before the name show the brand or the Proof title in another face (|d| > ${DELTA_MAX} vs +1.5 s)`)
		if (k === 1) {
			const save = (i, name) => writeFile(path.join(outDir, `${label}-${name}.png`), Buffer.from(frames[i].data, "base64"))
			await save(firstDark ?? 0, "a-first-paint")
			await save(h1Frame, "b-name-inked")
			await save(later, "c-plus-1500ms")
		}
		await lab.page.evaluate(() => (window.__store = []))
	}
	await lab.ctx.close()
}

// ---------- stone handoff: SVG (reduced motion) vs WebGL (after the swap) ----------
async function analyze(svgPng, glPng) {
	const ctx = await browser.newContext()
	const page = await ctx.newPage()
	const res = await page.evaluate(
		async ([a, b]) => {
			const load = async (b64) => {
				const img = new Image()
				img.src = "data:image/png;base64," + b64
				await img.decode()
				const c = document.createElement("canvas")
				c.width = img.width
				c.height = img.height
				const g = c.getContext("2d")
				g.drawImage(img, 0, 0)
				return g.getImageData(0, 0, c.width, c.height)
			}
			const [A, B] = await Promise.all([load(a), load(b)])
			const Y = (d, i) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]
			const median = (img) => {
				const v = []
				for (let i = 0; i < img.data.length; i += 4) v.push(Y(img.data, i))
				v.sort((x, y) => x - y)
				return v[v.length >> 1]
			}
			let diff = 0
			const n = Math.min(A.data.length, B.data.length)
			for (let i = 0; i < n; i += 4) diff += Math.abs(Y(A.data, i) - Y(B.data, i))
			return { svg: median(A), webgl: median(B), meanAbsDiff: diff / (n / 4) }
		},
		[svgPng.toString("base64"), glPng.toString("base64")]
	)
	await ctx.close()
	return res
}

/**
 * The stone's pattern, not just its energy (v2.5, v2.3 critique fix 2), on the SVG and WebGL stage frames.
 *   - High-pass NCC: luminance minus a 13 x 13 box blur (the material gate's high-pass) in each face band,
 *     then the normalised cross-correlation of the two renderers over all bands. v2.3 measured ~0 (0.16 at
 *     1440): the handoff replaced one pattern with another while luminance and sigma matched.
 *   - Lamination energy: hairline beds are lines along the bed, so the luminance is first smoothed 9 px
 *     along it (horizontally; the beds descend 8 deg) and then high-passed 9 px across it; the sigma of
 *     that over the mean luminance (a contrast, so the shadowed flank and the lit face compare). `face` is a
 *     rect; `flank` is the generated right facet (stage-unit path) mapped by `xf` = [sx, sy, ox, oy] and
 *     eroded so every window is inside it.
 */
async function structure(svgPng, glPng, { bands, face, flank, xf }) {
	const ctx = await browser.newContext()
	const page = await ctx.newPage()
	const res = await page.evaluate(
		async ([a, b, bands, face, flank, xf]) => {
			const load = async (b64) => {
				const img = new Image()
				img.src = "data:image/png;base64," + b64
				await img.decode()
				const c = document.createElement("canvas")
				c.width = img.width
				c.height = img.height
				const g = c.getContext("2d")
				g.drawImage(img, 0, 0)
				const { data, width, height } = g.getImageData(0, 0, c.width, c.height)
				const L = new Float32Array(width * height)
				for (let i = 0, j = 0; i < data.length; i += 4, j++) L[j] = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
				return { L, width, height }
			}
			const [A, B] = await Promise.all([load(a), load(b)])
			const { width: W, height: H } = A
			// box mean over [x-rx, x+rx] x [y-ry, y+ry] via an integral image
			const integral = (L) => {
				const I = new Float64Array((W + 1) * (H + 1))
				for (let y = 0; y < H; y++) {
					let row = 0
					for (let x = 0; x < W; x++) {
						row += L[y * W + x]
						I[(y + 1) * (W + 1) + x + 1] = I[y * (W + 1) + x + 1] + row
					}
				}
				return (x0, y0, x1, y1) => I[(y1 + 1) * (W + 1) + x1 + 1] - I[y0 * (W + 1) + x1 + 1] - I[(y1 + 1) * (W + 1) + x0] + I[y0 * (W + 1) + x0]
			}
			const rectPx = (r) => {
				const x0 = Math.max(0, Math.round(r.x))
				const y0 = Math.max(0, Math.round(r.y))
				return { x0, y0, x1: Math.min(W, Math.round(r.x + r.w)) - 1, y1: Math.min(H, Math.round(r.y + r.h)) - 1 }
			}
			// high-pass NCC over the bands
			const hpA = integral(A.L)
			const hpB = integral(B.L)
			const rad = 6
			let sa = 0, sb = 0, saa = 0, sbb = 0, sab = 0, n = 0
			for (const r of Object.values(bands)) {
				const { x0, y0, x1, y1 } = rectPx(r)
				for (let y = y0 + rad; y <= y1 - rad; y++)
					for (let x = x0 + rad; x <= x1 - rad; x++) {
						const k = (2 * rad + 1) ** 2
						const p = A.L[y * W + x] - hpA(x - rad, y - rad, x + rad, y + rad) / k
						const q = B.L[y * W + x] - hpB(x - rad, y - rad, x + rad, y + rad) / k
						sa += p
						sb += q
						saa += p * p
						sbb += q * q
						sab += p * q
						n++
					}
			}
			const cov = sab / n - (sa / n) * (sb / n)
			const ncc = cov / Math.sqrt((saa / n - (sa / n) ** 2) * (sbb / n - (sb / n) ** 2))
			// lamination energy: 9 px along the bed, high-passed 9 px across it, over the mean luminance
			const lamination = (img, inside) => {
				const { L } = img
				const I = integral(L)
				const r = 4
				const S = new Float32Array(W * H)
				for (let y = 0; y < H; y++) for (let x = r; x < W - r; x++) S[y * W + x] = I(x - r, y, x + r, y) / (2 * r + 1)
				const IS = integral(S)
				let s1 = 0, s2 = 0, sl = 0, m = 0
				for (let y = 2 * r; y < H - 2 * r; y++)
					for (let x = 2 * r; x < W - 2 * r; x++) {
						if (!inside(x, y)) continue
						const d = S[y * W + x] - IS(x, y - r, x, y + r) / (2 * r + 1)
						s1 += d
						s2 += d * d
						sl += L[y * W + x]
						m++
					}
				if (m < 200) return null
				return +(Math.sqrt(s2 / m - (s1 / m) ** 2) / (sl / m)).toFixed(4)
			}
			const fr = rectPx(face)
			const inFace = (x, y) => x >= fr.x0 + 8 && x <= fr.x1 - 8 && y >= fr.y0 + 8 && y <= fr.y1 - 8
			// the flank: the facet path rasterised, eroded by 9 px so every window lies on it
			const c = document.createElement("canvas")
			c.width = W
			c.height = H
			const g = c.getContext("2d")
			g.setTransform(xf[0], 0, 0, xf[1], xf[2], xf[3])
			g.fill(new Path2D(flank))
			const md = g.getImageData(0, 0, W, H).data
			const M = new Float32Array(W * H)
			for (let i = 0; i < W * H; i++) M[i] = md[i * 4 + 3] > 250 ? 1 : 0
			const IM = integral(M)
			const e = 9
			const inFlank = (x, y) => x - e >= 0 && y - e >= 0 && x + e < W && y + e < H && IM(x - e, y - e, x + e, y + e) >= (2 * e + 1) ** 2 - 0.5
			return {
				ncc,
				nccPixels: n,
				lamination: {
					svgFace: lamination(A, inFace),
					webglFace: lamination(B, inFace),
					svgFlank: lamination(A, inFlank),
					webglFlank: lamination(B, inFlank),
				},
			}
		},
		[svgPng.toString("base64"), glPng.toString("base64"), bands, face, flank, xf]
	)
	await ctx.close()
	return res
}

if (ROUTES.includes("/") && runs("handoff")) {
	for (const vp of VIEWPORTS) {
		const label = `home-${vp.name}-handoff`
		console.log(`> ${label}`)
		const shots = {}
		const stones = {}
		let stage = null
		let ok = true
		for (const reduced of [true, false]) {
			const ctx = await browser.newContext({
				viewport: { width: vp.width, height: vp.height },
				deviceScaleFactor: 2,
				hasTouch: vp.touch,
				isMobile: vp.touch,
				reducedMotion: reduced ? "reduce" : "no-preference",
			})
			const page = await ctx.newPage()
			await page.goto(base + "/", { waitUntil: "load" })
			await page.addStyleTag({ content: "nextjs-portal{display:none!important}" })
			await page.waitForTimeout(1300) // past the 1.2 s ignition
			const box = await page.locator(".hero-stone").boundingBox()
			const stone = { x: Math.max(0, box.x), y: Math.max(0, box.y), width: Math.min(box.width, vp.width - Math.max(0, box.x)), height: box.height }
			// The face: a band of the front face around the rune column (stage %, see components/hero/stone-profile.ts).
			const face = { x: box.x + box.width * 0.3, y: box.y + box.height * 0.22, width: box.width * 0.34, height: box.height * 0.62 }
			if (!reduced) {
				// The mobile gate is the first interaction.
				if (vp.touch) await page.evaluate(() => window.dispatchEvent(new Event("pointerdown")))
				try {
					await page.waitForSelector(".hero-stone[data-ready]", { timeout: 15000 })
					await page.waitForTimeout(175) // mid-fade
					await page.screenshot({ path: path.join(outDir, `${label}-2-mid.png`), clip: stone })
					await page.waitForSelector(".hero-stone[data-live]", { timeout: 5000 })
					await page.waitForTimeout(30)
				} catch {
					ok = false
				}
			}
			stones[reduced ? "svg" : "gl"] = await page.screenshot({ path: path.join(outDir, `${label}-${reduced ? "1-svg" : "3-webgl"}.png`), clip: stone })
			stage = { box, stone }
			shots[reduced ? "svg" : "gl"] = await page.screenshot({ clip: face })
			// What a retina laptop sees (v2.5): the face from the crown to below the runes, at device scale 2.
			if (!vp.touch) {
				const crop = { x: box.x + box.width * 0.25, y: Math.max(0, box.y + box.height * 0.1), width: box.width * 0.5, height: box.height * 0.55 }
				await page.screenshot({ path: path.join(outDir, `${label}-face-2x-${reduced ? "svg" : "webgl"}.png`), clip: crop })
			}
			await ctx.close()
		}
		if (!ok) {
			fail(`${label}: the WebGL stone never became ready`)
			continue
		}
		const r = await analyze(shots.svg, shots.gl)
		const delta = (r.webgl - r.svg) / r.svg
		report.runs.push({
			label,
			faceMedianSvg: +r.svg.toFixed(1),
			faceMedianWebgl: +r.webgl.toFixed(1),
			deltaPct: +(delta * 100).toFixed(1),
			meanAbsDiff: +r.meanAbsDiff.toFixed(1),
		})
		console.log(`  face median svg=${r.svg.toFixed(1)} webgl=${r.webgl.toFixed(1)} delta=${(delta * 100).toFixed(1)}% meanAbsDiff=${r.meanAbsDiff.toFixed(1)}`)
		if (Math.abs(delta) > PARITY) fail(`${label}: face luminance differs by ${(delta * 100).toFixed(1)}% (> ±${PARITY * 100}%)`)
		if (r.meanAbsDiff > PARITY_MAD) fail(`${label}: SVG vs WebGL face mean |diff| ${r.meanAbsDiff.toFixed(1)} > ${PARITY_MAD}`)
		if (vp.touch) continue
		// Stone material (v2.2 fix 3, retuned to night-lit slate in v2.3), on the same frames: regions in %
		// of the stage, as image px.
		const { box, stone } = stage
		const rgn = (x0, x1, y0, y1) => ({ x: (box.x + box.width * x0 - stone.x) * 2, y: (box.y + box.height * y0 - stone.y) * 2, w: box.width * (x1 - x0) * 2, h: box.height * (y1 - y0) * 2 })
		const regions = {
			away: rgn(0.285, 0.35, 0.29, 0.78), // the face >= 60 px from the runes
			near: rgn(0.38, 0.43, 0.35, 0.75), // the face within 60 px of them
			flank: rgn(0.71, 0.724, 0.62, 0.82), // inside the generated right facet
			upper: rgn(0.29, 0.37, 0.24, 0.34), // upper-left face, nearest the moon
			lowerRight: rgn(0.54, 0.64, 0.66, 0.76), // lower-right face, right of the runes
			mid: rgn(0.29, 0.37, 0.45, 0.55), // mid-face, left of the runes
			foot: rgn(0.29, 0.37, 0.745, 0.815), // the lowest tenth of the face above the base's mask
			runes: rgn(0.4, 0.52, 0.3, 0.8), // LARS: strokes, glow and bloom
		}
		const sv = (await imageStats(stones.svg, { regions })).regions
		const gl = (await imageStats(stones.gl, { regions })).regions
		const m = {
			label: `${label}-material`,
			svg: sv,
			webgl: gl,
			faceVsBase: +contrast(gl.away.rgb, BASE_RGB).toFixed(2),
			faceVsFlank: +contrast(gl.away.rgb, gl.flank.rgb).toFixed(2),
			falloff: +(gl.upper.lum / gl.lowerRight.lum).toFixed(2),
			footDarker: +(1 - gl.foot.lum / gl.mid.lum).toFixed(2),
			highPassRatio: +(sv.away.highPass / gl.away.highPass).toFixed(2),
			runeGlow: { mean: +(gl.runes.mean / sv.runes.mean - 1).toFixed(3), p90: +(gl.runes.p90 / sv.runes.p90 - 1).toFixed(3) },
		}
		report.runs.push(m)
		console.log(
			`  material webgl: away L*=${gl.away.lstar} hue=${gl.away.hue} sat=${gl.away.sat} hp=${gl.away.highPass}, near hue=${gl.near.hue}, flank sat=${gl.flank.sat}, face/base=${m.faceVsBase}:1, face/flank=${m.faceVsFlank}:1, falloff=${m.falloff}, foot=${m.footDarker}; svg hp=${sv.away.highPass} (x${m.highPassRatio}); rune glow gl/svg mean ${m.runeGlow.mean} p90 ${m.runeGlow.p90}`
		)
		// Night-lit blue-grey slate (v2.3): v2.2's neutral #7b7c7e read as studio-lit concrete (sat .006, L* 45).
		if (gl.away.sat < 0.03 || gl.away.sat > 0.07) fail(`${label}: WebGL face saturation ${gl.away.sat} away from the runes, expected .03-.07 (blue-grey slate)`)
		if (gl.away.hue < 200 || gl.away.hue > 225) fail(`${label}: WebGL face hue ${gl.away.hue} away from the runes, expected 200-225`)
		if (gl.away.lstar < 36 || gl.away.lstar > 41) fail(`${label}: WebGL face L* ${gl.away.lstar} away from the runes, expected 36-41 (night, not studio)`)
		if (gl.near.hue < 25 || gl.near.hue > 45) fail(`${label}: WebGL face hue ${gl.near.hue} near the runes, expected 25-45 (rune-fire warmth)`)
		if (gl.flank.sat > 0.12) fail(`${label}: WebGL flank saturation ${gl.flank.sat} > .12`)
		if (m.faceVsFlank < 1.8) fail(`${label}: face:flank ${m.faceVsFlank}:1 < 1.8:1`)
		if (m.faceVsBase < 2.3) fail(`${label}: face vs page ${m.faceVsBase}:1 < 2.3:1`)
		// The moon grades the face top-left -> bottom-right and the foot sits in its shadow. With these
		// regions v2.2 measured 1.30 and .23, which read "lit evenly, no ground contact": the bars are above it.
		if (m.falloff < 1.4) fail(`${label}: upper-left / lower-right face luminance ${m.falloff} < 1.40 (key fall-off)`)
		if (m.footDarker < 0.28) fail(`${label}: the foot is ${Math.round(m.footDarker * 100)} % darker than mid-face (< 28 %)`)
		// Texture from beds, lamination and pits, not white noise; and the same texture weight in both renderers.
		if (gl.away.highPass < 3 || gl.away.highPass > 6) fail(`${label}: WebGL face high-pass sigma ${gl.away.highPass}, expected 3-6`)
		if (m.highPassRatio < 0.75 || m.highPassRatio > 1.3) fail(`${label}: SVG / WebGL high-pass sigma ${m.highPassRatio}, expected 0.75-1.3`)
		// The rune fire must not dim (or flare) at the handoff.
		if (Math.abs(m.runeGlow.mean) > 0.03 || Math.abs(m.runeGlow.p90) > 0.03) fail(`${label}: rune glow changes at the handoff (mean ${m.runeGlow.mean}, p90 ${m.runeGlow.p90}; > ±3 %)`)
		// One material in both renderers (v2.5): the same pattern on the face (high-pass NCC >= 0.6 in the
		// bands either side of LARS), and hairline bedding on the edges, not the face (the face's lamination
		// energy <= 0.6 x the right flank's, WebGL).
		const st = await structure(stones.svg, stones.gl, {
			bands: { left: rgn(0.285, 0.37, 0.3, 0.8), right: rgn(0.55, 0.64, 0.45, 0.8) },
			face: regions.away,
			flank: FACET_RIGHT,
			xf: [(box.width / STAGE_W) * 2, (box.height / STAGE_H) * 2, (box.x - stone.x) * 2, (box.y - stone.y) * 2],
		})
		const lam = st.lamination
		const s = {
			label: `${label}-structure`,
			highPassNcc: +st.ncc.toFixed(3),
			nccPixels: st.nccPixels,
			lamination: lam,
			faceVsFlankLamination: lam.webglFace != null && lam.webglFlank ? +(lam.webglFace / lam.webglFlank).toFixed(2) : null,
		}
		report.runs.push(s)
		console.log(`  structure: high-pass NCC svg~webgl ${s.highPassNcc} (${s.nccPixels} px); lamination energy webgl face ${lam.webglFace} / flank ${lam.webglFlank} = ${s.faceVsFlankLamination}; svg face ${lam.svgFace} flank ${lam.svgFlank}`)
		if (!(s.highPassNcc >= 0.6)) fail(`${label}: SVG vs WebGL face high-pass NCC ${s.highPassNcc} < 0.6 (the handoff swaps the pattern)`)
		if (!(s.faceVsFlankLamination <= 0.6)) fail(`${label}: face lamination energy ${s.faceVsFlankLamination} x the flank's > 0.6 (hairlines belong on the edges)`)
	}
}

// ---------- links: internal hrefs answer 200 without a redirect; legacy URLs redirect once ----------
if (ROUTES.includes("/") && runs("links")) {
	const ctx = await browser.newContext()
	const page = await ctx.newPage()
	const hrefs = new Set()
	for (const route of ["/", "/writing"]) {
		await page.goto(base + route, { waitUntil: "domcontentloaded" })
		for (const h of await page.$$eval("a[href^='/']", (as) => as.map((a) => a.getAttribute("href")))) hrefs.add(h.split("#")[0] || "/")
	}
	const bad = []
	for (const h of hrefs) {
		const r = await ctx.request.get(base + h, { maxRedirects: 0 })
		if (r.status() !== 200) bad.push(`${h} -> ${r.status()}`)
	}
	// Legacy URLs (v2.7): requests percent-encode the decoded paths in lib/legacy-urls.json the way a
	// browser does (spaces as %20, the apostrophe left as is).
	const enc = (p) => p.split("/").map((seg) => encodeURIComponent(seg).replace(/%27/g, "'")).join("/")
	const legacy = { pages: 0, moved: 0, assets: 0, retired: 0 }
	const once = async (from, to) => {
		const r = await ctx.request.get(base + enc(from), { maxRedirects: 0 })
		if (from === to) {
			if (r.status() !== 200) bad.push(`legacy ${from} -> ${r.status()}${r.headers()["location"] ? ` ${r.headers()["location"]}` : ""} (expected 200, no redirect)`)
			return
		}
		const loc = r.headers()["location"] || ""
		const at = loc ? decodeURIComponent(new URL(loc, base + "/").pathname) : ""
		if (![301, 302, 307, 308].includes(r.status()) || at !== to) return bad.push(`legacy ${from} -> ${r.status()} ${loc} (expected one redirect to ${to})`)
		const r2 = await ctx.request.get(new URL(loc, base + "/").href, { maxRedirects: 0 })
		if (r2.status() !== 200) bad.push(`legacy ${from} -> ${to} -> ${r2.status()} (expected 200 after one redirect)`)
	}
	for (const [from, to] of Object.entries(LEGACY.pages)) await once(from, to), legacy.pages++
	for (const [from, to] of Object.entries(LEGACY.moved)) await once(from, to), legacy.moved++
	for (const a of LEGACY.assets) await once(a, a), legacy.assets++
	for (const from of Object.keys(LEGACY.retired)) {
		const r = await ctx.request.get(base + enc(from), { maxRedirects: 0 })
		if (r.status() !== 404) bad.push(`legacy ${from} (retired) -> ${r.status()}, expected 404`)
		legacy.retired++
	}
	const nLegacy = legacy.pages + legacy.moved + legacy.assets + legacy.retired
	report.runs.push({ label: "links", internal: hrefs.size, legacy, bad })
	console.log(`> links: ${hrefs.size} internal + ${nLegacy} legacy (${Object.entries(legacy).map(([k, v]) => `${k} ${v}`).join(", ")}), bad=${bad.length}`)
	if (bad.length) fail(`links: ${bad.join(" | ")}`)
	await ctx.close()
}

// ---------- meta (v2.7, go-live): résumé, robots, sitemap, share card, canonicals, JSON-LD, icons, 404 ----------
async function imageSize(buf, type) {
	const page = await browser.newPage()
	const size = await page.evaluate(
		async ([b64, type]) => {
			const img = new Image()
			img.src = `data:${type};base64,${b64}`
			await img.decode()
			return { width: img.naturalWidth, height: img.naturalHeight }
		},
		[buf.toString("base64"), type],
	)
	await page.close()
	return size
}
if (runs("meta")) {
	const ctx = await browser.newContext()
	const req = ctx.request
	const bad = []
	const meta = {}
	// Résumé: a real PDF, opened inline and saved under its own name.
	const pdf = await req.get(base + "/resume.pdf", { maxRedirects: 0 })
	const pdfBody = pdf.status() === 200 ? await pdf.body() : Buffer.alloc(0)
	meta.resume = { status: pdf.status(), type: pdf.headers()["content-type"], disposition: pdf.headers()["content-disposition"], bytes: pdfBody.length }
	if (pdf.status() !== 200) bad.push(`/resume.pdf -> ${pdf.status()}`)
	if (!/^application\/pdf/.test(meta.resume.type || "")) bad.push(`/resume.pdf content-type ${meta.resume.type}`)
	if (!/^inline;\s*filename="Lars_Crawford_Resume\.pdf"$/.test(meta.resume.disposition || "")) bad.push(`/resume.pdf content-disposition ${meta.resume.disposition}`)
	if (pdfBody.subarray(0, 5).toString() !== "%PDF-") bad.push("/resume.pdf is not a PDF")
	// robots.txt and the sitemap; every sitemap URL must answer 200 here.
	const robots = await req.get(base + "/robots.txt", { maxRedirects: 0 })
	const robotsText = robots.status() === 200 ? await robots.text() : ""
	meta.robots = { status: robots.status() }
	if (robots.status() !== 200) bad.push(`/robots.txt -> ${robots.status()}`)
	if (!/^Allow: \/$/m.test(robotsText) || /^Disallow: \/\s*$/m.test(robotsText)) bad.push("robots.txt does not allow /")
	if (!robotsText.includes(`Sitemap: ${SITE}/sitemap.xml`)) bad.push("robots.txt does not name the sitemap")
	const sm = await req.get(base + "/sitemap.xml", { maxRedirects: 0 })
	const locs = sm.status() === 200 ? [...(await sm.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]) : []
	meta.sitemap = { status: sm.status(), urls: locs.length }
	if (sm.status() !== 200 || !/xml/.test(sm.headers()["content-type"] || "")) bad.push(`/sitemap.xml -> ${sm.status()} ${sm.headers()["content-type"]}`)
	if (locs.length < 5) bad.push(`sitemap lists ${locs.length} URLs`)
	for (const loc of locs) {
		if (!loc.startsWith(SITE + "/")) bad.push(`sitemap URL off the production origin: ${loc}`)
		const r = await req.get(base + new URL(loc).pathname, { maxRedirects: 0 })
		if (r.status() !== 200) bad.push(`sitemap ${loc} -> ${r.status()}`)
	}
	// Per route: canonical and og:url on the production origin at the route's own path, the card, a title.
	const page = await ctx.newPage()
	const head = () =>
		page.evaluate(() => {
			const m = (sel) => document.querySelector(sel)?.getAttribute("content") ?? null
			return {
				title: document.title,
				canonical: document.querySelector("link[rel=canonical]")?.getAttribute("href") ?? null,
				ogUrl: m('meta[property="og:url"]'),
				ogImage: m('meta[property="og:image"]'),
				ogW: m('meta[property="og:image:width"]'),
				ogH: m('meta[property="og:image:height"]'),
				twCard: m('meta[name="twitter:card"]'),
				twImage: m('meta[name="twitter:image"]'),
				robots: m('meta[name="robots"]'),
				icons: [...document.querySelectorAll("link[rel=icon],link[rel=apple-touch-icon],link[rel=manifest]")].map((l) => l.getAttribute("href")),
				jsonld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((x) => x.textContent),
			}
		})
	meta.routes = {}
	for (const route of ROUTES) {
		await page.goto(base + route, { waitUntil: "domcontentloaded" })
		const h = await head()
		meta.routes[route] = { title: h.title, canonical: h.canonical }
		const want = SITE + (route === "/" ? "" : route)
		if (h.canonical !== want && h.canonical !== want + "/") bad.push(`${route}: canonical ${h.canonical}, expected ${want}`)
		if (h.ogUrl !== h.canonical) bad.push(`${route}: og:url ${h.ogUrl} != canonical`)
		if (h.twCard !== "summary_large_image") bad.push(`${route}: twitter:card ${h.twCard}`)
		if (!h.ogImage || h.twImage !== h.ogImage) bad.push(`${route}: og:image ${h.ogImage} / twitter:image ${h.twImage}`)
		if (h.ogW !== "1200" || h.ogH !== "630") bad.push(`${route}: og:image:width/height ${h.ogW}x${h.ogH}`)
		if (h.robots && /noindex/.test(h.robots)) bad.push(`${route}: robots meta ${h.robots}`)
		if (!h.title || h.title.length > 70) bad.push(`${route}: title "${h.title}"`)
		if (route === "/") {
			// The share card itself: fetched from this server, decoded, 1200x630, <= 300 kB.
			const og = await req.get(base + new URL(h.ogImage || "/missing-og-image", SITE).pathname)
			const type = og.headers()["content-type"] || ""
			const body = og.status() === 200 ? await og.body() : Buffer.alloc(0)
			const dims = body.length ? await imageSize(body, type).catch(() => null) : null
			meta.og = { url: h.ogImage, status: og.status(), type, kB: Math.round(body.length / 102.4) / 10, ...dims }
			if (!h.ogImage?.startsWith(SITE + "/")) bad.push(`og:image off the production origin: ${h.ogImage}`)
			if (og.status() !== 200 || !/^image\/(jpeg|png)/.test(type)) bad.push(`og image -> ${og.status()} ${type}`)
			if (!dims || dims.width !== 1200 || dims.height !== 630) bad.push(`og image is ${dims?.width}x${dims?.height}, expected 1200x630`)
			if (body.length > OG_MAX_BYTES) bad.push(`og image is ${meta.og.kB} kB > 300`)
			// JSON-LD Person: parses, names the current role and LinkedIn.
			let ld = null
			try {
				ld = h.jsonld.map((t) => JSON.parse(t)).find((x) => x["@type"] === "Person")
			} catch (e) {
				bad.push(`JSON-LD does not parse: ${e.message}`)
			}
			meta.jsonld = ld ? { jobTitle: ld.jobTitle, alumniOf: ld.alumniOf?.map?.((a) => a.name), sameAs: ld.sameAs } : null
			if (!ld || ld.name !== "Lars Crawford" || ld.url !== SITE || !ld.jobTitle || !ld.alumniOf || !ld.sameAs?.some((u) => /linkedin\.com/.test(u))) bad.push(`JSON-LD Person incomplete: ${JSON.stringify(meta.jsonld)}`)
			// The favicon set: each linked icon (and a manifest, if one is linked) and /favicon.ico answer 200.
			for (const href of new Set([...h.icons, "/favicon.ico"])) {
				const r = await req.get(base + new URL(href, base + "/").pathname, { maxRedirects: 0 })
				if (r.status() !== 200) bad.push(`icon ${href} -> ${r.status()}`)
			}
			meta.icons = h.icons
		}
	}
	// An unknown URL: a real 404 status and the styled page (the site header, its h1 in the display face).
	const nf = await page.goto(base + "/no-such-page-v27", { waitUntil: "domcontentloaded" })
	const nfh = await head()
	const nfStyled = await page.evaluate(() => !!document.querySelector(".site-header") && /Nothing carved here/.test(document.querySelector("h1")?.textContent || "") && /Cormorant/.test(getComputedStyle(document.querySelector("h1")).fontFamily))
	meta.notFound = { status: nf?.status(), styled: nfStyled, robots: nfh.robots }
	if (nf?.status() !== 404 || !nfStyled) bad.push(`404 page: status ${nf?.status()}, styled=${nfStyled}`)
	report.runs.push({ label: "meta", ...meta, bad })
	console.log(`> meta: resume ${meta.resume.status} ${meta.resume.type} ${meta.resume.bytes} B; robots ${meta.robots.status}; sitemap ${meta.sitemap.urls} URLs; og ${meta.og?.width}x${meta.og?.height} ${meta.og?.kB} kB; 404 ${meta.notFound.status}; bad=${bad.length}`)
	if (bad.length) fail(`meta: ${bad.join(" | ")}`)
	await ctx.close()
}

await browser.close()
await writeFile(path.join(outDir, "report.json"), JSON.stringify(report, null, 2))
console.log(report.failures.length ? `\n${report.failures.length} gate failure(s); see ${outDir}/report.json` : `\nAll gates passed. Shots in ${outDir}`)
process.exit(report.failures.length ? 1 : 0)
