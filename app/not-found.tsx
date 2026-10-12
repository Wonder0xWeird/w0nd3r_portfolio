import Link from "next/link"
import { Rune } from "@/components/Rune"
import s from "./writing/writing.module.css"

export default function NotFound() {
	return (
		<div className={`container ${s.page} ${s.notFound}`}>
			<Rune name="isa" size={48} strokeWidth={0.8} className="rune-incised" />
			<h1>Nothing carved here</h1>
			<p>That page doesn’t exist (or wandered off).</p>
			<p>
				<Link href="/">Back to the front door</Link>
			</p>
		</div>
	)
}
