import * as React from "react"
import { ChakraProvider } from "@chakra-ui/react"
import { AppProps } from "next/app"
import theme from "styles/theme"
import "styles/global.css"

function w0nd3r({ Component, pageProps }: AppProps) {
	return (
		<ChakraProvider theme={theme}>
			<Component {...pageProps} />
		</ChakraProvider>
	)
}

export default w0nd3r
