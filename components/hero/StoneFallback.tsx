import { preload } from "react-dom"
import { GROOVE, STAGE } from "@/lib/stone"
import { ANCHORS, FACETS, RUNE_STROKES, RUNE_UNIT, SILHOUETTE } from "./stone-profile"

const rx = (ANCHORS.runes.x / 100) * STAGE.w
const ry = (ANCHORS.runes.y / 100) * STAGE.h
const fy = ry + STAGE.h * 0.02
const u = RUNE_UNIT

/** The foot sinks into its ground shadow: the face darkens from FOOT.from to the base (stage fractions), as the 3D stone's vertex colours do. */
const FOOT = { from: 0.6, to: 0.9, alpha: 0.28 }

/**
 * The 3D stone baked (v2.5, scripts/bake-stone.mjs): its slate, light, flanks and crown at the handoff
 * pose, without runes or fire, at the stage's 740 px maximum (1x and 2x). From 861 px up it is the
 * twin's face (globals.css .stone__baked); phones never request it.
 */
export const BAKED = { x1: "/stone/face-740.avif", x2: "/stone/face-1480.avif", media: "(min-width: 861px)" }

/**
 * The menhir as SVG: the server-rendered first paint of the hero and the
 * permanent fallback (reduced motion, Save-Data, no WebGL, touch devices that
 * never interact). Its silhouette, facets and rune positions are generated from
 * the 3D stone (stone-profile.ts), so the WebGL swap is invisible. Lit like the
 * scene: moonlight from the upper left, rune-fire from inside the carving, the
 * right flank in shadow, and runes incised into it: a moonlit lower lip and a
 * shadowed channel up-left of each stroke.
 *
 * Three layers (v2.5): the drawn face (a smooth, night-lit blue-grey gradient);
 * from 861 px up, the 3D stone itself, baked (BAKED: the same slate, ripple,
 * bedded edges and moon as the WebGL stone, so the handoff no longer swaps one
 * pattern for another); then the light and the runes. Over the bake, the drawn
 * foot, shoulder, flanks and rim give way to the baked ones (.sf-drawn); below
 * 861 px the stone is a half-lit backdrop and keeps them, and the gradient face.
 *
 * The rune strokes carry the load sequence (globals.css "the one orchestrated
 * moment"): they draw, then ignite. Without motion they render ignited.
 * The halo, ground shadow and motes live outside, in HeroStone, so they persist
 * through the swap.
 */
export function StoneFallback({ className, label = true }: { className?: string; label?: boolean }) {
	// Desktop only, early and at the image's own priority: the baked face sits under the first paint's runes.
	preload(BAKED.x2, { as: "image", imageSrcSet: `${BAKED.x1} 1x, ${BAKED.x2} 2x`, media: BAKED.media, fetchPriority: "high" })
	const viewBox = `0 0 ${STAGE.w} ${STAGE.h}`
	return (
		<div
			className={`stone__twin${className ? ` ${className}` : ""}`}
			role={label ? "img" : undefined}
			aria-label={label ? "A slate standing stone carved with glowing gold runes spelling LARS" : undefined}
			aria-hidden={label ? undefined : true}
		>
			<svg viewBox={viewBox} aria-hidden="true" focusable="false">
				<defs>
					{/* moonlit face: lit from the upper left, falling into shadow bottom-right; night-lit blue-grey slate (v2.3) */}
					<linearGradient id="sf-face" x1="0.32" y1="0" x2="0.68" y2="1">
						<stop offset="0" stopColor="#6b7076" />
						<stop offset="0.45" stopColor="#53575d" />
						<stop offset="1" stopColor="#3d4147" />
					</linearGradient>
				</defs>
				<path d={SILHOUETTE} fill="url(#sf-face)" />
			</svg>
			<div className="stone__baked" aria-hidden="true" />
			<svg viewBox={viewBox} aria-hidden="true" focusable="false">
				<defs>
					{/* rune-fire on the slate, centred a little below the rune column's middle, like the 3D fire light */}
					<radialGradient id="sf-fire" gradientUnits="userSpaceOnUse" cx={rx} cy={fy} r={STAGE.w * 0.36} gradientTransform={`translate(${rx} ${fy}) scale(0.62 1) translate(${-rx} ${-fy})`}>
						<stop offset="0" stopColor="#e4b65a" stopOpacity="0.35" />
						<stop offset="0.5" stopColor="#cf9c3f" stopOpacity="0.14" />
						<stop offset="1" stopColor="#cf9c3f" stopOpacity="0" />
					</radialGradient>
					<linearGradient id="sf-foot" gradientUnits="userSpaceOnUse" x1="0" y1={STAGE.h * FOOT.from} x2="0" y2={STAGE.h * FOOT.to}>
						<stop offset="0" stopColor="#0b0e12" stopOpacity="0" />
						<stop offset="1" stopColor="#0b0e12" stopOpacity={FOOT.alpha} />
					</linearGradient>
					{/* the right shoulder turns away from the moon (the 3D face curves into the crown's slope) */}
					<radialGradient id="sf-shoulder" cx="0.66" cy="0.3" r="0.16">
						<stop offset="0" stopColor="#0b0e12" stopOpacity="0.22" />
						<stop offset="1" stopColor="#0b0e12" stopOpacity="0" />
					</radialGradient>
					<linearGradient id="sf-flank" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#30353a" />
						<stop offset="1" stopColor="#1b1e22" />
					</linearGradient>
					<linearGradient id="sf-crown" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0" stopColor="#4a4f55" />
						<stop offset="1" stopColor="#33373c" />
					</linearGradient>
					<linearGradient id="sf-rim" x1="0" y1="0" x2="1" y2="0.2">
						<stop offset="0" stopColor="#a9bdd6" stopOpacity="0.55" />
						<stop offset="0.28" stopColor="#7f95b8" stopOpacity="0" />
					</linearGradient>
					<filter id="sf-glow" x="-60%" y="-30%" width="220%" height="160%">
						<feGaussianBlur stdDeviation={GROOVE.glowBlur * u} result="b" />
						<feMerge>
							<feMergeNode in="b" />
							<feMergeNode in="b" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
					<filter id="sf-bloom" x="-100%" y="-40%" width="300%" height="180%">
						<feGaussianBlur stdDeviation={1.6 * u} />
					</filter>
					<clipPath id="sf-clip">
						<path d={SILHOUETTE} />
					</clipPath>
				</defs>

				<g clipPath="url(#sf-clip)">
					<g className="sf-drawn">
						<rect x="0" y="0" width={STAGE.w} height={STAGE.h} fill="url(#sf-foot)" />
						<rect x="0" y="0" width={STAGE.w} height={STAGE.h} fill="url(#sf-shoulder)" />
					</g>
					<rect className="stone-firelight" x="0" y="0" width={STAGE.w} height={STAGE.h} fill="url(#sf-fire)" />
					<g className="sf-drawn">
						{FACETS.right ? <path d={FACETS.right} fill="url(#sf-flank)" /> : null}
						{FACETS.left ? <path d={FACETS.left} fill="url(#sf-flank)" /> : null}
						{FACETS.top ? <path d={FACETS.top} fill="url(#sf-crown)" /> : null}
						{/* moonlight catching the left edge (half the stroke falls outside and is clipped) */}
						<path d={SILHOUETTE} fill="none" stroke="url(#sf-rim)" strokeWidth={3} />
					</g>
					{/* incised, lit from the upper left: the groove's lower lip catches the moonlight, its upper-left wall is in shadow */}
					<g fill="none" stroke="rgb(226 232 240)" strokeOpacity={GROOVE.lip} strokeWidth={GROOVE.lipW * u} strokeLinecap="round" strokeLinejoin="round">
						{RUNE_STROKES.flat().map((d) => (
							<path key={d} d={d} transform={`translate(${0.1 * u} ${0.14 * u})`} />
						))}
					</g>
					<g fill="none" stroke="#0b0e12" strokeOpacity={GROOVE.cut} strokeWidth={GROOVE.cutW * u} strokeLinecap="round" strokeLinejoin="round">
						{RUNE_STROKES.flat().map((d) => (
							<path key={d} d={d} transform={`translate(${-0.08 * u} ${-0.12 * u})`} />
						))}
					</g>
					{/* incised gold-700 inlay: the resting state the fire draws over */}
					<g fill="none" stroke="#8f6a2a" strokeWidth={0.5 * u} strokeLinecap="round" strokeLinejoin="round">
						{RUNE_STROKES.flat().map((d) => (
							<path key={d} d={d} />
						))}
					</g>
				</g>
				{/* rune-fire: bloom, glow and white-hot core */}
				<g className="stone-bloom" opacity={GROOVE.bloom} fill="none" stroke="#e4b65a" strokeWidth={1.4 * u} strokeLinecap="round" strokeLinejoin="round" filter="url(#sf-bloom)">
					{RUNE_STROKES.flat().map((d) => (
						<path key={d} d={d} />
					))}
				</g>
				<g fill="none" stroke="#f7d98c" strokeWidth={GROOVE.fireW * u} strokeLinecap="round" strokeLinejoin="round" filter="url(#sf-glow)">
					{RUNE_STROKES.map((strokes, i) => (
						<g key={i} className="stone-rune" style={{ "--i": i } as React.CSSProperties}>
							{strokes.map((d) => (
								<path key={d} d={d} pathLength={1} />
							))}
						</g>
					))}
				</g>
				<g fill="none" stroke="#fff4d6" strokeWidth={0.14 * u} strokeLinecap="round" strokeLinejoin="round" opacity="0.55">
					{RUNE_STROKES.map((strokes, i) => (
						<g key={i} className="stone-rune" style={{ "--i": i } as React.CSSProperties}>
							{strokes.map((d) => (
								<path key={d} d={d} pathLength={1} />
							))}
						</g>
					))}
				</g>
			</svg>
		</div>
	)
}
