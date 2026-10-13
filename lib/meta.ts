import type { Metadata } from "next"
import { profile } from "@/content/profile"
import { experience } from "@/content/experience"
import { education } from "@/content/research"

/**
 * Sharing and search metadata (v2.7). Every route builds its metadata with pageMeta() so each page
 * carries its own canonical URL, og:url and the share card. Next.js replaces a parent's `openGraph`
 * and `twitter` objects wholesale when a page sets them, so the card is repeated here rather than
 * inherited from the layout. metadataBase (app/layout.tsx) makes every path absolute.
 */
export const SITE_NAME = "w0nd3r.rune.love"

/** The share card: a 1200x630 render of the real hero, made by scripts/make-og.mjs. */
export const OG_IMAGE = {
	url: "/og.jpg",
	width: 1200,
	height: 630,
	type: "image/jpeg",
	alt: `${profile.name}: ${profile.lede}`,
}

export function pageMeta({
	title,
	description,
	path,
	type = "website",
}: {
	/** The page's own title; the layout's template adds " | Lars Crawford" in <title>. */
	title?: string
	description: string
	path: string
	type?: "website" | "article"
}): Metadata {
	const shareTitle = title ? `${title} | ${profile.name}` : `${profile.name}: ${profile.tagline}`
	return {
		...(title ? { title } : {}),
		description,
		alternates: { canonical: path },
		openGraph: { type, url: path, siteName: SITE_NAME, locale: "en_US", title: shareTitle, description, images: [OG_IMAGE] },
		twitter: { card: "summary_large_image", title: shareTitle, description, images: [OG_IMAGE] },
	}
}

/** The current role, exactly as content/experience.ts states it (the first role still running). */
const current = experience.flatMap((job) => job.roles.map((role) => ({ job, role }))).find(({ role }) => /present$/.test(role.dates))

/** JSON-LD for the front door: who this site is about. Facts only from content/. */
export const personJsonLd = {
	"@context": "https://schema.org",
	"@type": "Person",
	name: profile.name,
	honorificSuffix: profile.honorific,
	url: profile.siteUrl,
	...(current
		? {
				jobTitle: current.role.title,
				worksFor: { "@type": "Organization", name: current.job.org, ...(current.job.href ? { url: current.job.href } : {}) },
			}
		: {}),
	alumniOf: [...new Set(education.map((e) => e.school))].map((name) => ({ "@type": "CollegeOrUniversity", name })),
	sameAs: [profile.links.linkedin.href],
}
