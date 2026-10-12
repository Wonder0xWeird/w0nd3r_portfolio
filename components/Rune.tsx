import { runePath, type RuneName } from "@/lib/runes"

interface Props {
	name: RuneName
	size?: number | string
	className?: string
	strokeWidth?: number
	title?: string
}

/** A single rune glyph as inline SVG. Decorative unless a title is given. */
export function Rune({ name, size = "1em", className, strokeWidth = 1.1, title }: Props) {
	return (
		<svg
			viewBox="0 0 10 10"
			width={size}
			height={size}
			className={className}
			fill="none"
			stroke="currentColor"
			strokeWidth={strokeWidth}
			strokeLinecap="round"
			strokeLinejoin="round"
			role={title ? "img" : undefined}
			aria-hidden={title ? undefined : true}
		>
			{title ? <title>{title}</title> : null}
			<path d={runePath(name)} />
		</svg>
	)
}

/** A thin rune-studded rule used between sections. */
export function RuneRule({ runes = ["ansuz", "gebo", "othala"] }: { runes?: RuneName[] }) {
	return (
		<div className="rune-rule" aria-hidden="true">
			<span />
			{runes.map((r, i) => (
				<Rune key={i} name={r} size={14} />
			))}
			<span />
		</div>
	)
}
