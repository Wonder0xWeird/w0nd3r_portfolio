"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import { LARS, RUNES, type RuneName } from "@/lib/runes"
import { CAMERA, GROOVE, RUNE_FACE, START_YAW, STONE, deform, runeSlot } from "@/lib/stone"

/**
 * Rune-fire (v2.2): one warm point light in the stone's own space, centred on the rune column just off
 * the face, with a short range. v2.1's light hung 1 m out and warmed the whole stone to sandstone.
 */
const FIRE = { color: "#f2b65a", y: -0.1, z: 0.7, intensity: 0.45, distance: 1.15 }

/** Sway after the handoff: LARS keeps facing the visitor (the back face never turns round). */
const SWAY = { amp: 0.3, period: 15, easeIn: 2.5 }

// ---------- procedural textures (no image assets) ----------

function drawRune(ctx: CanvasRenderingContext2D, name: RuneName, x: number, y: number, size: number) {
	const k = size / 10
	ctx.beginPath()
	for (const stroke of RUNES[name]) {
		stroke.forEach(([px, py], i) => {
			const X = x + px * k
			const Y = y + py * k
			if (i === 0) ctx.moveTo(X, Y)
			else ctx.lineTo(X, Y)
		})
	}
	ctx.stroke()
}

/**
 * LARS as rune-fire, drawn exactly like the SVG twin (StoneFallback): a groove
 * cut into the stone (its moonlit lower lip, the shadowed channel up-left of the
 * stroke), the gold-700 inlay, bloom, glow and a thin hot core, at the slots
 * lib/stone defines, so the projected strokes land where the SVG's do. It is
 * laid over the front face (normal blending, untoned), so the runes match the
 * first paint pixel for pixel in colour and glow.
 */
function runeLightTexture(): THREE.CanvasTexture {
	const k = 2 // texture px per RUNE_FACE px
	const c = document.createElement("canvas")
	c.width = RUNE_FACE.w * k
	c.height = RUNE_FACE.h * k
	const ctx = c.getContext("2d")!
	ctx.scale(k, k)
	ctx.lineCap = "round"
	ctx.lineJoin = "round"
	const unit = RUNE_FACE.size / 10 // one rune-box unit in face px (the SVG's RUNE_UNIT)
	const each = (fn: (name: RuneName, x: number, y: number, size: number) => void) =>
		LARS.forEach((r, i) => {
			const { x, y, size } = runeSlot(i, LARS.length)
			fn(r, x, y, size)
		})
	// Incised, lit from the upper left (v2.2): the groove's lower-right lip catches the moonlight and
	// its upper-left wall is in shadow, so the runes read as cut into the stone, not as raised tubes.
	ctx.strokeStyle = `rgba(226,232,240,${GROOVE.lip})`
	ctx.lineWidth = GROOVE.lipW * unit
	each((r, x, y, s) => drawRune(ctx, r, x + 0.1 * unit, y + 0.14 * unit, s))
	ctx.strokeStyle = `rgba(11,14,18,${GROOVE.cut})`
	ctx.lineWidth = GROOVE.cutW * unit
	each((r, x, y, s) => drawRune(ctx, r, x - 0.08 * unit, y - 0.12 * unit, s))
	ctx.strokeStyle = "#8f6a2a"
	ctx.lineWidth = 0.5 * unit
	each((r, x, y, s) => drawRune(ctx, r, x, y, s))
	// bloom: only the shadow of strokes drawn far off-canvas
	const off = 4000
	ctx.save()
	ctx.globalAlpha = GROOVE.bloom
	ctx.shadowColor = "#e4b65a"
	ctx.shadowBlur = 3.4 * unit * k
	ctx.shadowOffsetX = off * k
	ctx.strokeStyle = "#e4b65a"
	ctx.lineWidth = 1.4 * unit
	each((r, x, y, s) => drawRune(ctx, r, x - off, y, s))
	ctx.restore()
	// glow + fire
	ctx.save()
	ctx.shadowColor = "#f7d98c"
	ctx.shadowBlur = GROOVE.glowBlur * 2 * unit * k
	ctx.strokeStyle = "#f7d98c"
	ctx.lineWidth = GROOVE.fireW * unit
	each((r, x, y, s) => drawRune(ctx, r, x, y, s))
	each((r, x, y, s) => drawRune(ctx, r, x, y, s))
	ctx.restore()
	// hot core: thin and partly transparent, so the fire sits in the groove rather than on top of it
	ctx.globalAlpha = 0.55
	ctx.strokeStyle = "#fff4d6"
	ctx.lineWidth = 0.14 * unit
	each((r, x, y, s) => drawRune(ctx, r, x, y, s))
	const t = new THREE.CanvasTexture(c)
	t.colorSpace = THREE.SRGBColorSpace
	t.anisotropy = 4
	return t
}

/** Seeded Park-Miller generator, so the stone is the same on every visit. */
function rng(seed: number) {
	let s = seed
	return () => {
		s = (s * 16807) % 2147483647
		return s / 2147483647
	}
}

/**
 * Tileable value-noise fbm on a size x size grid: one octave per [x period, y period, amplitude] (px;
 * each period is rounded so a whole number of lattice cells fits the tile). Unequal periods give
 * anisotropic noise: long in x, short in y makes bands. Quintic-interpolated lattice (smooth slopes,
 * so the bump map shows no grid), wrapped so the texture repeats seamlessly.
 */
function fbm(size: number, octaves: [number, number, number][], rnd: () => number): Float32Array {
	const out = new Float32Array(size * size)
	const quintic = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)
	for (const [px, py, amp] of octaves) {
		const nx = Math.max(1, Math.round(size / px))
		const ny = Math.max(1, Math.round(size / py))
		const lat = Float32Array.from({ length: nx * ny }, () => rnd() * 2 - 1)
		for (let y = 0; y < size; y++) {
			const fy = (y * ny) / size
			const y0 = Math.floor(fy)
			const sy = quintic(fy - y0)
			const r0 = (y0 % ny) * nx
			const r1 = ((y0 + 1) % ny) * nx
			for (let x = 0; x < size; x++) {
				const fx = (x * nx) / size
				const x0 = Math.floor(fx)
				const sx = quintic(fx - x0)
				const c0 = x0 % nx
				const c1 = (x0 + 1) % nx
				const top = lat[r0 + c0] + (lat[r0 + c1] - lat[r0 + c0]) * sx
				const bot = lat[r1 + c0] + (lat[r1 + c1] - lat[r1 + c0]) * sx
				out[y * size + x] += (top + (bot - top) * sy) * amp
			}
		}
	}
	return out
}

/**
 * Height-map weights (0-255 levels per unit of each field): bedding bands, lamination, ledge rise, grit.
 * v2.5: the face's lamination 14 -> 3 (its hairlines read as laminate or timber at 2x); the edges keep
 * the full 14 (EDGE_LAMINA). The face's riven ripple is in the geometry (RIPPLE), not here: three's bump
 * map tilts the normal by bumpScale x the height step per screen pixel, so a 120-180 px swell in an 8-bit
 * height map moves a fraction of a level per pixel and draws nothing (measured: x18 and x60 differ by 0.13
 * levels on screen).
 */
const HEIGHT = { bands: 3, lamina: 3, step: 60, grit: 10, fine: 4 }
/** Hairline bedding on the edges (the box's sides and crown, v2.5): full-strength lamination in the height and a visible line in the albedo. */
const EDGE_LAMINA = { height: 14, albedo: 1.6 }

/** Bedding angle on the front face (degrees; positive: the beds descend gently to the right, echoing the crown's slope). */
const BEDDING = 8

const smoothstep = (t: number) => {
	const x = Math.min(1, Math.max(0, t))
	return x * x * (3 - 2 * x)
}

type Slate = { albedo: THREE.CanvasTexture; surface: THREE.CanvasTexture; edgeAlbedo: THREE.CanvasTexture; edgeSurface: THREE.CanvasTexture }

/**
 * Slate (v2.3: night-lit slate, not cast concrete; v2.5: a riven cleavage face with bedded edges). A
 * darker blue-grey albedo (#5f6469, hue ~210) laid down in bedding bands (anisotropic fbm, 256 x 24 and
 * 64 x 10 px) with a faint blue-grey/green-grey drift between them, each split layer a shade apart, fine
 * fbm (8/4 px) and little per-texel grain; 220 pits on a power law (most tiny), 70 % of them strung along
 * 12 bedding lines; a few faint quartz veins. A data texture of the same surface: red is the height
 * (bumpMap), green the roughness (roughnessMap).
 *
 * Two sets, one recipe. The face is the cleavage plane of riven slate: satin (roughness .62-.80, so the
 * moon key draws a faint sheen across the ripple in the geometry, RIPPLE), five cleavage ledges that run
 * along a bed for about a third of their length and die out, and hairline lamination only in patches
 * (about 18 % of the tile, at a fifth of v2.3's height). The edges (the box's sides and crown) show the
 * bedding: full-strength lamination everywhere, drawn into the albedo too, rougher (.74-.96).
 * `laminated: false` (phones, v2.5) drops the lamination from both, so the WebGL stone that loads on the
 * first touch is as smooth as the SVG backdrop it replaces. The bands are generated axis-aligned (so the
 * tile still repeats seamlessly) and turned to BEDDING by the face textures' UV rotation. 512 px each,
 * generated once in a few ms; no image assets.
 */
function slateTextures(laminated: boolean): Slate {
	const S = 512
	const rnd = rng(7)
	const bands = fbm(
		S,
		[
			[256, 24, 8],
			[64, 10, 5],
		],
		rnd
	)
	const fine = fbm(
		S,
		[
			[8, 8, 3],
			[4, 4, 1.5],
		],
		rnd
	)
	// fine lamination: hairline beds, long and thin. On the face only in patches (riven slate splits
	// cleanly in places and not in others; everywhere at once it read as wood grain); on the edges, all of it.
	const lamina = fbm(
		S,
		[
			[48, 3, 2.4],
			[24, 1.6, 1.2],
		],
		rnd
	)
	const patches = fbm(S, [[96, 48, 1]], rnd)
	// the grain of the rock itself: short flecks drawn out along the bed, a fine sheen rather than lines
	const grit = fbm(S, [[10, 3, 1]], rnd)
	// cleavage steps (v2.3's field, now a small perturbation of `terrace` below)
	const ledges = fbm(S, [[512, 56, 1]], rnd)
	const runs = fbm(S, [[160, 80, 1]], rnd)
	const STEPS = 5
	// slate drifts a few degrees between blue-grey and green-grey from bed to bed
	const drift = fbm(S, [[512, 64, 1]], rnd)
	// v2.5 fields have their own seeds, so every field above keeps v2.3's values. The cleavage plane's
	// terraces: a slow field cut into five ledges (contours ~70 px apart, so each riser
	// stands alone; v2.3's 56 px field packed them into stacks of hairlines), bent slightly by `wander`
	// (more and the contours close into wood-grain knots). Each ledge is a sharp 2-3 px riser and then a
	// plate that thins away; it runs for about a third of its length along the bed and dies out (`runs`)
	// by widening until it is no step at all (masking it, as v2.3 did, drew the mask's outline).
	const terrace = fbm(S, [[512, 170, 1]], rng(13))
	const wander = fbm(S, [[256, 60, 0.06]], rng(17))
	const canvas = () => {
		const c = document.createElement("canvas")
		c.width = c.height = S
		return c
	}
	const sheets = [canvas(), canvas(), canvas(), canvas()] // face albedo, face surface, edge albedo, edge surface
	const [a, b, ea, eb] = sheets.map((c) => c.getContext("2d")!)
	const [ai, bi, eai, ebi] = [a, b, ea, eb].map((g) => g.createImageData(S, S))
	const keep = laminated ? 1 : 0
	for (let i = 0; i < S * S; i++) {
		const grain = rnd() * 2 - 1
		const q = (terrace[i] + wander[i] + ledges[i] * 0.1 + 1) * STEPS
		const k = Math.floor(q)
		const f = q - k
		const run = smoothstep((runs[i] - 0.12) / 0.2) // > .5 on a third of the tile
		const w = 1 - 0.85 * run // riser width: 0.15 of a step where the ledge runs, the whole step where it has died out
		const ledge = smoothstep((f - 1 + w) / w) - f + 0.45 // bounded and continuous: no outline where a ledge ends
		const lam = lamina[i] * smoothstep((patches[i] - 0.35) / 0.3) * keep // ~18 % of the face
		const edgeLam = lamina[i] * keep
		const tier = (((k * 7) % 5) - 2) * 0.8 // each split layer a shade apart
		const base = bands[i] * 0.6 + fine[i] + tier + grain * 2
		const v = base + lam * 0.35 // albedo, about +-15 levels
		const ev = base + edgeLam * EDGE_LAMINA.albedo
		const g = drift[i] * 2.2
		const o = i * 4
		const relief = 128 + bands[i] * HEIGHT.bands + ledge * HEIGHT.step + grit[i] * HEIGHT.grit + fine[i] * HEIGHT.fine + grain * 2
		for (const [img, val] of [
			[ai, v],
			[eai, ev],
		] as const) {
			img.data[o] = 0x5f + val - g * 0.5
			img.data[o + 1] = 0x64 + val + g * 0.6
			img.data[o + 2] = 0x69 + val - g * 0.2
			img.data[o + 3] = 255
		}
		bi.data[o] = relief + lam * HEIGHT.lamina
		bi.data[o + 1] = 255 * Math.min(0.8, Math.max(0.62, 0.71 + (v / 20) * 0.09)) // satin: the moon key draws a faint sheen
		bi.data[o + 3] = 255
		ebi.data[o] = relief + edgeLam * EDGE_LAMINA.height
		ebi.data[o + 1] = 255 * (0.85 + (ev / 20) * 0.11)
		ebi.data[o + 3] = 255
	}
	a.putImageData(ai, 0, 0)
	b.putImageData(bi, 0, 0)
	ea.putImageData(eai, 0, 0)
	eb.putImageData(ebi, 0, 0)
	// marks are drawn at the 9 wrapped offsets, so they tile seamlessly too
	const wrapped = (fn: (dx: number, dy: number) => void) => {
		for (const dx of [-S, 0, S]) for (const dy of [-S, 0, S]) fn(dx, dy)
	}
	// quartz veins: a few thin, faint random walks, 40-180 px long
	for (const g of [a, ea]) g.lineCap = g.lineJoin = "round"
	for (let v = 0; v < 10; v++) {
		const pts: [number, number][] = [[rnd() * S, rnd() * S]]
		const len = 40 + rnd() * 140
		let ang = rnd() * Math.PI * 2
		for (let d = 0; d < len; d += 6) {
			ang += (rnd() - 0.5) * 0.9
			const [px, py] = pts[pts.length - 1]
			pts.push([px + Math.cos(ang) * 6, py + Math.sin(ang) * 6])
		}
		const stroke = `rgba(196,200,204,${(0.06 + rnd() * 0.05).toFixed(3)})`
		const width = 0.8 + rnd() * 0.5
		for (const g of [a, ea]) {
			g.strokeStyle = stroke
			g.lineWidth = width
			wrapped((dx, dy) => {
				g.beginPath()
				pts.forEach(([px, py], i) => (i ? g.lineTo(px + dx, py + dy) : g.moveTo(px + dx, py + dy)))
				g.stroke()
			})
		}
	}
	// pits: 220, radius 0.6-2.6 px on a power law (most small), 70 % strung along 12 bedding lines,
	// a little longer along the bed; dark in the albedo, dents in the height (rougher inside)
	const lines = Array.from({ length: 12 }, () => rnd() * S)
	for (let p = 0; p < 220; p++) {
		const onLine = rnd() < 0.7
		const x = rnd() * S
		const y = onLine ? lines[Math.floor(rnd() * lines.length)] + (rnd() - 0.5) * 3 : rnd() * S
		const r = 0.6 + 2 * rnd() ** 3
		const alpha = (0.18 + rnd() * 0.17).toFixed(3)
		a.fillStyle = ea.fillStyle = `rgba(14,16,20,${alpha})`
		b.fillStyle = eb.fillStyle = `rgba(40,245,0,${alpha})`
		wrapped((dx, dy) => {
			for (const g of [a, b, ea, eb]) {
				g.beginPath()
				g.ellipse(x + dx, y + dy, r * 1.4, r, 0, 0, Math.PI * 2)
				g.fill()
			}
		})
	}
	// The face is 1.2 x 2.3 world units with UVs 0..1, so a UV rotation of t shows on it as
	// atan(2.3 / 1.2 * tan t): solve for BEDDING. Every face is mapped by world position (uv1, see
	// stoneGeometry) at the face's texel density; the edges' beds run level, unturned.
	const rotation = Math.atan((Math.tan((BEDDING * Math.PI) / 180) * STONE.w) / STONE.h)
	const texture = (c: HTMLCanvasElement, srgb: boolean, edge: boolean) => {
		const t = new THREE.CanvasTexture(c)
		if (srgb) t.colorSpace = THREE.SRGBColorSpace
		t.wrapS = t.wrapT = THREE.RepeatWrapping
		t.repeat.set(1.5, 2.5)
		t.rotation = edge ? 0 : rotation
		t.channel = 1
		t.anisotropy = 8
		return t
	}
	return {
		albedo: texture(sheets[0], true, false),
		surface: texture(sheets[1], false, false),
		edgeAlbedo: texture(sheets[2], true, true),
		edgeSurface: texture(sheets[3], false, true),
	}
}

/**
 * The cleavage face's riven ripple (v2.5): crests along the bed (BEDDING) in world space (in box
 * space the crown's squeeze packed them into a fan under its slope), about RIPPLE.wave apart with a
 * second, shorter swell, their phase wandering across the face and their height swelling and fading, as if raised
 * along the face's normal by up to RIPPLE.amp (world units; slopes up to ~15-25 degrees, which the moon key
 * turns into a satin sheen), but only the normals keep it (stoneGeometry). It fades out within
 * RIPPLE.edge of the face's sides and ends, so the shading meets the bedded edges without a seam.
 */
const RIPPLE = { amp: 0.0075, wave: 0.17, edge: 0.1 }

/** The ripple at a deformed face point (x, y), faded by the undeformed box point (bx, by)'s distance to the face's edges. */
function ripple(x: number, y: number, bx: number, by: number): number {
	const { w, h } = STONE
	const s = y + Math.tan((BEDDING * Math.PI) / 180) * x // constant along a bed
	const phase = 1.1 * Math.sin((x / 0.83) * Math.PI * 2 + 0.7) + 0.5 * Math.sin((x / 0.31) * Math.PI * 2 + 2.3)
	const swell = 0.65 + 0.35 * Math.sin((x / 0.9 + y / 1.7) * Math.PI * 2 + 1.1)
	const wave = Math.sin((s / RIPPLE.wave) * Math.PI * 2 + phase) + 0.35 * Math.sin((s / (RIPPLE.wave * 0.43)) * Math.PI * 2 + phase * 1.7 + 0.9)
	const nx = 1 - Math.abs(bx) / (w / 2)
	const ny = 1 - Math.abs(by) / (h / 2)
	const fade = smoothstep(nx / RIPPLE.edge) * smoothstep(ny / (RIPPLE.edge * 0.6))
	return RIPPLE.amp * swell * wave * fade
}

/** The foot sinks into its ground shadow (v2.3): below FOOT.from (world y) the vertex colour ramps down to FOOT.to. */
const FOOT = { from: -0.45, to: 0.62 }

/**
 * The menhir: lib/stone's deformation applied to a segmented box (the SVG twin is generated from the same
 * function). `uv` stays the box's (the rune overlay uses it, so LARS lands where the SVG's strokes do).
 * `uv1` (v2.5; the slate's channel) maps every face by its deformed world position, in the face's units:
 * the front by (x, y), so its beds run straight at BEDDING and the crown cuts them (the box UVs, squeezed
 * under the crown, ringed it like contour lines); the sides by (z, y), so the beds run level along them;
 * and the crown by (x, z), so its lines run straight across the top. `rippled` (desktop) gives the front
 * face RIPPLE's normals.
 */
function stoneGeometry(rippled: boolean): THREE.BufferGeometry {
	const g = new THREE.BoxGeometry(STONE.w, STONE.h, STONE.d, ...STONE.segs)
	const p = g.attributes.position
	const colors = new Float32Array(p.count * 3)
	const bottom = -STONE.h / 2
	const flat: [number, number][] = [] // front-face vertices: index, unrippled z
	for (let i = 0; i < p.count; i++) {
		const [bx, by, bz] = [p.getX(i), p.getY(i), p.getZ(i)]
		const [x, y, z] = deform(bx, by, bz)
		// the front face (+z) is the cleavage plane: it carries the ripple
		const front = rippled && bz >= STONE.d / 2 - 1e-6
		if (front) flat.push([i, z])
		p.setXYZ(i, x, y, front ? z + ripple(x, y, bx, by) : z)
		const t = Math.min(1, Math.max(0, (FOOT.from - y) / (FOOT.from - bottom)))
		const k = 1 - (1 - FOOT.to) * t * t * (3 - 2 * t)
		colors.set([k, k, k], i * 3)
	}
	// BoxGeometry groups: 0 +x, 1 -x, 2 +y, 3 -y, 4 +z (front: LARS), 5 -z; no vertex is shared between them
	const uv1 = new Float32Array(p.count * 2)
	const index = g.index!.array
	for (const grp of g.groups) {
		for (let k = grp.start; k < grp.start + grp.count; k++) {
			const i = index[k]
			const [x, y, z] = [p.getX(i), p.getY(i), p.getZ(i)]
			const m = grp.materialIndex ?? 4
			const [u, v] = m < 2 ? [z, y] : m < 4 ? [x, z] : [x, y]
			uv1[i * 2] = u / STONE.w + 0.5
			uv1[i * 2 + 1] = v / STONE.h + 0.5
		}
	}
	g.setAttribute("uv1", new THREE.BufferAttribute(uv1, 2))
	g.setAttribute("color", new THREE.BufferAttribute(colors, 3))
	g.computeVertexNormals()
	// The ripple lives in the normals only: flattened back, the face keeps the generated silhouette and LARS
	// stays exactly where the SVG twin's strokes are (displaced, the strokes wobbled by up to 2 px).
	for (const [i, z] of flat) p.setZ(i, z)
	return g
}

// ---------- scene ----------

/** Tuned so the median face luminance matches the SVG twin within ±12 % (scripts/shoot.mjs checks it). */
const ALBEDO = "#ffffff"
const EXPOSURE = 1.27
/** Strength of the slate's relief (bumpMap). v2.5: 1.6 -> 2.1, so the calmer face keeps a high-pass sigma of 3-6 (shoot.mjs gates it). */
const BUMP = 2.1
/** Moonlight key intensity, balanced with the hemisphere so the face matches the SVG twin. */
const KEY = 60

function Stone({ live, bake, onReady }: { live: boolean; bake: boolean; onReady: () => void }) {
	const group = useRef<THREE.Group>(null)
	const frames = useRef(0)
	const sway = useRef(0)
	const liveRef = useRef(live)
	liveRef.current = live

	const { geometry, materials, overlay, textures } = useMemo(() => {
		// Phones see the SVG twin as a smooth, half-lit backdrop (below 861 px), so the stone that replaces it
		// on the first touch is smooth too (v2.5): no lamination, no ripple and a third of the relief.
		const desktop = window.matchMedia("(min-width: 861px)").matches
		const geometry = stoneGeometry(desktop)
		const slate = slateTextures(desktop)
		const runes = runeLightTexture()
		const material = (map: THREE.Texture, surface: THREE.Texture) =>
			new THREE.MeshStandardMaterial({
				map,
				color: new THREE.Color(ALBEDO),
				bumpMap: surface,
				bumpScale: desktop ? BUMP : BUMP / 3,
				vertexColors: true,
				roughnessMap: surface,
				roughness: 1,
				metalness: 0,
			})
		const face = material(slate.albedo, slate.surface)
		const edge = material(slate.edgeAlbedo, slate.edgeSurface)
		const hidden = new THREE.MeshBasicMaterial({ visible: false })
		const fire = new THREE.MeshBasicMaterial({ map: runes, transparent: true, depthWrite: false, toneMapped: false })
		// BoxGeometry groups: +x, -x, +y, -y, +z (front: LARS), -z. The cleavage face is the front and back;
		// the bedding shows on the sides and the crown.
		const materials = { stone: [edge, edge, edge, edge, face, face], overlay: [hidden, hidden, hidden, hidden, fire, hidden] }
		return { geometry, materials, overlay: fire, textures: [slate.albedo, slate.surface, slate.edgeAlbedo, slate.edgeSurface, runes] }
	}, [])

	useEffect(
		() => () => {
			geometry.dispose()
			new Set([...materials.stone, ...materials.overlay]).forEach((m) => m.dispose())
			textures.forEach((t) => t.dispose())
		},
		[geometry, materials, textures]
	)

	useFrame((_, delta) => {
		// useFrame runs before each render: on the third call two frames have been drawn at the SVG's pose.
		frames.current += 1
		if (frames.current === 3) onReady()
		const g = group.current
		if (!g || !liveRef.current) return
		sway.current += Math.min(delta, 0.1)
		const t = sway.current
		const ease = Math.min(1, t / SWAY.easeIn)
		const k = ease * ease * (3 - 2 * ease)
		const phase = Math.sin((t / SWAY.period) * Math.PI * 2)
		g.rotation.y = START_YAW + SWAY.amp * k * phase
		overlay.opacity = 1 - 0.14 * k * (0.5 + 0.5 * Math.sin(t * 1.3))
	})

	return (
		<group ref={group} rotation={[0, START_YAW, 0]}>
			<mesh geometry={geometry} material={materials.stone} />
			{/* The bake (scripts/bake-stone.mjs) photographs the bare slate: no runes, no fire light. */}
			<mesh geometry={geometry} material={materials.overlay} renderOrder={1} visible={!bake} />
			{/* Rune-fire spilling from the carving, close to the face and moving with it: warm light on
			    the slate around LARS that falls off within a hand's breadth, so the rest stays neutral. */}
			<pointLight position={[0, FIRE.y, FIRE.z]} intensity={bake ? 0 : FIRE.intensity} distance={FIRE.distance} decay={2} color={FIRE.color} />
		</group>
	)
}

/**
 * `bake` (development only, `/?bake=1`; HeroStone): the stone alone at the handoff pose, rendered at
 * DPR 2 into a readable buffer, for scripts/bake-stone.mjs to turn into the SVG twin's desktop face.
 */
export default function RuneStoneScene({ active, live, bake = false, onReady }: { active: boolean; live: boolean; bake?: boolean; onReady: () => void }) {
	return (
		<Canvas
			dpr={bake ? 2 : [1, 1.5]}
			frameloop={active ? "always" : "never"}
			camera={{ position: [...CAMERA.position], fov: CAMERA.fov, near: CAMERA.near, far: CAMERA.far }}
			gl={{ antialias: true, alpha: true, powerPreference: "low-power", preserveDrawingBuffer: bake }}
			onCreated={({ gl }) => {
				// R3F defaults to ACES, which crushed the slate to near-black in v2.0. Neutral (v2.1) kept
				// the mid-tones but its toe subtracts an offset from dark values, which crushed the
				// shadowed flank toward black and saturated it navy. The scene has no highlights to roll
				// off (the rune-fire overlay is untoned), so linear exposure keeps every slate value.
				gl.toneMapping = THREE.LinearToneMapping
				gl.toneMappingExposure = EXPOSURE
			}}
		>
			{/* neutral sky and a warm-dark ground bounce (v2.2: both were blue, so the flank read navy) */}
			<hemisphereLight args={["#b9c2cc", "#2a2723", 0.6]} />
			{/* moonlight key from the upper left, only slightly cool; a near point light, so the face falls off toward the bottom right like the SVG */}
			<pointLight position={[-2.6, 3.2, 2.4]} intensity={KEY} decay={2} color="#e4e9f0" />
			{/* moon rim from behind on the right, so the shadowed flank still has an edge */}
			<directionalLight position={[3.5, 2, -3]} intensity={0.3} color="#a2a8b0" />
			<Stone live={live} bake={bake} onReady={onReady} />
		</Canvas>
	)
}
