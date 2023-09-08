import { SHADOW, gold } from "@/styles/theme"
import {
	Image,
	VStack,
	TabPanel,
	SlideFade,
	Heading,
	Divider,
} from "@chakra-ui/react"

export default function WritingSection({
	title,
	refIndex,
	tabIndex,
	content,
}) {
	return (
		<SlideFade
			in={tabIndex === refIndex}
			unmountOnExit
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
			<TabPanel as={VStack}>
				<Heading size="2xl" pt={10}>
					{title}
				</Heading>

				<Divider
					margin="40px auto"
					borderBottom={`1px solid ${gold(400)}`}
					width="100%"
					maxW="1000px"
				/>

				{content.map((file, index) => (
					<div key={index} className="writing">
						{file.image && (
							<Image
								borderRadius="10px"
								border={`2px solid ${gold(400)}`}
								boxShadow={`0 3px 10px 5px ${SHADOW}`}
								src={file.image}
								w="min(450px, 100%)"
								m="20px auto"
							/>
						)}
						<div
							dangerouslySetInnerHTML={{
								__html: file.html,
							}}
						/>

						{content.length - 1 !== index && (
							<Divider
								margin="40px auto"
								width="140px!important"
								opacity={0.24}
							/>
						)}
					</div>
				))}
			</TabPanel>
		</SlideFade>
	)
}
