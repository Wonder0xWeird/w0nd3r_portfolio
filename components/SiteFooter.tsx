import { profile } from "@/content/profile"
import { Rune } from "./Rune"
import { LARS } from "@/lib/runes"

export function SiteFooter() {
	const { links } = profile
	return (
		<footer className="site-footer">
			<div className="container site-footer__inner">
				<div className="site-footer__runes" aria-hidden="true">
					{LARS.map((r) => (
						<Rune key={r} name={r} size={16} />
					))}
				</div>
				<p>
					<a href={links.email.href}>{profile.email}</a>
					<span aria-hidden="true"> · </span>
					<a href={links.linkedin.href}>LinkedIn</a>
					<span aria-hidden="true"> · </span>
					<a href={links.github.href}>GitHub</a>
				</p>
				<p className="muted small">© {new Date().getFullYear()} Lars Crawford · w0nd3r.rune.love</p>
			</div>
		</footer>
	)
}
