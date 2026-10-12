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

/** Height-map weights (0-255 levels per unit of each field): bedding bands, lamination, ledge rise. */
const HEIGHT = { bands: 3, lamina: 15, step: 24 }

/** Bedding angle on the front face (degrees; positive: the beds descend gently to the right, echoing the crown's slope). */
const BEDDING = 8

/**
 * Slate (v2.3: night-lit slate, not cast concrete). A darker blue-grey albedo (#5f6469, hue ~210) laid
 * down in bedding bands (anisotropic fbm, 256 x 24 and 64 x 10 px) with a faint blue-grey/green-grey
 * drift between them, fine fbm (8/4 px) at half v2.2's amplitude and little per-texel grain; 220 pits
 * on a power law (most tiny), 70 % of them strung along 12 bedding lines; a few thin quartz veins.
 * A data texture of the same surface: red is the height (bumpMap: the bands and pits carry the relief,
 * not white noise), green the roughness (.74-.96, roughnessMap). The bands are generated axis-aligned
 * (so the tile still repeats seamlessly) and turned to BEDDING by the textures' UV rotation.
 * 512 px each, generated once in a few ms; no image assets.
 */
function slateTextures(): { albedo: THREE.CanvasTexture; surface: THREE.CanvasTexture } {
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
	// fine lamination: the cleavage's hairline beds, long and thin
	const lamina = fbm(
		S,
		[
			[48, 3, 2.4],
			[24, 1.6, 1.2],
		],
		rnd
	)
	// some beds split cleaner than others: the lamination's strength drifts from bed to bed
	const split = fbm(S, [[512, 40, 1]], rnd)
	// cleavage steps: a slow field terraced into ledges about a bed apart, each with a 2-3 px edge
	const ledges = fbm(S, [[512, 56, 1]], rnd)
	const STEPS = 7
	// slate drifts a few degrees between blue-grey and green-grey from bed to bed
	const drift = fbm(S, [[512, 64, 1]], rnd)
	const canvas = () => {
		const c = document.createElement("canvas")
		c.width = c.height = S
		return c
	}
	const albedo = canvas()
	const surface = canvas()
	const a = albedo.getContext("2d")!
	const b = surface.getContext("2d")!
	const ai = a.createImageData(S, S)
	const bi = b.createImageData(S, S)
	for (let i = 0; i < S * S; i++) {
		const grain = rnd() * 2 - 1
		const q = (ledges[i] + 1) * STEPS
		const k = Math.floor(q)
		const e = Math.min(1, Math.max(0, (q - k - 0.82) / 0.18))
		const riser = e * e * (3 - 2 * e)
		const ledge = k % 2 ? 1 - riser : riser // up one ledge, down the next: bounded, every riser a line
		const lam = lamina[i] * (0.65 + 0.35 * split[i])
		const v = bands[i] * 0.6 + fine[i] + lam * 0.8 + grain * 2 // albedo, about +-15 levels
		const g = drift[i] * 2.2
		const o = i * 4
		ai.data[o] = 0x5f + v - g * 0.5
		ai.data[o + 1] = 0x64 + v + g * 0.6
		ai.data[o + 2] = 0x69 + v - g * 0.2
		ai.data[o + 3] = 255
		bi.data[o] = 128 + bands[i] * HEIGHT.bands + lam * HEIGHT.lamina + (ledge - 0.5) * HEIGHT.step + fine[i] * 4 + grain * 2
		bi.data[o + 1] = 255 * (0.85 + (v / 20) * 0.11)
		bi.data[o + 3] = 255
	}
	a.putImageData(ai, 0, 0)
	b.putImageData(bi, 0, 0)
	// marks are drawn at the 9 wrapped offsets, so they tile seamlessly too
	const wrapped = (fn: (dx: number, dy: number) => void) => {
		for (const dx of [-S, 0, S]) for (const dy of [-S, 0, S]) fn(dx, dy)
	}
	// quartz veins: a few thin, faint random walks, 40-180 px long
	a.lineCap = a.lineJoin = "round"
	for (let v = 0; v < 10; v++) {
		const pts: [number, number][] = [[rnd() * S, rnd() * S]]
		const len = 40 + rnd() * 140
		let ang = rnd() * Math.PI * 2
		for (let d = 0; d < len; d += 6) {
			ang += (rnd() - 0.5) * 0.9
			const [px, py] = pts[pts.length - 1]
			pts.push([px + Math.cos(ang) * 6, py + Math.sin(ang) * 6])
		}
		a.strokeStyle = `rgba(196,200,204,${(0.06 + rnd() * 0.05).toFixed(3)})`
		a.lineWidth = 0.8 + rnd() * 0.5
		wrapped((dx, dy) => {
			a.beginPath()
			pts.forEach(([px, py], i) => (i ? a.lineTo(px + dx, py + dy) : a.moveTo(px + dx, py + dy)))
			a.stroke()
		})
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
		a.fillStyle = `rgba(14,16,20,${alpha})`
		b.fillStyle = `rgba(40,245,0,${alpha})`
		wrapped((dx, dy) => {
			for (const g of [a, b]) {
				g.beginPath()
				g.ellipse(x + dx, y + dy, r * 1.4, r, 0, 0, Math.PI * 2)
				g.fill()
			}
		})
	}
	// The face is 1.2 x 2.3 world units with UVs 0..1, so a UV rotation of t shows on it as
	// atan(2.3 / 1.2 * tan t): solve for BEDDING.
	const rotation = Math.atan((Math.tan((BEDDING * Math.PI) / 180) * STONE.w) / STONE.h)
	const texture = (c: HTMLCanvasElement, srgb: boolean) => {
		const t = new THREE.CanvasTexture(c)
		if (srgb) t.colorSpace = THREE.SRGBColorSpace
		t.wrapS = t.wrapT = THREE.RepeatWrapping
		t.repeat.set(1.5, 2.5)
		t.rotation = rotation
		t.anisotropy = 8
		return t
	}
	return { albedo: texture(albedo, true), surface: texture(surface, false) }
}

/** The foot sinks into its ground shadow (v2.3): below FOOT.from (world y) the vertex colour ramps down to FOOT.to. */
const FOOT = { from: -0.45, to: 0.62 }

/** The menhir: lib/stone's deformation applied to a segmented box (the SVG twin is generated from the same function). */
function stoneGeometry(): THREE.BufferGeometry {
	const g = new THREE.BoxGeometry(STONE.w, STONE.h, STONE.d, ...STONE.segs)
	const p = g.attributes.position
	const colors = new Float32Array(p.count * 3)
	const bottom = -STONE.h / 2
	for (let i = 0; i < p.count; i++) {
		const [x, y, z] = deform(p.getX(i), p.getY(i), p.getZ(i))
		p.setXYZ(i, x, y, z)
		const t = Math.min(1, Math.max(0, (FOOT.from - y) / (FOOT.from - bottom)))
		const k = 1 - (1 - FOOT.to) * t * t * (3 - 2 * t)
		colors.set([k, k, k], i * 3)
	}
	g.setAttribute("color", new THREE.BufferAttribute(colors, 3))
	g.computeVertexNormals()
	return g
}

// ---------- scene ----------

/** Tuned so the median face luminance matches the SVG twin within ±12 % (scripts/shoot.mjs checks it). */
const ALBEDO = "#ffffff"
const EXPOSURE = 1.27
/** Strength of the slate's relief (bumpMap): the face's high-pass sigma is >= 4 (shoot.mjs gates it). */
const BUMP = 1.6
/** Moonlight key intensity, balanced with the hemisphere so the face matches the SVG twin. */
const KEY = 60

function Stone({ live, onReady }: { live: boolean; onReady: () => void }) {
	const group = useRef<THREE.Group>(null)
	const frames = useRef(0)
	const sway = useRef(0)
	const liveRef = useRef(live)
	liveRef.current = live

	const { geometry, materials, overlay, textures } = useMemo(() => {
		const geometry = stoneGeometry()
		const { albedo, surface } = slateTextures()
		const runes = runeLightTexture()
		const stone = new THREE.MeshStandardMaterial({
			map: albedo,
			color: new THREE.Color(ALBEDO),
			bumpMap: surface,
			bumpScale: BUMP,
			vertexColors: true,
			roughnessMap: surface,
			roughness: 1,
			metalness: 0,
		})
		const hidden = new THREE.MeshBasicMaterial({ visible: false })
		const fire = new THREE.MeshBasicMaterial({ map: runes, transparent: true, depthWrite: false, toneMapped: false })
		// BoxGeometry groups: +x, -x, +y, -y, +z (front: LARS), -z
		const materials = { stone, overlay: [hidden, hidden, hidden, hidden, fire, hidden] }
		return { geometry, materials, overlay: fire, textures: [albedo, surface, runes] }
	}, [])

	useEffect(
		() => () => {
			geometry.dispose()
			materials.stone.dispose()
			new Set(materials.overlay).forEach((m) => m.dispose())
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
			<mesh geometry={geometry} material={materials.overlay} renderOrder={1} />
			{/* Rune-fire spilling from the carving, close to the face and moving with it: warm light on
			    the slate around LARS that falls off within a hand's breadth, so the rest stays neutral. */}
			<pointLight position={[0, FIRE.y, FIRE.z]} intensity={FIRE.intensity} distance={FIRE.distance} decay={2} color={FIRE.color} />
		</group>
	)
}

export default function RuneStoneScene({ active, live, onReady }: { active: boolean; live: boolean; onReady: () => void }) {
	return (
		<Canvas
			dpr={[1, 1.5]}
			frameloop={active ? "always" : "never"}
			camera={{ position: [...CAMERA.position], fov: CAMERA.fov, near: CAMERA.near, far: CAMERA.far }}
			gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
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
			<Stone live={live} onReady={onReady} />
		</Canvas>
	)
}
