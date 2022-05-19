const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const MergeIntoSingleFilePlugin = require('webpack-merge-and-include-globally');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (_env) =>
{
	const mode = "production";

	// Set default config settings
	const config = {
		entry: {
			'css':
			[
				path.resolve(__dirname, "./build/litegui.css")
			]
		},
		mode: mode,
		output: {
			path: path.resolve(__dirname, "./dist"),
			publicPath: "./",
			filename: "[name].js"
		},
		watch: false,
		plugins: [
			new RemoveEmptyScriptsPlugin(),
			new CleanWebpackPlugin(),
			new ESLintPlugin(),
			new MiniCssExtractPlugin({filename: "litegui.min.css"}),
			new MergeIntoSingleFilePlugin({
				files: {
					"litegui.min.js": [
						path.resolve(__dirname, "./build/litegui.js")
					],
					"jscolor/jscolor.min.js": [
						path.resolve(__dirname, "./external/jscolor/jscolor.js")
					]
				}
			}),
			new CopyPlugin({
				patterns: [
					{ from: "external/jscolor", to: "jscolor" },
					{ from: "build", to: "" }
				]
			})
		],
		optimization: {
			nodeEnv: mode,
			minimize: true,
			minimizer: [
				new TerserPlugin({
					extractComments: false,
					parallel: true,
					include: ["litegui.min.js","jscolor/jscolor.min.js"],
					terserOptions: {
						mangle: false
					}
				}),
				new CssMinimizerPlugin({
					include: "litegui.min.css",
					minimizerOptions: {
						preset: [
						  	"default",
						  	{
								discardComments: { removeAll: true },
						  	},
						],
					}
				})
			]
		},
		module: {
			rules: [
				{
					test: /\.css$/i,
					use: [MiniCssExtractPlugin.loader, "css-loader"],
				},
				{
					test: /\.ts?$/,
					use: 'ts-loader',
					exclude: /node_modules/,
				}
			],
		},
		resolve: {
			extensions: ['.ts', '.tsx', '.js'],
			alias: {
				stun: path.resolve(__dirname, 'src')
			}
		}
	};

	return [config];
};