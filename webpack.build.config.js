
const path = require("path");
const ESLintPlugin = require("eslint-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const CopyPlugin = require('copy-webpack-plugin');

module.exports =
{
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
	mode: "development",
	devtool: false,
	output: {
		path: path.resolve(__dirname, "./dist"),
		publicPath: "./",
		filename: "[name].js"
	},
	plugins: [
		new RemoveEmptyScriptsPlugin(),
		new ESLintPlugin(),
		new MiniCssExtractPlugin({filename: "litegui.css"}),
		new CopyPlugin({
			patterns: [
				{ from: './external/jscolor/', to: './jscolor/' }]
		})
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
		extensions: ['.ts', '.tsx', '.js']
	}
};