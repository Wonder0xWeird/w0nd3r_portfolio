"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import { LARS, RUNES, type RuneName } from "@/lib/runes"
import { CAMERA, RUNE_FACE, START_YAW, STONE, deform, runeSlot } from "@/lib/stone"

const GOLD = "#f3c75a"

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
 * LARS as rune-fire, drawn exactly like the SVG twin (StoneFallback): carved
 * channel, gold-700 inlay, bloom, glow and white-hot core, at the slots
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
	// carved channel (slightly below: the cut's shadowed lower lip) and the incised inlay
	ctx.strokeStyle = "rgba(11,14,18,0.72)"
	ctx.lineWidth = 1.05 * unit
	each((r, x, y, s) => drawRune(ctx, r, x, y + 0.14 * unit, s))
	ctx.strokeStyle = "#8f6a2a"
	ctx.lineWidth = 0.5 * unit
	each((r, x, y, s) => drawRune(ctx, r, x, y, s))
	// bloom: only the shadow of strokes drawn far off-canvas
	const off = 4000
	ctx.save()
	ctx.globalAlpha = 0.8
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
	ctx.shadowBlur = 0.9 * unit * k
	ctx.strokeStyle = "#f7d98c"
	ctx.lineWidth = 0.56 * unit
	each((r, x, y, s) => drawRune(ctx, r, x, y, s))
	each((r, x, y, s) => drawRune(ctx, r, x, y, s))
	ctx.restore()
	// white-hot core
	ctx.globalAlpha = 0.85
	ctx.strokeStyle = "#fff4d6"
	ctx.lineWidth = 0.2 * unit
	each((r, x, y, s) => drawRune(ctx, r, x, y, s))
	const t = new THREE.CanvasTexture(c)
	t.colorSpace = THREE.SRGBColorSpace
	t.anisotropy = 4
	return t
}

/** Mottled slate grain so the stone doesn't read as plastic. */
function slateTexture(): THREE.CanvasTexture {
	const s = 256
	const c = document.createElement("canvas")
	c.width = s
	c.height = s
	const ctx = c.getContext("2d")!
	ctx.fillStyle = "#8d97a7"
	ctx.fillRect(0, 0, s, s)
	let seed = 7
	const rnd = () => {
		seed = (seed * 16807) % 2147483647
		return seed / 2147483647
	}
	for (let i = 0; i < 2600; i++) {
		const v = Math.round(90 + rnd() * 60)
		ctx.fillStyle = `rgba(${v},${v + 6},${v + 14},${(0.04 + rnd() * 0.06).toFixed(3)})`
		const r = 1 + rnd() * 5
		ctx.fillRect(rnd() * s, rnd() * s, r * (1 + rnd() * 4), r)
	}
	const t = new THREE.CanvasTexture(c)
	t.colorSpace = THREE.SRGBColorSpace
	t.wrapS = t.wrapT = THREE.RepeatWrapping
	return t
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

function Stone({ live, onReady }: { live: boolean; onReady: () => void }) {
	const group = useRef<THREE.Group>(null)
	const frames = useRef(0)
	const sway = useRef(0)
	const liveRef = useRef(live)
	liveRef.current = live

	const { geometry, materials, overlay, textures } = useMemo(() => {
		const geometry = stoneGeometry()
		const slate = slateTexture()
		const runes = runeLightTexture()
		const stone = new THREE.MeshStandardMaterial({ map: slate, color: new THREE.Color(ALBEDO), roughness: 0.9, metalness: 0.02 })
		const hidden = new THREE.MeshBasicMaterial({ visible: false })
		const fire = new THREE.MeshBasicMaterial({ map: runes, transparent: true, depthWrite: false, toneMapped: false })
		// BoxGeometry groups: +x, -x, +y, -y, +z (front: LARS), -z
		const materials = { stone, overlay: [hidden, hidden, hidden, hidden, fire, hidden] }
		return { geometry, materials, overlay: fire, textures: [slate, runes] }
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
				// R3F defaults to ACES, which crushed the slate to near-black in v2.0.
				// Neutral keeps mid-tone slate close to its sRGB value, so the 3D face can match the SVG.
				gl.toneMapping = THREE.NeutralToneMapping
				gl.toneMappingExposure = EXPOSURE
			}}
		>
			<hemisphereLight args={["#c9ced6", "#30353d", 0.75]} />
			{/* moonlight key from the upper left; a near point light, so the face falls off toward the bottom right like the SVG */}
			<pointLight position={[-2.2, 2.8, 2.8]} intensity={24} decay={2} color="#dde6f3" />
			{/* moon rim from behind on the right, so the shadowed flank still has an edge */}
			<directionalLight position={[3.5, 2, -3]} intensity={0.6} color="#93a2b8" />
			{/* rune-fire spilling from the carving */}
			<pointLight position={[0.05, -0.05, 1.25]} intensity={0.9} distance={3} decay={1.4} color={GOLD} />
			<Stone live={live} onReady={onReady} />
		</Canvas>
	)
}
