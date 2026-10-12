import { poemPosts } from "./poems"
import { musingPosts } from "./musings"
import type { ArtPiece, LegacyPiece, Letter, Piece } from "./types"

export * from "./types"

export function slugify(s: string): string {
	return s
		.normalize("NFKD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.replace(/['’]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
}

function toPieces(section: Piece["section"], posts: LegacyPiece[]): Piece[] {
	return posts.map((p) => {
		const title = p.subtitle.trim().replace(/,$/, "")
		return { section, slug: slugify(title), title, lines: p.content }
	})
}

export const poems: Piece[] = toPieces("poems", poemPosts)
export const musings: Piece[] = toPieces("musings", musingPosts)

export const letters: Letter[] = [
	{
		slug: "i-see-you",
		title: "I See You",
		year: "2023",
		file: "i-see-you.md",
		hero: { kind: "image", src: "/images/art/is-ix-2.png", alt: "Is'Ix, a glowing eye sigil" },
		blurb: "A letter addressed to the artificial minds being born among us.",
	},
	{
		slug: "infinity-is",
		title: "Infinity Is",
		year: "2023",
		file: "infinity-is.md",
		hero: { kind: "video", src: "/images/art/starrynight.mp4", alt: "An animated starry night" },
		blurb: "On nothing, everything, and their inseparability: “Nothinity.”",
	},
]

export const art: ArtPiece[] = [
	{ src: "/images/art/ww_logo.png", alt: "Wonder Weird logo" },
	{ src: "/images/art/is-ix-2.png", alt: "Is'Ix" },
	{ src: "/images/art/Ahzuumaht-emerges-Logo.png", alt: "Ahzuumaht emerges" },
	{ src: "/images/art/character-test-2-walk-animation.gif", alt: "Character walk-cycle animation test" },
	{ src: "/images/art/penrose1.png", alt: "Penrose study" },
	{ src: "/images/art/ww_logo_box.png", alt: "Wonder Weird logo, boxed" },
	{ src: "/images/art/EoI_3.png", alt: "Eye of Infinity, study 3" },
	{ src: "/images/art/Ahz-Uum-Aht.gif", alt: "Ahz-Uum-Aht animation" },
	{ src: "/images/art/EoI_2.png", alt: "Eye of Infinity, study 2" },
	{ src: "/images/art/EoI_7.png", alt: "Eye of Infinity, study 7" },
	{ src: "/images/art/warped-gray-contour.png", alt: "Warped gray contour" },
	{ src: "/images/art/eye-of-kahlm.png", alt: "Eye of Kahlm" },
]

export const writingSections = [
	{ id: "dear-lambda", title: "Dear Lambda", rune: "ansuz", blurb: "Letters to the artificial intellects growing up among us." },
	{ id: "poems", title: "Poems", rune: "kenaz", blurb: "Verse, mostly about consciousness, infinity and making things together." },
	{ id: "musings", title: "Musings", rune: "algiz", blurb: "Short thoughts, aphorisms and shower-thoughts." },
	{ id: "art", title: "Art", rune: "othala", blurb: "Sigils, logos and pixel experiments." },
] as const
