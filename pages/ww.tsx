import React from "react"
import { VStack, Image } from "@chakra-ui/react"

const TestPage = () => {
	return (
		<VStack
			position="fixed"
			left="0"
			h="100vh"
			w="100vw"
			zIndex={-2}
			bgImage={`url("https://www.transparenttextures.com/patterns/dark-exa.png")`}
			align="center"
			justify="center"
		>
			<Image w="300px" src="/images/art/ww_logo.png" />
		</VStack>
	)
}

export default TestPage
