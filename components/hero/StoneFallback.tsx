import { LARS, runePath, type RuneName } from "@/lib/runes"

const MOTES: { name: RuneName; x: number; y: number; s: number; o: number }[] = [
	{ name: "algiz", x: 52, y: 120, s: 2.2, o: 0.55 },
	{ name: "kenaz", x: 330, y: 92, s: 1.8, o: 0.45 },
	{ name: "ingwaz", x: 340, y: 300, s: 2.0, o: 0.5 },
	{ name: "tiwaz", x: 40, y: 330, s: 1.6, o: 0.4 },
	{ name: "othala", x: 300, y: 30, s: 1.4, o: 0.35 },
	{ name: "fehu", x: 86, y: 30, s: 1.4, o: 0.3 },
]

/**
 * Static rune stone. Server-rendered first paint for the hero, and the
 * permanent fallback for reduced motion or no WebGL.
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
				<linearGradient id="slate" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#5b6472" />
					<stop offset="0.55" stopColor="#3a414c" />
					<stop offset="1" stopColor="#23272f" />
				</linearGradient>
				<radialGradient id="halo" cx="0.5" cy="0.5" r="0.5">
					<stop offset="0" stopColor="#e9b949" stopOpacity="0.28" />
					<stop offset="1" stopColor="#e9b949" stopOpacity="0" />
				</radialGradient>
				<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
					<feGaussianBlur stdDeviation="3.2" result="b" />
					<feMerge>
						<feMergeNode in="b" />
						<feMergeNode in="b" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
			</defs>
			<ellipse cx="205" cy="250" rx="190" ry="210" fill="url(#halo)" />
			<ellipse cx="205" cy="448" rx="110" ry="12" fill="#000" opacity="0.35" />
			<path
				d="M138 446 L124 318 Q112 196 140 128 Q170 62 222 60 Q276 62 290 140 Q302 214 296 318 L284 446 Z"
				fill="url(#slate)"
				stroke="#6b7482"
				strokeOpacity="0.35"
			/>
			<path d="M140 128 Q170 62 222 60 Q190 80 172 140 Q156 220 160 446 L138 446 L124 318 Q112 196 140 128 Z" fill="#fff" opacity="0.05" />
			<g fill="none" stroke="#f3cf6a" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)">
				{LARS.map((r, i) => (
					<path key={r} d={runePath(r, 182, 120 + i * 76, 5)} strokeWidth={1.4 * 1.6} />
				))}
			</g>
			<g className="stone-motes" fill="none" stroke="#e9b949" strokeLinecap="round" strokeLinejoin="round">
				{MOTES.map((m, i) => (
					<path key={i} d={runePath(m.name, m.x, m.y, m.s)} strokeWidth={0.9} opacity={m.o} style={{ animationDelay: `${i * -1.3}s` }} />
				))}
			</g>
		</svg>
	)
}
