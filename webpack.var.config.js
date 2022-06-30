
// webpack.dev.js
const webpackCommon = require('./webpack.build.config');
const path = require("path");

webpackCommon.entry.litegui = [path.resolve(__dirname, './src/core.ts')];

module.exports = {
	...webpackCommon,
	output: {
		path: path.resolve(__dirname, "./dist"),
		publicPath: "./",
        library:  {
			name: 'LiteGUI',
			type: 'var',
			export: 'LiteGUI',
		},
		filename: "[name].js"
	},
	devtool: 'inline-source-map',
	mode: 'development'
};