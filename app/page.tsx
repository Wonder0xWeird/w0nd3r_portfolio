import { existsSync } from "node:fs"
import path from "node:path"
import Image from "next/image"
import Link from "next/link"
import { HeroStone } from "@/components/hero/HeroStone"
import { StoneFallback } from "@/components/hero/StoneFallback"
import { CopyEmail } from "@/components/CopyEmail"
import { External } from "@/components/External"
import { Rune } from "@/components/Rune"
import { CarvedRune } from "@/components/CarvedRune"
import { profile, play } from "@/content/profile"
import { experience } from "@/content/experience"
import { research, thesis, education } from "@/content/research"
import { publications, honors } from "@/content/publications"
import { projects, proofCards } from "@/content/projects"
import { letters, poems, musings, writingSections } from "@/content/writing"
import type { RuneName } from "@/lib/runes"
import s from "./home.module.css"

// The résumé CTA only renders once the final PDF is in public/ (the primary
// CTA must never 404). Until then, email is the primary action.
const hasResume = existsSync(path.join(process.cwd(), "public", "resume.pdf"))

/** Section title with its sigil rune incised beside it (rune map: DESIGN.md "Sigils"). */
function SectionHead({ id, rune, title, children }: { id: string; rune: RuneName; title: string; children?: React.ReactNode }) {
	return (
		<header className={s.sectionHead}>
			<CarvedRune name={rune} className={s.sigil} />
			<h2 id={`${id}-title`}>{title}</h2>
			{children}
		</header>
	)
}

/** Two quiet meta lines, never joined with "·". */
function Meta({ lines, className }: { lines: (string | undefined)[]; className?: string }) {
	return (
		<p className={`meta ${className ?? ""}`}>
			{lines.filter(Boolean).map((l) => (
				<span key={l}>{l}</span>
			))}
		</p>
	)
}

function Stack({ items, max }: { items: string[]; max?: number }) {
	return (
		<p className={s.stack}>
			<span className="visually-hidden">Stack: </span>
			{(max ? items.slice(0, max) : items).join(", ")}
		</p>
	)
}

export default function Home() {
	const { links } = profile
	const featured = projects.filter((p) => p.featured)
	const legacy = projects.filter((p) => !p.featured)
	const feature = proofCards.find((c) => c.feature)!
	const slims = proofCards.filter((c) => !c.feature)

	return (
		<>
			{/* ---------- hero: the name, one line of who/what-now, the next action; the stone ---------- */}
			<section className={s.hero} aria-labelledby="hero-title">
				<div className={`container ${s.heroGrid}`}>
					<h1 id="hero-title" className={s.name}>
						<span className={s.nameLine}>Lars</span> <span className={s.nameLine}>Crawford</span>
					</h1>
					<div className={s.heroArt}>
						<HeroStone fallback={<StoneFallback className="stone__svg" />} />
					</div>
					<div className={s.heroCopy}>
						<p className={s.lede}>{profile.lede}</p>
						<Meta lines={[...profile.place]} className={s.place} />
						<div className={s.ctaRow}>
							{hasResume ? (
								<a className="btn--primary" href={links.resume.href}>
									{links.resume.label}
								</a>
							) : (
								<a className="btn--primary" href={links.email.href}>
									Email me
								</a>
							)}
							<ul className={s.ctaLinks}>
								<li>
									<External className="textlink" href={links.linkedin.href}>
										LinkedIn
									</External>
								</li>
								<li>
									<External className="textlink" href={links.github.href}>
										GitHub
									</External>
								</li>
							</ul>
						</div>
						<CopyEmail email={profile.email} className={s.email} />
					</div>
				</div>
			</section>

			{/* ---------- proof ---------- */}
			<section id="work" className={`${s.section} ${s.sectionProof}`} aria-labelledby="work-title">
				<div className="container">
					<SectionHead id="work" rune="sowilo" title="What I do now, and what I did before">
						<p className={s.sectionLede}>{profile.aim}</p>
					</SectionHead>
					<div className={s.proofGrid}>
						<article className={`slab ${s.proofFeature}`}>
							<Meta lines={[feature.org, feature.context]} />
							<h3 className={s.featureTitle}>{feature.title}</h3>
							<p className={s.proofBody}>{feature.body}</p>
							{feature.figure ? (
								<p className={s.figure}>
									<span className={s.figureValue}>{feature.figure.value}</span>
									<span className={s.figureLabel}>{feature.figure.label}</span>
								</p>
							) : null}
							<ul className={s.proofPoints}>
								{feature.points.map((pt) => (
									<li key={pt}>{pt}</li>
								))}
							</ul>
							{feature.external ? (
								<External className={s.proofLink} href={feature.href}>
									{feature.linkLabel}
								</External>
							) : (
								<a className={s.proofLink} href={feature.href}>
									{feature.linkLabel}
								</a>
							)}
						</article>
						{slims.map((c) => (
							<article key={c.title} className={`slab ${s.proofSlim}`}>
								<Meta lines={[c.org, c.context]} />
								<h3 className={s.slimTitle}>{c.title}</h3>
								<p className={s.proofBody}>{c.body}</p>
								<ul className={s.proofPoints}>
									{c.points.map((pt) => (
										<li key={pt}>{pt}</li>
									))}
								</ul>
								<a className={s.proofLink} href={c.href}>
									{c.linkLabel}
								</a>
							</article>
						))}
					</div>
				</div>
			</section>

			{/* ---------- experience ---------- */}
			<section id="experience" className={s.section} aria-labelledby="experience-title">
				<div className="container">
					<SectionHead id="experience" rune="raidho" title="Shipping systems people rely on" />
					<ol className={s.timeline}>
						{experience.map((job) => (
							<li key={job.org} className={s.job}>
								<div className={s.jobHead}>
									<h3 className={s.org}>{job.href ? <External href={job.href} icon={false}>{job.org}</External> : job.org}</h3>
									<Meta lines={[job.location, job.dates]} />
								</div>
								<div className={s.jobBody}>
									{job.roles.map((r) => (
										<div key={r.title} className={s.role}>
											<p className={s.roleTitle}>{r.title}</p>
											<p className="meta">{r.dates}</p>
											{r.bullets.length ? (
												<ul className={s.bullets}>
													{r.bullets.map((b) => (
														<li key={b}>{b}</li>
													))}
												</ul>
											) : null}
										</div>
									))}
									{job.stack ? <Stack items={job.stack} /> : null}
								</div>
							</li>
						))}
					</ol>
				</div>
			</section>

			{/* ---------- research ---------- */}
			<section id="research" className={s.section} aria-labelledby="research-title">
				<div className="container">
					<SectionHead id="research" rune="dagaz" title="Neural engineering, from electrodes to immune cells" />
					<div className={s.researchGrid}>
						<div>
							<ol className={s.timeline}>
								{research.map((r) => (
									<li key={r.lab} className={s.job}>
										<div className={s.jobHead}>
											<h3 className={s.org}>{r.org}</h3>
											<Meta lines={[`${r.role}, ${r.lab}`, `${r.place}, ${r.dates}`]} />
										</div>
										<div className={s.jobBody}>
											<ul className={s.bullets}>
												{r.bullets.map((b) => (
													<li key={b}>{b}</li>
												))}
											</ul>
										</div>
									</li>
								))}
							</ol>
							<details className={`slab ${s.thesis}`}>
								<summary>About the dissertation: {thesis.title}</summary>
								<div className={s.thesisBody}>
									{thesis.paragraphs.map((p) => (
										<p key={p}>{p}</p>
									))}
								</div>
							</details>
						</div>
						<div className={s.scienceGrid}>
							{thesis.images.map((img) => (
								<figure key={img.src} className={`frame ${s.scienceFig}`}>
									<Image className="duotone" src={img.src} alt={img.alt} fill sizes="(max-width: 860px) 45vw, 260px" />
								</figure>
							))}
						</div>
					</div>

					<div className={s.pubGrid}>
						<div>
							<h3 className={s.subhead}>Publications and patents</h3>
							<ol className={s.pubs}>
								{publications.map((p) => (
									<li key={p.title}>
										<span className={s.pubYear}>{p.year}</span>
										<span>
											{p.citation}{" "}
											{p.href ? <External href={p.href}>“{p.title}.”</External> : <>“{p.title}.”</>} <em>{p.venue}</em>.{" "}
											<span className={s.pubKind}>{p.kind[0].toUpperCase() + p.kind.slice(1)}</span>
										</span>
									</li>
								))}
							</ol>
						</div>
						<div>
							<h3 className={s.subhead}>Education</h3>
							<ul className={s.plainList}>
								{education.map((e) => (
									<li key={e.degree}>
										<strong>{e.degree}</strong>
										<Meta lines={[`${e.school}, ${e.year}`, e.note]} />
									</li>
								))}
							</ul>
							<h3 className={s.subhead}>Honors</h3>
							<ul className={s.honors}>
								{honors.map((h) => (
									<li key={h}>{h}</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* ---------- projects ---------- */}
			<section id="projects" className={s.section} aria-labelledby="projects-title">
				<div className="container">
					<SectionHead id="projects" rune="fehu" title="Things I've built" />
					<div className={s.featuredGrid}>
						{featured.map((p) => (
							<article key={p.name} className={s.featured}>
								<p className="meta">{p.when}</p>
								<h3 className={s.featuredTitle}>{p.name}</h3>
								<p className={s.lead}>{p.summary}</p>
								{p.details ? (
									<ul className={s.bullets}>
										{p.details.map((d) => (
											<li key={d}>{d}</li>
										))}
									</ul>
								) : null}
								<Stack items={p.tags} />
								{p.href ? (
									<External className={s.proofLink} href={p.href}>
										{p.linkLabel ?? "Visit"}
									</External>
								) : null}
							</article>
						))}
					</div>

					<h3 className={s.shelfTitle}>Earlier: games, web3 and tools</h3>
					<ul className={s.shelf}>
						{legacy.map((p) => (
							<li key={p.name} className={s.tile}>
								{p.image ? (
									<div className={`frame ${s.tileImg}`}>
										<Image
											className="duotone"
											src={p.image}
											alt=""
											fill
											sizes="(max-width: 600px) 100vw, 300px"
											unoptimized={p.image.endsWith(".gif")}
										/>
									</div>
								) : null}
								<h4 className={s.tileTitle}>{p.href ? <External href={p.href}>{p.name}</External> : p.name}</h4>
								<p className={s.tileText}>{p.summary}</p>
								<Stack items={p.tags} max={4} />
							</li>
						))}
					</ul>
				</div>
			</section>

			{/* ---------- writing ---------- */}
			<section id="writing" className={s.section} aria-labelledby="writing-title">
				<div className="container">
					<SectionHead id="writing" rune="ansuz" title="Letters, poems and musings">
						<p className={s.sectionLede}>
							Long before agents, I was writing letters to the machine minds I expected to meet. They are still here,
							unedited.
						</p>
					</SectionHead>
					<div className={s.library}>
						{writingSections.map((w) => {
							const items =
								w.id === "dear-lambda"
									? letters.map((l) => ({ title: l.title, href: `/writing/dear-lambda/${l.slug}` }))
									: w.id === "poems"
										? poems.slice(0, 3).map((p) => ({ title: p.title, href: `/writing/poems/${p.slug}` }))
										: w.id === "musings"
											? musings.slice(0, 3).map((p) => ({ title: p.title, href: `/writing/musings/${p.slug}` }))
											: []
							return (
								<article key={w.id} className={s.shelfCol}>
									<Rune name={w.rune} size={22} strokeWidth={0.9} className="rune-incised" />
									<h3 className={s.libraryTitle}>
										<Link href={w.id === "art" ? "/writing/art" : `/writing#${w.id}`}>{w.title}</Link>
									</h3>
									<p className={s.libraryBlurb}>{w.blurb}</p>
									{items.length ? (
										<ul className={s.libraryList}>
											{items.map((it) => (
												<li key={it.href}>
													<Link href={it.href}>{it.title}</Link>
												</li>
											))}
										</ul>
									) : null}
								</article>
							)
						})}
					</div>
					<p className={s.more}>
						<Link href="/writing">All writing</Link>
					</p>
				</div>
			</section>

			{/* ---------- play ---------- */}
			<section className={s.play} aria-labelledby="play-title">
				<div className="container">
					<Rune name="wunjo" size={40} strokeWidth={0.8} className={`rune-ignited ${s.playRune}`} />
					<p className={s.playKicker}>My massive transformative purpose</p>
					<h2 id="play-title" className={s.playTitle}>
						To make play the only task.
					</h2>
					<ul className={s.playMeans}>
						{play.means.map((m) => (
							<li key={m}>Play means you are {m}.</li>
						))}
					</ul>
					<p className={s.playCoda}>{play.coda[0]}</p>
				</div>
			</section>

			{/* ---------- contact + cottage ---------- */}
			<section id="contact" className={s.section} aria-labelledby="contact-title">
				<div className={`container ${s.thresholdGrid}`}>
					<div className={s.contact}>
						<div className={s.avatar}>
							<Image src="/images/w0nd3r_headshot-min.png" alt="Lars Crawford" fill sizes="112px" />
						</div>
						<div>
							<h2 id="contact-title" className={s.contactTitle}>
								Let&apos;s build something
							</h2>
							<p className={s.contactText}>
								The fastest way to reach me is email: <a href={links.email.href}>{profile.email}</a>. I&apos;m also on{" "}
								<External href={links.linkedin.href}>LinkedIn</External> and{" "}
								<External href={links.github.href}>GitHub</External>.
							</p>
						</div>
					</div>
					<Link href="/cottage" className={`slab ${s.door}`}>
						<Rune name="othala" size={28} strokeWidth={0.9} className={`rune-incised ${s.doorRune}`} />
						<span className={s.doorTitle}>
							Enter the cottage
						</span>
						<span className={s.doorSub}>An explorable 3D home for all of the above. Under construction.</span>
					</Link>
				</div>
			</section>
		</>
	)
}
