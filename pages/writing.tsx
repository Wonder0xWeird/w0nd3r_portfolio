import { BG_COLOR, DESIGN_MAX_WIDTH } from "@/styles/theme"
import {
	Box,
	Flex,
	Image,
	VStack,
	Tab,
	TabList,
	Tabs,
	SlideFade,
	TabPanels,
} from "@chakra-ui/react"
import Tablet from "components/Tablet"
import useWindowWidth from "@/lib/hooks/window"
import { useEffect, useState } from "react"
import Nav from "@/components/layout/Nav"
import axios from "axios"
import WritingSection from "@/components/writings/WritingSection"

export default function Writing() {
	const [tabIndex, setTabIndex] = useState(0)
	const breakpoint = useWindowWidth(DESIGN_MAX_WIDTH)
	const [content, setContent] = useState([])

	async function getContent(folder: string) {
		await axios
			.post("/api/getWritings", { folder: folder })
			.then((response) => {
				setContent(response.data)
			})
			.catch((error) => {
				console.error(error)
			})
	}

	useEffect(() => {
		getContent("Dear Lambda")
	}, [])

	return (
		<VStack>
			<VStack
				position="fixed"
				left="0"
				h="100vh"
				w="100vw"
				zIndex={-2}
				bgImage={`url("https://www.transparenttextures.com/patterns/dark-exa.png")`}
			>
				<Image
					src="/images/art/Cast spells.png"
					h="90vh"
					bottom="0"
					opacity={0.1}
					position="absolute"
				/>
			</VStack>

			<SlideFade
				in
				reverse={true}
				// unmountOnExit={true}
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
				<Tabs
					as={VStack}
					// minH="100vh"
					zIndex={999}
					w="100%"
					maxW={DESIGN_MAX_WIDTH}
					m="auto"
					index={3}
					position="relative"
				>
					<Nav
						breakpoint={breakpoint}
						setTabIndex={setTabIndex}
						setReadMore={() => null}
					/>
				</Tabs>

				<Tabs
					as={VStack}
					h="100%"
					w="100%"
					maxW={DESIGN_MAX_WIDTH}
					m="auto"
					index={tabIndex}
					position="relative"
					onChange={(index: number) => {
						setTabIndex(index)
						window.scrollTo(0, 0)
					}}
				>
					<Box
						zIndex={100}
						position="sticky"
						top="0"
						pt={5}
					>
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
								justifyContent="space-around"
							>
								<Tab
									onClick={() => getContent("Dear Lambda")}
								>
									<Image
										src="/icons/robot.svg"
										w="15px"
										mr={!breakpoint ? 0 : 2}
									/>{" "}
									{!breakpoint ? null : " Dear Lambda"}
								</Tab>
								<Tab onClick={() => getContent("Musings")}>
									<Image
										src="/icons/shower.svg"
										mr={!breakpoint ? 0 : 2}
									/>
									{!breakpoint ? null : " Musings"}
								</Tab>
								<Tab onClick={() => getContent("Poems")}>
									<Image
										src="/icons/wand.svg"
										mr={!breakpoint ? 0 : 2}
									/>{" "}
									{!breakpoint ? null : " Poems"}
								</Tab>
								<Tab onClick={() => getContent("Art")}>
									<Image
										src="/icons/palette.svg"
										mr={!breakpoint ? 0 : 2}
									/>{" "}
									{!breakpoint ? null : " Art"}
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

					<TabPanels>
						<WritingSection
							title="Dear Lambda"
							refIndex={0}
							tabIndex={tabIndex}
							content={content}
						/>

						<WritingSection
							title="Musings"
							refIndex={1}
							tabIndex={tabIndex}
							content={content}
						/>

						<WritingSection
							title="Poems"
							refIndex={2}
							tabIndex={tabIndex}
							content={content}
						/>

						<WritingSection
							title="Art"
							refIndex={3}
							tabIndex={tabIndex}
							content={content}
						/>
					</TabPanels>
				</Tabs>
			</SlideFade>
		</VStack>
	)
}
