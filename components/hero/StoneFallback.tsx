import { GROOVE, STAGE } from "@/lib/stone"
import { ANCHORS, FACETS, RUNE_STROKES, RUNE_UNIT, SILHOUETTE } from "./stone-profile"

const rx = (ANCHORS.runes.x / 100) * STAGE.w
const ry = (ANCHORS.runes.y / 100) * STAGE.h
const u = RUNE_UNIT

/** Dark mottles on the face (centre and radius as fractions of the stage, peak alpha). */
const MOTTLES = [
	{ cx: 0.36, cy: 0.3, r: 0.13, a: 0.14 },
	{ cx: 0.6, cy: 0.68, r: 0.17, a: 0.12 },
	{ cx: 0.38, cy: 0.79, r: 0.11, a: 0.12 },
	{ cx: 0.63, cy: 0.38, r: 0.09, a: 0.1 },
]

/**
 * The menhir as SVG: the server-rendered first paint of the hero and the
 * permanent fallback (reduced motion, Save-Data, no WebGL, touch devices that
 * never interact). Its silhouette, facets and rune positions are generated from
 * the 3D stone (stone-profile.ts), so the WebGL swap is invisible. Lit like the
 * scene: moonlight from the upper left, rune-fire from inside the carving, the
 * right flank in shadow. Neutral slate with the page's grain tile and a few
 * dark mottles (v2.2), and runes incised into it: a moonlit lower lip and a
 * shadowed channel up-left of each stroke.
 *
 * The rune strokes carry the load sequence (globals.css "the one orchestrated
 * moment"): they draw, then ignite. Without motion they render ignited.
 * The halo, ground shadow and motes live outside, in HeroStone, so they persist
 * through the swap.
 */
export function StoneFallback({ className, label = true }: { className?: string; label?: boolean }) {
	return (
		<svg
			className={className}
			viewBox={`0 0 ${STAGE.w} ${STAGE.h}`}
			role={label ? "img" : undefined}
			aria-label={label ? "A slate standing stone carved with glowing gold runes spelling LARS" : undefined}
			aria-hidden={label ? undefined : true}
			focusable="false"
		>
			<defs>
				{/* moonlit face: lighter top-left, falling into shadow bottom-right; neutral slate (v2.2) */}
				<linearGradient id="sf-face" x1="0.3" y1="0" x2="0.7" y2="1">
					<stop offset="0" stopColor="#7b7d80" />
					<stop offset="0.45" stopColor="#646669" />
					<stop offset="1" stopColor="#47494c" />
				</linearGradient>
				<radialGradient id="sf-fire" gradientUnits="userSpaceOnUse" cx={rx} cy={ry} r={STAGE.w * 0.36} gradientTransform={`translate(${rx} ${ry}) scale(0.62 1) translate(${-rx} ${-ry})`}>
					<stop offset="0" stopColor="#e4b65a" stopOpacity="0.42" />
					<stop offset="0.5" stopColor="#cf9c3f" stopOpacity="0.14" />
					<stop offset="1" stopColor="#cf9c3f" stopOpacity="0" />
				</radialGradient>
				<linearGradient id="sf-flank" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#33363a" />
					<stop offset="1" stopColor="#1d1f22" />
				</linearGradient>
				<linearGradient id="sf-crown" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#55585c" />
					<stop offset="1" stopColor="#3c3f43" />
				</linearGradient>
				<linearGradient id="sf-rim" x1="0" y1="0" x2="1" y2="0.2">
					<stop offset="0" stopColor="#a9bdd6" stopOpacity="0.55" />
					<stop offset="0.28" stopColor="#7f95b8" stopOpacity="0" />
				</linearGradient>
				{MOTTLES.map((m, i) => (
					<radialGradient key={i} id={`sf-mottle-${i}`} cx={m.cx} cy={m.cy} r={m.r}>
						<stop offset="0" stopColor="#141619" stopOpacity={m.a} />
						<stop offset="1" stopColor="#141619" stopOpacity="0" />
					</radialGradient>
				))}
				{/* the page's grain tile (already loaded for the page light), as the slate's micro-texture */}
				<pattern id="sf-grain" patternUnits="userSpaceOnUse" width="64" height="64">
					<image href="/textures/grain.png" width="64" height="64" />
				</pattern>
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

			<path d={SILHOUETTE} fill="url(#sf-face)" />
			<g clipPath="url(#sf-clip)">
				{MOTTLES.map((_, i) => (
					<rect key={i} x="0" y="0" width={STAGE.w} height={STAGE.h} fill={`url(#sf-mottle-${i})`} />
				))}
				<rect className="stone-firelight" x="0" y="0" width={STAGE.w} height={STAGE.h} fill="url(#sf-fire)" />
				{FACETS.right ? <path d={FACETS.right} fill="url(#sf-flank)" /> : null}
				{FACETS.left ? <path d={FACETS.left} fill="url(#sf-flank)" /> : null}
				{FACETS.top ? <path d={FACETS.top} fill="url(#sf-crown)" /> : null}
				{/* moonlight catching the left edge (half the stroke falls outside and is clipped) */}
				<path d={SILHOUETTE} fill="none" stroke="url(#sf-rim)" strokeWidth={3} />
				<rect x="0" y="0" width={STAGE.w} height={STAGE.h} fill="url(#sf-grain)" opacity="0.065" style={{ mixBlendMode: "overlay" }} />
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
	)
}
