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
 * Tileable value-noise fbm on a size x size grid: one octave per [period (px, divides size),
 * amplitude], summed. Quintic-interpolated lattice (smooth slopes, so the bump map shows no grid),
 * wrapped so the texture repeats seamlessly.
 */
function fbm(size: number, octaves: [number, number][], rnd: () => number): Float32Array {
	const out = new Float32Array(size * size)
	for (const [period, amp] of octaves) {
		const n = size / period
		const lat = Float32Array.from({ length: n * n }, () => rnd() * 2 - 1)
		for (let y = 0; y < size; y++) {
			const fy = y / period
			const y0 = Math.floor(fy)
			const ty = fy - y0
			const sy = ty * ty * ty * (ty * (ty * 6 - 15) + 10)
			const r0 = (y0 % n) * n
			const r1 = ((y0 + 1) % n) * n
			for (let x = 0; x < size; x++) {
				const fx = x / period
				const x0 = Math.floor(fx)
				const tx = fx - x0
				const sx = tx * tx * tx * (tx * (tx * 6 - 15) + 10)
				const c0 = x0 % n
				const c1 = (x0 + 1) % n
				const top = lat[r0 + c0] + (lat[r0 + c1] - lat[r0 + c0]) * sx
				const bot = lat[r1 + c0] + (lat[r1 + c1] - lat[r1 + c0]) * sx
				out[y * size + x] += (top + (bot - top) * sy) * amp
			}
		}
	}
	return out
}

/**
 * Slate (v2.2): a neutral grey albedo (#7b7c7e) mottled by fbm (periods 128/32 px) with fine
 * fbm (8/4 px) and per-texel grain, 30 quartz veins and 900 pits; plus a data texture of the same
 * surface: red is the height (bumpMap: mostly the fine relief and grain, with the pits dented in),
 * green the roughness (.74-.96, roughnessMap). 512 px each, generated once in a few ms; no image
 * assets.
 */
function slateTextures(): { albedo: THREE.CanvasTexture; surface: THREE.CanvasTexture } {
	const S = 512
	const rnd = rng(7)
	const mottle = fbm(
		S,
		[
			[128, 9],
			[32, 8],
		],
		rnd
	)
	const fine = fbm(
		S,
		[
			[8, 6],
			[4, 3],
		],
		rnd
	)
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
		const v = mottle[i] + fine[i] + grain * 3 // albedo, about +-30 levels
		const o = i * 4
		ai.data[o] = 0x7b + v
		ai.data[o + 1] = 0x7c + v
		ai.data[o + 2] = 0x7e + v
		ai.data[o + 3] = 255
		bi.data[o] = 128 + mottle[i] + fine[i] * 6 + grain * 8
		bi.data[o + 1] = 255 * (0.85 + (v / 30) * 0.11)
		bi.data[o + 3] = 255
	}
	a.putImageData(ai, 0, 0)
	b.putImageData(bi, 0, 0)
	// marks are drawn at the 9 wrapped offsets, so they tile seamlessly too
	const wrapped = (fn: (dx: number, dy: number) => void) => {
		for (const dx of [-S, 0, S]) for (const dy of [-S, 0, S]) fn(dx, dy)
	}
	// quartz veins: thin, pale random walks, 40-180 px long
	a.lineCap = a.lineJoin = "round"
	for (let v = 0; v < 30; v++) {
		const pts: [number, number][] = [[rnd() * S, rnd() * S]]
		const len = 40 + rnd() * 140
		let ang = rnd() * Math.PI * 2
		for (let d = 0; d < len; d += 6) {
			ang += (rnd() - 0.5) * 0.9
			const [px, py] = pts[pts.length - 1]
			pts.push([px + Math.cos(ang) * 6, py + Math.sin(ang) * 6])
		}
		a.strokeStyle = `rgba(214,210,200,${(0.1 + rnd() * 0.06).toFixed(3)})`
		a.lineWidth = 1 + rnd() * 0.5
		wrapped((dx, dy) => {
			a.beginPath()
			pts.forEach(([px, py], i) => (i ? a.lineTo(px + dx, py + dy) : a.moveTo(px + dx, py + dy)))
			a.stroke()
		})
	}
	// pits: small dark dots in the albedo, dents in the height (rougher inside)
	for (let p = 0; p < 900; p++) {
		const x = rnd() * S
		const y = rnd() * S
		const r = 0.5 + rnd() * 1.3
		const alpha = (0.25 + rnd() * 0.2).toFixed(3)
		a.fillStyle = `rgba(20,22,26,${alpha})`
		b.fillStyle = `rgba(30,245,0,${alpha})`
		wrapped((dx, dy) => {
			for (const g of [a, b]) {
				g.beginPath()
				g.arc(x + dx, y + dy, r, 0, Math.PI * 2)
				g.fill()
			}
		})
	}
	const texture = (c: HTMLCanvasElement, srgb: boolean) => {
		const t = new THREE.CanvasTexture(c)
		if (srgb) t.colorSpace = THREE.SRGBColorSpace
		t.wrapS = t.wrapT = THREE.RepeatWrapping
		t.repeat.set(1.5, 2.5)
		t.anisotropy = 8
		return t
	}
	return { albedo: texture(albedo, true), surface: texture(surface, false) }
}

/** The menhir: lib/stone's deformation applied to a segmented box (the SVG twin is generated from the same function). */
function stoneGeometry(): THREE.BufferGeometry {
	const g = new THREE.BoxGeometry(STONE.w, STONE.h, STONE.d, ...STONE.segs)
	const p = g.attributes.position
	for (let i = 0; i < p.count; i++) {
		const [x, y, z] = deform(p.getX(i), p.getY(i), p.getZ(i))
		p.setXYZ(i, x, y, z)
	}
	g.computeVertexNormals()
	return g
}

// ---------- scene ----------

/** Tuned so the median face luminance matches the SVG twin within ±12 % (scripts/shoot.mjs checks it). */
const ALBEDO = "#ffffff"
const EXPOSURE = 1.32
/** Strength of the slate's relief (bumpMap): the face's high-pass sigma is >= 4 (shoot.mjs gates it). */
const BUMP = 3
/** Moonlight key intensity, balanced with the hemisphere so the face matches the SVG twin. */
const KEY = 36

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
			<hemisphereLight args={["#bfc3c8", "#2a2723", 0.95]} />
			{/* moonlight key from the upper left, only slightly cool; a near point light, so the face falls off toward the bottom right like the SVG */}
			<pointLight position={[-2.2, 2.8, 2.8]} intensity={KEY} decay={2} color="#e4e9f0" />
			{/* moon rim from behind on the right, so the shadowed flank still has an edge */}
			<directionalLight position={[3.5, 2, -3]} intensity={0.3} color="#9aa5b4" />
			<Stone live={live} onReady={onReady} />
		</Canvas>
	)
}
