#!/usr/bin/env node
/**
 * Renders the share card (Open Graph / Twitter summary_large_image) from the real hero.
 *
 *   node scripts/make-og.mjs [baseUrl]        # default http://localhost:3200 (next start or next dev)
 *
 * Loads / at a 1200x630 desktop viewport (1:1 with the card, so its type is as large as a card allows), in reduced motion (the final
 * state: the SVG stone with its baked face and ignited runes, the name at rest), hides what would read
 * as clickable UI in a card (header, CTA row, email row) and everything below the hero, captures at
 * 2x and downsamples to 1200x630 in the browser, then writes public/og.jpg as a JPEG of <= 300 kB.
 * Re-run after any visible change to the hero (and commit the image).
 *
 * Uses the locally installed Edge (or Chrome) through playwright-core, like scripts/shoot.mjs.
 * OG_VIEWPORT=1440x756 renders a wider viewport into the same card (keep the 1.905:1 aspect; the type gets smaller).
 */
import { chromium } from "playwright-core"
import { writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const base = (process.argv[2] || "http://localhost:3200").replace(/\/$/, "")
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), "../public/og.jpg")
const [W, H] = [1200, 630]
const [vw, vh] = (process.env.OG_VIEWPORT || "1200x630").split("x").map(Number)
const MAX_BYTES = 300 * 1024

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
const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: (2 * W) / vw, reducedMotion: "reduce" })
const page = await ctx.newPage()
await page.goto(base + "/", { waitUntil: "load" })
await page.addStyleTag({
	content: `
		nextjs-portal, .site-header, .skip-link, [class*="ctaRow"], .copy-email, main > section ~ section, .site-footer { visibility: hidden !important; }
	`,
})
await page.evaluate(() => document.fonts.ready)
// The stone's baked face is a CSS background (globals.css), so wait for its response, not an <img>.
await page
	.waitForFunction(() => performance.getEntriesByType("resource").some((r) => /\/stone\/face-\d+\.avif/.test(r.name) && r.responseEnd > 0), null, { timeout: 8000 })
	.catch(() => console.warn("warning: the baked stone face never loaded (is this a desktop-width viewport?)"))
await page.waitForTimeout(1000)
const png = await page.screenshot({ clip: { x: 0, y: 0, width: vw, height: vh } })

// Downsample 2x -> 1x in the browser (smooth, high quality) and encode as JPEG under the size cap.
const jpeg = await page.evaluate(
	async ([b64, W, H, max]) => {
		const img = new Image()
		img.src = "data:image/png;base64," + b64
		await img.decode()
		const c = document.createElement("canvas")
		c.width = W
		c.height = H
		const g = c.getContext("2d")
		g.imageSmoothingEnabled = true
		g.imageSmoothingQuality = "high"
		g.drawImage(img, 0, 0, W, H)
		for (let q = 0.88; q >= 0.5; q -= 0.04) {
			const url = c.toDataURL("image/jpeg", q)
			const b = url.slice(url.indexOf(",") + 1)
			if ((b.length * 3) / 4 <= max) return { b64: b, q: Math.round(q * 100) }
		}
		return null
	},
	[png.toString("base64"), W, H, MAX_BYTES],
)
await browser.close()
if (!jpeg) throw new Error("could not fit the card under 300 kB")
const buf = Buffer.from(jpeg.b64, "base64")
await writeFile(out, buf)
console.log(`wrote ${path.relative(process.cwd(), out)}: ${W}x${H}, JPEG q${jpeg.q}, ${(buf.length / 1024).toFixed(1)} kB (from ${base}/ at ${vw}x${vh})`)
