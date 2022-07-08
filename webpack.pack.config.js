
// webpack.var.js
const webpackCommon = require('./webpack.var.config');
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

webpackCommon.entry.litegui = [path.resolve(__dirname, './src/core.ts')];
webpackCommon.plugins.push(
	new CssMinimizerPlugin({
		minimizerOptions: {
			preset: [
				  "default",
				  {
					discardComments: { removeAll: true },
				  },
			],
		}
	}));
	
module.exports = {
	...webpackCommon,
	output: {
		path: path.resolve(__dirname, "./build"),
		publicPath: "./",
        library:  {
			name: 'LiteGUI',
			type: 'var',
			export: 'LiteGUI',
		},
		filename: "[name].js"
	},
	mode: 'production',
	devtool: false,
	optimization:
	{
		minimize: true,
		minimizer: [
		  new TerserPlugin({
			extractComments: false,
			terserOptions: {
			  format: {
				comments: false,
			  },
			},
		  }),
		]
	}
};