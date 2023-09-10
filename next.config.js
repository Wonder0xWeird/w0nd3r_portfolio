/** @type {import('next').NextConfig} */
const withPlugins = require("next-compose-plugins")
const optimizedImages = require("next-optimized-images")

module.exports = withPlugins([
	[
		optimizedImages,
		{
			/* config for next-optimized-images */
		},
	],
	{
		webpack: function (config) {
			config.module.rules.push({
				test: /\.md$/,
				use: "raw-loader",
			})
			return config
		},
	},

	// your other plugins here
])
