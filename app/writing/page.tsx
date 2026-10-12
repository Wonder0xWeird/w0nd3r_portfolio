import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Rune } from "@/components/Rune"
import { art, letters, musings, poems, writingSections } from "@/content/writing"
import s from "./writing.module.css"

export const metadata: Metadata = {
	title: "Writing",
	description: "Dear Lambda letters, poems, musings and art by Lars Crawford (w0nd3r).",
}

const section = (id: string) => writingSections.find((w) => w.id === id)!

function Head({ id }: { id: string }) {
	const w = section(id)
	return (
		<header className={s.sectionHead}>
			<Rune name={w.rune} size={22} strokeWidth={0.9} className="gold" />
			<div>
				<h2>{w.title}</h2>
				<p className="muted">{w.blurb}</p>
			</div>
		</header>
	)
}

export default function WritingIndex() {
	return (
		<div className={`container ${s.page}`}>
			<header className={s.indexHead}>
				<p className={s.eyebrow}>w0nd3r · writing</p>
				<h1>Writing</h1>
				<p className={s.indexLede}>
					Letters to the artificial minds being born among us, poems, short musings and a little art, carried over
					from the original w0nd3r.rune.love.
				</p>
			</header>

			<section id="dear-lambda" className={s.block} aria-label="Dear Lambda">
				<Head id="dear-lambda" />
				<div className={s.letterCards}>
					{letters.map((l) => (
						<Link key={l.slug} href={`/writing/dear-lambda/${l.slug}`} className={s.letterCard}>
							<span className={s.eyebrow}>{l.year}</span>
							<span className={s.letterCardTitle}>{l.title}</span>
							<span className="muted">{l.blurb}</span>
						</Link>
					))}
				</div>
			</section>

			<section id="poems" className={s.block} aria-label="Poems">
				<Head id="poems" />
				<ul className={s.titleList}>
					{poems.map((p) => (
						<li key={p.slug}>
							<Link href={`/writing/poems/${p.slug}`}>{p.title}</Link>
							<span className="muted">{p.lines[0]}</span>
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
							<span className="muted">{p.lines[0].length > 110 ? `${p.lines[0].slice(0, 110).trimEnd()}…` : p.lines[0]}</span>
						</li>
					))}
				</ul>
			</section>

			<section id="art" className={s.block} aria-label="Art">
				<Head id="art" />
				<div className={s.artStrip}>
					{art.slice(0, 4).map((a) => (
						<div key={a.src} className={s.artThumb}>
							<Image src={a.src} alt={a.alt} fill sizes="160px" unoptimized={a.src.endsWith(".gif")} />
						</div>
					))}
				</div>
				<p>
					<Link href="/writing/art">See all {art.length} pieces →</Link>
				</p>
			</section>
		</div>
	)
}
