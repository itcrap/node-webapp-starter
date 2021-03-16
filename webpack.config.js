require('dotenv').config()
const config = process.env;
const path = require('path');
const webpack = require('webpack');
const ESLintPlugin = require('eslint-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');

module.exports = {
  mode: config.MODE,
  devServer: {
    open: true,
    host: config.HOST,
    port: config.PORT
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new MiniCssExtractPlugin({ filename: 'main.[contenthash].css' }),
    new HtmlWebpackPlugin({
      template: 'index.html'
    }),
    new WorkboxWebpackPlugin.GenerateSW({
      swDest: 'sw.js',
      clientsClaim: true,
      skipWaiting: false,
    }),
    new ESLintPlugin({
      eslintPath: 'eslint',
      context: 'src',
      files: '*.js',
      fix: Boolean(config.ESLINT_AUTOFIX),
      quiet: false,
      extensions: ['js', 'ts', 'tsx'],
    }),
    new StylelintPlugin({
      configFile: '.stylelintrc',
      context: 'src/assets/css',
      files: '*.css',
      fix: Boolean(config.STYLEINT_AUTOFIX),
      failOnError: false
    }),
    new CleanWebpackPlugin(),
  ],

  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      include: [path.resolve(__dirname, 'src')],
      loader: 'babel-loader'
    }, {
      test: /.css$/,
      use: [{
        loader: MiniCssExtractPlugin.loader
      }, {
        loader: "css-loader",
        options: {
          sourceMap: true
        }
      }]
    }]
  }
}