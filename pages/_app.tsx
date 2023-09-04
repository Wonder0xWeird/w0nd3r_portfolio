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
					content="A portfolio site for w0nd3r (aka Lars Crawford)."
				/>
				{/* Open Graph / Facebook */}
				<meta property="og:type" content="website" />
				<meta
					property="og:url"
					content="https://w0nd3r.rune.love"
				/>
				<meta
					property="og:title"
					content="A portfolio site for w0nd3r (aka Lars Crawford)."
				/>
				<meta
					property="og:description"
					content="A portfolio site for w0nd3r (aka Lars Crawford)."
				/>
				<meta
					property="og:image"
					content="/images/art/ww_logo.png"
				/>

				{/* Twitter */}
				<meta property="twitter:card" content="summary" />
				<meta
					property="twitter:url"
					content="https://w0nd3r.rune.love"
				/>
				<meta
					property="twitter:title"
					content="A portfolio site for w0nd3r (aka Lars Crawford)."
				/>
				<meta
					property="twitter:description"
					content="A portfolio site for w0nd3r (aka Lars Crawford)."
				/>
				{/* Twitter image must be a absolute url */}
				<meta
					property="twitter:image"
					content="https://w0nd3r.rune.love/images/art/ww_logo.png"
				/>
			</Head>
			<Component {...pageProps} />
		</ChakraProvider>
	)
}

export default w0nd3r
