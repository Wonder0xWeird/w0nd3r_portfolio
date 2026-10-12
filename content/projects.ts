export interface Project {
	name: string
	when?: string
	summary: string
	details?: string[]
	href?: string
	linkLabel?: string
	image?: string
	tags: string[]
	featured?: boolean
}

export const immortalKinematicsPost = "https://immortal.boutique/blog/one-month-with-claude"

export const projects: Project[] = [
	{
		name: "Immortal Kinematics",
		when: "Aug 2026 – present",
		summary: "An AI motion-capture dance app, built by an autonomous agent team I direct.",
		details: [
			"A scheduled Claude lead wakes every 3 hours with no memory, boots from a fixed set of repo files, delegates bounded tasks to up to three Opus subagents in isolated git worktrees, reviews every diff and ships only through a verify gate.",
			"Context as infrastructure: 270 architecture decision records and 241 delegation briefs serve as shared memory for stateless agents; human-only questions go to a queue.",
			"Product: FastAPI + Postgres + React; MediaPipe 33-joint pose extraction with multi-dancer tracking turns dance video into ranked clips and skeleton-scored challenges.",
		],
		href: immortalKinematicsPost,
		linkLabel: "Read: “I built a dance app in a month by talking to it”",
		tags: ["Claude Code", "Agent harness", "FastAPI", "Postgres", "React", "MediaPipe"],
		featured: true,
	},
	{
		name: "mindmapper",
		when: "Aug – Sep 2026",
		summary: "The LLM phylogenetic tree: a 3D React Three Fiber map of 173 language models from 58 providers.",
		details: [
			"Curated by a Claude research-agent skill whose rules require a primary-source citation for every claim and forbid fabrication; a schema and referential-integrity validator plus CI gates every agent edit.",
			"An autonomous loop raised source-verified entries from 41 to 88 of 95: the same provenance problem as literature curation.",
		],
		tags: ["React Three Fiber", "Research agents", "Provenance", "CI"],
		featured: true,
	},
	{
		name: "Tribally Games",
		summary: "A social gaming platform with game development tooling and onchain perks.",
		href: "https://tribally.games",
		image: "/images/tribally.png",
		tags: ["TypeScript", "Node.js", "Next.js", "Ethers.js", "Wagmi", "OAuth 2.0", "MongoDB", "Redis", "PostgreSQL", "Kubernetes", "Docker"],
	},
	{
		name: "Axie DoLL",
		summary: "A fast-paced, action survival game set in the Axie Infinity universe.",
		href: "https://doll.tioland.com",
		image: "/images/DoLL_banner-min.jpg",
		tags: ["Next.js", "MongoDB", "GraphQL", "Ethers.js", "Express", "TypeScript"],
	},
	{
		name: "Sidekicks",
		summary: "The first third-party NFT deployed on the Ronin blockchain.",
		href: "https://marketplace.skymavis.com/collections/ronin:97797358f0d12aee117209c15d964ee0022bf1aa",
		image: "/images/sidekick321.gif",
		tags: ["Solidity", "Hardhat", "Ethers.js", "NFT.Storage", "IPFS"],
	},
	{
		name: "Beezlebop’s Blunder",
		summary: "A multiplayer rogue-like dungeon crawler set in the Axie Infinity universe.",
		href: "https://blunder.beezle.buzz",
		image: "/images/Beezlebop.gif",
		tags: ["Phaser", "Socket.io", "Next.js", "MongoDB", "Redis", "TypeScript"],
	},
	{
		name: "BTC Pay App",
		summary: "A Bitcoin payment system with real-time monitoring on Bitcoin Testnet4.",
		href: "https://btc-pay-w0nd3rs-projects.vercel.app/",
		image: "/images/btc-pay-app.png",
		tags: ["TypeScript", "Next.js", "Tailwind", "bitcoinjs-lib", "BIP32/39/44", "SegWit"],
	},
	{
		name: "SIWR Starter Pack",
		summary: "Demo and tutorial site for the Sign In With Ronin (SIWR) authentication system.",
		href: "https://siwr-starter-pack.vercel.app/",
		image: "/images/siwr.png",
		tags: ["Next.js", "MongoDB", "GraphQL", "Ethers.js", "TypeScript"],
	},
	{
		name: "The Andtheneum",
		summary: "A social storytelling platform for the Forgotten Runes Wizard’s Cult NFT.",
		href: "https://andtheneum-wonder0xweird.vercel.app/",
		image: "/images/Andtheneum.png",
		tags: ["Next.js", "MongoDB", "Ethers.js", "JavaScript"],
	},
]

export interface ProofCard {
	/** Who/where, shown as the first meta line. */
	org: string
	/** When/what kind, shown as the second meta line. */
	context: string
	title: string
	body: string
	/** The one big figure (feature card only). */
	figure?: { value: string; label: string }
	points: string[]
	href: string
	linkLabel: string
	external?: boolean
	/** The feature slab in the asymmetric proof composition. */
	feature?: boolean
}

// Since v2.4 only the feature card renders on / (with the harness diagram); the other two restated
// Experience and Research, which follow it, and are kept here as copy.
export const proofCards: ProofCard[] = [
	{
		org: "Blockchain.com",
		context: "Now",
		title: "Leading AI transformation",
		body: "Technical Product Lead of AI Transformation since May 2026: strategy, administration, architecture and build of internal AI solutions, org-wide.",
		points: [
			"Near-term focus: engineering throughput",
			"Before that: core contributor to June AI, a privacy-first AI assistant",
		],
		href: "#experience",
		linkLabel: "See experience",
	},
	{
		org: "Immortal Kinematics",
		context: "Side build",
		title: "An agent team that ships",
		body: "A scheduled Claude lead delegates to Opus subagents in isolated worktrees and ships only through a one-command verify gate.",
		figure: { value: "2,416 of 2,593", label: "commits co-authored by Claude in 8 weeks" },
		points: ["270 ADRs + 241 briefs as shared memory for stateless agents"],
		href: immortalKinematicsPost,
		linkLabel: "Read the write-up",
		external: true,
		feature: true,
	},
	{
		org: "University of Washington",
		context: "PhD",
		title: "Neural-interface research",
		body: "Soft, conductive hydrogels for long-term neural interfacing, made by a novel one-pot photochemical synthesis; in vitro and in vivo immunomodulation studies.",
		points: [
			"Two patent filings; Advanced Healthcare Materials (2021)",
			"Electrophysiology and computational neuroscience before that",
		],
		href: "#research",
		linkLabel: "See research",
	},
]
