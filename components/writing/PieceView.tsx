import Link from "next/link"
import type { Piece } from "@/content/writing"
import s from "@/app/writing/writing.module.css"

const LABEL: Record<Piece["section"], string> = { poems: "Poems", musings: "Musings" }

/** Renders a poem (line by line) or a musing (paragraphs), with prev/next. */
export function PieceView({ piece, all }: { piece: Piece; all: Piece[] }) {
	const i = all.findIndex((p) => p.slug === piece.slug)
	const prev = i > 0 ? all[i - 1] : null
	const next = i < all.length - 1 ? all[i + 1] : null
	const isPoem = piece.section === "poems"

	// Poems: each entry is a line, "~" is a stanza break.
	// Musings: each entry is a paragraph (some contain blank-line breaks).
	const blocks: string[][] = []
	if (isPoem) {
		let cur: string[] = []
		for (const line of piece.lines) {
			if (line.trim() === "~") {
				blocks.push(cur)
				cur = []
			} else cur.push(line)
		}
		blocks.push(cur)
	}
	const paragraphs = isPoem ? [] : piece.lines.flatMap((l) => l.split(/\n\s*\n/)).map((p) => p.trim()).filter(Boolean)
	const short = !isPoem && paragraphs.length === 1 && paragraphs[0].length < 260

	return (
		<article className={`container ${s.page}`}>
			<nav className={s.crumbs} aria-label="Breadcrumb">
				<Link href="/writing">Writing</Link> <span aria-hidden="true">/</span>{" "}
				<Link href={`/writing#${piece.section}`}>{LABEL[piece.section]}</Link>
			</nav>
			<header className={s.pieceHead}>
				<h1>{piece.title}</h1>
			</header>
			{isPoem ? (
				<div className={s.poem}>
					{blocks.map((stanza, k) => (
						<div key={k}>
							{k > 0 ? (
								<p className={s.stanzaBreak} aria-hidden="true">
									~
								</p>
							) : null}
							<p className={s.stanza}>
								{stanza.map((line, j) => (
									<span key={j}>
										{line}
										<br />
									</span>
								))}
							</p>
						</div>
					))}
				</div>
			) : (
				<div className={short ? s.aphorism : s.musing}>
					{paragraphs.map((p, k) => (
						<p key={k}>{p}</p>
					))}
				</div>
			)}
			<nav className={s.pager} aria-label={`More ${LABEL[piece.section].toLowerCase()}`}>
				{prev ? (
					<Link href={`/writing/${piece.section}/${prev.slug}`} rel="prev">
						<span className={s.pagerLabel}>Previous</span>
						<span className={s.pagerTitle}>{prev.title}</span>
					</Link>
				) : (
					<span />
				)}
				{next ? (
					<Link href={`/writing/${piece.section}/${next.slug}`} rel="next">
						<span className={s.pagerLabel}>Next</span>
						<span className={s.pagerTitle}>{next.title}</span>
					</Link>
				) : (
					<span />
				)}
			</nav>
		</article>
	)
}
