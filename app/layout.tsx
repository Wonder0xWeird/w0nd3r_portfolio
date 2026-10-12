import type { Metadata, Viewport } from "next"
import { Cormorant, Mona_Sans } from "next/font/google"
import { SiteHeader } from "@/components/SiteHeader"
import { SiteFooter } from "@/components/SiteFooter"
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

// Italic is only for genuine quoted verse/prose, so it is not preloaded.
const displayItalic = Cormorant({
	subsets: ["latin"],
	style: "italic",
	variable: "--font-display-italic",
	display: "swap",
	preload: false,
})

const text = Mona_Sans({
	subsets: ["latin"],
	axes: ["wdth"],
	variable: "--font-text",
	display: "swap",
})

const description = `${profile.name}, ${profile.honorific}: ${profile.tagline}. Neural engineer turned production engineer, now leading AI transformation and building agentic systems with Claude.`

export const metadata: Metadata = {
	metadataBase: new URL(profile.siteUrl),
	title: {
		default: `${profile.name} · ${profile.tagline}`,
		template: `%s · ${profile.name}`,
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
	themeColor: "#14171c",
	colorScheme: "dark",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className={`${display.variable} ${displayItalic.variable} ${text.variable}`}>
			<body>
				<a className="skip-link" href="#main">
					Skip to content
				</a>
				<SiteHeader />
				<main id="main">{children}</main>
				<SiteFooter />
			</body>
		</html>
	)
}
