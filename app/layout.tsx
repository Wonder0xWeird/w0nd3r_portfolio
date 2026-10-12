import type { Metadata, Viewport } from "next"
import { preload } from "react-dom"
import { Cormorant, Mona_Sans } from "next/font/google"
import localFont from "next/font/local"
import { SiteHeader } from "@/components/SiteHeader"
import { SiteFooter } from "@/components/SiteFooter"
import { SlabLight } from "@/components/SlabLight"
import { DuotoneFilter } from "@/components/DuotoneFilter"
import { profile } from "@/content/profile"
import "./globals.css"

// Fonts (DESIGN.md "Type"). next/font defines these CSS variables on <html>.
// Never redefine --font-display / --font-display-italic / --font-text in CSS:
// a same-specificity :root rule later in globals.css silently wins and the
// faces never load (the v1 bug).
const display = Cormorant({
	subsets: ["latin"],
	style: "normal",
	variable: "--font-display",
	display: "swap",
})

// The name (v2.3): Cormorant again, with display "block", for the h1 only, so the first frames never
// paint "Lars Crawford" in the heavier metric-adjusted fallback and swap it mid-rise (the FOUT open
// since v2.1); every other text stays on swap. A second next/font/google instance would share the
// family name "Cormorant" and its later @font-face would turn ALL Cormorant text to block, so this is
// the same latin variable woff2 (OFL; CREDITS.md) self-hosted under its own family name ("cormorantName",
// from the const). Its bytes are
// identical to the Google instance's latin file, so it resolves to the same /_next/static/media URL:
// one download.
const cormorantName = localFont({
	src: "./fonts/cormorant-latin-wght.woff2",
	weight: "300 700",
	style: "normal",
	variable: "--font-display-name",
	display: "block",
	adjustFontFallback: "Times New Roman",
})

// Italic is only for genuine quoted verse/prose, so it is not preloaded.
const displayItalic = Cormorant({
	subsets: ["latin"],
	style: "italic",
	variable: "--font-display-italic",
	display: "swap",
	preload: false,
})

// wght axis only: adding wdth grows the latin file from 40 kB to 98 kB, which
// cost ~0.3 s of mobile LCP. Meta uses size and colour instead of width.
const text = Mona_Sans({
	subsets: ["latin"],
	variable: "--font-text",
	display: "swap",
})

const description = `${profile.name}, ${profile.honorific}: ${profile.tagline}. Neural engineer turned production engineer, now leading AI transformation and building agentic systems with Claude.`

export const metadata: Metadata = {
	metadataBase: new URL(profile.siteUrl),
	title: {
		default: `${profile.name}: ${profile.tagline}`,
		template: `%s | ${profile.name}`,
	},
	description,
	openGraph: {
		type: "website",
		url: profile.siteUrl,
		title: profile.name,
		description,
		siteName: "w0nd3r.rune.love",
	},
	twitter: { card: "summary", title: profile.name, description },
}

export const viewport: Viewport = {
	themeColor: "#10141a",
	colorScheme: "dark",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	// The grain tile lights the page at first paint (.atmos__grain, the bands). Until v2.2 the hero SVG's
	// <pattern> fetched it straight from the HTML; now only CSS references it, so it would wait for the
	// stylesheet. Preload it from the head instead (5.7 kB).
	preload("/textures/grain.png", { as: "image", fetchPriority: "low" })
	return (
		<html lang="en" className={`${display.variable} ${cormorantName.variable} ${displayItalic.variable} ${text.variable}`}>
			<body>
				{/* Page light: moonlight, vignette, torchlight from the stone, grain (DESIGN.md "Surfaces and light"). */}
				<div className="atmos" aria-hidden="true">
					<div className="atmos__torch" />
					<div className="atmos__grain" />
				</div>
				<a className="skip-link" href="#main">
					Skip to content
				</a>
				<SiteHeader />
				<main id="main">{children}</main>
				<SiteFooter />
				<SlabLight />
				<DuotoneFilter />
			</body>
		</html>
	)
}
