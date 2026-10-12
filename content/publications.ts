export interface Publication {
	kind: "paper" | "thesis" | "patent"
	citation: string
	title: string
	venue: string
	year: string
	href?: string
}

export const publications: Publication[] = [
	{
		kind: "paper",
		citation: "Crawford L, Wyatt M, Bryers J, Ratner B.",
		title: "Biocompatibility Evolves: Phenomenology to Toxicology to Regeneration",
		venue: "Advanced Healthcare Materials 10(11):2002153",
		year: "2021",
		href: "https://doi.org/10.1002/adhm.202002153",
	},
	{
		kind: "paper",
		citation: "Zhen L, Darrow R, Chen N, Anant M, Gorantla L, Crawford L, Dryg I, Ratner B.",
		title: "Soft, precision engineered porous, hydrogel scaffolds mechanically tailored toward applications in the central nervous system",
		venue: "Journal of Bioactive and Compatible Polymers 39(6):507–521",
		year: "2024",
	},
	{
		kind: "thesis",
		citation: "Crawford LM.",
		title: "Toward a Wholly Organic, Immunomodulatory Neuroelectronic Interface",
		venue: "Doctoral dissertation, University of Washington",
		year: "2021",
		href: "https://proquest.com/docview/2596065608",
	},
	{
		kind: "patent",
		citation: "Ratner BD, Crawford L.",
		title: "One-pot photochemical synthesis methodology for conductive hydrogel fabrication",
		venue: "US Patent Application 17/357,887",
		year: "2021",
		href: "https://patents.google.com/patent/US20210403613A1/en",
	},
	{
		kind: "patent",
		citation: "Ratner BD, Crawford L.",
		title: "Heterogeneous Unit Cells and Composites Containing the Same",
		venue: "US Provisional Patent Application 63/216,249",
		year: "2021",
	},
]

export const honors: string[] = [
	"1st Place, Tissue Engineering SIG Poster Award, Society for Biomaterials (2019)",
	"Best Poster, Neuroelectronic Interfaces Gordon Research Conference (2018)",
	"UW Business Plan Competition, 3rd (2016) and 4th (2015), MultiModal Health",
	"Foster + Jones Accelerator (2015) and UW Commercialization Fellow (2015), MultiModal Health",
	"UW Commercialization Gap Fund (2014), MultiModal Health",
	"Center for Neurotechnology Tech Studio Competition, 1st Place (2014)",
	"Computational Neuroscience Training Grant (2013–14)",
]
