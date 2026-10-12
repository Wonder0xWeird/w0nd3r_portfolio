import { runePath, type RuneName } from "@/lib/runes"

interface Props {
	name: RuneName
	size?: number | string
	className?: string
	/** Stroke width in the rune's 10-unit box (scales with size). */
	strokeWidth?: number
	/** Stroke width in CSS px that stays constant at any size (carved sigils). */
	fixedStroke?: number
	title?: string
}

/** A single rune glyph as inline SVG. Decorative unless a title is given. */
export function Rune({ name, size = "1em", className, strokeWidth = 1.1, fixedStroke, title }: Props) {
	return (
		<svg
			viewBox="0 0 10 10"
			width={size}
			height={size}
			className={className}
			fill="none"
			stroke="currentColor"
			strokeWidth={fixedStroke ?? strokeWidth}
			strokeLinecap="round"
			strokeLinejoin="round"
			role={title ? "img" : undefined}
			aria-hidden={title ? undefined : true}
		>
			{title ? <title>{title}</title> : null}
			<path d={runePath(name)} vectorEffect={fixedStroke ? "non-scaling-stroke" : undefined} />
		</svg>
	)
}
