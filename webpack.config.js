const webpack = require("webpack");
const path = require("path");
const HtmlPlugin = require('html-webpack-plugin');



module.exports = {
	devtool: 'eval',
	entry: {
		scripts: './src/js/index.js'

	},
	output: {
		filename: "[name].js",
		chunkFilename: "[name].js",
		path: path.resolve(__dirname, 'js'),
		publicPath: 'js'

	},
	module: {
		rules: [{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: '/node-modules/'

  	},
//			{
//				test: /\.hbs/,
//				loader: 'handlebars-loader',
//				exclude: /(node_modules|bower_components)/
//    },
           ]
	}, 
	
//	plugins: [
//
//    new HtmlPlugin({
//      filename: '../index.html',
//      template: './src/hbs/index.hbs'
//    })]

}
