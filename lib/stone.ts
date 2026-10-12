/**
 * The hero menhir, shared by the WebGL scene (components/hero/RuneStoneScene)
 * and the generator that draws its SVG twin (scripts/stone-profile.mjs ->
 * components/hero/stone-profile.ts). Change anything here, then re-run
 * `node scripts/stone-profile.mjs` so the first-paint SVG keeps matching the 3D
 * stone (silhouette, facets and rune positions) and the swap stays invisible.
 *
 * Plain TypeScript with no imports, so Node can run it directly (type stripping).
 */

/** Undeformed box: width, height, depth (world units) and segments. */
export const STONE = { w: 1.2, h: 2.3, d: 0.46, segs: [20, 36, 6] as const }

/** Camera of the 3D scene. R3F calls lookAt(0, 0, 0) on its default camera; the generator does the same. */
export const CAMERA = { position: [0, 0.12, 5.2] as const, fov: 34, near: 0.1, far: 50 }

/** The stage (SVG viewBox and canvas) is 5:6. */
export const STAGE = { w: 400, h: 480 }

/** Yaw at first paint and at the handoff; the 3D stone only starts to sway after the crossfade. */
export const START_YAW = -0.3

/** Where the LARS runes sit on the front face texture (canvas px; the texture is 256 x 512). */
export const RUNE_FACE = { w: 256, h: 512, size: 70, gap: 22, offsetY: 18 }

function smooth(a: number, b: number, t: number): number {
	const x = Math.min(1, Math.max(0, (t - a) / (b - a)))
	return x * x * (3 - 2 * x)
}

function noise(x: number, y: number, z: number): number {
	return (
		Math.sin(x * 2.1 + Math.sin(y * 1.7)) * Math.cos(z * 2.9 + y * 0.8) * 0.5 +
		Math.sin(x * 5.3 + z * 3.1 + y * 4.7) * 0.22 +
		Math.sin(y * 11.0 + x * 7.0) * 0.07
	)
}

/**
 * Box point -> menhir point. A tapering slab with an asymmetric crown: the peak
 * sits left of centre, a short rounded left shoulder and a long, nearly
 * straight chipped slope down to the right, a slight lean, and a rough,
 * position-seeded surface. Not a rounded tombstone.
 */
export function deform(x: number, y: number, z: number): [number, number, number] {
	const { w, h: H } = STONE
	const h = (y + H / 2) / H // 0 bottom -> 1 top
	const nx = x / (w / 2) // -1 .. 1
	const taper = 1 - 0.15 * h
	const s = smooth(0.55, 1, h)
	const p = -0.32 // crown peak, left of centre
	const t = nx < p ? (p - nx) / (1 + p) : (nx - p) / (1 - p)
	const crown = nx < p ? 0.24 * t * t : 0.66 * Math.pow(t, 1.35)
	let X = x * taper * (1 - 0.05 * s)
	let Y = y - crown * s
	let Z = z * (1 + 0.32 * (1 - nx * nx)) * (1 - 0.18 * s)
	X -= 0.07 * h * h // lean toward the name
	const len = Math.hypot(X, Y * 0.25, Z) || 1
	const n = noise(X * 1.6, Y * 1.6, Z * 1.6) * 0.05
	X += (X / len) * n
	Y += ((Y * 0.25) / len) * n
	Z += (Z / len) * n
	return [X, Y, Z]
}

/** Top-left corner (canvas px) and size of rune i on the front face texture. */
export function runeSlot(i: number, count = 4): { x: number; y: number; size: number } {
	const { w, h, size, gap, offsetY } = RUNE_FACE
	const total = count * size + (count - 1) * gap
	return { x: (w - size) / 2, y: (h - total) / 2 + offsetY + i * (size + gap), size }
}

/** Front-face texture px -> undeformed box point on the +z face (CanvasTexture flipY: v = 1 at the top). */
export function facePoint(px: number, py: number): [number, number, number] {
	const { w, h, d } = STONE
	const u = px / RUNE_FACE.w
	const v = 1 - py / RUNE_FACE.h
	return [(u - 0.5) * w, (v - 0.5) * h, d / 2]
}
