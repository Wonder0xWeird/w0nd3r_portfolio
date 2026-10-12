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
 *   - runs axe (serious/critical count).
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
				primaryTop: (() => {
					const a = document.querySelector(".btn--primary")
					return a ? Math.round(a.getBoundingClientRect().bottom + window.scrollY) : null
				})(),
			}))
			Object.assign(run, dims)
			run.jsEncodedKB = Math.round(dims.js.reduce((n, r) => n + (r.encoded || 0), 0) / 1024)
			delete run.js
			// Compare with the emulated width: on mobile, wide content silently grows the layout viewport.
			if (dims.scrollWidth > vp.width || dims.innerWidth > vp.width) fail(`${label}: horizontal overflow ${dims.scrollWidth} > ${vp.width}`)

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
			// Full page at 1 image px per CSS px: Chromium tiles/duplicates captures taller than 16384 device px.
			await page.screenshot({ path: `${base_}-full.png`, fullPage: true, scale: "css" })

			if (route === "/" && !reduced) {
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
					(route === "/" ? ` primaryBottom=${dims.primaryTop}` : "")
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

await browser.close()
await writeFile(path.join(outDir, "report.json"), JSON.stringify(report, null, 2))
console.log(report.failures.length ? `\n${report.failures.length} gate failure(s); see ${outDir}/report.json` : `\nAll gates passed. Shots in ${outDir}`)
process.exit(report.failures.length ? 1 : 0)
