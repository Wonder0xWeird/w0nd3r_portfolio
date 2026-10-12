#!/usr/bin/env node
/**
 * Generates the tileable grain texture used by the page light (DESIGN.md §Light).
 * Fractal value noise (3 octaves, wrap-around lattice so it tiles seamlessly),
 * quantised to a small palette so the PNG stays a few kB.
 *
 *   node scripts/make-grain.mjs   ->  public/textures/grain.png (128x128)
 */
import sharp from "sharp"

const S = 128
let seed = 1337
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)

function lattice(cells) {
	const g = Array.from({ length: cells * cells }, rnd)
	const at = (x, y) => g[((y % cells) + cells) % cells * cells + (((x % cells) + cells) % cells)]
	const smooth = (t) => t * t * (3 - 2 * t)
	return (px, py) => {
		const fx = (px / S) * cells
		const fy = (py / S) * cells
		const x0 = Math.floor(fx)
		const y0 = Math.floor(fy)
		const tx = smooth(fx - x0)
		const ty = smooth(fy - y0)
		const a = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * tx
		const b = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * tx
		return a + (b - a) * ty
	}
}

// Fine grain dominates (baseFrequency ~0.8 in feTurbulence terms), with two
// coarser octaves for a little "stone" mottling.
const octaves = [
	{ f: lattice(128), w: 0.6 },
	{ f: lattice(64), w: 0.28 },
	{ f: lattice(16), w: 0.12 },
]
const levels = Number(process.env.LEVELS || 6)
const buf = Buffer.alloc(S * S)
for (let y = 0; y < S; y++)
	for (let x = 0; x < S; x++) {
		let v = 0
		for (const o of octaves) v += o.f(x, y) * o.w
		// stretch contrast around mid-grey, then quantise
		v = Math.min(1, Math.max(0, 0.5 + (v - 0.5) * 2.2))
		buf[y * S + x] = Math.round(Math.round(v * (levels - 1)) * (255 / (levels - 1)))
	}

const out = new URL("../public/textures/grain.png", import.meta.url)
const info = await sharp(buf, { raw: { width: S, height: S, channels: 1 } })
	.png({ palette: true, colours: levels, compressionLevel: 9, effort: 10 })
	.toFile(out.pathname.replace(/^\/([A-Z]:)/, "$1"))
console.log(`grain.png ${S}x${S}, ${levels} levels, ${info.size} bytes`)
