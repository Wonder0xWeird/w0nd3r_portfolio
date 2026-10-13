import type { Metadata } from "next"
import Link from "next/link"
import { StoneFallback } from "@/components/hero/StoneFallback"
import { StoneLight, StoneMotes, stoneVars } from "@/components/hero/StoneLight"
import { pageMeta } from "@/lib/meta"
import s from "../writing/writing.module.css"

export const metadata: Metadata = pageMeta({
	title: "The cottage",
	description: "An explorable 3D cottage on a hill: under construction.",
	path: "/cottage",
})

export default function Cottage() {
	return (
		<div className={`container ${s.page} ${s.cottage}`}>
			<div className={s.cottageStone}>
				<div className="stone" style={stoneVars}>
					<StoneLight />
					<div className="stone__body">
						<StoneFallback className="stone__svg" />
					</div>
					<StoneMotes />
				</div>
			</div>
			<h1>The cottage</h1>
			<p className="meta">Under construction</p>
			<p className={s.indexLede}>
				A cottage on a grassy hill, a creek with rune-carved stones, and a table inside strewn with the things I’ve
				made. It’s being built right now. Until the door opens, everything lives on the front page.
			</p>
			<p className={s.cottageLinks}>
				<Link className="btn--primary" href="/">
					Back to the front door
				</Link>
				<Link className="textlink" href="/writing">
					Read the writing
				</Link>
			</p>
		</div>
	)
}
