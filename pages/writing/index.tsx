import {
	BG_COLOR,
	CONTENT_MAX_WIDTH,
	DESIGN_MAX_WIDTH,
	SHADOW,
	gold,
} from "@/styles/theme"
import {
	Text,
	Box,
	Flex,
	Image,
	VStack,
	Tab,
	TabList,
	Tabs,
	TabPanels,
	Heading,
	TabPanel,
	SlideFade,
	List,
	ListItem,
	Divider,
	Grid,
	GridItem,
} from "@chakra-ui/react"
import Tablet from "components/Tablet"
import useWindowWidth from "@/lib/hooks/window"
import { useEffect, useState } from "react"
import Layout from "@/components/layout"
import { useTabContext } from "../_app"
import { useRouter } from "next/router"
import sections, {
	IPost,
	SectionTypes,
} from "../../writing/sections"

export default function Writing() {
	const router = useRouter()
	const { tabIndex, setTabIndex } = useTabContext()
	const [sectionIndex, setSectionIndex] = useState(0)
	const breakpoint = useWindowWidth(DESIGN_MAX_WIDTH)

	useEffect(() => {
		setTabIndex(3)
		setSectionIndex(0)
	}, [])

	return (
		<Layout>
			<Tabs
				as={VStack}
				h="100%"
				w="100%"
				maxW={DESIGN_MAX_WIDTH}
				m="auto"
				index={sectionIndex}
				position="relative"
				onChange={(index: number) => {
					setSectionIndex(index)
					window.scrollTo(0, 0)
				}}
			>
				<Box zIndex={100} position="sticky" top="0" pt={5}>
					<Tablet
						as={Flex}
						w="98%"
						ml="1%"
						justifyContent="space-between"
					>
						<TabList
							gap={!breakpoint ? 2 : 5}
							border="none"
							w="100%"
							justifyContent="space-between"
						>
							<Tab>
								<Image
									src="/icons/robot.svg"
									w="15px"
									mr={!breakpoint ? 0 : 2}
								/>{" "}
								{!breakpoint ? null : " Dear Lambda"}
							</Tab>
							<Tab>
								<Image
									src="/icons/shower.svg"
									mr={!breakpoint ? 0 : 2}
								/>
								{!breakpoint ? null : " Musings"}
							</Tab>
							<Tab>
								<Image
									src="/icons/wand.svg"
									mr={!breakpoint ? 0 : 2}
								/>{" "}
								{!breakpoint ? null : " Poems"}
							</Tab>
							<Tab>
								<Image
									src="/icons/palette.svg"
									mr={!breakpoint ? 0 : 2}
								/>{" "}
								{!breakpoint ? null : " Art"}
							</Tab>
							<Tab>
								<Image
									src="/icons/hammer.svg"
									mr={!breakpoint ? 0 : 2}
								/>{" "}
								{!breakpoint ? null : " Dev Log"}
							</Tab>
						</TabList>
					</Tablet>

					<Box
						bg={BG_COLOR}
						h={16}
						position="absolute"
						w="100%"
						zIndex={-1}
						top={0}
						bgImage={`url("https://www.transparenttextures.com/patterns/dark-exa.png")`}
					/>
				</Box>

				<TabPanels mt="20px">
					{sections.map((section, key1) => (
						<SlideFade
							in={section.refIndex === sectionIndex}
							reverse
							unmountOnExit
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
							<TabPanel
								as={VStack}
								key={`${key1}`}
								w="100%"
								maxW={CONTENT_MAX_WIDTH}
								m="auto"
							>
								<Heading size="3xl">
									{section.title}
								</Heading>
								<Divider
									borderBottom={`1px solid ${gold()}`}
									maxW={CONTENT_MAX_WIDTH}
									margin="20px auto"
								/>
								{/* POST SET */}
								{section.type === SectionTypes.POST && (
									<List w="100%">
										{section.posts.map(
											(post: IPost, key2) => (
												<ListItem
													onClick={() =>
														router.push(post.url)
													}
													p={2}
													bgColor={`${gold(400)}15`}
													borderRadius="999px"
													border={`1px solid ${gold(700)}`}
													transition="all ease 1s"
													as={Flex}
													alignItems="center"
													justifyContent="space-around"
													key={`${key1}-${key2}`}
													_hover={{
														cursor: "pointer",
														bgColor: `${gold(400)}35`,
														border: `1px solid ${gold(
															600
														)}`,
														transition: "all ease 1s",
													}}
												>
													<Heading size="lg">
														{post.subtitle}
													</Heading>
													<Heading size="md">
														{post.date}
													</Heading>
												</ListItem>
											)
										)}
									</List>
								)}

								{/* SCROLL SET */}
								{section.type === SectionTypes.SCROLL && (
									<List w="100%">
										{section.posts.map(
											(post: IPost, key2) => (
												<ListItem
													p={2}
													as={VStack}
													alignItems="center"
													key={`${key1}-${key2}`}
												>
													{post.image && (
														<Image
															borderRadius="10px"
															border={`2px solid ${gold(
																400
															)}`}
															boxShadow={`0 3px 10px 5px ${SHADOW}`}
															src={post.image}
															w="min(450px, 100%)"
															m="20px auto"
														/>
													)}
													{/* <Image src={post.image ?? null} /> */}
													<Heading textDecor={"underline"}>
														{post.subtitle}
													</Heading>
													<Text textAlign="justify">
														{post.content &&
															post.content.map(
																(p, key3) => (
																	<Text
																		key={`${key1}-${key2}-${key3}`}
																	>
																		{p}
																	</Text>
																)
															)}
													</Text>
													{/* <Heading size="md" float="right">
														{post.date}
													</Heading> */}
													<Divider w="100px" m="20px" />
												</ListItem>
											)
										)}
									</List>
								)}

								{/* GRID SET */}
								{section.type === SectionTypes.GRID && (
									<Grid
										templateColumns="repeat(auto-fit, minmax(300px, 1fr))"
										gap={4} // Adjust the gap between grid items as needed
										w="100%" // Make sure the grid fills its parent container
									>
										{section.posts.map(
											(post: IPost, key2) => (
												<GridItem>
													<Image
														src={post.image}
														boxSize="100%" // Make the image a square with a dynamic size
														objectFit="contain" // Ensure the image covers the square container
													/>
												</GridItem>
											)
										)}
									</Grid>
								)}
							</TabPanel>
						</SlideFade>
					))}
				</TabPanels>
			</Tabs>
		</Layout>
	)
}

// const sections = [
// 	{
// 		title: "Dear Lambda",
// 		refIndex: 0,
// 		posts: [
// 			{
// 				image: "/images/art/Is'Ix_2.png",
// 				subtitle: "I See You",
// 				date: "9-10-2023",
// 				url: "/writing/Dear-Lambda/I-See-You",
// 			},
// 		],
// 	},
// ]

{
	/* <WritingSection
							title="Dear Lambda"
							refIndex={0}
							sectionIndex={sectionIndex}
							content={content}
						/>

						<WritingSection
							title="Musings"
							refIndex={1}
							sectionIndex={sectionIndex}
							content={content}
						/>

						<WritingSection
							title="Poems"
							refIndex={2}
							sectionIndex={sectionIndex}
							content={content}
						/>

						<WritingSection
							title="Art"
							refIndex={3}
							sectionIndex={sectionIndex}
							content={content}
						/> */
}
