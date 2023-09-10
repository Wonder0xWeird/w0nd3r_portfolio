import useWindowWidth from "@/lib/hooks/window"
import {
	DESIGN_MAX_WIDTH,
	SHADOW,
	gold,
} from "@/styles/theme"
import {
	Box,
	Heading,
	Text,
	Flex,
	Image,
	VStack,
	TabPanel,
	SlideFade,
	Collapse,
	Divider,
	Link,
	ListItem,
	UnorderedList,
} from "@chakra-ui/react"
import { useState } from "react"

export default function About({ tabIndex }) {
	const [readMore, setReadMore] = useState(false)
	const breakpoint = useWindowWidth(DESIGN_MAX_WIDTH)
	return (
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
							textAlign={breakpoint ? "start" : "center"}
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
								Neurobiology & Computational Neuroscience
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
							The neuroelectronic interface is a fascinating
							and powerful tool for enabling direct
							electrochemical interaction with the central
							and peripheral nervous systems as a means to
							alleviate symptoms of debilitating
							neurological conditions. As the name implies,
							successful design and implementation of such
							systems requires a unique combination of
							neurobiological knowhow and engineering
							execution.
						</Text>

						<Collapse in={readMore}>
							<VStack align="start" spacing={2} pt={3}>
								<Text fontSize="18px" textAlign="justify">
									A long and fruitful history of
									neuroscience investigation coupled with
									the more recent rise of microfabrication
									techniques and high-powered digital
									computing systems places the present
									engineering endeavors in a position to
									contribute significantly and meaningfully
									to solutions for these severest of
									conditions.
								</Text>
								<Text fontSize="18px" textAlign="justify">
									Indeed, devices of this nature are already
									commercially available and more still are
									in development.
								</Text>
								<Text fontSize="18px" textAlign="justify">
									However, interfacing robustly with this
									most delicate of human tissues, the brain,
									still presents a major challenge to the
									long-term success of these devices as a
									result of the prolific neuroinflammatory
									response to implanted materials which is
									still not fully understood. This complex
									and dynamic immune reaction is driven not
									only by the implantation procedure, but
									also by the materials chosen for the
									device itself.
								</Text>
								<Text fontSize="18px" textAlign="justify">
									A primary research thrust in this space
									thus involves the design and optimization
									of devices which may not only limit the
									severity of this immune reaction but also
									actively modulate it toward more
									pro-regenerative outcomes. Central to this
									effort is the integration of material
									classes which enable control over multiple
									properties of the device simultaneously
									including microarchitecture, mechanical
									compliance, electrochemical activity, and
									the delivery of biomolecular cues.
								</Text>
								<Text fontSize="18px" textAlign="justify">
									The preliminary work and proposed future
									exploration presented in this dissertation
									aim to contribute to the neuroelectronic
									interface design toolbox a set of new
									methods for synthesizing soft electronic
									materials and new understanding into the
									mechanisms behind the neuroinflammatory
									response. The ultimate goal of this
									venture is therefore to enable and promote
									the creation of a wholly organic,
									immunomodulatory neuroelectronic interface
									which may be translated into a robust
									medical device to improve the lives of
									those suffering from life-long
									neurological conditions.
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
							1. Crawford, Lars M. "Toward a Wholly Organic,
							Immunomodulatory Neuroelectronic Interface."
							Doctoral Dissertation, University of
							Washington, 2021.{" "}
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
							Phenomenology to Toxicology to Regeneration."
							Advanced Healthcare Materials 10.11 (2021):
							2002153.{" "}
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
							"One-pot photochemical synthesis methodology
							for conductive hydrogel fabrication." U.S.
							Patent Application No. 17/357,887. (Patent
							Pending){" "}
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
							Containing the Same." U.S. Provisional Patent
							Application No. 63/216,249. (Provisional
							Patent)
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
								Interest Group Poster Award – Society for
								Biomaterials (4/19)
							</ListItem>

							<ListItem fontSize="18px">
								Best Poster Presentation – Neuroelectronic
								Interfaces, Gordon Research Conference
								(4/18)
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
								University of Washington Commercialization
								Fellow, Multimodal Health Inc. (1/15)
							</ListItem>
							<ListItem fontSize="18px">
								University of Washington Business Plan
								Competition 4th place, Multimodal Health
								Inc. (4/15)
							</ListItem>
							<ListItem fontSize="18px">
								University of Washington Commercialization
								Gap Fund, Multimodal Health Inc. (11/14)
							</ListItem>
							<ListItem fontSize="18px">
								Center for Neurotechnology Tech Studio
								Competition 1st Place (3/14)
							</ListItem>
							<ListItem fontSize="18px">
								Computational Neuroscience Training Grant
								(8/13)
							</ListItem>
							<ListItem fontSize="18px">
								University of Washington Honors Achievement
								Award (8/10)
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
	)
}
