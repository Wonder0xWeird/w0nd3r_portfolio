import { SHADOW, gold, grey } from "@/styles/theme"
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
	Wrap,
	Grid,
	GridItem,
} from "@chakra-ui/react"
import router from "next/router"

export default function About({ tabIndex }) {
	return (
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
					{/* Tribally */}
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
							router.push("https://tribally.games")
						}
					>
						<VStack
							bgImage="/images/tribally.png"
							bgSize="cover"
							bgPosition="center"
							h="300px"
							w="100%"
							position="relative"
							borderBottom={`1px solid ${gold()} `}
						>
							{/* <Heading
								pos="absolute"
								size="md"
								bottom="15%"
							>
								Beezlebop
							</Heading> */}
						</VStack>
						<VStack p={4} spacing={4}>
							<Heading>Tribally Games</Heading>
							<Text fontSize="18px">
								A social gaming platform with game dev tooling and onchain
								perks.
							</Text>
							<Wrap fontSize="18px">
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
									Ethers.js
								</Text>
								<Text
									border={`1px solid ${gold()}`}
									borderRadius="100px"
									w="fit-content"
									p="2px 10px"
									fontSize="14px"
								>
									Wagmi.js
								</Text>
								<Text
									border={`1px solid ${gold()}`}
									borderRadius="100px"
									w="fit-content"
									p="2px 10px"
									fontSize="14px"
								>
									OAuth2.0
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
									Redis
								</Text>
								<Text
									border={`1px solid ${gold()}`}
									borderRadius="100px"
									w="fit-content"
									p="2px 10px"
									fontSize="14px"
								>
									PostgreSQL
								</Text>
								<Text
									border={`1px solid ${gold()}`}
									borderRadius="100px"
									w="fit-content"
									p="2px 10px"
									fontSize="14px"
								>
									Kubernetes
								</Text>
								<Text
									border={`1px solid ${gold()}`}
									borderRadius="100px"
									w="fit-content"
									p="2px 10px"
									fontSize="14px"
								>
									Docker
								</Text>
							</Wrap>
						</VStack>
					</GridItem>

					{/* Beezlebop's Blunder */}
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
							router.push("https://blunder.beezle.buzz")
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
								Beezlebop - #667
							</Heading>
						</VStack>
						<VStack p={4} spacing={4}>
							<Heading>Beezlbop's Blunder</Heading>
							<Text fontSize="18px">
								A multiplayer rogue-like dungeon crawler set
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
						>
							<Heading
								pos="absolute"
								size="md"
								top="10%"
								left="5%"
							>
								Lord_Wud
							</Heading>
							<Heading
								pos="absolute"
								size="md"
								top="10%"
								right="10%"
							>
								#321
							</Heading>
						</VStack>
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
							bgImage="/images/DoLL_banner-min.jpg"
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
								A fast-paced, action survival game set in
								the Axie Infinity universe.
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
								Demo and tutorial site for the Sign In With
								Ronin (SIWR) authentication system.
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
	)
}
