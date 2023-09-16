import { musingPosts } from "./Musings/posts"

export enum SectionTypes {
	POST = "post",
	SCROLL = "scroll",
	GRID = "grid",
}

export interface IPost {
	subtitle: string
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
		posts: [
			{
				image: "",
				subtitle: "Coming soon...",
				date: "xx-xx-xxxx",
				url: "/writing",
			},
		],
	},

	{
		title: "Art",
		type: SectionTypes.GRID,
		refIndex: 3,
		posts: [
			{
				image: "",
				subtitle: "Coming soon...",
				date: "xx-xx-xxxx",
				url: "/writing",
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
