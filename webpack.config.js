var path = require('path');

module.exports = {
	entry: './src/shank.js',
	output: {
		path: path.resolve(__dirname, 'dist/'),
		filename: 'shank.js'
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

			// Options to configure babel with
			query: {
				presets: ['es2015']
			}
		}]
	},
	devServer: {
		publicPath: __dirname
	}
};
