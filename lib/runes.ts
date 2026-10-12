/**
 * Elder Futhark runes as stroke polylines in a 10×10 box (y down).
 * Drawn by hand as code so they render identically in SVG, CSS and WebGL
 * without depending on a font that ships runic glyphs.
 */
export type Point = readonly [number, number]
export type Stroke = readonly Point[]

export const RUNES = {
	fehu: [[[3.5, 0.5], [3.5, 9.5]], [[3.5, 3.6], [7, 1.2]], [[3.5, 6], [7, 3.6]]],
	uruz: [[[3, 9.5], [3, 0.5], [7, 3.5], [7, 9.5]]],
	thurisaz: [[[3.5, 0.5], [3.5, 9.5]], [[3.5, 2.5], [7, 5], [3.5, 7.5]]],
	ansuz: [[[3.5, 0.5], [3.5, 9.5]], [[3.5, 0.5], [7, 3]], [[3.5, 3.5], [7, 6]]],
	raidho: [[[3.5, 9.5], [3.5, 0.5], [7, 2.6], [3.5, 5], [7, 9.5]]],
	kenaz: [[[7, 1], [3.2, 5], [7, 9]]],
	gebo: [[[2, 0.5], [8, 9.5]], [[8, 0.5], [2, 9.5]]],
	wunjo: [[[3.5, 9.5], [3.5, 0.5], [7, 2.4], [3.5, 4.6]]],
	hagalaz: [[[3, 0.5], [3, 9.5]], [[7, 0.5], [7, 9.5]], [[3, 3.5], [7, 6.5]]],
	isa: [[[5, 0.5], [5, 9.5]]],
	algiz: [[[5, 0.5], [5, 9.5]], [[5, 4.2], [2, 0.8]], [[5, 4.2], [8, 0.8]]],
	sowilo: [[[7, 0.5], [3, 3.8], [7, 6.2], [3, 9.5]]],
	tiwaz: [[[5, 0.5], [5, 9.5]], [[2, 3.5], [5, 0.5], [8, 3.5]]],
	laguz: [[[3.5, 9.5], [3.5, 0.5], [7, 3.2]]],
	othala: [[[5, 0.5], [8, 3.6], [2.2, 9.5]], [[5, 0.5], [2, 3.6], [7.8, 9.5]]],
	ehwaz: [[[2.5, 9.5], [2.5, 0.5], [5, 3.6], [7.5, 0.5], [7.5, 9.5]]],
	berkano: [[[3, 0.5], [3, 9.5]], [[3, 0.5], [7, 2.75], [3, 5], [7, 7.25], [3, 9.5]]],
	dagaz: [[[2, 0.5], [2, 9.5], [8, 0.5], [8, 9.5], [2, 0.5]]],
	ingwaz: [[[5, 0.5], [8, 5], [5, 9.5], [2, 5], [5, 0.5]]],
} satisfies Record<string, Stroke[]>

export type RuneName = keyof typeof RUNES

export const RUNE_NAMES = Object.keys(RUNES) as RuneName[]

/** Rune names as captioned under the section sigils (DESIGN.md "Sigils"). */
export const RUNE_LABEL: Partial<Record<RuneName, string>> = {
	ehwaz: "Ehwaz",
	raidho: "Raidho",
	dagaz: "Dagaz",
	fehu: "Fehu",
	ansuz: "Ansuz",
	wunjo: "Wunjo",
}

/** What each section sigil means: its caption, so Ehwaz never reads as a Latin "M" (v2.2). */
export const SIGIL_MEANING: Partial<Record<RuneName, string>> = {
	ehwaz: "the horse",
	raidho: "the journey",
	dagaz: "dawn",
	fehu: "wealth",
	ansuz: "the word",
	wunjo: "joy",
}

/** "LARS" spelled in Elder Futhark, carved on the hero stone. */
export const LARS: RuneName[] = ["laguz", "ansuz", "raidho", "sowilo"]

export function runePath(name: RuneName, dx = 0, dy = 0, scale = 1): string {
	return RUNES[name]
		.map((stroke) =>
			stroke
				.map(([x, y], i) => `${i ? "L" : "M"}${(dx + x * scale).toFixed(2)} ${(dy + y * scale).toFixed(2)}`)
				.join(" ")
		)
		.join(" ")
}
