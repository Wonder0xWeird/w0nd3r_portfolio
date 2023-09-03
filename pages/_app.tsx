import * as React from "react"
import { ChakraProvider } from "@chakra-ui/react"
import { AppProps } from "next/app"
import theme from "styles/theme"
import "styles/global.css"
import Head from "next/head"

function w0nd3r({ Component, pageProps }: AppProps) {
	return (
		<ChakraProvider theme={theme}>
			<Head>
				{/* Primary Meta Tags */}
				<title>w0nd3r</title>
				<link
					rel="icon"
					type="image/x-icon"
					href="/images/art/ww_logo.png"
				/>
				<meta name="title" content="w0nd3r" />
				<meta
					name="description"
					content="w0nd3r's portfolio website"
				/>
			</Head>
			<Component {...pageProps} />
		</ChakraProvider>
	)
}

export default w0nd3r
