const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');

let define = {
  // 后面的路径如果需要变为云地址，请自行修改
  __CDN__: process.env.ENV === 'developer' ? '/dist/' : '/dist/',
  __ENV__: JSON.stringify(process.env.ENV),
  __API__: JSON.stringify(process.env.API || process.env.ENV),
  __VER__: require('./package.json').version
};

let config = {
  entry: {
    main: ['./src/index.ts']
  },
  output: {
    filename: '[name].js',
    chunkFilename: '[name][id].[chunkhash].js',
    path: path.resolve('./www/dist'),
    publicPath: define.__CDN__
  },
  resolve: {
    extensions: ['.ts', '.js'],
    modules: [path.resolve('node_modules'), path.resolve('src')]
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        include: path.resolve('src'),
        use: [{ loader: 'babel-loader' }, { loader: 'ts-loader' }]
      },
      {
        test: /\.sve$/,
        include: path.resolve('src'),
        use: [{ loader: 'babel-loader' }, { loader: 'svelte-loader' }]
      },
      {
        test: /\.(png|jpg)$/,
        include: path.resolve('src'),
        use: ['url-loader?limit=8192&name=img/[hash:8].[name].[ext]']
      },
      {
        test: /\.(less|css)$/,
        include: path.resolve('src'),
        use:
          ['test', 'production'].indexOf(process.env.ENV) >= 0
            ? ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: [
                  {
                    loader: 'css-loader',
                    options: { importLoaders: 1, modules: false }
                  },
                  { loader: 'less-loader' }
                ]
              })
            : [
                { loader: 'style-loader' },
                {
                  loader: 'css-loader',
                  options: { importLoaders: 1, modules: false }
                },
                { loader: 'less-loader' }
              ]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin(
      Object.assign({}, define, {
        __VER__: JSON.stringify(define.__VER__)
      })
    ),
    new HtmlWebpackPlugin(
      Object.assign(
        {
          title: 'App',
          template: './src/index.ejs',
          hash: true,
          favicon: './src/common/asset/favicon.png',
          filename: '../index.html',
          alwaysWriteToDisk: true
        },
        define
      )
    ),
    new HtmlWebpackHarddiskPlugin()
  ]
};

if (process.env.ENV === 'developer') {
  config.devServer = {
    port: 8080,
    host: '0.0.0.0',
    inline: true,
    contentBase: path.resolve(__dirname, 'www'),
    publicPath: define.__CDN__,
    stats: 'minimal'
  };
  config.performance = {
    hints: false
  };
  config.devtool = false;
  config.watchOptions = {
    ignored: /node_modules/
  };
}

if (['test', 'production'].indexOf(process.env.ENV) >= 0) {
  config.devtool = 'source-map';

  config.plugins = [].concat(config.plugins, [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      beautify: false,
      comments: false,
      compress: {
        warnings: false,
        drop_console: true,
        collapse_vars: true,
        reduce_vars: true
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      async: true,
      children: true,
      minChunks: 4
    }),
    new ExtractTextPlugin({
      filename: '[name].css',
      disable: false,
      allChunks: true
    }),
    new CompressionPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.js$|\.css$|\.html$|\.eot?.+$|\.ttf?.+$|\.woff?.+$|\.svg?.+$/,
      threshold: 10240,
      minRatio: 0.8
    })
  ]);
}

module.exports = config;
