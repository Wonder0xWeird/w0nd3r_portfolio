export interface Role {
	title: string
	dates: string
	bullets: string[]
}

export interface Job {
	org: string
	href?: string
	location: string
	dates: string
	roles: Role[]
	stack?: string[]
	/** Before the software career: listed on / behind a disclosure that still names it. */
	earlier?: boolean
}

// Only claims already on the résumé or the legacy site. Unconfirmed items
// (marked [FILL]/[CHECK] in the résumé draft) are deliberately left out.
// TODO(Lars): add the Blockchain.com AI-transformation specifics once confirmed.
export const experience: Job[] = [
	{
		org: "Blockchain.com",
		href: "https://www.blockchain.com",
		location: "London (hybrid)",
		dates: "Sep 2025 – present",
		roles: [
			{
				title: "Technical Product Lead, AI Transformation",
				dates: "May 2026 – present",
				bullets: [
					"Lead the strategy, administration, architecture and build of internal AI solutions to drive adoption and productivity org-wide; near-term focus on engineering throughput.",
				],
			},
			{
				title: "Web3 Engineer, June AI",
				dates: "From Sep 2025",
				bullets: [
					"Core contributor to June AI (askjune.ai), a privacy-first AI assistant: on-device encrypted chat history, open-weights models and a Privacy+ mode; full-stack and smart-contract work.",
				],
			},
		],
	},
	{
		org: "Tribally",
		href: "https://tribally.games",
		location: "London",
		dates: "Sep 2023 – Sep 2025",
		roles: [
			{
				title: "Senior Software Engineer",
				dates: "Oct 2024 – Sep 2025",
				bullets: [
					"Helped launch and grow tribally.games to 175k+ gamers and dozens of partner games.",
					"Led UX design, data modeling and implementation of the Tribally DevKit Partner Portal with a team of 2 frontend and 4 backend engineers; onboarded game partners onto the platform.",
					"Built gameplay-data ingestion APIs for 5+ partner games and internal/external APIs across dozens of microservices; onboarded and mentored junior engineers.",
					"Pioneered services that securely automate onchain transactions across six EVM-compatible chains: 80k+ transactions managed, 30k+ prizes distributed.",
				],
			},
			{ title: "Software Engineer (contract)", dates: "Sep 2023 – Sep 2024", bullets: [] },
		],
		stack: ["TypeScript", "Node.js", "Next.js", "PostgreSQL", "MongoDB", "Redis", "Kubernetes", "Docker"],
	},
	{
		org: "Defenders of Lunacian Land",
		href: "https://doll.tioland.com",
		location: "Remote",
		dates: "Jun 2022 – May 2025",
		roles: [
			{
				title: "Lead Full-Stack Developer (part-time)",
				dates: "Jun 2022 – May 2025",
				bullets: [
					"One of the first projects in Axie Infinity's Builders Program. Built server-side auth, gameplay-data ingestion, and a role-based analytics system for skill balancing.",
					"Built payment processing that handled 10k+ payments and $100k+ in revenue; shipped the first third-party NFT on the Ronin blockchain.",
				],
			},
		],
	},
	{
		org: "MultiModal Health",
		earlier: true,
		location: "Seattle",
		dates: "2015 – 2016",
		roles: [
			{
				title: "Cofounder, Director of Operations & Research",
				dates: "2015 – 2016",
				bullets: [
					"Co-developed vHAB, a gamified stroke-rehabilitation device that integrates bio-signals from multiple sensors; designed and ran IRB-approved studies of patient motivation and engagement with therapists and physicians.",
					"UW Commercialization Fellow; Foster + Jones Accelerator; UW Business Plan Competition 3rd (2016) and 4th (2015).",
				],
			},
		],
	},
]
