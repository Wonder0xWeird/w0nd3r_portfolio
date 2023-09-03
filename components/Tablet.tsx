import {
	forwardRef,
	Box,
	BoxProps,
	Image,
} from "@chakra-ui/react"
import {
	GLOBAL_PADDING_X,
	GLOBAL_PADDING_Y,
	gold,
	grey,
	BG_COLOR,
	SHADOW,
} from "styles/theme"

interface BopProps extends BoxProps {
	header?: boolean
	hover?: boolean
	selected?: boolean
	button?: boolean
}

const Tablet = forwardRef<BopProps, "div">((props, ref) => (
	<Box
		w="100%"
		p={props.as == Image ? "0" : `${10}px`} //"10px 15px"
		borderRadius="9999px"
		border={`1px solid ${gold(400)}`}
		backgroundImage={`linear-gradient(185deg, ${grey(
			700
		)}, ${grey(800)})`}
		boxShadow={`0 3px 10px 5px ${SHADOW}`}
		ref={ref}
		_hover={
			props.button
				? {
						bg: `${gold()}10!important`,
				  }
				: {}
		}
		transition="all 0.2s"
		cursor={props.button ? "pointer" : "default"}
		{...props}
	>
		{props.children}
	</Box>
))

export default Tablet
