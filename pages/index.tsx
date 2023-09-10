import { DESIGN_MAX_WIDTH } from "@/styles/theme"
import { VStack, TabPanels, Tabs } from "@chakra-ui/react"
import About from "@/components/home/About"
import Education from "@/components/home/Education"
import Projects from "@/components/home/Projects"
import { useTabContext } from "./_app"
import Layout from "@/components/layout"

export default function Home() {
	const { tabIndex, setTabIndex } = useTabContext()

	return (
		<Layout>
			<Tabs
				as={VStack}
				minH="100vh"
				w="100%"
				maxW={DESIGN_MAX_WIDTH}
				m="auto"
				index={tabIndex}
				position="relative"
			>
				<TabPanels>
					<About tabIndex={tabIndex} />
					<Education tabIndex={tabIndex} />
					<Projects tabIndex={tabIndex} />
				</TabPanels>
			</Tabs>
		</Layout>
	)
}
