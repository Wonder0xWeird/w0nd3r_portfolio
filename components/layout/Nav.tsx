import {
	BG_COLOR,
	DESIGN_MAX_WIDTH,
	gold,
} from "@/styles/theme"
import {
	Box,
	Button,
	Flex,
	HStack,
	Image,
} from "@chakra-ui/react"
import { useRouter } from "next/router"
import Tablet from "../Tablet"
import useWindowWidth from "@/lib/hooks/window"
import { useTabContext } from "@/pages/_app"

export default function Nav() {
	const { tabIndex, setTabIndex } = useTabContext()
	const router = useRouter()
	const breakpoint = useWindowWidth(DESIGN_MAX_WIDTH)

	return (
		<Box zIndex={999} position="sticky" top="0" pt={5}>
			<Tablet
				as={Flex}
				w="98%"
				ml="1%"
				justifyContent="space-between"
			>
				<HStack gap={!breakpoint ? 2 : 5} border="none">
					<Button
						bg={tabIndex === 0 && `${gold()}25`}
						variant="brand"
						onClick={() => {
							router.push("/")
							setTabIndex(0)
							window.scrollTo(0, 0)
						}}
					>
						<Image
							src="/icons/user.svg"
							mr={!breakpoint ? 0 : 2}
						/>{" "}
						{!breakpoint ? null : " About"}
					</Button>
					<Button
						bg={tabIndex === 1 && `${gold()}25`}
						variant="brand"
						onClick={() => {
							router.push("/")
							setTabIndex(1)
							window.scrollTo(0, 0)
						}}
					>
						<Image
							src="/icons/grad-cap.svg"
							mr={!breakpoint ? 0 : 2}
						/>
						{!breakpoint ? null : " Education"}
					</Button>
					<Button
						bg={tabIndex === 2 && `${gold()}25`}
						variant="brand"
						onClick={() => {
							router.push("/")
							console.log("setting tab index to 2")
							setTabIndex(2)
							window.scrollTo(0, 0)
						}}
					>
						<Image
							src="/icons/projects.svg"
							mr={!breakpoint ? 0 : 2}
						/>{" "}
						{!breakpoint ? null : " Projects"}
					</Button>
					<Button
						bg={tabIndex === 3 && `${gold()}25`}
						variant="brand"
						onClick={() => {
							router.push("/writing")
							setTabIndex(3)
						}}
					>
						<Image
							src="/icons/writing.svg"
							mr={!breakpoint ? 0 : 2}
						/>{" "}
						{!breakpoint ? null : " Writing"}
					</Button>
				</HStack>
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
