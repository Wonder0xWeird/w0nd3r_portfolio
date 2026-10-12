import Image from "next/image"
import Link from "next/link"
import { HeroStone } from "@/components/hero/HeroStone"
import { Rune, RuneRule } from "@/components/Rune"
import { profile, play } from "@/content/profile"
import { experience } from "@/content/experience"
import { research, thesis, education } from "@/content/research"
import { publications, honors } from "@/content/publications"
import { projects, proofCards } from "@/content/projects"
import { letters, poems, musings, writingSections } from "@/content/writing"
import type { RuneName } from "@/lib/runes"
import s from "./home.module.css"

function SectionHead({ id, rune, kicker, title }: { id: string; rune: RuneName; kicker: string; title: string }) {
	return (
		<header className={s.sectionHead}>
			<p className={s.kicker}>
				<Rune name={rune} size={14} />
				{kicker}
			</p>
			<h2 id={`${id}-title`}>{title}</h2>
		</header>
	)
}

function External({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
	return (
		<a href={href} className={className} target="_blank" rel="noopener noreferrer">
			{children}
		</a>
	)
}

export default function Home() {
	const { links } = profile
	const featured = projects.filter((p) => p.featured)
	const legacy = projects.filter((p) => !p.featured)

	return (
		<>
			{/* ---------- hero ---------- */}
			<section className={s.hero} aria-labelledby="hero-title">
				<div className={`container ${s.heroGrid}`}>
					<div className={s.heroText}>
						<p className={s.kicker}>
							<Rune name="laguz" size={14} />
							w0nd3r · {profile.location}
						</p>
						<h1 id="hero-title" className={s.name}>
							Lars Crawford<span className={s.honorific}>, {profile.honorific}</span>
						</h1>
						<p className={s.tagline}>{profile.tagline}</p>
						<div className={s.intro}>
							{profile.intro.map((p) => (
								<p key={p}>{p}</p>
							))}
						</div>
						<div className={s.ctaRow}>
							<a className="btn btn--gold" href={links.resume.href}>
								{links.resume.label}
							</a>
							<External className="btn" href={links.linkedin.href}>
								LinkedIn
							</External>
							<External className="btn" href={links.github.href}>
								GitHub
							</External>
							<a className="btn" href={links.email.href}>
								Email
							</a>
						</div>
						<p className={s.heroAside}>
							Prefer to wander? <Link href="/cottage">Enter the cottage →</Link>
						</p>
					</div>
					<div className={s.heroArt}>
						<HeroStone />
					</div>
				</div>
			</section>

			{/* ---------- proof ---------- */}
			<section id="work" className={s.section} aria-labelledby="work-title">
				<div className="container">
					<SectionHead id="work" rune="tiwaz" kicker="Proof of work" title="What I do now, and what I did before" />
					<div className={s.proofGrid}>
						{proofCards.map((c) => (
							<article key={c.title} className={s.proofCard}>
								<div className={s.proofRune} aria-hidden="true">
									<Rune name={c.rune} size={28} strokeWidth={0.9} />
								</div>
								<p className={s.proofKicker}>{c.kicker}</p>
								<h3>{c.title}</h3>
								<p>{c.body}</p>
								<ul>
									{c.points.map((pt) => (
										<li key={pt}>{pt}</li>
									))}
								</ul>
								{c.external ? (
									<External className={s.cardLink} href={c.href}>
										{c.linkLabel} ↗
									</External>
								) : (
									<a className={s.cardLink} href={c.href}>
										{c.linkLabel} ↓
									</a>
								)}
							</article>
						))}
					</div>
				</div>
			</section>

			{/* ---------- experience ---------- */}
			<section id="experience" className={s.section} aria-labelledby="experience-title">
				<div className="container">
					<SectionHead id="experience" rune="raidho" kicker="Experience" title="Shipping systems people rely on" />
					<ol className={s.timeline}>
						{experience.map((job) => (
							<li key={job.org} className={s.job}>
								<div className={s.jobHead}>
									<h3>{job.href ? <External href={job.href}>{job.org}</External> : job.org}</h3>
									<p className={s.meta}>
										{job.location} · {job.dates}
									</p>
								</div>
								{job.roles.map((r) => (
									<div key={r.title} className={s.role}>
										<p className={s.roleTitle}>
											{r.title} <span className={s.meta}>· {r.dates}</span>
										</p>
										{r.bullets.length ? (
											<ul>
												{r.bullets.map((b) => (
													<li key={b}>{b}</li>
												))}
											</ul>
										) : null}
									</div>
								))}
								{job.stack ? (
									<ul className="tag-list" aria-label="Stack">
										{job.stack.map((t) => (
											<li key={t}>{t}</li>
										))}
									</ul>
								) : null}
							</li>
						))}
					</ol>
				</div>
			</section>

			{/* ---------- research ---------- */}
			<section id="research" className={s.section} aria-labelledby="research-title">
				<div className="container">
					<SectionHead id="research" rune="kenaz" kicker="Research & publications" title="Neural engineering, from electrodes to immune cells" />
					<div className={s.researchGrid}>
						<div>
							<ol className={s.timeline}>
								{research.map((r) => (
									<li key={r.lab} className={s.job}>
										<div className={s.jobHead}>
											<h3>
												{r.org} <span className={s.lab}>· {r.lab}</span>
											</h3>
											<p className={s.meta}>
												{r.role} · {r.place} · {r.dates}
											</p>
										</div>
										<ul>
											{r.bullets.map((b) => (
												<li key={b}>{b}</li>
											))}
										</ul>
									</li>
								))}
							</ol>
							<details className={s.thesis}>
								<summary>About the dissertation: {thesis.title}</summary>
								{thesis.paragraphs.map((p) => (
									<p key={p}>{p}</p>
								))}
							</details>
						</div>
						<div className={s.scienceGrid}>
							{thesis.images.map((img) => (
								<figure key={img.src} className={s.scienceFig}>
									<Image src={img.src} alt={img.alt} fill sizes="(max-width: 860px) 45vw, 240px" />
								</figure>
							))}
						</div>
					</div>

					<div className={s.pubGrid}>
						<div>
							<h3 className={s.subhead}>Publications & patents</h3>
							<ol className={s.pubs}>
								{publications.map((p) => (
									<li key={p.title}>
										<span className={s.pubKind}>{p.kind}</span>
										<span>
											{p.citation}{" "}
											{p.href ? (
												<External href={p.href}>“{p.title}.”</External>
											) : (
												<>“{p.title}.”</>
											)}{" "}
											<em>{p.venue}</em> ({p.year}).
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
										<br />
										<span className={s.meta}>
											{e.school}, {e.year}. {e.note}
										</span>
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
					<SectionHead id="projects" rune="gebo" kicker="Projects" title="Things I've built" />
					<div className={s.featuredGrid}>
						{featured.map((p) => (
							<article key={p.name} className={s.featured}>
								<p className={s.meta}>{p.when}</p>
								<h3>{p.name}</h3>
								<p className={s.lead}>{p.summary}</p>
								{p.details ? (
									<ul>
										{p.details.map((d) => (
											<li key={d}>{d}</li>
										))}
									</ul>
								) : null}
								<ul className="tag-list">
									{p.tags.map((t) => (
										<li key={t}>{t}</li>
									))}
								</ul>
								{p.href ? (
									<External className={s.cardLink} href={p.href}>
										{p.linkLabel ?? "Visit"} ↗
									</External>
								) : null}
							</article>
						))}
					</div>

					<h3 className={s.subhead}>Earlier: games, web3 and tools</h3>
					<div className={s.projectGrid}>
						{legacy.map((p) => (
							<article key={p.name} className={s.project}>
								{p.image ? (
									<div className={s.projectImg}>
										<Image src={p.image} alt="" fill sizes="(max-width: 600px) 100vw, 340px" unoptimized={p.image.endsWith(".gif")} />
									</div>
								) : null}
								<div className={s.projectBody}>
									<h4>
										{p.href ? (
											<External href={p.href}>
												{p.name} <span aria-hidden="true">↗</span>
											</External>
										) : (
											p.name
										)}
									</h4>
									<p>{p.summary}</p>
									<ul className="tag-list">
										{p.tags.map((t) => (
											<li key={t}>{t}</li>
										))}
									</ul>
								</div>
							</article>
						))}
					</div>
				</div>
			</section>

			{/* ---------- writing ---------- */}
			<section id="writing" className={s.section} aria-labelledby="writing-title">
				<div className="container">
					<SectionHead id="writing" rune="ansuz" kicker="Writing" title="Letters, poems and musings" />
					<p className={s.sectionLede}>
						Long before agents, I was writing letters to the machine minds I expected to meet. They are still here,
						unedited.
					</p>
					<div className={s.writingGrid}>
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
								<article key={w.id} className={s.writingCard}>
									<Rune name={w.rune} size={22} strokeWidth={0.9} className="gold" />
									<h3>
										<Link href={w.id === "art" ? "/writing/art" : `/writing#${w.id}`}>{w.title}</Link>
									</h3>
									<p className="muted">{w.blurb}</p>
									{items.length ? (
										<ul>
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
						<Link href="/writing">All writing →</Link>
					</p>
				</div>
			</section>

			{/* ---------- play ---------- */}
			<section className={`${s.section} ${s.play}`} aria-labelledby="play-title">
				<div className="container">
					<RuneRule runes={["fehu", "wunjo", "fehu"]} />
					<p className={s.playKicker}>My massive transformative purpose</p>
					<h2 id="play-title" className={s.playTitle}>
						To make <span className="gold">play</span> the only task.
					</h2>
					<ul className={s.playMeans}>
						{play.means.map((m) => (
							<li key={m}>
								<span className="gold">Play</span> means you are {m}.
							</li>
						))}
					</ul>
					<p className={s.playCoda}>{play.coda[0]}</p>
				</div>
			</section>

			{/* ---------- contact ---------- */}
			<section id="contact" className={s.section} aria-labelledby="contact-title">
				<div className={`container ${s.contact}`}>
					<div className={s.avatar}>
						<Image src="/images/w0nd3r_headshot-min.png" alt="Lars Crawford" fill sizes="112px" />
					</div>
					<div>
						<SectionHead id="contact" rune="ingwaz" kicker="Contact" title="Let's build something" />
						<p>
							The fastest way to reach me is email: <a href={links.email.href}>{profile.email}</a>. I'm also on{" "}
							<External href={links.linkedin.href}>LinkedIn</External> and{" "}
							<External href={links.github.href}>GitHub</External>.
						</p>
					</div>
				</div>
			</section>

			{/* ---------- cottage CTA ---------- */}
			<section className={s.cottage} aria-labelledby="cottage-title">
				<div className="container">
					<Link href="/cottage" className={s.cottageLink}>
						<span className={s.cottageRunes} aria-hidden="true">
							<Rune name="othala" size={20} strokeWidth={0.9} />
							<Rune name="dagaz" size={20} strokeWidth={0.9} />
							<Rune name="othala" size={20} strokeWidth={0.9} />
						</span>
						<span id="cottage-title" className={s.cottageTitle}>
							Enter the cottage →
						</span>
						<span className={s.cottageSub}>An explorable 3D home for all of the above. Under construction.</span>
					</Link>
				</div>
			</section>
		</>
	)
}
