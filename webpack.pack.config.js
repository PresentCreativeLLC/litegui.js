const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = (_env) =>
{
	const mode = "production";

	// Set default config settings
	const config = {
		entry: {
			app: [path.resolve(__dirname, "./build/litegui.js")]
		},
		mode: mode,
		output: {
			path: path.resolve(__dirname, "./dist"),
			publicPath: "./",
			filename: "litegui.min.js"
		},
		watch: false,
		plugins: [
			new CleanWebpackPlugin(),
			new ESLintPlugin(),
			new CopyPlugin({
				patterns: [
					{ from: "external/jscolor", to: "jscolor" },
					{ from: "build", to: "dev" },
					{ from: "build", to: "" }
				]
			})
		],
	};

	// Additional settings
	config.optimization = {
		nodeEnv: mode,
		minimize: true,
		minimizer: [
			new TerserPlugin({
				extractComments: false,
				parallel: true,
				include: ["litegui.min.js"]
			}),
			new CssMinimizerPlugin({include: "litegui.css"})
		]
	};

	return [config];
};