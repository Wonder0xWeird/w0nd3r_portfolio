import type { MetadataRoute } from "next"
import { profile } from "@/content/profile"

// The icon set's last piece (v2.7): what Android and desktop installs show. Icons from scripts/make-icons.mjs.
export default function manifest(): MetadataRoute.Manifest {
	return {
		name: `${profile.name}: ${profile.tagline}`,
		short_name: profile.name,
		description: profile.lede,
		start_url: "/",
		display: "browser",
		background_color: "#10141a",
		theme_color: "#10141a",
		icons: [
			{ src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
			{ src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
			{ src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
		],
	}
}
