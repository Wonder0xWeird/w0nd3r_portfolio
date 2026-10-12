export interface LinkItem {
	label: string
	href: string
}

export const profile = {
	name: "Lars Crawford",
	honorific: "Ph.D.",
	handle: "w0nd3r",
	tagline: "AI transformation lead, PhD neural engineer, builder",
	location: "San Francisco, CA (relocating from London)",
	intro: [
		"Neural engineer turned production software engineer, now leading AI transformation at Blockchain.com.",
		"PhD in Bioengineering from the University of Washington (Ratner Lab), where I built soft, conductive hydrogels for neural interfaces. Since then: four years shipping production systems real users rely on, and this year building agentic systems with Claude every day.",
		"I want to put Claude to work inside life-science research.",
	],
	email: "crawford.lars@gmail.com",
	links: {
		resume: { label: "Résumé (PDF)", href: "/resume.pdf" },
		linkedin: { label: "LinkedIn", href: "https://www.linkedin.com/in/larscrawford" },
		github: { label: "GitHub", href: "https://github.com/Wonder0xWeird" },
		email: { label: "Email", href: "mailto:crawford.lars@gmail.com" },
	} satisfies Record<string, LinkItem>,
	siteUrl: "https://w0nd3r.rune.love",
} as const

/** Massive Transformative Purpose, from the original About page. */
export const play = {
	mtp: "To make play the only task.",
	means: ["alive", "secure", "free", "loved", "learning", "growing", "thinking", "making"],
	coda: [
		"Play is the simplest and most profound of basic sciences. It is one which all humans are born knowing how to do.",
		"The joyous creations made during acts of play have a tendency to positively impact the world in unforeseeable yet significant ways.",
	],
	aside: "And yes, I do have a Padawan braid, as I am forever a student :)",
}
