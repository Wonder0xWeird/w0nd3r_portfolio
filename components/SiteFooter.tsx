import { profile } from "@/content/profile"
import { Rune } from "./Rune"
import { LARS } from "@/lib/runes"

export function SiteFooter() {
	const { links } = profile
	return (
		<footer className="site-footer">
			<div className="container site-footer__inner">
				<div className="site-footer__runes rune-incised" aria-hidden="true">
					{LARS.map((r) => (
						<Rune key={r} name={r} size={18} strokeWidth={1.2} />
					))}
				</div>
				<ul className="site-footer__links">
					<li>
						<a href={links.email.href}>{profile.email}</a>
					</li>
					<li>
						<a href={links.linkedin.href}>LinkedIn</a>
					</li>
					<li>
						<a href={links.github.href}>GitHub</a>
					</li>
				</ul>
				<p className="site-footer__legal meta">
					© {new Date().getFullYear()} Lars Crawford, w0nd3r.rune.love
				</p>
			</div>
		</footer>
	)
}
