import type { Metadata, Viewport } from "next"
import { Cormorant_Garamond, Inter } from "next/font/google"
import { SiteHeader } from "@/components/SiteHeader"
import { SiteFooter } from "@/components/SiteFooter"
import { profile } from "@/content/profile"
import "./globals.css"

const serif = Cormorant_Garamond({
	subsets: ["latin"],
	weight: ["500", "600", "700"],
	style: ["normal", "italic"],
	variable: "--font-serif",
	display: "swap",
})

const sans = Inter({
	subsets: ["latin"],
	variable: "--font-sans",
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
		<html lang="en" className={`${serif.variable} ${sans.variable}`}>
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
