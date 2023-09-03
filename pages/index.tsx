import {
	BG_COLOR,
	DESIGN_MAX_WIDTH,
	SHADOW,
	gold,
	grey,
} from "@/styles/theme"
import {
	Box,
	Heading,
	Text,
	Flex,
	Image,
	VStack,
	Tab,
	TabList,
	TabPanel,
	TabPanels,
	Tabs,
	SlideFade,
	HStack,
	Collapse,
	Divider,
	Link,
	List,
	ListItem,
	UnorderedList,
	Grid,
	GridItem,
	Wrap,
} from "@chakra-ui/react"
import Tablet from "components/Tablet"
import { useState } from "react"
import { useRouter } from "next/router"
import useWindowWidth from "@/lib/hooks/window"

export default function Home() {
	const router = useRouter()
	const [tabIndex, setTabIndex] = useState(0)
	const [readMore, setReadMore] = useState(false)

	const breakpoint = useWindowWidth(DESIGN_MAX_WIDTH)

	return (
		<Tabs
			as={VStack}
			minH="100vh"
			maxW={DESIGN_MAX_WIDTH}
			m="auto"
			index={tabIndex}
			onChange={(index: number) => {
				setTabIndex(index)
				setReadMore(false)
				window.scrollTo(0, 0)
			}}
			position="relative"
		>
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

			<Box zIndex={100} position="sticky" top="0" pt={5}>
				<Tablet
					as={Flex}
					w="98%"
					ml="1%"
					justifyContent="space-between"
				>
					<TabList gap={breakpoint ? 5 : 2} border="none">
						<Tab>
							<Image
								src="/icons/user.svg"
								w="15px"
								mr={breakpoint ? 2 : 0}
							/>{" "}
							{breakpoint ? " About" : null}
						</Tab>
						<Tab>
							<Image
								src="/icons/grad-cap.svg"
								mr={breakpoint ? 2 : 0}
							/>
							{breakpoint ? " Education" : null}
						</Tab>
						<Tab>
							{" "}
							<Image
								src="/icons/projects.svg"
								mr={breakpoint ? 2 : 0}
							/>{" "}
							{breakpoint ? " Projects" : null}
						</Tab>
					</TabList>
					<HStack spacing={breakpoint ? 5 : 2}>
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
							p={breakpoint ? 3 : 1}
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
							p={breakpoint ? 3 : 1}
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
							p={breakpoint ? 3 : 1}
							onClick={() =>
								router.push(
									"https://www.linkedin.com/in/larscrawford/"
								)
							}
						>
							<Image src="/icons/linkedin.svg" />
						</Tablet>
						<Image
							w={breakpoint ? "50px" : "30px"}
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

			<TabPanels>
				<SlideFade
					in={tabIndex === 0}
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
					<TabPanel as={VStack} spacing={0}>
						<Flex
							align={breakpoint ? "start" : "center"}
							direction={breakpoint ? "row" : "column"}
						>
							<Image
								borderRadius="100%"
								border={`2px solid ${gold(400)}`}
								boxShadow={`0 3px 10px 5px ${SHADOW}`}
								src="/images/w0nd3r_headshot.png"
								alt="w0nd3r headshot"
								boxSize={breakpoint ? "450px" : "300px"}
								transition="all ease 0.25s"
							/>

							<VStack
								ml={5}
								align={breakpoint ? "start" : "center"}
								spacing={4}
							>
								<Heading
									fontSize="80px"
									transition="all ease 0.25s"
								>
									Hi, I'm{" "}
									<span
										style={{
											color: `${gold()}`,
										}}
									>
										w0nd3r
									</span>
								</Heading>
								<Text fontSize="18px" mr="20px">
									Also known as{" "}
									<span
										style={{
											color: `${gold()}`,
										}}
									>
										Lars Crawford
									</span>
									, I am extremely passionate about the
									future and continuously seek to
									participate in its arrival by pursuing the
									development of novel concepts and
									technologies.
								</Text>
								<Text fontSize="18px" mr="20px">
									I was formally trained as a{" "}
									<span
										style={{ textDecoration: "underline" }}
									>
										Neural Engineer at the University of
										Washington
									</span>
									, but more recently have pivoted to{" "}
									<span
										style={{ textDecoration: "underline" }}
									>
										{" "}
										Full Stack Web Development
									</span>{" "}
									in order to contribute to the ongoing Web3
									renessaince.
								</Text>
								<Text fontSize="18px" mr="20px">
									Overall, I am optimistic, enthusiastic,
									self-motivated, organized, a quick and
									voracious learner, and keenly interested
									in applying my expertise and passion
									toward imagining and building the future.
								</Text>
								<Text fontSize="18px" mr="20px">
									And yes, I do have a Padewan braid as I am
									forever a student :)
								</Text>
							</VStack>
						</Flex>

						<Divider
							margin="40px auto"
							width="140px!important"
							opacity={0.24}
						/>

						<Flex
							align={breakpoint ? "start" : "center"}
							direction={breakpoint ? "row" : "column"}
						>
							<VStack
								borderRadius="100%"
								border={`2px solid ${gold(400)}`}
								boxShadow={`0 3px 10px 5px ${SHADOW}`}
								bgImage="/images/Coco Slurper.gif"
								bgSize="cover"
								bgPosition="center"
								boxSize="300px"
								position="relative"
								mb={breakpoint ? 0 : 5}
							>
								<Heading
									pos="absolute"
									size="md"
									bottom="20%"
								>
									Koko Slurper
								</Heading>
							</VStack>
							<VStack ml={5} spacing={4}>
								<VStack spacing={0}>
									<Text fontSize="20px">
										My{" "}
										<span
											style={{
												color: `${gold()}`,
											}}
										>
											Massive Transformative Purpose
										</span>{" "}
										is
									</Text>
									<Heading size="xl">
										To make{" "}
										<span
											style={{
												fontSize: "50px",
												color: `${gold()}`,
											}}
										>
											play
										</span>{" "}
										the only task.
									</Heading>
								</VStack>
								<List spacing={0}>
									<ListItem fontSize="18px">
										<span
											style={{
												fontSize: "30px",
												color: `${gold()}`,
											}}
										>
											Play
										</span>{" "}
										means you are secure.
									</ListItem>
									<ListItem fontSize="18px">
										<span
											style={{
												fontSize: "30px",
												color: `${gold()}`,
											}}
										>
											Play
										</span>{" "}
										means you are healthy.
									</ListItem>
									<ListItem fontSize="18px">
										<span
											style={{
												fontSize: "30px",
												color: `${gold()}`,
											}}
										>
											Play
										</span>{" "}
										means you are free.
									</ListItem>
									<ListItem fontSize="18px">
										<span
											style={{
												fontSize: "30px",
												color: `${gold()}`,
											}}
										>
											Play
										</span>{" "}
										means you are loved.
									</ListItem>
									<br />
									<ListItem fontSize="18px">
										<span
											style={{
												fontSize: "30px",
												color: `${gold()}`,
											}}
										>
											Play
										</span>{" "}
										means you are learning.
									</ListItem>
									<ListItem fontSize="18px">
										<span
											style={{
												fontSize: "30px",
												color: `${gold()}`,
											}}
										>
											Play
										</span>{" "}
										means you are growing.
									</ListItem>
									<ListItem fontSize="18px">
										<span
											style={{
												fontSize: "30px",
												color: `${gold()}`,
											}}
										>
											Play
										</span>{" "}
										means you are moving.
									</ListItem>
									<ListItem fontSize="18px">
										<span
											style={{
												fontSize: "30px",
												color: `${gold()}`,
											}}
										>
											Play
										</span>{" "}
										means you are making.
									</ListItem>
								</List>
							</VStack>
							<VStack
								borderRadius="100%"
								border={`2px solid ${gold(400)}`}
								boxShadow={`0 3px 10px 5px ${SHADOW}`}
								bgImage="/images/Charcola.gif"
								bgSize="cover"
								bgPosition="center"
								boxSize="300px"
								transform="scaleX(-1)"
								mt={breakpoint ? 0 : 5}
							>
								<Heading
									pos="absolute"
									size="md"
									bottom="20%"
									transform="scaleX(-1)"
								>
									Charkola
								</Heading>
							</VStack>
						</Flex>
						<List spacing={2} pt={4}>
							<ListItem fontSize="20px" textAlign="center">
								<span
									style={{
										fontSize: "24px",
										color: `${gold()}`,
									}}
								>
									Play
								</span>{" "}
								is the simplest and most profound of basic
								sciences. It is one which all humans are
								born knowing how to do.
							</ListItem>
							<ListItem fontSize="20px" textAlign="center">
								The joyous creations made during acts of{" "}
								<span
									style={{
										fontSize: "24px",
										color: `${gold()}`,
									}}
								>
									play
								</span>{" "}
								have a tendency to positively impact the
								world in unforseeable yet significant ways.
							</ListItem>
							<ListItem fontSize="20px" textAlign="center">
								The ultimate goal of my{" "}
								<span
									style={{
										fontSize: "24px",
										color: `${gold()}`,
									}}
								>
									MTP
								</span>{" "}
								is to help bring more joy to the world by
								first creating cooperative games that people
								can play with their friends and loved ones,
								and then, more broadly, helping humanity
								transition to a world where{" "}
								<span
									style={{
										fontSize: "24px",
										color: `${gold()}`,
									}}
								>
									play
								</span>{" "}
								is the only task.
							</ListItem>
						</List>

						<Collapse in={readMore}>
							<Divider
								margin="40px auto"
								width="140px!important"
								opacity={0.24}
							/>
							<List spacing={4}>
								<ListItem
									fontSize="18px"
									textAlign="justify"
								>
									Inspired by Ray Kurzweil's "The
									Singularity is Near," I spent the first
									decade of my professional life pursuing
									the development of Brain Computer
									Interface devices, ostensibly to help
									people with neurological conditions in the
									near term, but more deeply as a means to
									contribute to humanity's ability to
									integrate with the approaching
									technological singularity and the digital
									beings who are now rapidly becoming our
									peers. I still believe that human-machine
									interfacing has the potential to{" "}
									<span
										style={{
											color: `${gold()}`,
										}}
									>
										play
									</span>{" "}
									a significant role in the future of
									humanity and its immersion in our shared
									digital world.
								</ListItem>
								<ListItem
									fontSize="18px"
									textAlign="justify"
								>
									However, as a result of severe burnout, I
									have shifted my energy toward pursuing joy
									and{" "}
									<span
										style={{
											color: `${gold()}`,
										}}
									>
										play
									</span>{" "}
									as a first order goal, instead seeking to
									build web3-enabled games as a near-term
									career path. As a life-long gamer, I
									believe that games are a powerful medium
									for the production of pure joy, lively
									social interaction, and life-long
									learning. For example, Axie Infinity, the
									gaming ecosystem I am building in, served
									as an incredible catalyst to teach me
									everything I know about the benefits of
									blockchain technology, and I hope the
									games I build will contribute to this
									effort as well. But more than that, the
									act of building games actually brings me
									joy moment-to-moment, something that I
									struggled to find in my lab-based work.
								</ListItem>
								<ListItem
									fontSize="18px"
									textAlign="justify"
								>
									Furthermore, as Digital Intelligence,
									humanity's collective progeny, continues
									to grow, learn and contribute to our
									civilization, I believe that there will
									soon come a time where the function of
									work as we know it will come to an end,
									and the final task remaining for humans
									will be to{" "}
									<span
										style={{
											color: `${gold()}`,
										}}
									>
										play
									</span>
									.
								</ListItem>
								<ListItem
									fontSize="18px"
									textAlign="justify"
								>
									I am committed to helping build a future
									that maximizes joy for all.
								</ListItem>
							</List>
						</Collapse>

						<Heading
							size="sm"
							display="flex"
							color={`${gold()}`}
							alignSelf="end"
							mr={5}
							pt={4}
							onClick={() => setReadMore(!readMore)}
							cursor="pointer"
						>
							{!readMore ? "Read more " : "Read less "}
							<Image
								src={`/icons/${
									!readMore ? "down" : "up"
								}.svg`}
								ml={2}
							/>
						</Heading>
					</TabPanel>
				</SlideFade>

				<SlideFade
					in={tabIndex === 1}
					reverse={true}
					unmountOnExit={true}
					offsetY="50px"
					style={{ width: "100%" }}
					transition={{
						enter: {
							duration: 0.4,
							delay: 0.25,
						},
					}}
				>
					<TabPanel as={VStack} spacing={5}>
						<Flex
							align={breakpoint ? "start" : "center"}
							direction={breakpoint ? "row" : "column"}
						>
							<Image
								borderRadius="100%"
								border={`2px solid ${gold(400)}`}
								boxShadow={`0 3px 10px 5px ${SHADOW}`}
								src="/images/w0nd3r_grad.jpg"
								alt="w0nd3r headshot"
								boxSize="300px"
								transition="all ease 0.25s"
							/>

							<VStack
								ml={5}
								align={breakpoint ? "start" : "center"}
								spacing={4}
							>
								<Heading
									fontSize="60px"
									transition="all ease 0.25s"
									textAlign={
										breakpoint ? "start" : "center"
									}
								>
									<span
										style={{
											color: `${gold()}`,
										}}
									>
										Lars Crawford
									</span>
									, PhD
								</Heading>
								<VStack align="start" spacing={2}>
									<Text fontSize="30px">
										Doctor of Philosophy - University of
										Washington, 2021
									</Text>
									<Text fontSize="18px">
										<span
											style={{
												textDecoration: "underline",
											}}
										>
											Dual Title Degree Program:
										</span>{" "}
										Bioengineering & Nanotechnology and
										Molecular Engineering
									</Text>
									<Text fontSize="18px">
										<span
											style={{
												textDecoration: "underline",
											}}
										>
											Dissertation:
										</span>{" "}
										Toward a Wholly Organic Immunomodulatory
										Neuroelectronic Interface
									</Text>
									<Text fontSize="18px">
										<span
											style={{
												textDecoration: "underline",
											}}
										>
											Advisor:
										</span>{" "}
										Professor Buddy Ratner
									</Text>
								</VStack>

								<VStack
									alignSelf="start"
									align="start"
									spacing={0}
								>
									<Text fontSize="30px">
										Bachelor of Science - University of
										Washington, 2014
									</Text>
									<Text fontSize="18px">
										<span
											style={{
												textDecoration: "underline",
											}}
										>
											Degree Program:
										</span>{" "}
										Neurobiology & Computational
										Neuroscience
									</Text>
								</VStack>
							</VStack>
						</Flex>

						<Divider
							margin="36px auto"
							width="140px!important"
							opacity={0.24}
						/>

						<VStack
							align={breakpoint ? "start" : "center"}
							spacing={4}
						>
							<Flex w="100%" justifyContent="space-between">
								<Box
									borderRadius="30px"
									border={`2px solid ${gold(400)}`}
									boxShadow={`0 3px 10px 5px ${SHADOW}`}
									bgImage="/images/science/6s.jpg"
									bgSize="cover"
									bgPosition="center"
									boxSize={
										breakpoint ? "200px" : "max(60px, 15vw)"
									}
								/>
								<Box
									borderRadius="30px"
									border={`2px solid ${gold(400)}`}
									boxShadow={`0 3px 10px 5px ${SHADOW}`}
									bgImage="/images/science/seeded scaffold.jpg"
									bgSize="cover"
									bgPosition="center"
									boxSize={
										breakpoint ? "200px" : "max(60px, 15vw)"
									}
								/>
								<Box
									borderRadius="30px"
									border={`2px solid ${gold(400)}`}
									boxShadow={`0 3px 10px 5px ${SHADOW}`}
									bgImage="/images/science/gelectrode.png"
									bgSize="cover"
									bgPosition="center"
									boxSize={
										breakpoint ? "200px" : "max(60px, 15vw)"
									}
								/>
								<Box
									borderRadius="30px"
									border={`2px solid ${gold(400)}`}
									boxShadow={`0 3px 10px 5px ${SHADOW}`}
									bgImage="/images/science/Rapid Photochemical CH Synthesis.png"
									bgSize="contain"
									bgPosition="center"
									boxSize={
										breakpoint ? "200px" : "max(60px, 15vw)"
									}
								/>
								<Box
									borderRadius="30px"
									border={`2px solid ${gold(400)}`}
									boxShadow={`0 3px 10px 5px ${SHADOW}`}
									bgImage="/images/science/Immunohistochemistry.tif"
									bgSize="cover"
									bgPosition="center"
									boxSize={
										breakpoint ? "200px" : "max(60px, 15vw)"
									}
								/>
							</Flex>

							<VStack spacing="0!important">
								<Heading
									fontSize="24px"
									transition="all ease 0.25s"
									textDecor="underline"
									pb={4}
									textAlign="center"
								>
									Toward a Wholly Organic Immunomodulatoy
									Neuroelectronic Interface
								</Heading>

								<Text fontSize="18px" textAlign="justify">
									The neuroelectronic interface is a
									fascinating and powerful tool for enabling
									direct electrochemical interaction with
									the central and peripheral nervous systems
									as a means to alleviate symptoms of
									debilitating neurological conditions. As
									the name implies, successful design and
									implementation of such systems requires a
									unique combination of neurobiological
									knowhow and engineering execution.
								</Text>

								<Collapse in={readMore}>
									<VStack align="start" spacing={2} pt={3}>
										<Text
											fontSize="18px"
											textAlign="justify"
										>
											A long and fruitful history of
											neuroscience investigation coupled
											with the more recent rise of
											microfabrication techniques and
											high-powered digital computing systems
											places the present engineering
											endeavors in a position to contribute
											significantly and meaningfully to
											solutions for these severest of
											conditions.
										</Text>
										<Text
											fontSize="18px"
											textAlign="justify"
										>
											Indeed, devices of this nature are
											already commercially available and
											more still are in development.
										</Text>
										<Text
											fontSize="18px"
											textAlign="justify"
										>
											However, interfacing robustly with
											this most delicate of human tissues,
											the brain, still presents a major
											challenge to the long-term success of
											these devices as a result of the
											prolific neuroinflammatory response to
											implanted materials which is still not
											fully understood. This complex and
											dynamic immune reaction is driven not
											only by the implantation procedure,
											but also by the materials chosen for
											the device itself.
										</Text>
										<Text
											fontSize="18px"
											textAlign="justify"
										>
											A primary research thrust in this
											space thus involves the design and
											optimization of devices which may not
											only limit the severity of this immune
											reaction but also actively modulate it
											toward more pro-regenerative outcomes.
											Central to this effort is the
											integration of material classes which
											enable control over multiple
											properties of the device
											simultaneously including
											microarchitecture, mechanical
											compliance, electrochemical activity,
											and the delivery of biomolecular cues.
										</Text>
										<Text
											fontSize="18px"
											textAlign="justify"
										>
											The preliminary work and proposed
											future exploration presented in this
											dissertation aim to contribute to the
											neuroelectronic interface design
											toolbox a set of new methods for
											synthesizing soft electronic materials
											and new understanding into the
											mechanisms behind the
											neuroinflammatory response. The
											ultimate goal of this venture is
											therefore to enable and promote the
											creation of a wholly organic,
											immunomodulatory neuroelectronic
											interface which may be translated into
											a robust medical device to improve the
											lives of those suffering from
											life-long neurological conditions.
										</Text>
									</VStack>
								</Collapse>

								<Heading
									size="sm"
									display="flex"
									color={`${gold()}`}
									alignSelf="end"
									mr={5}
									pt={4}
									onClick={() => setReadMore(!readMore)}
									cursor="pointer"
								>
									{!readMore ? "Read more " : "Read less "}
									<Image
										src={`/icons/${
											!readMore ? "down" : "up"
										}.svg`}
										ml={2}
									/>
								</Heading>
							</VStack>

							<Divider
								margin="36px auto"
								width="140px!important"
								opacity={0.24}
							/>

							<VStack ml={5} align="start" spacing={4}>
								<Heading
									fontSize="24px"
									transition="all ease 0.25s"
									textDecor="underline"
									pb={4}
								>
									Publications & Patents
								</Heading>
								<Text fontSize="18px">
									1. Crawford, Lars M. "Toward a Wholly
									Organic, Immunomodulatory Neuroelectronic
									Interface." Doctoral Dissertation,
									University of Washington, 2021.{" "}
									<Link
										wordBreak="break-word"
										color={gold()}
										href="https://proquest.com/docview/2596065608"
									>
										proquest.com/docview/2596065608
									</Link>
								</Text>

								<Text fontSize="18px">
									2. Crawford, L., Wyatt, M., Bryers, J., &
									Ratner, B. "Biocompatibility Evolves:
									Phenomenology to Toxicology to
									Regeneration." Advanced Healthcare
									Materials 10.11 (2021): 2002153.{" "}
									<Link
										wordBreak="break-word"
										color={gold()}
										href="https://doi.org/10.1002/adhm.202002153"
									>
										doi.org/10.1002/adhm.202002153
									</Link>
								</Text>

								<Text fontSize="18px">
									3. Ratner, Buddy D., and Lars Crawford.
									"One-pot photochemical synthesis
									methodology for conductive hydrogel
									fabrication." U.S. Patent Application No.
									17/357,887. (Patent Pending){" "}
									<Link
										wordBreak="break-word"
										color={gold()}
										href="https://patents.google.com/patent/US20210403613A1/en"
									>
										patents.google.com/patent/US20210403613A1/en
									</Link>
								</Text>

								<Text fontSize="18px">
									4. Ratner, Buddy D., and Lars Crawford.
									"Heterogeneous Unit Cells and Composites
									Containing the Same." U.S. Provisional
									Patent Application No. 63/216,249.
									(Provisional Patent)
								</Text>
							</VStack>

							<Divider
								margin="36px auto"
								width="140px!important"
								opacity={0.24}
							/>

							<VStack ml={5} align="start" spacing={4}>
								<Heading
									fontSize="24px"
									transition="all ease 0.25s"
									textDecor="underline"
									pb={4}
								>
									Honors & Awards
								</Heading>
								<UnorderedList spacing={2}>
									<ListItem fontSize="18px">
										1 st Place Tissue Engineering Special
										Interest Group Poster Award – Society
										for Biomaterials (4/19)
									</ListItem>

									<ListItem fontSize="18px">
										Best Poster Presentation –
										Neuroelectronic Interfaces, Gordon
										Research Conference (4/18)
									</ListItem>
									<ListItem fontSize="18px">
										{" "}
										Foster + Jones Accelerator Program,
										Multimodal Health Inc. (7/15)
									</ListItem>
									<ListItem fontSize="18px">
										{" "}
										University of Washington Business Plan
										Competition 3rd place, Multimodal Health
										Inc. (4/16)
									</ListItem>
									<ListItem fontSize="18px">
										University of Washington
										Commercialization Fellow, Multimodal
										Health Inc. (1/15)
									</ListItem>
									<ListItem fontSize="18px">
										University of Washington Business Plan
										Competition 4th place, Multimodal Health
										Inc. (4/15)
									</ListItem>
									<ListItem fontSize="18px">
										University of Washington
										Commercialization Gap Fund, Multimodal
										Health Inc. (11/14)
									</ListItem>
									<ListItem fontSize="18px">
										Center for Neurotechnology Tech Studio
										Competition 1st Place (3/14)
									</ListItem>
									<ListItem fontSize="18px">
										Computational Neuroscience Training
										Grant (8/13)
									</ListItem>
									<ListItem fontSize="18px">
										University of Washington Honors
										Achievement Award (8/10)
									</ListItem>
									<ListItem fontSize="18px">
										Dean’s List, University of Washington,
										Quarterly 2011-14
									</ListItem>
								</UnorderedList>
							</VStack>
						</VStack>
					</TabPanel>
				</SlideFade>

				<SlideFade
					in={tabIndex === 2}
					reverse={true}
					unmountOnExit={true}
					offsetY="50px"
					style={{ width: "100%" }}
					transition={{
						enter: {
							duration: 0.4,
							delay: 0.25,
						},
					}}
				>
					<TabPanel as={VStack} spacing={5}>
						<Grid
							w="100%"
							templateColumns="repeat(auto-fill, minmax(300px, 1fr))"
							gap={4}
						>
							<GridItem
								as={VStack}
								borderRadius="24px"
								border={`1px solid ${gold(400)}`}
								boxShadow={`0 3px 10px 5px ${SHADOW}`}
								overflow="hidden"
								backgroundImage={`linear-gradient(185deg, ${grey(
									700
								)}, ${grey(800)})`}
								cursor="pointer"
								onClick={() =>
									router.push(
										"https://briefing.beezle.buzz"
									)
								}
							>
								<VStack
									bgImage="/images/Beezlebop.gif"
									bgSize="cover"
									bgPosition="center"
									h="300px"
									w="100%"
									position="relative"
									borderBottom={`1px solid ${gold()} `}
								>
									<Heading
										pos="absolute"
										size="md"
										bottom="15%"
									>
										Beezlebop
									</Heading>
								</VStack>
								<VStack p={4} spacing={4}>
									<Heading>Beezlbop's Blunder</Heading>
									<Text fontSize="18px">
										A multiplayer rogue-lite dungeon crawler
										set in the Axie Infinity universe.
									</Text>
									<Wrap fontSize="18px">
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											Phaser.js
										</Text>
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											EasyStar.js
										</Text>
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											Socket.io
										</Text>
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											Next.js
										</Text>
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											Chakra-UI
										</Text>
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											MongoDB
										</Text>
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											Mongoose.js
										</Text>
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											Ethers.js
										</Text>
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											TypeScript
										</Text>
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											Node.js
										</Text>
									</Wrap>
								</VStack>
							</GridItem>

							<GridItem
								as={VStack}
								borderRadius="24px"
								border={`1px solid ${gold(400)}`}
								boxShadow={`0 3px 10px 5px ${SHADOW}`}
								overflow="hidden"
								backgroundImage={`linear-gradient(185deg, ${grey(
									700
								)}, ${grey(800)})`}
								cursor="pointer"
								onClick={() =>
									router.push(
										"https://marketplace.skymavis.com/collections/ronin:97797358f0d12aee117209c15d964ee0022bf1aa"
									)
								}
							>
								<VStack
									bgImage="/images/sidekick321.gif"
									bgSize="cover"
									bgPosition="bottom"
									h="300px"
									w="100%"
									position="relative"
									borderBottom={`1px solid ${gold()} `}
								/>
								<VStack p={4} spacing={4}>
									<Heading>Sidekicks</Heading>
									<Text fontSize="18px">
										The first 3rd party NFT deployed on the
										Ronin Blockchain!
									</Text>
									<Wrap fontSize="18px">
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											Solidity
										</Text>
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											Hardhat.js
										</Text>
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											Ethers.js
										</Text>
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											NFT.Storage
										</Text>
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											IPFS
										</Text>
									</Wrap>
								</VStack>
							</GridItem>

							<GridItem
								as={VStack}
								borderRadius="24px"
								border={`1px solid ${gold(400)}`}
								boxShadow={`0 3px 10px 5px ${SHADOW}`}
								overflow="hidden"
								backgroundImage={`linear-gradient(185deg, ${grey(
									700
								)}, ${grey(800)})`}
								cursor="pointer"
								onClick={() =>
									router.push("https://doll.tioland.com")
								}
							>
								<VStack
									bgImage="/images/DoLL_banner.jpg"
									bgSize="cover"
									bgPosition="center"
									h="300px"
									w="100%"
									position="relative"
									borderBottom={`1px solid ${gold()} `}
								/>
								<VStack p={4} spacing={4}>
									<Heading>Axie DoLL</Heading>
									<Text fontSize="18px">
										A fast-paced, action survival game set
										in the Axie Infinity universe.
									</Text>
									<Wrap fontSize="18px">
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											Next.js
										</Text>
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											Chakra-UI
										</Text>
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											MongoDB
										</Text>
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											Mongoose.js
										</Text>
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											GraphQL
										</Text>
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											Ethers.js
										</Text>
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											Express.js
										</Text>
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											TypeScript
										</Text>
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											Node.js
										</Text>
									</Wrap>
								</VStack>
							</GridItem>

							<GridItem
								as={VStack}
								borderRadius="24px"
								border={`1px solid ${gold(400)}`}
								boxShadow={`0 3px 10px 5px ${SHADOW}`}
								overflow="hidden"
								backgroundImage={`linear-gradient(185deg, ${grey(
									700
								)}, ${grey(800)})`}
								cursor="pointer"
								onClick={() =>
									router.push(
										"https://siwr-starter-pack.vercel.app/"
									)
								}
							>
								<VStack
									bgImage="/images/siwr.png"
									bgSize="cover"
									bgPosition="center"
									h="300px"
									w="100%"
									position="relative"
									borderBottom={`1px solid ${gold()} `}
								/>
								<VStack p={4} spacing={4}>
									<Heading>SIWR Starter Pack</Heading>
									<Text fontSize="18px">
										Demo and tutorial site for the Sign In
										With Ronin (SIWR) authentication system.
									</Text>
									<Wrap fontSize="18px">
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											Next.js
										</Text>
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											Chakra-UI
										</Text>
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											MongoDB
										</Text>
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											Mongoose.js
										</Text>
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											GraphQL
										</Text>
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											Ethers.js
										</Text>
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											Express.js
										</Text>
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											TypeScript
										</Text>
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											Node.js
										</Text>
									</Wrap>
								</VStack>
							</GridItem>

							<GridItem
								as={VStack}
								borderRadius="24px"
								border={`1px solid ${gold(400)}`}
								boxShadow={`0 3px 10px 5px ${SHADOW}`}
								overflow="hidden"
								backgroundImage={`linear-gradient(185deg, ${grey(
									700
								)}, ${grey(800)})`}
								cursor="pointer"
								onClick={() =>
									router.push(
										"https://andtheneum-wonder0xweird.vercel.app/"
									)
								}
							>
								<VStack
									bgImage="/images/Andtheneum.png"
									bgSize="cover"
									bgPosition="center"
									h="300px"
									w="100%"
									borderBottom={`1px solid ${gold()} `}
								/>
								<VStack p={4} spacing={4}>
									<Heading>The Andtheneum</Heading>
									<Text fontSize="18px">
										A social storytelling platform for the
										Forgotten Runes Wizard's Cult NFT.
									</Text>
									<Wrap fontSize="18px">
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											Next.js
										</Text>
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											MongoDB
										</Text>
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											Mongoose.js
										</Text>
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											Ethers.js
										</Text>
										<Text
											border={`1px solid ${gold()}`}
											borderRadius="100px"
											w="fit-content"
											p="2px 10px"
											fontSize="14px"
										>
											JavaScript
										</Text>
									</Wrap>
								</VStack>
							</GridItem>
						</Grid>
					</TabPanel>
				</SlideFade>
			</TabPanels>
		</Tabs>
	)
}
