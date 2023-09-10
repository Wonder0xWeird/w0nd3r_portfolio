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
	DESIGN_MAX_WIDTH,
	gold,
	SHADOW,
} from "@/styles/theme"
import Nav from "@/components/layout/Nav"
import useWindowWidth from "@/lib/hooks/window"
import { useState } from "react"
import Layout from "@/components/layout"

function reformatDate(fullDate) {
	const date = new Date(fullDate)
	return date.toDateString().slice(4)
}

export default function BlogTemplate({
	metadata,
	content,
	blogTitle,
}) {
	const [tabIndex, setTabIndex] = useState(0)

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
					<Heading size="2xl" pt={5}>
						{blogTitle}
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
					<Heading>{metadata.title}</Heading>

					<ReactMarkdown className="writing">
						{content}
					</ReactMarkdown>
					<Flex w="100%" justifyContent="space-between">
						<Heading>{metadata.date}</Heading>
						<Heading>💖 {metadata.author}</Heading>
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