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
 *   - asserts no horizontal overflow (also at 320x640);
 *   - saves the fold and one crop per `main > section` at device scale
 *     factor 2, and the full page at 1x (Chromium breaks taller captures);
 *   - captures hover states for the first slab and the primary button;
 *   - records console errors, page errors, failed requests, JS bytes and
 *     whether three.js was parsed (window.__THREE__);
 *   - runs axe (serious/critical count);
 *   - on /: asserts the primary CTA's bottom edge (<= 600 px at 390, <= 700 at
 *     1440), the hero's visible word count (<= 40) and the page height (<= 9000 px
 *     at 390, <= 8500 at 1440), records the LCP element,
 *     and saves real viewport frames, one per screen (section crops repaint the
 *     fixed light layer in tiles and show a fake seam).
 * Handoff (/, 1440 and 390): the median luminance of the stone's face as SVG
 * (reduced motion) vs WebGL (after the swap) must agree within ±12 %; saves the
 * SVG / mid-fade / WebGL frames of the stone.
 * Desktop folds (/, 1280x800, 1440x900, 1536x864, 1920x1080, reduced motion): the
 * Proof title's top is inside the fold (<= height - 48) and <= 140 px below the
 * hero's email row; the stone's ground shadow never overlaps it (also at 900, 1024).
 * Links: every internal href on / and /writing must answer 200 without a
 * redirect; the legacy mixed-case letter URLs must 308 once to a 200.
 * Other routes get fold + full page + the same font/overflow checks.
 * Writes <outDir>/report.json and exits 1 if any gate fails.
 */
import { chromium } from "playwright-core"
import AxeBuilder from "@axe-core/playwright"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

const base = (process.argv[2] || "http://localhost:3200").replace(/\/$/, "")
const outDir = path.resolve(process.argv[3] || "shots/latest")
const ROUTES = (process.env.ROUTES || "/,/writing,/writing/poems/imagine,/cottage").split(",")
const VIEWPORTS = [
	{ name: "1440", width: 1440, height: 900, touch: false },
	{ name: "390", width: 390, height: 844, touch: true },
]
const CTA_MAX = { 1440: 700, 390: 600 }
const HERO_WORDS_MAX = 40
const HEIGHT_MAX = { 1440: 8500, 390: 9000 } // critique change 3: disclose, never delete
const PARITY = 0.12
const LEGACY = {
	"/writing/Dear-Lambda/I-See-You": "/writing/dear-lambda/i-see-you",
	"/writing/Dear-Lambda/Infinity-Is": "/writing/dear-lambda/infinity-is",
}
const DISPLAY = /Cormorant/i
const TEXT = /Mona[ _]?Sans/i

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

for (const route of ROUTES) {
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
				if (dims.primaryBottom == null || dims.primaryBottom > CTA_MAX[vp.name]) fail(`${label}: primary CTA bottom ${dims.primaryBottom} > ${CTA_MAX[vp.name]}`)
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
			if (route === "/" && run.pageHeight > HEIGHT_MAX[vp.name]) fail(`${label}: page is ${run.pageHeight} px tall > ${HEIGHT_MAX[vp.name]}`)
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

			run.consoleErrors = consoleErrors
			run.failedRequests = failedRequests
			if (consoleErrors.length) fail(`${label}: console errors: ${consoleErrors.join(" | ")}`)
			if (failedRequests.length) fail(`${label}: failed requests: ${failedRequests.join(" | ")}`)
			report.runs.push(run)
			console.log(
				`  fonts h1="${fonts.h1Family.slice(0, 40)}" loaded=${run.fonts.loadedDisplay.length}/${run.fonts.loadedText.length}` +
					` overflow=${dims.scrollWidth}/${dims.innerWidth} height=${run.pageHeight} three=${dims.three} js=${run.jsEncodedKB}kB` +
					(route === "/" ? ` primaryBottom=${dims.primaryBottom} heroWords=${dims.heroWords} lcp=${dims.lcp?.tag}#${dims.lcp?.id ?? ""}@${dims.lcp?.t}ms` : "")
			)
			await ctx.close()
		}
	}
}

// Narrowest supported width: overflow only.
for (const route of ROUTES) {
	const ctx = await browser.newContext({ viewport: { width: 320, height: 640 }, hasTouch: true, isMobile: true })
	const page = await ctx.newPage()
	await page.goto(base + route, { waitUntil: "load" })
	await page.waitForTimeout(300)
	const d = await page.evaluate(() => {
		const vw = document.documentElement.clientWidth
		const wide = [...document.querySelectorAll("body *")]
			.filter((el) => el.getBoundingClientRect().right > 320.5 && getComputedStyle(el).position !== "fixed")
			.slice(0, 5)
			.map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)} right=${Math.round(el.getBoundingClientRect().right)}`)
		return { sw: document.documentElement.scrollWidth, iw: window.innerWidth, vw, wide }
	})
	report.runs.push({ label: `${slug(route)}-320`, route, viewport: "320", scrollWidth: d.sw, innerWidth: d.iw, widest: d.wide })
	if (d.sw > 320 || d.iw > 320) fail(`${slug(route)}-320: horizontal overflow ${d.sw} > 320 (${d.wide.join("; ")})`)
	console.log(`> ${slug(route)}-320 overflow=${d.sw}/${d.iw}`)
	await ctx.close()
}

// ---------- desktop folds (v2.2 critique fix 1): the next title is in the fold, close to the copy ----------
// Reduced motion, so the SVG stone and the final layout are measured. At every size: the Proof h2's top
// is <= viewport height - 48 and <= 140 px below the hero's email row; the stone's ground shadow never
// overlaps the Proof h2's box (it stands beside the title, not on it).
if (ROUTES.includes("/")) {
	const FOLDS = [
		[1280, 800, true],
		[1440, 900, true],
		[1536, 864, true],
		[1920, 1080, true],
		[900, 800, false], // ground-overlap check only
		[1024, 768, false],
	]
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
			return { h2: box("#work h2"), email: box("main .copy-email"), ground: box(".stone__ground") }
		})
		const gap = Math.round(m.h2.y - m.email.b)
		const hit = !!m.ground && m.ground.r > m.ground.x && !(m.ground.r <= m.h2.x || m.h2.r <= m.ground.x || m.ground.b <= m.h2.y || m.h2.b <= m.ground.y)
		report.runs.push({ label, h2Top: Math.round(m.h2.y), emailBottom: Math.round(m.email.b), gap, groundHitsH2: hit })
		console.log(`> ${label} h2Top=${Math.round(m.h2.y)} (max ${h - 48}) gap=${gap} (max 140) groundHitsH2=${hit}`)
		if (foldGate && m.h2.y > h - 48) fail(`${label}: Proof title top ${Math.round(m.h2.y)} > ${h - 48} (below the fold)`)
		if (foldGate && gap > 140) fail(`${label}: ${gap} px of empty fold between the email row and the Proof title (> 140)`)
		if (hit) fail(`${label}: the stone's ground shadow overlaps the Proof title`)
		await page.screenshot({ path: path.join(outDir, `${label}.png`) })
		await ctx.close()
	}
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

if (ROUTES.includes("/")) {
	for (const vp of VIEWPORTS) {
		const label = `home-${vp.name}-handoff`
		console.log(`> ${label}`)
		const shots = {}
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
			await page.screenshot({ path: path.join(outDir, `${label}-${reduced ? "1-svg" : "3-webgl"}.png`), clip: stone })
			shots[reduced ? "svg" : "gl"] = await page.screenshot({ clip: face })
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
	}
}

// ---------- links: internal hrefs answer 200 without a redirect; legacy URLs redirect once ----------
if (ROUTES.includes("/")) {
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
	for (const [from, to] of Object.entries(LEGACY)) {
		const r = await ctx.request.get(base + from, { maxRedirects: 0 })
		const loc = r.headers()["location"] || ""
		if (r.status() !== 308 || !loc.endsWith(to)) bad.push(`${from} -> ${r.status()} ${loc}`)
		const r2 = await ctx.request.get(base + to, { maxRedirects: 0 })
		if (r2.status() !== 200) bad.push(`${to} -> ${r2.status()}`)
	}
	report.runs.push({ label: "links", internal: hrefs.size, legacy: Object.keys(LEGACY).length, bad })
	console.log(`> links: ${hrefs.size} internal + ${Object.keys(LEGACY).length} legacy, bad=${bad.length}`)
	if (bad.length) fail(`links: ${bad.join(" | ")}`)
	await ctx.close()
}

await browser.close()
await writeFile(path.join(outDir, "report.json"), JSON.stringify(report, null, 2))
console.log(report.failures.length ? `\n${report.failures.length} gate failure(s); see ${outDir}/report.json` : `\nAll gates passed. Shots in ${outDir}`)
process.exit(report.failures.length ? 1 : 0)
