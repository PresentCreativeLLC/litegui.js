
const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const MergeIntoSingleFilePlugin = require('webpack-merge-and-include-globally');

module.exports = (_env) =>
{
	const mode = "development";

	// Set default config settings
	const config = {
		entry: {
			'css':
			[
				path.resolve(__dirname, 'src/css/inspector.css'),
				path.resolve(__dirname, 'src/css/layout.css'),
				path.resolve(__dirname, 'src/css/style.css'),
				path.resolve(__dirname, 'src/css/normalize.css'),
				path.resolve(__dirname, 'src/css/widgets.css'),
			],
			litegui: [path.resolve(__dirname, './src/index.ts')]
		},
		mode: mode,
		devtool: false,
		output: {
			path: path.resolve(__dirname, "./build"),
			publicPath: "./",
			filename: "[name].js"
		},
		watch: false,
		plugins: [
			new RemoveEmptyScriptsPlugin(),
			new CleanWebpackPlugin(),
			new ESLintPlugin(),
			new MiniCssExtractPlugin({filename: "litegui.css"})
		],
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
			fallback: {
			  "fs": false,
			  "assert": false,
			  "path": false,
			  "polyfill": false,
			  "buffer-util": false,
			  "bufferutil": false,
			  "util": false,
			  "os": false,
			  "stream": false,
			  "utf-8-validate": false,
			  "constants": false,
			  "dns": false,
			  "net": false,
			  "tls": false,
			}
		},
	};

	return [config];
};