var path = require("path");

module.exports = {
  resolve: {
    extensions: ['.ts', '.js']
  },
  entry: "./src/heart.ts",
  output: {
    filename: "heart.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/"
  },
  module: {
    rules: [
      { test: /\.ts?$/, loader: "ts-loader" }
    ]
  },
  devServer: {
	contentBase: path.join(__dirname, 'src'),
    stats: {
      assets: false,
      hash: false,
      chunks: false,
      errors: true,
      errorDetails: true,
    },
    overlay: true
  }
};
