#!/usr/bin/env node
/**
 * Research plates (v2.3 craft sweep): the four thesis images on / without instrument chrome.
 *
 *   node scripts/crop-science.mjs
 *
 * Reads the originals in public/images/science/ (Lars Crawford's own work, unchanged; see CREDITS.md)
 * and writes square plates to public/images/science/plates/, so the tiles' `object-fit: cover` crops
 * nothing further:
 *   - 6s.jpg (SEM of a printed scaffold): the instrument info bar (kV, mode, magnification, timestamp)
 *     is cut off; the 1 mm scale bar is redrawn by the page as a clean overlay (content/research.ts).
 *   - seeded-scaffold.jpg (SEM of seeded cells): the info bar is cut off.
 *   - rapid-photochemical-synthesis.png: the "UV: 0 / 3 / 6 / 9 / 12 Mins" header, the row labels and
 *     the frames are cut off; the plate keeps the 3- and 6-minute discs of both rows (grey -> black).
 *   - gelectrode.png (Blender render): the viewport's X/Y axis lines, the origin dot and the 3D cursor
 *     are painted out (masked by saturation and a disk at the cursor, filled from the surrounding
 *     pixels inward).
 * Uses sharp (already installed with Next). Deterministic: re-running gives the same files.
 */
import sharp from "sharp"
import { mkdir } from "node:fs/promises"
import path from "node:path"

const SRC = path.resolve("public/images/science")
const OUT = path.join(SRC, "plates")
await mkdir(OUT, { recursive: true })

// The SEM's 1 mm bar is 161 px long in 6s.jpg (x 283-444); the plate is 344 px square
// (content/research.ts carries it: { label: "1 mm", fraction: 161 / 344 })

// 6s.jpg, 459 x 344: the info bar starts at y 321 (content ends ~316). The scaffold spans x 68-400, so
// a 344 px square needs 28 px above the frame: the background row is repeated (plain grey there).
// (Two passes: within one pipeline sharp would extract before it extends.)
const above = await sharp(path.join(SRC, "6s.jpg")).extract({ left: 0, top: 0, width: 459, height: 316 }).extend({ top: 28, extendWith: "copy" }).toBuffer()
await sharp(above)
	.extract({ left: 62, top: 0, width: 344, height: 344 })
	.jpeg({ quality: 92, mozjpeg: true })
	.toFile(path.join(OUT, "scaffold-sem.jpg"))

// seeded-scaffold.jpg, 1838 x 1379: the info bar starts at y ~1287.
await sharp(path.join(SRC, "seeded-scaffold.jpg"))
	.extract({ left: 290, top: 0, width: 1284, height: 1284 })
	.resize(960, 960)
	.jpeg({ quality: 88, mozjpeg: true })
	.toFile(path.join(OUT, "seeded-scaffold-sem.jpg"))

// rapid-photochemical-synthesis.png, 1364 x 661: two framed rows (interiors y 70-293 and 370-583) of
// slides; the 3- and 6-minute columns run x ~290-815. The two rows' interiors are stacked with an 18 px
// slate seam in place of the black band, labels and purple frames, and cropped square on the four discs.
{
	const src = path.join(SRC, "rapid-photochemical-synthesis.png")
	const X = 330, S = 444 // the discs span x 334-769
	const top = await sharp(src).removeAlpha().extract({ left: X, top: 72, width: S, height: 218 }).toBuffer()
	const bottom = await sharp(src).removeAlpha().extract({ left: X, top: 372, width: S, height: 208 }).toBuffer()
	await sharp({ create: { width: S, height: S, channels: 3, background: "#1a1f26" } })
		.composite([
			{ input: top, left: 0, top: 0 },
			{ input: bottom, left: 0, top: S - 208 },
		])
		.png({ compressionLevel: 9 })
		.toFile(path.join(OUT, "photochemical-synthesis.png"))
}

// gelectrode.png, 600 x 600: paint out the viewport chrome.
{
	const { data, info } = await sharp(path.join(SRC, "gelectrode.png")).removeAlpha().raw().toBuffer({ resolveWithObject: true })
	const { width: W, height: H } = info
	const mask = new Uint8Array(W * H)
	// the render is grey: any clearly coloured pixel is an axis line, the origin dot or the cursor ring
	for (let i = 0; i < W * H; i++) {
		const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2]
		if (Math.max(r, g, b) - Math.min(r, g, b) > 12) mask[i] = 1
	}
	// the 3D cursor (dashed ring and its black ticks) at (186, 330)
	for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if ((x - 186) ** 2 + (y - 330) ** 2 <= 19 ** 2) mask[y * W + x] = 1
	// grow the mask by 2 px to take the cores' anti-aliased fringes
	for (let pass = 0; pass < 2; pass++) {
		const grown = mask.slice()
		for (let y = 1; y < H - 1; y++)
			for (let x = 1; x < W - 1; x++) if (!mask[y * W + x] && (mask[y * W + x - 1] || mask[y * W + x + 1] || mask[(y - 1) * W + x] || mask[(y + 1) * W + x])) grown[y * W + x] = 1
		mask.set(grown)
	}
	// fill from the boundary inward: each pass sets the masked pixels that touch known ones to the
	// mean of their known 8-neighbours, so lines close from both sides
	const px = Float32Array.from(data)
	let left = mask.reduce((n, v) => n + v, 0)
	while (left > 0) {
		const fill = []
		for (let y = 0; y < H; y++)
			for (let x = 0; x < W; x++) {
				if (!mask[y * W + x]) continue
				let n = 0, r = 0, g = 0, b = 0
				for (let dy = -1; dy <= 1; dy++)
					for (let dx = -1; dx <= 1; dx++) {
						const X = x + dx, Y = y + dy
						if ((dx || dy) && X >= 0 && Y >= 0 && X < W && Y < H && !mask[Y * W + X]) {
							const j = (Y * W + X) * 3
							r += px[j]
							g += px[j + 1]
							b += px[j + 2]
							n++
						}
					}
				if (n >= 2 || (n && left < 50)) fill.push([y * W + x, r / n, g / n, b / n])
			}
		if (!fill.length) break
		for (const [i, r, g, b] of fill) {
			px[i * 3] = r
			px[i * 3 + 1] = g
			px[i * 3 + 2] = b
			mask[i] = 0
		}
		left -= fill.length
	}
	// The axis lines also carry a soft grey halo (~83 on the 60 background, +-9 px) where they cross the
	// empty viewport (the object occludes them elsewhere). Background segments only: the Y axis left of
	// x 112 and right of x 266 (below the object), the X axis left of the ring (x < 18).
	const BG = 60
	const axes = [
		{ p: [186, 330], d: [284, 270], keep: (x) => x <= 112 || x >= 266 }, // Y (green)
		{ p: [186, 330], d: [-186, 50.5], keep: (x) => x < 18 }, // X (red)
	]
	for (const { p, d, keep } of axes) {
		const len = Math.hypot(d[0], d[1])
		const [nx, ny] = [-d[1] / len, d[0] / len]
		for (let y = 0; y < H; y++)
			for (let x = 0; x < W; x++) {
				if (!keep(x) || Math.abs((x - p[0]) * nx + (y - p[1]) * ny) > 12) continue
				const i = (y * W + x) * 3
				if (px[i] > BG && px[i] <= 92) px[i] = px[i + 1] = px[i + 2] = BG
			}
	}
	await sharp(Buffer.from(Uint8Array.from(px, (v) => Math.round(v))), { raw: { width: W, height: H, channels: 3 } })
		.png({ compressionLevel: 9 })
		.toFile(path.join(OUT, "hydrogel-electrode.png"))
}

console.log(`plates written to ${path.relative(process.cwd(), OUT)}`)
