const path = require('path');

module.exports = {
  module: {
    rules: [
      {
        loader: 'babel-loader',

        include: [
          path.resolve(__dirname, 'src/'),
          path.resolve(__dirname, 'test/'),
        ],

        test: /\.js$/,
      }
    ]
  },

  resolve: {
    extensions: ['.js'],
    modules: [
      __dirname,
      path.resolve(__dirname, './node_modules'),
      path.resolve(__dirname, './src'),
      path.resolve(__dirname, './test'),
    ],
  },

  target: 'node'
};
