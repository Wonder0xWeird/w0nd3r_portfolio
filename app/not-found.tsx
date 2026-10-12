import Link from "next/link"
import { Rune } from "@/components/Rune"

export default function NotFound() {
	return (
		<div className="container" style={{ textAlign: "center", padding: "96px 16px 40px" }}>
			<Rune name="isa" size={40} className="gold" />
			<h1 style={{ fontSize: "2.6rem", marginTop: 16 }}>Nothing carved here</h1>
			<p className="muted">That page doesn&apos;t exist (or wandered off).</p>
			<p>
				<Link href="/">Back to the front door →</Link>
			</p>
		</div>
	)
}
