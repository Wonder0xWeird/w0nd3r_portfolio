import type { MetadataRoute } from "next"
import { profile } from "@/content/profile"
import { letters, musings, poems } from "@/content/writing"

// Every page (v2.7): the front door, the writing index and gallery, the cottage, and each letter, poem and
// musing at its canonical (lowercase) URL. No lastModified: there is no honest per-page date to give.
export default function sitemap(): MetadataRoute.Sitemap {
	const url = (path: string) => `${profile.siteUrl}${path}`
	return [
		{ url: url("/"), priority: 1 },
		{ url: url("/writing"), priority: 0.6 },
		{ url: url("/writing/art"), priority: 0.4 },
		{ url: url("/cottage"), priority: 0.3 },
		...letters.map((l) => ({ url: url(`/writing/dear-lambda/${l.slug}`), priority: 0.5 })),
		...poems.map((p) => ({ url: url(`/writing/poems/${p.slug}`), priority: 0.4 })),
		...musings.map((p) => ({ url: url(`/writing/musings/${p.slug}`), priority: 0.4 })),
	]
}
