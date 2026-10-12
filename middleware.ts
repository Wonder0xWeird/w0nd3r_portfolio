import { NextResponse, type NextRequest } from "next/server"

/**
 * Legacy writing URLs from the old site were mixed case
 * (/writing/Dear-Lambda/I-See-You). Every route under /writing is lowercase, so
 * redirect only when the path literally contains an uppercase letter. The
 * target never does, so this cannot loop.
 *
 * Why not next.config redirects(): Vercel matches those case-insensitively
 * (despite experimental.caseSensitiveRoutes), so a redirect to the lowercase
 * path also matched itself and 308-looped (v2.0 critique, defect #3).
 */
export function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl
	let decoded = pathname
	try {
		decoded = decodeURIComponent(pathname)
	} catch {
		/* malformed escape: leave it to the router */
	}
	if (!/[A-Z]/.test(decoded)) return NextResponse.next()
	const url = req.nextUrl.clone()
	url.pathname = decoded.toLowerCase()
	return NextResponse.redirect(url, 308)
}

export const config = { matcher: ["/writing/:path*"] }
