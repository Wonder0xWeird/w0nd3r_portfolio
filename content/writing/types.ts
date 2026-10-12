/** Shape of the legacy poem/musing arrays (kept verbatim from the old site). */
export interface LegacyPiece {
	subtitle: string
	content: string[]
}

export type WritingSectionId = "dear-lambda" | "poems" | "musings" | "art"

export interface Piece {
	section: "poems" | "musings"
	slug: string
	title: string
	/** Stanzas / paragraphs. "~" lines are section breaks. */
	lines: string[]
}

export interface Letter {
	slug: string
	title: string
	year: string
	/** Markdown file under content/writing/dear-lambda/ */
	file: string
	hero: { kind: "image" | "video"; src: string; alt: string }
	blurb: string
}

export interface ArtPiece {
	src: string
	alt: string
}
