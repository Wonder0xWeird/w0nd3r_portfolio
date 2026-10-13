import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { art } from "@/content/writing"
import { pageMeta } from "@/lib/meta"
import s from "../writing.module.css"

export const metadata: Metadata = pageMeta({
	title: "Art",
	description: "Sigils, logos and pixel experiments by w0nd3r.",
	path: "/writing/art",
})

export default function ArtPage() {
	return (
		<div className={`container ${s.page}`}>
			<nav className={s.crumbs} aria-label="Breadcrumb">
				<Link href="/writing">Writing</Link> <span aria-hidden="true">/</span> Art
			</nav>
			<header className={s.indexHead}>
				<h1>Art</h1>
				<p className={s.indexLede}>Sigils, logos and pixel experiments.</p>
			</header>
			<div className={s.artGrid}>
				{art.map((a) => (
					<figure key={a.src} className={`frame ${s.artItem}`}>
						<Image
							src={a.src}
							alt={a.alt}
							fill
							sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 360px"
							unoptimized={a.src.endsWith(".gif")}
						/>
					</figure>
				))}
			</div>
		</div>
	)
}
