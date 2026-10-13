import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { CarvedRune } from "@/components/CarvedRune"
import { art, letters, musings, poems, writingSections } from "@/content/writing"
import { pageMeta } from "@/lib/meta"
import s from "./writing.module.css"

export const metadata: Metadata = pageMeta({
	title: "Writing",
	description: "Dear Lambda letters, poems, musings and art by Lars Crawford (w0nd3r).",
	path: "/writing",
})

const section = (id: string) => writingSections.find((w) => w.id === id)!

function Head({ id }: { id: string }) {
	const w = section(id)
	return (
		<header className={s.sectionHead}>
			<div>
				<h2>{w.title}</h2>
				<p>{w.blurb}</p>
			</div>
			<CarvedRune name={w.rune} className={s.sigil} />
		</header>
	)
}

export default function WritingIndex() {
	return (
		<div className={`container ${s.page}`}>
			<header className={s.indexHead}>
				<h1>Writing</h1>
				<p className={s.indexLede}>
					Letters to the artificial minds being born among us, poems, short musings and a little art, carried over
					from the original w0nd3r.rune.love.
				</p>
			</header>

			<section id="dear-lambda" className={s.block} aria-label="Dear Lambda">
				<Head id="dear-lambda" />
				<ul className={s.letterList}>
					{letters.map((l) => (
						<li key={l.slug}>
							<p className="meta">{l.year}</p>
							<Link href={`/writing/dear-lambda/${l.slug}`} className={s.letterTitle}>
								{l.title}
							</Link>
							<p className={s.letterBlurb}>{l.blurb}</p>
						</li>
					))}
				</ul>
			</section>

			<section id="poems" className={s.block} aria-label="Poems">
				<Head id="poems" />
				<ul className={s.titleList}>
					{poems.map((p) => (
						<li key={p.slug}>
							<Link href={`/writing/poems/${p.slug}`}>{p.title}</Link>
							<span className={s.firstLine}>{p.lines[0]}</span>
						</li>
					))}
				</ul>
			</section>

			<section id="musings" className={s.block} aria-label="Musings">
				<Head id="musings" />
				<ul className={s.titleList}>
					{musings.map((p) => (
						<li key={p.slug}>
							<Link href={`/writing/musings/${p.slug}`}>{p.title}</Link>
							<span className={s.firstLine}>
								{p.lines[0].length > 110 ? `${p.lines[0].slice(0, 110).trimEnd()}…` : p.lines[0]}
							</span>
						</li>
					))}
				</ul>
			</section>

			<section id="art" className={s.block} aria-label="Art">
				<Head id="art" />
				<div className={s.artStrip}>
					{art.slice(0, 4).map((a) => (
						<div key={a.src} className={`frame ${s.artThumb}`}>
							<Image src={a.src} alt={a.alt} fill sizes="(max-width: 600px) 25vw, 300px" unoptimized={a.src.endsWith(".gif")} />
						</div>
					))}
				</div>
				<p>
					<Link href="/writing/art">See all {art.length} pieces</Link>
				</p>
			</section>
		</div>
	)
}
