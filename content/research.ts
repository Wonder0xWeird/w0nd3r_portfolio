export interface ResearchItem {
	org: string
	lab: string
	place: string
	dates: string
	role: string
	bullets: string[]
}

export const research: ResearchItem[] = [
	{
		org: "University of Washington",
		lab: "Ratner Lab",
		place: "Seattle",
		dates: "2016 – 2021",
		role: "PhD research",
		bullets: [
			"Thesis: Toward a Wholly Organic, Immunomodulatory Neuroelectronic Interface. Developed soft, conductive hydrogel biomaterials (PHEMA with PEDOT, graphene and carbon nanotubes) through a novel one-pot photochemical synthesis, for long-term neural interfacing.",
			"Ran in vitro and in vivo studies: a mechanistic study of pore-size-dependent immunomodulation of macrophages and microglia, and immunohistochemical analysis of gliosis.",
			"Computational design and stereolithographic 3D printing of precision-porous hydrogel scaffolds; led interdisciplinary teams; published and presented internationally.",
		],
	},
	{
		org: "University of New South Wales",
		lab: "Poole-Warren Lab",
		place: "Sydney",
		dates: "Jan – Jul 2019",
		role: "Research intern",
		bullets: [
			"Extended the one-pot conductive-hydrogel synthesis to a PVA macromer system, showing the method is chemistry-agnostic.",
		],
	},
	{
		org: "UW Computational Neuroscience Program",
		lab: "Bair Lab",
		place: "Seattle",
		dates: "2013 – 2014",
		role: "Undergraduate researcher",
		bullets: [
			"Built computational models of large-scale, biologically plausible functional maps in macaque primary visual cortex.",
		],
	},
	{
		org: "UW Center for Integrative Brain Research",
		lab: "Welsh Lab",
		place: "Seattle",
		dates: "2012 – 2013",
		role: "Undergraduate researcher",
		bullets: [
			"Whole-cell and dual whole-cell electrophysiology of inferior-olive circuitry in ex vivo brain slices.",
		],
	},
]

/** Dissertation summary, condensed from the original Education page. */
export const thesis = {
	title: "Toward a Wholly Organic, Immunomodulatory Neuroelectronic Interface",
	paragraphs: [
		"The neuroelectronic interface is a powerful tool for direct electrochemical interaction with the central and peripheral nervous systems, as a means to alleviate symptoms of debilitating neurological conditions. Building one well takes a unique combination of neurobiological know-how and engineering execution.",
		"Interfacing robustly with the brain is still a major challenge, because of the neuroinflammatory response to implanted materials, which is not fully understood. That immune reaction is driven not only by the implantation procedure but by the materials chosen for the device itself.",
		"This work contributes new methods for synthesizing soft electronic materials and new understanding of the mechanisms behind the neuroinflammatory response, toward a wholly organic, immunomodulatory interface that could be translated into a robust medical device.",
	],
	images: [
		{ src: "/images/science/gelectrode.png", alt: "A soft conductive hydrogel electrode" },
		{ src: "/images/science/seeded-scaffold.jpg", alt: "A cell-seeded precision-porous hydrogel scaffold" },
		{ src: "/images/science/rapid-photochemical-synthesis.png", alt: "Schematic of the rapid one-pot photochemical conductive-hydrogel synthesis" },
		{ src: "/images/science/6s.jpg", alt: "Scanning electron micrograph of a 3D-printed precision-porous scaffold (1 mm scale bar)" },
	],
}

export const education = [
	{
		degree: "Ph.D., Bioengineering and Nanotechnology & Molecular Engineering (dual title)",
		school: "University of Washington",
		year: "2021",
		note: "Advisor: Prof. Buddy Ratner",
	},
	{
		degree: "B.S., Neurobiology (Computational Neuroscience Program)",
		school: "University of Washington",
		year: "2014",
		note: "Cum laude; College and Departmental Honors",
	},
]
