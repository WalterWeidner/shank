var path = require('path');

module.exports = {
	entry: './src/index.js',
	output: {
		path: path.resolve(__dirname, 'dist/'),
		filename: 'shank.js',
		libraryName: 'Shank',
		libraryTarget: 'umd',
		umdNamedDefine: true
	},
	module: {
		loaders: [{
			loader: 'babel',

			// Skip any files outside of your project's `src` directory
			include: [
				path.resolve(__dirname, 'src/'),
			],

			// Only run `.js` files through Babel
			test: /\.js$/,
		}]
	},
	devServer: {
		contentBase: path.resolve(__dirname, 'example'),
		publicPath: '/dist'
	}
};
