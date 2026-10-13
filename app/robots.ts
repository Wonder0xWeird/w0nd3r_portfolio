import type { MetadataRoute } from "next"
import { profile } from "@/content/profile"

// Everything is public (v2.7). Vercel adds `X-Robots-Tag: noindex` to preview deployments by itself, so
// this file never needs to tell production and previews apart; nothing in code blocks indexing.
export default function robots(): MetadataRoute.Robots {
	return {
		rules: { userAgent: "*", allow: "/" },
		sitemap: `${profile.siteUrl}/sitemap.xml`,
	}
}
