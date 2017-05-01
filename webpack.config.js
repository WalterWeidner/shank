var path = require('path');
var webpack = require('webpack');

module.exports = {
	entry: path.resolve(__dirname, 'src/index.js'),
	output: {
		path: path.resolve(__dirname, 'dist/'),
		filename: 'shank.js',
		library: 'Shank',
		libraryTarget: 'umd',
		umdNamedDefine: true
	},
	module: {
		rules: [
			{
				loader: 'babel-loader',

				include: [
					path.resolve(__dirname, 'src/'),
				],

				test: /\.js$/,
			}
		]
	},
	plugins: [
		new webpack.optimize.UglifyJsPlugin({
			sourceMap: true
		})
	]
};
