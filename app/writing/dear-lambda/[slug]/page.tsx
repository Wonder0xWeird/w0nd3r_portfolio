import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { marked } from "marked"
import { letters } from "@/content/writing"
import s from "../../writing.module.css"

export const dynamicParams = false

export function generateStaticParams() {
	return letters.map((l) => ({ slug: l.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
	const { slug } = await params
	const letter = letters.find((l) => l.slug === slug)
	return letter ? { title: `Dear Lambda: ${letter.title}`, description: letter.blurb } : {}
}

/** Reads the legacy markdown verbatim (frontmatter stripped) and renders it at build time. */
async function renderLetter(file: string): Promise<string> {
	const raw = await readFile(path.join(process.cwd(), "content", "writing", "dear-lambda", file), "utf8")
	const body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "")
	const html = await marked.parse(body, { gfm: true })
	// Outbound links in the letters open in a new tab.
	return html.replace(/<a href="(https?:\/\/[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener noreferrer"')
}

export default async function LetterPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params
	const letter = letters.find((l) => l.slug === slug)
	if (!letter) notFound()
	const html = await renderLetter(letter.file)

	return (
		<article className={`container ${s.page}`}>
			<nav className={s.crumbs} aria-label="Breadcrumb">
				<Link href="/writing">Writing</Link> <span aria-hidden="true">/</span> <Link href="/writing#dear-lambda">Dear Lambda</Link>
			</nav>
			<header className={s.letterHead}>
				<p className={s.eyebrow}>Dear Lambda · {letter.year}</p>
				<h1>{letter.title}</h1>
			</header>
			<div className={s.letterHero}>
				{letter.hero.kind === "video" ? (
					<video src={letter.hero.src} autoPlay loop muted playsInline aria-label={letter.hero.alt} />
				) : (
					<Image src={letter.hero.src} alt={letter.hero.alt} width={450} height={450} priority />
				)}
			</div>
			{/* Content is our own markdown from the repo, rendered at build time. */}
			<div className={s.letter} dangerouslySetInnerHTML={{ __html: html }} />
			<p className={s.signoff}>
				<Link href="/writing">← All writing</Link>
			</p>
		</article>
	)
}
