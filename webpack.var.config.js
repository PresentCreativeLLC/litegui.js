
// webpack.dev.js
const webpackCommon = require('./webpack.build.config');
const path = require("path");

webpackCommon.entry.litegui = [path.resolve(__dirname, './src/varPackage.ts')];

module.exports = {
	...webpackCommon,
	devServer: {
		static: {
		  directory: path.join(__dirname, './examples'),
		},
	},
	target: 'web',
	output: {
		path: path.resolve(__dirname, "./examples/dist"),
		publicPath: "./",
        library:  {
			name: 'LiteGUI',
			type: 'var',
			export: 'default',
		},
		filename: "[name].js"
	},
	devtool: 'inline-source-map',
	mode: 'development'
};