/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	poweredByHeader: false,
	images: {
		formats: ["image/avif", "image/webp"],
	},
	// Legacy mixed-case writing URLs (/writing/Dear-Lambda/I-See-You) are
	// redirected in middleware.ts, not here: Vercel matches redirects()
	// case-insensitively, so a lowercase destination matched itself and looped.
	// The old site's logo page (/ww showed only the Wonder Weird logo, which now hangs in the art
	// gallery). Safe from the case-insensitive self-match above: the destination is not "/ww".
	// Every legacy URL and where it lives now: lib/legacy-urls.json.
	async redirects() {
		return [
			{ source: "/ww", destination: "/writing/art", permanent: true },
			// The pages router answered /index with the home page (Vercel still does); one 308 to the canonical /.
			{ source: "/index", destination: "/", permanent: true },
		]
	},
	async headers() {
		return [
			{
				// The résumé opens in the browser's viewer; "Save as" names the file properly. The file is
				// swapped for newer renders at the same path (README), so it is never cached immutably.
				source: "/resume.pdf",
				headers: [{ key: "Content-Disposition", value: 'inline; filename="Lars_Crawford_Resume.pdf"' }],
			},
		]
	},
}

export default nextConfig
