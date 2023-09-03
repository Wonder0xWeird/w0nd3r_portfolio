import {
	extendTheme,
	theme as base,
	createMultiStyleConfigHelpers,
} from "@chakra-ui/react"

export const DESIGN_MAX_WIDTH = 1200
export const GLOBAL_PADDING_X = 15
export const GLOBAL_PADDING_Y = 10

export const SHADOW = "#141921"
export const BG_COLOR = "#222831"

export function gold(colorVal = 0) {
	switch (colorVal) {
		case 50:
			return "#fff3e0"
		case 100:
			return "#f1dfbe"
		case 200:
			return "#e5ca98"
		case 300:
			return "#d9b571"
		case 400:
			return "#cea04a"
		case 500:
			return "#b58731"
		case 600:
			return "#8d6924"
		case 700:
			return "#654b18"
		case 800:
			return "#3d2d0a"
		case 900:
			return "#180e00"

		default:
			return "#cc9c42"
	}
}

export function grey(colorVal = 0) {
	switch (colorVal) {
		case 50:
			return "#edf2fc"
		case 100:
			return "#d4d8e0"
		case 200:
			return "#b9bec6"
		case 300:
			return "#9ea4ae"
		case 400:
			return "#838a96"
		case 500:
			return "#68707c"
		case 600:
			return "#515761"
		case 700:
			return "#393e46"
		case 800:
			return "#21252c"
		case 900:
			return "#070c15"

		default:
			return ""
	}
}

export const webkitNoTap = {
	WebkitTapHighlightColor: "transparent",
	WebkitTouchCallout: "none",
	WebkitUserSelect: "none",
	KhtmlUserSelect: "none",
	MozUserSelect: "none",
	msUserSelect: "none",
	userSelect: "none",
}

const tabHelpers = createMultiStyleConfigHelpers([
	"tabs",
	"tablist",
	"tab",
])
const Tabs = tabHelpers.defineMultiStyleConfig({
	baseStyle: {
		tabs: {
			width: "fit-content",
		},
		tablist: {
			// gap: 5,
		},
		tab: {
			margin: "0",
			borderRadius: "9999px",
			border: `1px solid ${gold()}!important`,
			fontSize: { base: "12px", sm: "15px", md: "20px" },
			...webkitNoTap,
			boxShadow: `0 3px 10px 5px ${SHADOW}`,
			_hover: {
				bg: `${gold()}10!important`,
			},
			_active: {
				bg: `${gold()}25!important`,
				color: "#eee!important",
			},
			_focus: {
				bg: `${gold()}25!important`,
				color: "#eee!important",
			},
			_selected: {
				bg: `${gold()}15!important`,
				color: `#eee!important`,
			},
		},
	},
})

const theme = extendTheme({
	fonts: {
		heading: `Alice, Times New Roman`,
		body: `Alice, Times New Roman`,
	},
	styles: {
		global: {
			body: {
				color: "#eee",
				textShadow: `0 4px 4px ${SHADOW}`,
				bgColor: BG_COLOR,
			},
		},
	},
	components: {
		Tab: {
			baseStyle: {
				color: "#eee",
			},
		},
		Tabs,
		Divider: {
			baseStyle: {
				borderBottom: `10px dotted ${gold()}!important`,
			},
		},
	},
})

export default theme
