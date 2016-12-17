var path = require('path');
var webpack = require('webpack');

var LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

module.exports = {
	entry: './src/index.js',
	output: {
		path: './dist',
		filename: 'shank.js',
		library: 'Shank',
		libraryTarget: 'umd',
		umdNamedDefine: true
	},
	module: {
		loaders: [{
			loader: 'babel',

			include: [
				path.resolve(__dirname, 'src/'),
			],

			test: /\.js$/,
		}]
	},
	plugins: [
		new LodashModuleReplacementPlugin(),
		new webpack.optimize.UglifyJsPlugin()
	]
};