import { STAGE } from "@/lib/stone"
import { ANCHORS, FACETS, RUNE_STROKES, RUNE_UNIT, SILHOUETTE } from "./stone-profile"

const rx = (ANCHORS.runes.x / 100) * STAGE.w
const ry = (ANCHORS.runes.y / 100) * STAGE.h
const u = RUNE_UNIT

/**
 * The menhir as SVG: the server-rendered first paint of the hero and the
 * permanent fallback (reduced motion, Save-Data, no WebGL, touch devices that
 * never interact). Its silhouette, facets and rune positions are generated from
 * the 3D stone (stone-profile.ts), so the WebGL swap is invisible. Lit like the
 * scene: cool moonlight from the upper left, rune-fire from inside the carving,
 * the right flank in shadow.
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
				{/* moonlit face: cool and lighter top-left, falling into shadow bottom-right */}
				<linearGradient id="sf-face" x1="0.3" y1="0" x2="0.7" y2="1">
					<stop offset="0" stopColor="#6c7786" />
					<stop offset="0.45" stopColor="#566070" />
					<stop offset="1" stopColor="#3b434f" />
				</linearGradient>
				<radialGradient id="sf-fire" gradientUnits="userSpaceOnUse" cx={rx} cy={ry} r={STAGE.w * 0.36} gradientTransform={`translate(${rx} ${ry}) scale(0.62 1) translate(${-rx} ${-ry})`}>
					<stop offset="0" stopColor="#e4b65a" stopOpacity="0.3" />
					<stop offset="0.5" stopColor="#cf9c3f" stopOpacity="0.1" />
					<stop offset="1" stopColor="#cf9c3f" stopOpacity="0" />
				</radialGradient>
				<linearGradient id="sf-flank" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#36425a" />
					<stop offset="1" stopColor="#1e2735" />
				</linearGradient>
				<linearGradient id="sf-crown" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#8e9bb0" />
					<stop offset="1" stopColor="#68768a" />
				</linearGradient>
				<linearGradient id="sf-rim" x1="0" y1="0" x2="1" y2="0.2">
					<stop offset="0" stopColor="#a9bdd6" stopOpacity="0.55" />
					<stop offset="0.28" stopColor="#7f95b8" stopOpacity="0" />
				</linearGradient>
				<radialGradient id="sf-mottle" cx="0.3" cy="0.62" r="0.5">
					<stop offset="0" stopColor="#0b0e12" stopOpacity="0.16" />
					<stop offset="1" stopColor="#0b0e12" stopOpacity="0" />
				</radialGradient>
				<filter id="sf-glow" x="-60%" y="-30%" width="220%" height="160%">
					<feGaussianBlur stdDeviation={0.42 * u} result="b" />
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
				<rect x="0" y="0" width={STAGE.w} height={STAGE.h} fill="url(#sf-mottle)" />
				<rect className="stone-firelight" x="0" y="0" width={STAGE.w} height={STAGE.h} fill="url(#sf-fire)" />
				{FACETS.right ? <path d={FACETS.right} fill="url(#sf-flank)" /> : null}
				{FACETS.left ? <path d={FACETS.left} fill="url(#sf-flank)" /> : null}
				{FACETS.top ? <path d={FACETS.top} fill="url(#sf-crown)" /> : null}
				{/* moonlight catching the left edge (half the stroke falls outside and is clipped) */}
				<path d={SILHOUETTE} fill="none" stroke="url(#sf-rim)" strokeWidth={3} />
				{/* carved channels under the strokes */}
				<g fill="none" stroke="#0b0e12" strokeOpacity="0.72" strokeWidth={1.05 * u} strokeLinecap="round" strokeLinejoin="round">
					{RUNE_STROKES.flat().map((d) => (
						<path key={d} d={d} transform="translate(0 0.6)" />
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
			<g className="stone-bloom" opacity="0.8" fill="none" stroke="#e4b65a" strokeWidth={1.4 * u} strokeLinecap="round" strokeLinejoin="round" filter="url(#sf-bloom)">
				{RUNE_STROKES.flat().map((d) => (
					<path key={d} d={d} />
				))}
			</g>
			<g fill="none" stroke="#f7d98c" strokeWidth={0.56 * u} strokeLinecap="round" strokeLinejoin="round" filter="url(#sf-glow)">
				{RUNE_STROKES.map((strokes, i) => (
					<g key={i} className="stone-rune" style={{ "--i": i } as React.CSSProperties}>
						{strokes.map((d) => (
							<path key={d} d={d} pathLength={1} />
						))}
					</g>
				))}
			</g>
			<g fill="none" stroke="#fff4d6" strokeWidth={0.2 * u} strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
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
