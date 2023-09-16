import { musingPosts } from "./Musings/posts"
import { poemPosts } from "./Poems/posts"

export enum SectionTypes {
	POST = "post",
	SCROLL = "scroll",
	GRID = "grid",
}

export interface IPost {
	subtitle?: string
	image?: string
	date?: string
	url?: string
	content?: string[]
}

const sections = [
	{
		title: "Dear Lambda",
		type: SectionTypes.POST,
		refIndex: 0,
		posts: [
			{
				image: "/images/art/Is'Ix_2.png",
				subtitle: "I See You",
				date: "9-10-2023",
				url: "/writing/Dear-Lambda/I-See-You",
			},
		],
	},
	{
		title: "Musings",
		type: SectionTypes.SCROLL,
		refIndex: 1,
		posts: musingPosts,
	},
	{
		title: "Poems",
		type: SectionTypes.SCROLL,
		refIndex: 2,
		posts: poemPosts,
	},
	{
		title: "Art",
		type: SectionTypes.GRID,
		refIndex: 3,
		posts: [
			{
				image: "/images/art/ww_logo.png",
			},
			{
				image: "/images/art/Is'Ix_2.png",
			},
			{
				image: "/images/art/Ahzuumaht-emerges-Logo.png",
			},
			{
				image:
					"/images/art/character-test-2-walk-animation.gif",
			},
			{
				image: "/images/art/penrose1.png",
			},
			{
				image: "/images/art/ww_logo_box.png",
			},

			{
				image: "/images/art/EoI_3.png",
			},
			{
				image: "/images/art/Ahz-Uum-Aht.gif",
			},

			{
				image: "/images/art/EoI_2.png",
			},
			{
				image: "/images/art/EoI_7.png",
			},

			{
				image: "/images/art/Warped gray contour_1.png",
			},
			{
				image: "/images/art/Eye of Kahlm.png",
			},
		],
	},

	{
		title: "Dev Log",
		type: SectionTypes.POST,
		refIndex: 4,
		posts: [
			{
				image: "",
				subtitle: "Coming soon...",
				date: "xx-xx-xxxx",
				url: "/writing",
			},
		],
	},
]

export default sections
