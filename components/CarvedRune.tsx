import { RUNES, runePath, type RuneName } from "@/lib/runes"

/** The rune's horizontal extent in its 10-unit box, padded for the 6 px cut at rail sizes (v2.6). */
function fitBox(name: RuneName): string {
	const xs = RUNES[name].flatMap((stroke) => stroke.map(([x]) => x))
	const min = Math.min(...xs) - 0.6
	const max = Math.max(...xs) + 0.6
	return `${min} 0 ${+(max - min).toFixed(2)} 10`
}

/**
 * A section sigil incised into the slate (DESIGN.md "Incised vs ignited
 * runes"): a dark cut, its moonlit lower lip and a thin gold-700 inlay.
 * The inlay carries a class so the page can ignite it (home.module.css
 * .sigil). Decorative: the title carries the meaning.
 * `fit` crops the box to the rune's own width, so a left-aligned rune and
 * its caption share one left edge (the sigil rail, v2.6).
 */
export function CarvedRune({ name, className, fit }: { name: RuneName; className?: string; fit?: boolean }) {
	const d = runePath(name)
	return (
		<svg className={className} viewBox={fit ? fitBox(name) : "0 0 10 10"} fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
			<path d={d} stroke="#a9bdd6" strokeOpacity="0.09" strokeWidth="6" vectorEffect="non-scaling-stroke" transform="translate(0 0.12)" />
			<path d={d} stroke="#0b0e12" strokeOpacity="0.85" strokeWidth="6" vectorEffect="non-scaling-stroke" />
			<path className="sigil__inlay" d={d} stroke="#8f6a2a" strokeWidth="2" vectorEffect="non-scaling-stroke" />
		</svg>
	)
}
