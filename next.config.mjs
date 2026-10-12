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
}

export default nextConfig
