"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { Sparkles } from "@react-three/drei"
import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import { LARS, RUNES, type RuneName } from "@/lib/runes"

const GOLD = "#f3c75a"
const STONE_W = 1.2
const STONE_H = 2.3
const STONE_D = 0.46

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

/** White-on-black rune carving used as both emissive glow and (negative) bump. */
function runeFaceTexture(runes: RuneName[]): THREE.CanvasTexture {
	const w = 256
	const h = 512
	const c = document.createElement("canvas")
	c.width = w
	c.height = h
	const ctx = c.getContext("2d")!
	ctx.fillStyle = "#000"
	ctx.fillRect(0, 0, w, h)
	ctx.strokeStyle = "#fff"
	ctx.lineCap = "round"
	ctx.lineJoin = "round"
	const size = 74
	const gap = 22
	const total = runes.length * size + (runes.length - 1) * gap
	let y = (h - total) / 2 + 10
	for (const r of runes) {
		ctx.shadowColor = "#fff"
		ctx.shadowBlur = 10
		ctx.lineWidth = 7
		drawRune(ctx, r, (w - size) / 2, y, size)
		ctx.shadowBlur = 0
		ctx.lineWidth = 4
		drawRune(ctx, r, (w - size) / 2, y, size)
		y += size + gap
	}
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
	ctx.fillStyle = "#59616e"
	ctx.fillRect(0, 0, s, s)
	let seed = 7
	const rnd = () => {
		seed = (seed * 16807) % 2147483647
		return seed / 2147483647
	}
	for (let i = 0; i < 2600; i++) {
		const v = Math.round(70 + rnd() * 50)
		ctx.fillStyle = `rgba(${v},${v + 4},${v + 12},${(0.08 + rnd() * 0.12).toFixed(3)})`
		const r = 1 + rnd() * 5
		ctx.fillRect(rnd() * s, rnd() * s, r * (1 + rnd() * 4), r)
	}
	const t = new THREE.CanvasTexture(c)
	t.colorSpace = THREE.SRGBColorSpace
	t.wrapS = t.wrapT = THREE.RepeatWrapping
	return t
}

function runeSpriteTexture(name: RuneName): THREE.CanvasTexture {
	const s = 64
	const c = document.createElement("canvas")
	c.width = s
	c.height = s
	const ctx = c.getContext("2d")!
	ctx.strokeStyle = "#fff"
	ctx.lineCap = "round"
	ctx.lineJoin = "round"
	ctx.shadowColor = "#fff"
	ctx.shadowBlur = 6
	ctx.lineWidth = 3.5
	drawRune(ctx, name, 12, 12, 40)
	return new THREE.CanvasTexture(c)
}

// ---------- geometry ----------

function noise(x: number, y: number, z: number): number {
	return (
		Math.sin(x * 2.1 + Math.sin(y * 1.7)) * Math.cos(z * 2.9 + y * 0.8) * 0.5 +
		Math.sin(x * 5.3 + z * 3.1 + y * 4.7) * 0.22 +
		Math.sin(y * 11.0 + x * 7.0) * 0.07
	)
}

/** A tapered, round-shouldered standing stone with a position-seeded rough surface. */
function stoneGeometry(): THREE.BufferGeometry {
	const g = new THREE.BoxGeometry(STONE_W, STONE_H, STONE_D, 20, 36, 6)
	const p = g.attributes.position
	const v = new THREE.Vector3()
	const dir = new THREE.Vector3()
	for (let i = 0; i < p.count; i++) {
		v.fromBufferAttribute(p, i)
		const h = (v.y + STONE_H / 2) / STONE_H // 0 bottom -> 1 top
		const nx = v.x / (STONE_W / 2) // -1 .. 1
		const taper = 1 - 0.16 * h
		const shoulder = THREE.MathUtils.smoothstep(h, 0.62, 1)
		v.x *= taper * (1 - 0.1 * shoulder)
		v.y -= 0.42 * nx * nx * shoulder + 0.06 * nx * shoulder
		v.z *= (1 + 0.35 * (1 - nx * nx)) * (1 - 0.25 * shoulder)
		dir.set(v.x, v.y * 0.25, v.z).normalize()
		v.addScaledVector(dir, noise(v.x * 1.6, v.y * 1.6, v.z * 1.6) * 0.05)
		p.setXYZ(i, v.x, v.y, v.z)
	}
	g.computeVertexNormals()
	return g
}

// ---------- scene pieces ----------

function Stone() {
	const group = useRef<THREE.Group>(null)
	const { geometry, materials, carvedMats, textures } = useMemo(() => {
		const geometry = stoneGeometry()
		const slate = slateTexture()
		const front = runeFaceTexture(LARS)
		const back = runeFaceTexture(["othala", "ingwaz", "algiz", "dagaz"])
		const plain = new THREE.MeshStandardMaterial({ map: slate, color: "#9aa3b2", roughness: 0.92, metalness: 0.02 })
		const carved = (tex: THREE.Texture) =>
			new THREE.MeshStandardMaterial({
				map: slate,
				color: "#9aa3b2",
				roughness: 0.88,
				metalness: 0.02,
				emissive: new THREE.Color(GOLD),
				emissiveMap: tex,
				emissiveIntensity: 1.6,
				bumpMap: tex,
				bumpScale: -2.5,
			})
		const carvedMats = [carved(front), carved(back)]
		// BoxGeometry groups: +x, -x, +y, -y, +z (front), -z (back)
		const materials = [plain, plain, plain, plain, carvedMats[0], carvedMats[1]]
		return { geometry, materials, carvedMats, textures: [slate, front, back] }
	}, [])

	useEffect(
		() => () => {
			geometry.dispose()
			new Set(materials).forEach((m) => m.dispose())
			textures.forEach((t) => t.dispose())
		},
		[geometry, materials, textures]
	)

	useFrame((state, delta) => {
		const g = group.current
		if (!g) return
		const t = state.clock.elapsedTime
		g.rotation.y += Math.min(delta, 0.1) * 0.22
		g.position.y = Math.sin(t * 0.6) * 0.04
		const glow = 1.35 + Math.sin(t * 1.4) * 0.35
		carvedMats[0].emissiveIntensity = glow
		carvedMats[1].emissiveIntensity = glow
	})

	return (
		<group ref={group} rotation={[0, -0.35, 0]}>
			<mesh geometry={geometry} material={materials} />
		</group>
	)
}

const MOTE_RUNES: RuneName[] = ["algiz", "kenaz", "ingwaz", "tiwaz", "othala", "fehu", "sowilo", "gebo", "wunjo"]

function RuneMotes() {
	const refs = useRef<(THREE.Sprite | null)[]>([])
	const motes = useMemo(
		() =>
			MOTE_RUNES.map((name, i) => {
				const tex = runeSpriteTexture(name)
				const mat = new THREE.SpriteMaterial({
					map: tex,
					color: GOLD,
					transparent: true,
					opacity: 0.75,
					blending: THREE.AdditiveBlending,
					depthWrite: false,
				})
				return {
					mat,
					tex,
					radius: 1.25 + (i % 3) * 0.3,
					height: -0.9 + ((i * 0.37) % 1) * 2.0,
					phase: (i / MOTE_RUNES.length) * Math.PI * 2,
					speed: 0.12 + (i % 4) * 0.035,
					scale: 0.16 + (i % 3) * 0.04,
				}
			}),
		[]
	)

	useEffect(
		() => () =>
			motes.forEach((m) => {
				m.mat.dispose()
				m.tex.dispose()
			}),
		[motes]
	)

	useFrame((state) => {
		const t = state.clock.elapsedTime
		motes.forEach((m, i) => {
			const s = refs.current[i]
			if (!s) return
			const a = m.phase + t * m.speed
			s.position.set(Math.cos(a) * m.radius, m.height + Math.sin(t * 0.7 + m.phase) * 0.12, Math.sin(a) * m.radius * 0.7)
			m.mat.opacity = 0.45 + 0.35 * (0.5 + 0.5 * Math.sin(t * 1.1 + m.phase * 3))
		})
	})

	return (
		<>
			{motes.map((m, i) => (
				<sprite
					key={i}
					ref={(el) => {
						refs.current[i] = el
					}}
					material={m.mat}
					scale={[m.scale, m.scale, m.scale]}
				/>
			))}
		</>
	)
}

export default function RuneStoneScene({ active, onReady }: { active: boolean; onReady: () => void }) {
	return (
		<Canvas
			dpr={[1, 1.5]}
			frameloop={active ? "always" : "never"}
			camera={{ position: [0, 0.15, 5.4], fov: 34 }}
			gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
			onCreated={({ gl }) => {
				gl.toneMapping = THREE.ACESFilmicToneMapping
				requestAnimationFrame(() => onReady())
			}}
		>
			<ambientLight intensity={0.5} color="#b8c2d4" />
			<directionalLight position={[3, 4, 5]} intensity={1.6} color="#f1ece2" />
			<directionalLight position={[-4, 1.5, -3]} intensity={1.1} color="#7f95b8" />
			<pointLight position={[0, -0.2, 1.8]} intensity={2.2} distance={4} color={GOLD} />
			<Stone />
			<RuneMotes />
			<Sparkles count={28} scale={[3.4, 3.2, 2]} size={1.6} speed={0.18} opacity={0.5} color={GOLD} />
		</Canvas>
	)
}
