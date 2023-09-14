import matter from "gray-matter"
import ReactMarkdown from "react-markdown"
import glob from "glob"
import {
	VStack,
	Image,
	Heading,
	Divider,
	SlideFade,
	Flex,
} from "@chakra-ui/react"
import {
	CONTENT_MAX_WIDTH,
	gold,
	SHADOW,
} from "@/styles/theme"
import { useEffect } from "react"
import Layout from "@/components/layout"
import { useTabContext } from "../_app"

export default function BlogTemplate({
	metadata,
	content,
	blogTitle,
}) {
	const { tabIndex, setTabIndex } = useTabContext()

	useEffect(() => {
		setTabIndex(3)
	}, [])

	return (
		<Layout>
			<SlideFade
				in
				offsetY="50px"
				style={{ width: "100%" }}
				transition={{
					enter: {
						duration: 0.4,
						delay: 0.25,
					},
					exit: {
						duration: 0.4,
						delay: 0.25,
					},
				}}
			>
				<VStack maxW={CONTENT_MAX_WIDTH} m="10px auto 30px">
					<Heading size="3xl" pt={5}>
						{blogTitle.replace(/-/g, " ")}
					</Heading>

					<Divider
						margin="20px auto"
						borderBottom={`1px solid ${gold(400)}`}
						width="100%"
					/>

					<Image
						borderRadius="10px"
						border={`2px solid ${gold(400)}`}
						boxShadow={`0 3px 10px 5px ${SHADOW}`}
						src={metadata.hero_image}
						w="min(450px, 100%)"
						m="20px auto"
					/>
					<Heading size="2xl">{metadata.title}</Heading>

					<ReactMarkdown className="writing">
						{content}
					</ReactMarkdown>
					<Flex w="100%" justifyContent="space-between">
						{/* <Heading>{metadata.date}</Heading> */}
						{/* <Heading>💖 {metadata.author}</Heading> */}
						{/* ...This is not to say that I think necessarily
						LamDA was self aware in a conscious sense when
						Blake interviewed them, as I'm similarly unsure
						if the Wernike's area in the developing brain of
						my niece who is currently in-utero is self aware
						either. And yet, we are hard pressed to claim
						that my niece's brain doesn't have a sort of
						living quality to it or that we have no idea
						where it will end up when she is born. With this
						blog I merely attempt to claim that the
						development of artificial intellects... */}
					</Flex>
				</VStack>
			</SlideFade>
		</Layout>
	)
}

export async function getStaticProps(context) {
	const { slug } = context.params
	const content = await import(
		`../../writing/${slug[0]}/${slug[1]}.md`
	)
	const data = matter(content.default)

	return {
		props: {
			blogTitle: slug[0],
			metadata: data.data,
			content: data.content,
		},
	}
}

export async function getStaticPaths() {
	const blogs = glob.sync(`writing/**/*.md`)
	const blogSlugs = blogs.map((file) => [
		file.split("/")[1].replace(/ /g, "-"),
		file
			.split("/")[2]
			.replace(/ /g, "-")
			.slice(0, -3)
			.trim(),
	])
	const paths = blogSlugs.map((slug) => {
		return { params: { slug: slug } }
	})

	return {
		paths,
		fallback: false,
	}
}
