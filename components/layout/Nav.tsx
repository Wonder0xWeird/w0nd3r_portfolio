import { BG_COLOR } from "@/styles/theme"
import {
	Box,
	Flex,
	HStack,
	Image,
	Tab,
	TabList,
} from "@chakra-ui/react"
import { useRouter } from "next/router"
import Tablet from "../Tablet"

export default function Nav({
	breakpoint,
	setTabIndex,
	setReadMore,
}) {
	const router = useRouter()
	const currentPage = router.pathname.split("/")[1]
	console.log("currentPage", currentPage)

	return (
		<Box zIndex={100} position="sticky" top="0" pt={5}>
			<Tablet
				as={Flex}
				w="98%"
				ml="1%"
				justifyContent="space-between"
			>
				<TabList gap={!breakpoint ? 2 : 5} border="none">
					<Tab
						onClick={() => {
							if (currentPage === "writing")
								router.push("/?tabIndex=0")
							setTabIndex(0)
							setReadMore(false)
							window.scrollTo(0, 0)
						}}
					>
						<Image
							src="/icons/user.svg"
							mr={!breakpoint ? 0 : 2}
						/>{" "}
						{!breakpoint ? null : " About"}
					</Tab>
					<Tab
						onClick={() => {
							if (currentPage === "writing")
								router.push("/?tabIndex=1")
							setTabIndex(1)
							setReadMore(false)
							window.scrollTo(0, 0)
						}}
					>
						<Image
							src="/icons/grad-cap.svg"
							mr={!breakpoint ? 0 : 2}
						/>
						{!breakpoint ? null : " Education"}
					</Tab>
					<Tab
						onClick={() => {
							if (currentPage === "writing")
								router.push("/?tabIndex=2")

							setTabIndex(2)
							setReadMore(false)
							window.scrollTo(0, 0)
						}}
					>
						<Image
							src="/icons/projects.svg"
							mr={!breakpoint ? 0 : 2}
						/>{" "}
						{!breakpoint ? null : " Projects"}
					</Tab>
					<Tab onClick={() => router.push("/writing")}>
						<Image
							src="/icons/writing.svg"
							mr={!breakpoint ? 0 : 2}
						/>{" "}
						{!breakpoint ? null : " Writing"}
					</Tab>
				</TabList>
				<HStack spacing={2}>
					{/* <Tablet
      button
      p={3}
      onClick={() =>
        (window.location.href =
          "mailto:crawford.lars@gmail.com")
      }
    >
      <Image src="/icons/google.svg" />
    </Tablet> */}
					<Tablet
						button
						p={!breakpoint ? 1 : 3}
						onClick={() =>
							router.push(
								"https://twitter.com/wonder0xweird"
							)
						}
					>
						<Image src="/icons/x.svg" />
					</Tablet>
					<Tablet
						button
						p={!breakpoint ? 1 : 3}
						onClick={() =>
							router.push(
								"https://github.com/Wonder0xWeird"
							)
						}
					>
						<Image src="/icons/github.svg" />
					</Tablet>
					<Tablet
						button
						p={!breakpoint ? 1 : 3}
						onClick={() =>
							router.push(
								"https://www.linkedin.com/in/larscrawford/"
							)
						}
					>
						<Image src="/icons/linkedin.svg" />
					</Tablet>
					<Image
						w={!breakpoint ? "30px" : "45px"}
						src="/images/art/ww_logo.png"
					/>
				</HStack>
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
	)
}
