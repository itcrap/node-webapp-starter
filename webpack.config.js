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
  stats: {
    colors: true,
    logging: config.LOG_LEVEL,
    preset: config.LOG_PRESET,
    timings: true
  },
  devServer: {
    // opens browser on start
    open: false,
    host: config.HOST,
    port: config.PORT
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: '[name].bundle.js',
    clean: true,
  },
  plugins: [
    /* Webpack progress bar */
    new webpack.ProgressPlugin(),
    /* CSS minify */
    new MiniCssExtractPlugin({ filename: 'main.[contenthash].css' }),
    /* HTML template generator */
    new HtmlWebpackPlugin({
      title: config.APPNAME,
      favicon: "favicon.png",
      template: 'index.html'
    }),
    /* PWA Service Worker */
    new WorkboxWebpackPlugin.GenerateSW({
      swDest: 'sw.js',
      // these options encourage the ServiceWorkers to get in there fast
      // and not allow any straggling "old" SWs to hang around
      clientsClaim: true,
      skipWaiting: true,
    }),
    /* Linter for JavaScript */
    new ESLintPlugin({
      eslintPath: 'eslint',
      context: 'src',
      files: '*.js',
      fix: Boolean(config.ESLINT_AUTOFIX),
      quiet: false,
      extensions: ['js', 'ts', 'tsx'],
    }),
    /* Linter for CSS */
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
      /* JavaScript loaders */
      test: /\.(js|jsx)$/,
      include: [path.resolve(__dirname, 'src')],
      loader: 'babel-loader'
    }, {
      /* CSS loaders */
      test: /.css$/,
      use: [{
        loader: MiniCssExtractPlugin.loader
      }, {
        loader: "css-loader",
        options: {
          sourceMap: true
        }
      }]
    }, {
      /* Media loaders */
      test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
      type: 'asset/resource',
    }]
  }
}