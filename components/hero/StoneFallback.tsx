import { LARS, runePath, type RuneName } from "@/lib/runes"

const MOTES: { name: RuneName; x: number; y: number; s: number; o: number }[] = [
	{ name: "algiz", x: 52, y: 120, s: 2.2, o: 0.5 },
	{ name: "kenaz", x: 330, y: 92, s: 1.8, o: 0.42 },
	{ name: "ingwaz", x: 340, y: 300, s: 2.0, o: 0.45 },
	{ name: "tiwaz", x: 40, y: 330, s: 1.6, o: 0.36 },
	{ name: "othala", x: 300, y: 30, s: 1.4, o: 0.3 },
	{ name: "fehu", x: 86, y: 30, s: 1.4, o: 0.26 },
]

const STONE = "M138 446 L124 318 Q112 196 140 128 Q170 62 222 60 Q276 62 290 140 Q302 214 296 318 L284 446 Z"

/**
 * Static rune stone: the server-rendered first paint of the hero, and the
 * permanent fallback for reduced motion, Save-Data, no WebGL and touch devices
 * that never interact. Lit like the 3D scene: warm rune-fire from the carving,
 * a cool moonlight rim on the left, a contact shadow on the ground.
 */
export function StoneFallback({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 400 480"
			role="img"
			aria-label="A slate standing stone carved with glowing gold runes spelling LARS"
		>
			<defs>
				<linearGradient id="sf-slate" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#5d6876" />
					<stop offset="0.5" stopColor="#3a4350" />
					<stop offset="1" stopColor="#1d232c" />
				</linearGradient>
				<radialGradient id="sf-firelight" cx="0.5" cy="0.47" r="0.36">
					<stop offset="0" stopColor="#e4b65a" stopOpacity="0.34" />
					<stop offset="0.55" stopColor="#cf9c3f" stopOpacity="0.1" />
					<stop offset="1" stopColor="#cf9c3f" stopOpacity="0" />
				</radialGradient>
				<radialGradient id="sf-halo" cx="0.5" cy="0.5" r="0.5">
					<stop offset="0" stopColor="#e4b65a" stopOpacity="0.22" />
					<stop offset="1" stopColor="#e4b65a" stopOpacity="0" />
				</radialGradient>
				<linearGradient id="sf-rim" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#a9bdd6" stopOpacity="0.75" />
					<stop offset="0.6" stopColor="#7f95b8" stopOpacity="0.3" />
					<stop offset="1" stopColor="#7f95b8" stopOpacity="0" />
				</linearGradient>
				<filter id="sf-glow" x="-50%" y="-50%" width="200%" height="200%">
					<feGaussianBlur stdDeviation="3.4" result="b" />
					<feMerge>
						<feMergeNode in="b" />
						<feMergeNode in="b" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
				<clipPath id="sf-clip">
					<path d={STONE} />
				</clipPath>
			</defs>
			<ellipse cx="205" cy="250" rx="190" ry="210" fill="url(#sf-halo)" />
			<ellipse cx="208" cy="450" rx="128" ry="13" fill="#0b0e12" opacity="0.8" />
			<ellipse cx="208" cy="447" rx="84" ry="6" fill="#0b0e12" opacity="0.9" />
			<path d={STONE} fill="url(#sf-slate)" />
			<g clipPath="url(#sf-clip)">
				{/* rune-fire lighting the face from inside the carving */}
				<rect x="100" y="40" width="220" height="420" fill="url(#sf-firelight)" />
				{/* top-left facet catches the moon */}
				<path d="M140 128 Q170 62 222 60 Q190 80 172 140 Q156 220 160 446 L138 446 L124 318 Q112 196 140 128 Z" fill="#a9bdd6" opacity="0.07" />
				{/* carved channels: dark incision under each glowing stroke */}
				<g fill="none" stroke="#0b0e12" strokeOpacity="0.7" strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round">
					{LARS.map((r, i) => (
						<path key={r} d={runePath(r, 182, 121 + i * 76, 5)} />
					))}
				</g>
			</g>
			{/* moonlight rim on the left edge */}
			<path d="M138 446 L124 318 Q112 196 140 128 Q170 62 222 60" fill="none" stroke="url(#sf-rim)" strokeWidth="1.6" />
			<path d={STONE} fill="none" stroke="#5d6876" strokeOpacity="0.35" />
			<g fill="none" stroke="#f7d98c" strokeLinecap="round" strokeLinejoin="round" filter="url(#sf-glow)">
				{LARS.map((r, i) => (
					<path key={r} d={runePath(r, 182, 120 + i * 76, 5)} strokeWidth={2.3} />
				))}
			</g>
			<g fill="none" stroke="#fff4d6" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
				{LARS.map((r, i) => (
					<path key={r} d={runePath(r, 182, 120 + i * 76, 5)} strokeWidth={0.9} />
				))}
			</g>
			<g className="stone-motes" fill="none" stroke="#e4b65a" strokeLinecap="round" strokeLinejoin="round">
				{MOTES.map((m, i) => (
					<path key={i} d={runePath(m.name, m.x, m.y, m.s)} strokeWidth={0.9} opacity={m.o} style={{ animationDelay: `${i * -1.3}s` }} />
				))}
			</g>
		</svg>
	)
}
