import { runePath, type RuneName } from "@/lib/runes"

/**
 * A section sigil incised into the slate (DESIGN.md "Incised vs ignited
 * runes"): a dark cut, its moonlit lower lip and a thin gold-700 inlay.
 * Decorative: the title carries the meaning.
 */
export function CarvedRune({ name, className }: { name: RuneName; className?: string }) {
	const d = runePath(name)
	return (
		<svg className={className} viewBox="0 0 10 10" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
			<path d={d} stroke="#a9bdd6" strokeOpacity="0.09" strokeWidth="6" vectorEffect="non-scaling-stroke" transform="translate(0 0.12)" />
			<path d={d} stroke="#0b0e12" strokeOpacity="0.85" strokeWidth="6" vectorEffect="non-scaling-stroke" />
			<path d={d} stroke="#8f6a2a" strokeWidth="2" vectorEffect="non-scaling-stroke" />
		</svg>
	)
}
