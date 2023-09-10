import { Image, VStack, SlideFade } from "@chakra-ui/react"
import Nav from "@/components/layout/Nav"
import { DESIGN_MAX_WIDTH } from "@/styles/theme"

export default function Layout({ children }) {
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
				reverse
				unmountOnExit
				offsetY="50px"
				style={{
					width: "100%",
					maxWidth: DESIGN_MAX_WIDTH,
				}}
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
				<Nav />

				{children}
			</SlideFade>
		</VStack>
	)
}
