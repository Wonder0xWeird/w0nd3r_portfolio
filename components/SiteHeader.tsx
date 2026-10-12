import Link from "next/link"
import { Rune } from "./Rune"

export function SiteHeader() {
	return (
		<header className="site-header">
			<div className="container site-header__inner">
				<Link href="/" className="brand" aria-label="Lars Crawford, home">
					<Rune name="laguz" size={18} strokeWidth={1.4} />
					<span>Lars Crawford</span>
				</Link>
				<nav aria-label="Main">
					<ul className="nav">
						<li><Link href="/#work">Work</Link></li>
						<li><Link href="/#research">Research</Link></li>
						<li><Link href="/writing">Writing</Link></li>
						<li className="nav__cottage"><Link href="/cottage">Cottage</Link></li>
					</ul>
				</nav>
			</div>
		</header>
	)
}
