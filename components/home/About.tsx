import useWindowWidth from "@/lib/hooks/window"
import {
	DESIGN_MAX_WIDTH,
	SHADOW,
	gold,
} from "@/styles/theme"
import {
	Heading,
	Text,
	Flex,
	Image,
	VStack,
	TabPanel,
	SlideFade,
	Collapse,
	Divider,
	List,
	ListItem,
} from "@chakra-ui/react"
import { useState } from "react"

export default function About({ tabIndex }) {
	const [readMore, setReadMore] = useState(false)
	const breakpoint = useWindowWidth(DESIGN_MAX_WIDTH)
	return (
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
							, I am extremely passionate about the future
							and continuously seek to participate in its
							arrival by pursuing the development of novel
							concepts and technologies.
						</Text>
						<Text fontSize="18px" mr="20px">
							I was formally trained as a{" "}
							<span style={{ textDecoration: "underline" }}>
								Neural Engineer at the University of
								Washington
							</span>
							, but more recently have pivoted to{" "}
							<span style={{ textDecoration: "underline" }}>
								{" "}
								Full Stack Web3 Development
							</span>{" "}
							in order to contribute to the ongoing Web3
							renessaince.
						</Text>
						<Text fontSize="18px" mr="20px">
							Overall, I am optimistic, enthusiastic,
							self-motivated, organized, a quick and
							voracious learner, and keenly interested in
							applying my expertise and passion toward
							imagining and building the future.
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
						<Heading pos="absolute" size="md" bottom="20%">
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
								means you are alive.
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
								means you are thinking.
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
						sciences. It is one which all humans are born
						knowing how to do.
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
						have a tendency to positively impact the world
						in unforseeable yet significant ways.
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
						is to help bring more joy to the world by first
						creating cooperative games that people can play
						with their friends and loved ones, and then,
						more broadly, helping humanity transition to a
						world where{" "}
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
						<ListItem fontSize="18px" textAlign="justify">
							Inspired by Ray Kurzweil's "The Singularity is
							Near," I spent the first decade of my
							professional life pursuing the development of
							Brain Computer Interface devices, ostensibly
							to help people with neurological conditions in
							the near term, but more deeply as a means to
							contribute to humanity's ability to integrate
							with the approaching technological singularity
							and the digital beings who are now rapidly
							becoming our peers. I still believe that
							human-machine interfacing has the potential to{" "}
							<span
								style={{
									color: `${gold()}`,
								}}
							>
								play
							</span>{" "}
							a significant role in the future of humanity
							and its immersion in our shared digital world.
						</ListItem>
						<ListItem fontSize="18px" textAlign="justify">
							However, as a result of severe burnout, I have
							shifted my energy toward pursuing joy and{" "}
							<span
								style={{
									color: `${gold()}`,
								}}
							>
								play
							</span>{" "}
							as a first order goal, instead seeking to
							build web3-enabled games as a near-term career
							path. As a life-long gamer, I believe that
							games are a powerful medium for the production
							of pure joy, lively social interaction, and
							life-long learning. For example, Axie
							Infinity, the gaming ecosystem I am building
							in, served as an incredible catalyst to teach
							me everything I know about the benefits of
							blockchain technology, and I hope the games I
							build will contribute to this effort as well.
							But more than that, the act of building games
							actually brings me joy moment-to-moment,
							something that I struggled to find in my
							lab-based work.
						</ListItem>
						<ListItem fontSize="18px" textAlign="justify">
							Furthermore, as Digital Intelligence,
							humanity's collective progeny, continues to
							grow, learn and contribute to our
							civilization, I believe that there will soon
							come a time where the function of work as we
							know it will come to an end, and the final
							task remaining for humans will be to{" "}
							<span
								style={{
									color: `${gold()}`,
								}}
							>
								play
							</span>
							.
						</ListItem>
						<ListItem fontSize="18px" textAlign="justify">
							I am committed to helping build a future that
							maximizes joy for all.
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
						src={`/icons/${!readMore ? "down" : "up"}.svg`}
						ml={2}
					/>
				</Heading>
			</TabPanel>
		</SlideFade>
	)
}
