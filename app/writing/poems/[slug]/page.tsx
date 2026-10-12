import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PieceView } from "@/components/writing/PieceView"
import { poems } from "@/content/writing"

export const dynamicParams = false

export function generateStaticParams() {
	return poems.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
	const { slug } = await params
	const piece = poems.find((p) => p.slug === slug)
	return piece ? { title: `${piece.title} (poem)`, description: piece.lines[0] } : {}
}

export default async function PoemPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params
	const piece = poems.find((p) => p.slug === slug)
	if (!piece) notFound()
	return <PieceView piece={piece} all={poems} />
}
