/** The one external-link icon (DESIGN.md ban list: no arrow glyphs on links). */
export function ExternalIcon() {
	return (
		<svg className="ext" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			<path d="M5.5 2.5H2.5v7h7v-3" />
			<path d="M7.5 1.5h3v3M10.5 1.5 6 6" />
		</svg>
	)
}

/** An off-site link: opens in a new tab and carries the external-link icon. */
export function External({
	href,
	children,
	className,
	icon = true,
}: {
	href: string
	children: React.ReactNode
	className?: string
	icon?: boolean
}) {
	return (
		<a href={href} className={className} target="_blank" rel="noopener noreferrer">
			{children}
			{icon ? (
				<>
					{/* word joiner: the icon never wraps onto a line of its own */}
					{"\u2060"}
					<ExternalIcon />
					<span className="visually-hidden"> (opens in a new tab)</span>
				</>
			) : null}
		</a>
	)
}
