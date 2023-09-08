import { BG_COLOR, DESIGN_MAX_WIDTH } from "@/styles/theme"
import {
	Box,
	Flex,
	Image,
	VStack,
	Tab,
	TabList,
	TabPanels,
	Tabs,
	HStack,
	SlideFade,
} from "@chakra-ui/react"
import Tablet from "components/Tablet"
import { useState } from "react"
import { useRouter } from "next/router"
import useWindowWidth from "@/lib/hooks/window"
import About from "@/components/home/About"
import Education from "@/components/home/Education"
import Projects from "@/components/home/Projects"
import Nav from "@/components/layout/Nav"

export async function getServerSideProps(context) {
	const { query } = context
	let initTab = parseInt(query.tabIndex as string) ?? 0
	if (initTab > 2 || isNaN(initTab)) initTab = 0
	return {
		props: { initTab },
	}
}

export default function Home({ initTab }) {
	const router = useRouter()
	const [tabIndex, setTabIndex] = useState(initTab)
	const [readMore, setReadMore] = useState(false)

	const breakpoint = useWindowWidth(DESIGN_MAX_WIDTH)

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
					minH="100vh"
					w="100%"
					maxW={DESIGN_MAX_WIDTH}
					m="auto"
					index={tabIndex}
					position="relative"
				>
					<Nav
						breakpoint={breakpoint}
						setTabIndex={setTabIndex}
						setReadMore={setReadMore}
					/>

					<TabPanels>
						<About
							tabIndex={tabIndex}
							breakpoint={breakpoint}
							readMore={readMore}
							setReadMore={setReadMore}
						/>

						<Education
							tabIndex={tabIndex}
							breakpoint={breakpoint}
							readMore={readMore}
							setReadMore={setReadMore}
						/>

						<Projects tabIndex={tabIndex} />
					</TabPanels>
				</Tabs>
			</SlideFade>
		</VStack>
	)
}
