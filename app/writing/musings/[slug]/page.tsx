import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PieceView } from "@/components/writing/PieceView"
import { musings } from "@/content/writing"

export const dynamicParams = false

export function generateStaticParams() {
	return musings.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
	const { slug } = await params
	const piece = musings.find((p) => p.slug === slug)
	return piece ? { title: piece.title, description: piece.lines[0].slice(0, 160) } : {}
}

export default async function MusingPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params
	const piece = musings.find((p) => p.slug === slug)
	if (!piece) notFound()
	return <PieceView piece={piece} all={musings} />
}
