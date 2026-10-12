#!/usr/bin/env node
/**
 * Draws the SVG twin of the 3D hero menhir from the same geometry and camera.
 *
 *   node scripts/stone-profile.mjs [previewDir]
 *
 * Reads lib/stone.ts (shared with components/hero/RuneStoneScene.tsx), builds
 * the deformed mesh with three.js, turns it to START_YAW, projects it through
 * the scene camera onto the 400 x 480 stage and z-buffers it. Writes
 * components/hero/stone-profile.ts with:
 *   - the silhouette and the visible side/top facets (row-scanned, simplified);
 *   - the LARS rune strokes, projected onto the curved front face, one path per
 *     stroke (the load sequence draws them with stroke-dashoffset);
 *   - anchor points (rune centre, base) for the persistent light layer.
 * So the first-paint SVG and the WebGL stone share one silhouette and one set
 * of rune positions, and the swap is invisible. Re-run after editing lib/stone.ts.
 * With a previewDir it also writes preview.svg there.
 */
import * as THREE from "three"
import { writeFile, mkdir } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { STONE, CAMERA, STAGE, START_YAW, deform, runeSlot, facePoint } from "../lib/stone.ts"
import { RUNES, LARS } from "../lib/runes.ts"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const S = 4 // raster supersampling
const W = STAGE.w * S
const H = STAGE.h * S

// ---------- scene ----------
const geo = new THREE.BoxGeometry(STONE.w, STONE.h, STONE.d, ...STONE.segs)
const pos = geo.attributes.position
for (let i = 0; i < pos.count; i++) {
	const [x, y, z] = deform(pos.getX(i), pos.getY(i), pos.getZ(i))
	pos.setXYZ(i, x, y, z)
}
const yaw = new THREE.Matrix4().makeRotationY(START_YAW)
const camera = new THREE.PerspectiveCamera(CAMERA.fov, STAGE.w / STAGE.h, CAMERA.near, CAMERA.far)
camera.position.set(...CAMERA.position)
camera.lookAt(0, 0, 0)
camera.updateMatrixWorld()
camera.updateProjectionMatrix()

const v = new THREE.Vector3()
/** World point (before yaw) -> [x, y, depth] on the stage. */
function project(x, y, z) {
	v.set(x, y, z).applyMatrix4(yaw)
	const viewZ = v.clone().applyMatrix4(camera.matrixWorldInverse).z
	v.project(camera)
	return [((v.x + 1) / 2) * STAGE.w, ((1 - v.y) / 2) * STAGE.h, -viewZ]
}

// ---------- z-buffered raster with face ids ----------
// BoxGeometry groups: 0 +x, 1 -x, 2 +y, 3 -y, 4 +z (front, LARS), 5 -z
const ids = new Int8Array(W * H).fill(-1)
const depth = new Float32Array(W * H).fill(Infinity)
const P = []
for (let i = 0; i < pos.count; i++) P.push(project(pos.getX(i), pos.getY(i), pos.getZ(i)))
const index = geo.index.array
for (const g of geo.groups) {
	for (let k = g.start; k < g.start + g.count; k += 3) {
		const a = P[index[k]], b = P[index[k + 1]], c = P[index[k + 2]]
		const ax = a[0] * S, ay = a[1] * S, bx = b[0] * S, by = b[1] * S, cx = c[0] * S, cy = c[1] * S
		const area = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax)
		if (Math.abs(area) < 1e-9) continue
		const x0 = Math.max(0, Math.floor(Math.min(ax, bx, cx))), x1 = Math.min(W - 1, Math.ceil(Math.max(ax, bx, cx)))
		const y0 = Math.max(0, Math.floor(Math.min(ay, by, cy))), y1 = Math.min(H - 1, Math.ceil(Math.max(ay, by, cy)))
		for (let py = y0; py <= y1; py++) {
			for (let px = x0; px <= x1; px++) {
				const sx = px + 0.5, sy = py + 0.5
				const w0 = ((bx - sx) * (cy - sy) - (by - sy) * (cx - sx)) / area
				const w1 = ((cx - sx) * (ay - sy) - (cy - sy) * (ax - sx)) / area
				const w2 = 1 - w0 - w1
				if (w0 < 0 || w1 < 0 || w2 < 0) continue
				const z = w0 * a[2] + w1 * b[2] + w2 * c[2]
				const o = py * W + px
				if (z < depth[o]) {
					depth[o] = z
					ids[o] = g.materialIndex
				}
			}
		}
	}
}

// ---------- outlines ----------
function rowOutline(test) {
	const left = []
	const right = []
	for (let y = 0; y < H; y++) {
		let lo = -1, hi = -1
		for (let x = 0; x < W; x++) {
			if (test(ids[y * W + x])) {
				if (lo < 0) lo = x
				hi = x
			}
		}
		if (lo >= 0) {
			left.push([lo / S, (y + 0.5) / S])
			right.push([(hi + 1) / S, (y + 0.5) / S])
		}
	}
	if (!left.length) return null
	// close over the top and bottom rows
	const top = left[0][1] - 0.5 / S
	const bottom = left[left.length - 1][1] + 0.5 / S
	const topRight = right[0][0]
	const bottomRight = right[right.length - 1][0]
	const pts = [[left[0][0], top], ...left, [left[left.length - 1][0], bottom], [bottomRight, bottom], ...[...right].reverse(), [topRight, top]]
	return simplify(pts, 0.35)
}

function simplify(pts, eps) {
	if (pts.length < 3) return pts
	const [a, b] = [pts[0], pts[pts.length - 1]]
	let max = 0, idx = 0
	for (let i = 1; i < pts.length - 1; i++) {
		const d = segDist(pts[i], a, b)
		if (d > max) [max, idx] = [d, i]
	}
	if (max <= eps) return [a, b]
	return [...simplify(pts.slice(0, idx + 1), eps).slice(0, -1), ...simplify(pts.slice(idx), eps)]
}
function segDist([px, py], [ax, ay], [bx, by]) {
	const dx = bx - ax, dy = by - ay
	const l2 = dx * dx + dy * dy
	const t = l2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2)) : 0
	return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}
const f = (n) => +n.toFixed(1)
const toPath = (pts) => (pts ? "M" + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join("L") + "Z" : "")

const counts = {}
for (const id of ids) if (id >= 0) counts[id] = (counts[id] || 0) + 1
const total = Object.values(counts).reduce((a, b) => a + b, 0)
const silhouette = rowOutline((id) => id >= 0)
const facets = {}
for (const [id, name] of [[0, "right"], [1, "left"], [2, "top"]]) {
	if ((counts[id] || 0) / total > 0.004) facets[name] = toPath(rowOutline((x) => x === id))
}

// ---------- runes on the curved front face ----------
const runeStrokes = LARS.map((name, i) => {
	const slot = runeSlot(i, LARS.length)
	const k = slot.size / 10
	return RUNES[name].map((stroke) => {
		const out = []
		for (let s = 0; s < stroke.length - 1; s++) {
			const [x0, y0] = stroke[s], [x1, y1] = stroke[s + 1]
			const steps = 8
			for (let t = s ? 1 : 0; t <= steps; t++) {
				const px = slot.x + (x0 + ((x1 - x0) * t) / steps) * k
				const py = slot.y + (y0 + ((y1 - y0) * t) / steps) * k
				const [X, Y, Z] = deform(...facePoint(px, py))
				const [sx, sy] = project(X, Y, Z)
				out.push([sx, sy])
			}
		}
		return "M" + simplify(out, 0.08).map(([x, y]) => `${f(x)} ${f(y)}`).join("L")
	})
})
// rune scale on the stage (for stroke widths): projected height of one rune box
const r0 = runeSlot(0), r3 = runeSlot(LARS.length - 1)
const pa = project(...deform(...facePoint(r0.x + r0.size / 2, r0.y)))
const pb = project(...deform(...facePoint(r0.x + r0.size / 2, r0.y + r0.size)))
const runeUnit = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]) / 10
const runeTop = project(...deform(...facePoint(128, r0.y)))
const runeBottom = project(...deform(...facePoint(128, r3.y + r3.size)))

// ---------- anchors ----------
let minX = W, maxX = 0, minY = H, maxY = 0
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (ids[y * W + x] >= 0) {
	if (x < minX) minX = x
	if (x > maxX) maxX = x
	if (y < minY) minY = y
	if (y > maxY) maxY = y
}
// footprint: the stone's width a little above its lowest point (the base edge is convex in perspective)
let baseL = W, baseR = 0
const baseRow = Math.round(maxY - 0.06 * H)
for (let x = 0; x < W; x++) if (ids[baseRow * W + x] >= 0) {
	baseL = Math.min(baseL, x)
	baseR = Math.max(baseR, x)
}
const pct = (n, d) => +((n / d) * 100).toFixed(2)
const anchors = {
	bbox: { x: pct(minX, W), y: pct(minY, H), w: pct(maxX - minX, W), h: pct(maxY - minY, H) },
	runes: { x: pct(((runeTop[0] + runeBottom[0]) / 2) * S, W), y: pct(((runeTop[1] + runeBottom[1]) / 2) * S, H) },
	base: { x: pct((baseL + baseR) / 2, W), y: pct(maxY, H), w: pct(baseR - baseL, W) },
}

const out = `// GENERATED by scripts/stone-profile.mjs from lib/stone.ts. Do not edit by hand.
// The SVG twin of the 3D menhir at START_YAW (${START_YAW}) on the ${STAGE.w} x ${STAGE.h} stage.

/** Outline of the whole stone. */
export const SILHOUETTE = ${JSON.stringify(toPath(silhouette))}

/** Visible side facets (painted over the front face). */
export const FACETS: { right?: string; left?: string; top?: string } = ${JSON.stringify(facets, null, "\t")}

/** LARS, one path per stroke, projected onto the curved front face. */
export const RUNE_STROKES: string[][] = ${JSON.stringify(runeStrokes, null, "\t")}

/** Stage units per rune-box unit (rune strokes are drawn in a 10-unit box). */
export const RUNE_UNIT = ${runeUnit.toFixed(3)}

/** Anchors in % of the stage: silhouette box, centre of the rune column, base of the stone. */
export const ANCHORS = ${JSON.stringify(anchors, null, "\t")}
`
await writeFile(path.join(root, "components/hero/stone-profile.ts"), out)
console.log("silhouette points", silhouette.length, "facets", Object.keys(facets), "area %", Object.fromEntries(Object.entries(counts).map(([k, n]) => [k, +((n / total) * 100).toFixed(1)])))
console.log("anchors", JSON.stringify(anchors), "runeUnit", runeUnit.toFixed(3))

const previewDir = process.argv[2]
if (previewDir) {
	await mkdir(previewDir, { recursive: true })
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${STAGE.w} ${STAGE.h}" width="${STAGE.w * 2}" height="${STAGE.h * 2}" style="background:#10141a">
<path d="${toPath(silhouette)}" fill="#5d6876"/>
${Object.entries(facets).map(([k, d]) => `<path d="${d}" fill="${k === "top" ? "#8a95a6" : "#3a4350"}"/>`).join("\n")}
<g fill="none" stroke="#f7d98c" stroke-width="${(0.55 * runeUnit).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round">${runeStrokes.flat().map((d) => `<path d="${d}"/>`).join("")}</g>
<rect x="${(anchors.bbox.x / 100) * STAGE.w}" y="${(anchors.bbox.y / 100) * STAGE.h}" width="${(anchors.bbox.w / 100) * STAGE.w}" height="${(anchors.bbox.h / 100) * STAGE.h}" fill="none" stroke="#f0f" stroke-width=".5"/>
</svg>`
	await writeFile(path.join(previewDir, "preview.svg"), svg)
}
