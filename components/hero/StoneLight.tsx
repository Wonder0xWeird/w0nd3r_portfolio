import { runePath, type RuneName } from "@/lib/runes"
import { ANCHORS } from "./stone-profile"

/** Anchor points of the generated stone as CSS custom properties on the stage (% of the stage). */
export const stoneVars = {
	"--runes-x": `${ANCHORS.runes.x}%`,
	"--runes-y": `${ANCHORS.runes.y}%`,
	"--base-x": `${ANCHORS.base.x}%`,
	"--base-y": `${ANCHORS.base.y}%`,
	"--base-w": `${ANCHORS.base.w}%`,
} as React.CSSProperties

/**
 * The stone's light, which stays put while the body swaps from SVG to WebGL:
 * the torch (rune-fire spilling onto the page around the hero), a close halo,
 * and the ground: a contact shadow with a little moonlit mist.
 */
export function StoneLight({ torch = false }: { torch?: boolean }) {
	return (
		<>
			{torch ? <div className="stone__torch" aria-hidden="true" /> : null}
			<div className="stone__halo" aria-hidden="true" />
			<div className="stone__ground" aria-hidden="true" />
		</>
	)
}

/**
 * A few runes drifting off the stone. Never Tiwaz, Kenaz or Gebo (they read as
 * ↑ < ✕) and never a lone Sowilo (DESIGN.md "Sigils"): Ingwaz (seed), Uruz
 * (strength), Berkano (growth).
 */
const MOTES: { name: RuneName; x: number; y: number; s: number; o: number }[] = [
	{ name: "ingwaz", x: 50, y: 150, s: 2.1, o: 0.42 },
	{ name: "uruz", x: 330, y: 112, s: 1.7, o: 0.34 },
	{ name: "berkano", x: 342, y: 300, s: 1.9, o: 0.3 },
]

export function StoneMotes() {
	return (
		<svg className="stone__motes" viewBox="0 0 400 480" aria-hidden="true" focusable="false">
			<g fill="none" stroke="#e4b65a" strokeLinecap="round" strokeLinejoin="round">
				{MOTES.map((m, i) => (
					<path key={m.name} d={runePath(m.name, m.x, m.y, m.s)} strokeWidth={0.9} opacity={m.o} style={{ animationDelay: `${i * -2.3}s` }} />
				))}
			</g>
		</svg>
	)
}
