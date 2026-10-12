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
import { RUNE_LABEL, SIGIL_MEANING, type RuneName } from "@/lib/runes"
import s from "./home.module.css"

// The résumé CTA only renders once the final PDF is in public/ (the primary
// CTA must never 404). Until then, email is the primary action.
const hasResume = existsSync(path.join(process.cwd(), "public", "resume.pdf"))

// Titles shown on / stay inside the preloaded latin font subset: one conlang musing title
// (ę, ą, Ṯ) would pull a 30 kB latin-ext Cormorant file into the front door's critical path.
// It is still listed on /writing.
const LATIN = /^[\u0020-\u007E\u00A0-\u00FF\u2013\u2014\u2018\u2019\u201C\u201D]*$/

/** The sigil's name and meaning, captioned under it on wide screens (decorative, like the rune). */
function SigilName({ rune }: { rune: RuneName }) {
	return (
		<span className={s.sigilName} aria-hidden="true">
			{RUNE_LABEL[rune]}
			<br />
			{SIGIL_MEANING[rune]}
		</span>
	)
}

/**
 * Section title with its sigil rune incised beside it (rune map: DESIGN.md "Sigils"). The sigil
 * ignites as its header scrolls into view and casts the warm pool around the title (v2.2).
 */
function SectionHead({ id, rune, title, children }: { id: string; rune: RuneName; title: string; children?: React.ReactNode }) {
	return (
		<header className={s.sectionHead}>
			<span className={s.sigilMark}>
				<CarvedRune name={rune} className={s.sigil} />
				<SigilName rune={rune} />
			</span>
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

/**
 * The rest of a list, disclosed rather than deleted (critique change 3): the
 * summary names what and how many, it stays keyboard-reachable, and it opens
 * with the 220 ms height transition (instant under reduced motion).
 */
function More({ label, count, className, children }: { label: string; count?: number; className?: string; children: React.ReactNode }) {
	return (
		<details className={`${s.disclose} ${className ?? ""}`}>
			<summary>
				{label}
				{count ? <span className={s.discloseCount}> ({count})</span> : null}
			</summary>
			<div className={s.discloseBody}>{children}</div>
		</details>
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
	const [phd, ...earlier] = research
	const pubs = [...publications].sort((x, y) => Number(y.year) - Number(x.year))

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
					<SectionHead id="work" rune="ehwaz" title="What I do now, and what I did before">
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
							<article key={c.title} className={`slab ${s.proofSlim} ${s.wideOnly}`}>
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

			{/* ---------- experience: one impact line per org; the rest is disclosed, never deleted ---------- */}
			<section id="experience" className={s.section} aria-labelledby="experience-title">
				<div className="container">
					<SectionHead id="experience" rune="raidho" title="Shipping systems people rely on" />
					<ol className={s.timeline}>
						{experience.filter((job) => !job.earlier).map((job) => {
							const [lead, ...firstRest] = job.roles[0].bullets
							const rest = job.roles
								.map((r, i) => ({ title: r.title, bullets: i === 0 ? firstRest : r.bullets }))
								.filter((r) => r.bullets.length)
							const count = rest.reduce((n, r) => n + r.bullets.length, 0)
							return (
								<li key={job.org} className={s.job}>
									<div className={s.jobHead}>
										<h3 className={s.org}>{job.href ? <External href={job.href} icon={false}>{job.org}</External> : job.org}</h3>
										<Meta lines={[job.location, job.dates]} />
									</div>
									<div className={s.jobBody}>
										<ul className={s.roleList}>
											{job.roles.map((r) => (
												<li key={r.title}>
													<span className={s.roleTitle}>{r.title}</span>
													{r.dates !== job.dates ? <span className="meta">{r.dates}</span> : null}
												</li>
											))}
										</ul>
										{lead ? <p className={s.impact}>{lead}</p> : null}
										{count || job.stack ? (
											<More label={`More from ${job.org}`} count={count}>
												{rest.map((r) => (
													<div key={r.title}>
														{job.roles.length > 1 ? <p className={s.moreRole}>{r.title}</p> : null}
														<ul className={s.bullets}>
															{r.bullets.map((b) => (
																<li key={b}>{b}</li>
															))}
														</ul>
													</div>
												))}
												{job.stack ? <Stack items={job.stack} /> : null}
											</More>
										) : null}
									</div>
								</li>
							)
						})}
					</ol>
					{experience
						.filter((job) => job.earlier)
						.map((job) => (
							<More key={job.org} label={`Before software: ${job.org}, ${job.dates}`} className={s.earlier}>
								{job.roles.map((r) => (
									<div key={r.title}>
										<p className={s.moreRole}>{r.title}</p>
										<ul className={s.bullets}>
											{r.bullets.map((b) => (
												<li key={b}>{b}</li>
											))}
										</ul>
									</div>
								))}
								<p className={s.stack}>{job.location}</p>
							</More>
						))}
				</div>
			</section>

			{/* ---------- research ---------- */}
			<section id="research" className={s.sectionBand} aria-labelledby="research-title">
				<div className="container">
					<SectionHead id="research" rune="dagaz" title="Neural engineering, from electrodes to immune cells" />
					{/* Two independent columns on wide screens (no row alignment, so no voids); on narrow
					    ones the wrappers dissolve and the blocks reorder: work, images, papers, education. */}
					<div className={s.researchGrid}>
						<div className={s.researchMain}>
							<div className={s.researchWork}>
								<ol className={s.timeline}>
									<li className={s.job}>
										<div className={s.jobHead}>
											<h3 className={s.org}>{phd.org}</h3>
											<Meta lines={[`${phd.role}, ${phd.lab}`, `${phd.place}, ${phd.dates}`]} />
										</div>
										<div className={s.jobBody}>
											<p className={s.impact}>Thesis: {thesis.title}.</p>
											<details className={`slab ${s.thesis}`}>
												<summary>Materials, studies and the dissertation</summary>
												<div className={s.thesisBody}>
													<ul className={s.bullets}>
														{phd.bullets.map((b) => (
															<li key={b}>{b}</li>
														))}
													</ul>
													<p className={s.moreRole}>{thesis.title}</p>
													{thesis.paragraphs.map((p) => (
														<p key={p}>{p}</p>
													))}
												</div>
											</details>
										</div>
									</li>
								</ol>
								<More label="Earlier research" count={earlier.length} className={s.earlier}>
									<ol className={s.timeline}>
										{earlier.map((r) => (
											<li key={r.lab} className={s.job}>
												<div className={s.jobHead}>
													<h3 className={s.org}>{r.org}</h3>
													<Meta lines={[`${r.role}, ${r.lab}`, `${r.place}, ${r.dates}`]} />
												</div>
												<div className={s.jobBody}>
													{r.bullets.map((b) => (
														<p key={b} className={s.impact}>
															{b}
														</p>
													))}
												</div>
											</li>
										))}
									</ol>
								</More>
							</div>
							<div className={s.researchPubs}>
								<h3 className={s.subhead}>Publications and patents</h3>
								<ol className={s.pubs}>
									{pubs.map((p) => (
										<li key={p.title}>
											<span className={s.pubYear}>{p.year}</span>
											<span>
												<span className={s.pubTitle}>{p.href ? <External href={p.href}>{p.title}</External> : p.title}</span>
												<span className={s.pubVenue}>
													{p.venue}. {p.kind[0].toUpperCase() + p.kind.slice(1)}
												</span>
											</span>
										</li>
									))}
								</ol>
								<More label="Full citations with authors" count={pubs.length}>
									<ol className={s.citations}>
										{pubs.map((p) => (
											<li key={p.title}>
												{p.citation} “{p.title}.” <em>{p.venue}</em>, {p.year}.
											</li>
										))}
									</ol>
								</More>
							</div>
						</div>
						<div className={s.researchAside}>
							{/* A 2 x 2 grid beside the work on wide screens; one row of four on narrow ones. */}
							<div className={s.scienceGrid}>
								{thesis.images.map((img) => (
									<figure key={img.src} className={`frame ${s.scienceFig}`}>
										<Image className="duotone" src={img.src} alt={img.alt} fill sizes="(max-width: 960px) 25vw, 260px" />
									</figure>
								))}
							</div>
							<div className={s.researchEdu}>
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
									{honors.slice(0, 3).map((h) => (
										<li key={h}>{h}</li>
									))}
								</ul>
								<More label="More honors" count={honors.length - 3}>
									<ul className={s.honors}>
										{honors.slice(3).map((h) => (
											<li key={h}>{h}</li>
										))}
									</ul>
								</More>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ---------- projects ---------- */}
			<section id="projects" className={s.section} aria-labelledby="projects-title">
				<div className="container">
					<SectionHead id="projects" rune="fehu" title="Things I’ve built" />
					<div className={s.featuredGrid}>
						{/* One sentence in the open; the build details are one tap away (the proof slab
						    already tells Immortal Kinematics' harness story). */}
						{featured.map((p) => (
							<article key={p.name} className={s.featured}>
								<p className="meta">{p.when}</p>
								<h3 className={s.featuredTitle}>{p.name}</h3>
								<p className={s.lead}>{p.summary}</p>
								<More label={`More about ${p.name}`} count={p.details?.length}>
									{p.details?.length ? (
										<ul className={s.bullets}>
											{p.details.map((d) => (
												<li key={d}>{d}</li>
											))}
										</ul>
									) : null}
									<Stack items={p.tags} />
								</More>
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
											sizes="(max-width: 600px) 64px, 300px"
											unoptimized={p.image.endsWith(".gif")}
										/>
									</div>
								) : null}
								<div className={s.tileCopy}>
									<h4 className={s.tileTitle}>{p.href ? <External href={p.href}>{p.name}</External> : p.name}</h4>
									<p className={s.tileText}>{p.summary}</p>
									<Stack items={p.tags} max={4} />
								</div>
							</li>
						))}
					</ul>
				</div>
			</section>

			{/* ---------- writing: a typographic library; Musings and Art live on /writing below 760 px ---------- */}
			<section id="writing" className={s.sectionBand} aria-labelledby="writing-title">
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
											? musings
													.filter((p) => LATIN.test(p.title))
													.slice(0, 3)
													.map((p) => ({ title: p.title, href: `/writing/musings/${p.slug}` }))
											: []
							const wideOnly = w.id === "musings" || w.id === "art"
							return (
								<article key={w.id} className={`${s.shelfCol} ${wideOnly ? s.wideOnly : ""}`}>
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
					<SigilName rune="wunjo" />
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
								Let’s build something
							</h2>
							<p className={s.contactText}>
								The fastest way to reach me is email: <a href={links.email.href}>{profile.email}</a>. I’m also on{" "}
								<External href={links.linkedin.href}>LinkedIn</External> and{" "}
								{/* the full stop stays with the link and its icon */}
								<span className="nowrap">
									<External href={links.github.href}>GitHub</External>.
								</span>
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
