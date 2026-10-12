/**
 * The site's one image treatment (DESIGN.md "Imagery"): luminance mapped from
 * slate shadows (--slate-950) through stone mid-tones (--slate-600) to dim
 * gold-lit highlights, so any picture sits inside the night-lit palette.
 * Used via `filter: url(#duotone)` (the .duotone class).
 */
export function DuotoneFilter() {
	return (
		<svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
			<filter id="duotone" colorInterpolationFilters="sRGB">
				<feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0" />
				<feComponentTransfer>
					<feFuncR type="table" tableValues="0.063 0.275 0.76" />
					<feFuncG type="table" tableValues="0.078 0.314 0.66" />
					<feFuncB type="table" tableValues="0.102 0.369 0.46" />
				</feComponentTransfer>
			</filter>
		</svg>
	)
}
