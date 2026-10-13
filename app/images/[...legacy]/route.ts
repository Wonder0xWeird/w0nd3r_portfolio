import legacy from "@/lib/legacy-urls.json"

/**
 * Renamed legacy images (v2.7). The old site served files whose names had spaces and an apostrophe
 * (/images/art/Cast%20spells.png); v2.0 renamed them to kebab case. public/ is served before any
 * dynamic route, so this handler only sees /images/* paths that are NOT files: a renamed one gets a
 * single 308 to its new name, anything else a plain 404.
 *
 * Why not next.config redirects(): those are matched as regexes against the raw or decoded path
 * depending on the host (and case-insensitively on Vercel); here the lookup is on the decoded path.
 */
const MOVED: Record<string, string> = legacy.moved

export async function GET(req: Request, { params }: { params: Promise<{ legacy: string[] }> }) {
	const { legacy: parts } = await params
	let path = `/images/${parts.join("/")}`
	try {
		path = decodeURIComponent(path)
	} catch {
		/* already decoded */
	}
	const to = MOVED[path]
	if (!to) return new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } })
	return Response.redirect(new URL(to, req.url), 308)
}
