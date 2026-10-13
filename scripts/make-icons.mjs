#!/usr/bin/env node
/**
 * Regenerates the raster icon set from the favicon's own mark (app/icon.svg: the laguz rune, gold on
 * slate). No server needed.
 *
 *   node scripts/make-icons.mjs
 *
 * Writes:
 *   app/favicon.ico      16, 32 and 48 px PNGs in one ICO (browsers and crawlers ask for /favicon.ico)
 *   app/apple-icon.png   180 px, full bleed (iOS rounds the corners itself)
 *   public/icon-192.png, public/icon-512.png   web manifest icons (app/manifest.ts), full bleed with
 *                        the rune inside the 80 % safe zone so they also work as maskable icons
 * Next.js emits the <link> tags for app/favicon.ico, app/icon.svg and app/apple-icon.png itself.
 * Uses the locally installed Edge (or Chrome) through playwright-core, like scripts/shoot.mjs.
 */
import { chromium } from "playwright-core"
import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..")
const svg = await readFile(path.join(root, "app/icon.svg"), "utf8")
// The mark, taken from app/icon.svg so the two never drift: its background fill, rune path and stroke.
const fill = svg.match(/<rect[^>]*fill="([^"]+)"/)[1]
const rune = svg.match(/<path[^>]*\/>/)[0]
// Full bleed (no corner radius), the rune scaled about the tile's centre (16, 16).
const bleed = (scale) =>
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="${fill}"/><g transform="translate(16 16) scale(${scale}) translate(-16 -16)">${rune}</g></svg>`

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
const page = await browser.newPage()
/** Rasterises an SVG string to a PNG of size x size (transparent where the SVG is). */
const png = async (src, size) =>
	Buffer.from(
		await page.evaluate(
			async ([src, size]) => {
				const img = new Image()
				img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(src)
				await img.decode()
				const c = document.createElement("canvas")
				c.width = c.height = size
				const g = c.getContext("2d")
				g.imageSmoothingQuality = "high"
				g.drawImage(img, 0, 0, size, size)
				const url = c.toDataURL("image/png")
				return url.slice(url.indexOf(",") + 1)
			},
			[src, size],
		),
		"base64",
	)

/** An ICO whose entries are PNGs (supported by every browser since IE Vista-era). */
function ico(pngs) {
	const head = Buffer.alloc(6 + 16 * pngs.length)
	head.writeUInt16LE(0, 0)
	head.writeUInt16LE(1, 2) // type: icon
	head.writeUInt16LE(pngs.length, 4)
	let offset = head.length
	pngs.forEach(({ size, data }, i) => {
		const e = 6 + 16 * i
		head.writeUInt8(size >= 256 ? 0 : size, e)
		head.writeUInt8(size >= 256 ? 0 : size, e + 1)
		head.writeUInt8(0, e + 2) // palette
		head.writeUInt8(0, e + 3)
		head.writeUInt16LE(1, e + 4) // planes
		head.writeUInt16LE(32, e + 6) // bpp
		head.writeUInt32LE(data.length, e + 8)
		head.writeUInt32LE(offset, e + 12)
		offset += data.length
	})
	return Buffer.concat([head, ...pngs.map((p) => p.data)])
}

const out = []
const write = async (rel, buf) => {
	await writeFile(path.join(root, rel), buf)
	out.push(`${rel} ${(buf.length / 1024).toFixed(1)} kB`)
}
await write("app/favicon.ico", ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(svg, size) })))))
await write("app/apple-icon.png", await png(bleed(0.9), 180))
await write("public/icon-192.png", await png(bleed(0.78), 192))
await write("public/icon-512.png", await png(bleed(0.78), 512))
await browser.close()
console.log(out.join("\n"))
