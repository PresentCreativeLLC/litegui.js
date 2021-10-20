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
			]
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
			new MiniCssExtractPlugin({filename: "litegui.css"}),
			new MergeIntoSingleFilePlugin({
				files: {
					"litegui.js": [
						path.resolve(__dirname, "./src/core.js"),
						path.resolve(__dirname, "./src/widgets.js"),
						path.resolve(__dirname, "./src/console.js"),
						path.resolve(__dirname, "./src/area.js"),
						path.resolve(__dirname, "./src/menubar.js"),
						path.resolve(__dirname, "./src/tabs.js"),
						path.resolve(__dirname, "./src/dragger.js"),
						path.resolve(__dirname, "./src/tree.js"),
						path.resolve(__dirname, "./src/panel.js"),
						path.resolve(__dirname, "./src/dialog.js"),
						path.resolve(__dirname, "./src/table.js"),
						path.resolve(__dirname, "./src/inspector.js")
					]
				}
			})
		],
		module: {
			rules: [
				{
					test: /\.css$/i,
					use: [MiniCssExtractPlugin.loader, "css-loader"],
				},
			],
		}
	};

	return [config];
};